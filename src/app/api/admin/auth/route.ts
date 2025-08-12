import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET!;

    // If a valid token already exists, short-circuit (prevents repeated log spam)
    try {
      const existingToken = request.cookies.get('admin-token')?.value;
      if (existingToken) {
        const decoded: any = jwt.verify(existingToken, jwtSecret);
        if (decoded?.username === adminUsername) {
          console.log('Auth API - Existing valid token detected, returning current session');
          return NextResponse.json({
            message: 'Already authenticated',
            user: { username: decoded.username, role: 'admin' },
            token: existingToken
          });
        }
      }
    } catch {
      // Ignore verification errors, proceed with normal auth flow
    }
    console.log('Auth API - Login attempt for username:', username);
    
    console.log('Auth API - Admin username exists:', !!adminUsername);
    console.log('Auth API - Admin password exists:', !!adminPassword);
    console.log('Auth API - JWT secret exists:', !!jwtSecret);
    
    if (!adminUsername || !adminPassword || !jwtSecret) {
      console.log('Auth API - Server configuration error');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (username !== adminUsername) {
      console.log('Auth API - Invalid username');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // For demo purposes, we'll compare plain text passwords
    // In production, you should hash the stored password
    if (password !== adminPassword) {
      console.log('Auth API - Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const token = jwt.sign(
      { username, role: 'admin' },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    console.log('Auth API - Token created successfully');
    
    const response = NextResponse.json({
      message: 'Login successful',
      user: { username, role: 'admin' },
      token: token // Include token in response for localStorage
    });
    
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: false, // Set to false for development (localhost)
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 86400, // 24 hours
      path: '/' // Ensure cookie is available for all paths
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
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: false, // Set to false for development
    sameSite: 'lax',
    maxAge: 0,
    path: '/' // Ensure cookie is cleared for all paths
  });
  
  return response;
}
