import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import connectDB, { hasMongoURI } from '@/lib/mongodb';
import { AdminLoginAttempt } from '@/models';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const loginAttempts = new Map<string, { count: number; firstAttemptAt: number }>();

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(request: NextRequest) {
  const key = getClientKey(request);
  const now = Date.now();
  const existing = loginAttempts.get(key);

  if (!existing || now - existing.firstAttemptAt > WINDOW_MS) {
    loginAttempts.set(key, { count: 0, firstAttemptAt: now });
    return { limited: false, key };
  }

  if (existing.count >= MAX_ATTEMPTS) {
    return { limited: true, key };
  }

  return { limited: false, key };
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const existing = loginAttempts.get(key);
  if (!existing || now - existing.firstAttemptAt > WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
    return;
  }
  loginAttempts.set(key, { ...existing, count: existing.count + 1 });
}

function clearFailedAttempts(key: string) {
  loginAttempts.delete(key);
}

async function isRateLimitedPersistent(key: string) {
  if (!hasMongoURI) return { limited: false };

  const now = new Date();
  await connectDB();
  const attempt = await AdminLoginAttempt.findOne({ key });

  if (!attempt) return { limited: false };
  if (attempt.blockedUntil && attempt.blockedUntil > now) return { limited: true };
  if (attempt.blockedUntil && attempt.blockedUntil <= now) {
    attempt.blockedUntil = null;
    attempt.count = 0;
    attempt.windowStart = now;
    await attempt.save();
  }

  return { limited: false };
}

async function recordFailedAttemptPersistent(key: string) {
  if (!hasMongoURI) return;

  const now = new Date();
  await connectDB();
  const attempt = await AdminLoginAttempt.findOne({ key });

  if (!attempt) {
    await AdminLoginAttempt.create({ key, count: 1, windowStart: now });
    return;
  }

  const windowStartTime = new Date(attempt.windowStart).getTime();
  if (now.getTime() - windowStartTime > WINDOW_MS) {
    attempt.count = 1;
    attempt.windowStart = now;
    attempt.blockedUntil = null;
    await attempt.save();
    return;
  }

  attempt.count += 1;
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.blockedUntil = new Date(now.getTime() + BLOCK_MS);
  }
  await attempt.save();
}

async function clearFailedAttemptsPersistent(key: string) {
  if (!hasMongoURI) return;
  await connectDB();
  await AdminLoginAttempt.deleteOne({ key });
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET!;
    const isProduction = process.env.NODE_ENV === 'production';

    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const rateLimit = isRateLimited(request);
    if (rateLimit.limited) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const persistentLimit = await isRateLimitedPersistent(rateLimit.key);
    if (persistentLimit.limited) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    // If a valid token already exists, short-circuit (prevents repeated log spam)
    try {
      const existingToken = request.cookies.get('admin-token')?.value;
      if (existingToken) {
                const decoded = jwt.verify(existingToken, jwtSecret) as JwtPayload;
      if (decoded?.username === adminUsername) {
        console.log('Auth API - Existing valid token detected, returning current session');
        const existingResponse = NextResponse.json({
          message: 'Already authenticated',
          user: { username: decoded.username, role: 'admin' }
        });
        const csrfToken = request.cookies.get('admin-csrf-token')?.value || crypto.randomBytes(32).toString('hex');
        existingResponse.cookies.set('admin-csrf-token', csrfToken, {
          httpOnly: false,
          secure: isProduction,
          sameSite: 'lax',
          maxAge: 86400,
          path: '/',
        });
        return existingResponse;
      }
      }
    } catch {
      // Ignore verification errors, proceed with normal auth flow
    }
    console.log('Auth API - Login attempt for username:', username);
    
    console.log('Auth API - Admin username exists:', !!adminUsername);
    console.log('Auth API - Admin password exists:', !!adminPassword);
    console.log('Auth API - JWT secret exists:', !!jwtSecret);
    
    if (!adminUsername || (!adminPassword && !adminPasswordHash) || !jwtSecret) {
      console.log('Auth API - Server configuration error');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (username !== adminUsername) {
      recordFailedAttempt(rateLimit.key);
      await recordFailedAttemptPersistent(rateLimit.key);
      console.log('Auth API - Invalid username');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    let passwordValid = false;
    if (adminPasswordHash) {
      passwordValid = await bcrypt.compare(password, adminPasswordHash);
    } else {
      passwordValid = password === adminPassword;
    }

    if (!passwordValid) {
      recordFailedAttempt(rateLimit.key);
      await recordFailedAttemptPersistent(rateLimit.key);
      console.log('Auth API - Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    clearFailedAttempts(rateLimit.key);
    await clearFailedAttemptsPersistent(rateLimit.key);
    
    const token = jwt.sign(
      { username, role: 'admin' },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    console.log('Auth API - Token created successfully');
    
    const response = NextResponse.json({
      message: 'Login successful',
      user: { username, role: 'admin' }
    });
    
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/'
    });

    const csrfToken = crypto.randomBytes(32).toString('hex');
    response.cookies.set('admin-csrf-token', csrfToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });
    
    console.log('Auth API - Cookie set, returning success response');
    
    return response;
  } catch (error) {
    console.log('Auth API - Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const isProduction = process.env.NODE_ENV === 'production';
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  response.cookies.set('admin-csrf-token', '', {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  return response;
}
