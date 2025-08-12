import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Force dynamic to avoid any caching of auth result
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const bearerToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';

    // Prefer Authorization header; DO NOT fall back silently to cookie to avoid ambiguity
    const token = bearerToken || request.cookies.get('admin-token')?.value || '';

    if (!token) {
      return NextResponse.json({ authenticated: false, error: 'NO_TOKEN' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({ authenticated: false, error: 'NO_JWT_SECRET' }, { status: 500 });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      return NextResponse.json({
        authenticated: true,
        user: { username: decoded.username, role: decoded.role }
      }, { status: 200 });
    } catch (err) {
      return NextResponse.json({ authenticated: false, error: 'INVALID_TOKEN' }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ authenticated: false, error: 'VERIFY_EXCEPTION' }, { status: 500 });
  }
}
