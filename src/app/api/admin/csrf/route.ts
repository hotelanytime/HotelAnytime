import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const existing = request.cookies.get('admin-csrf-token')?.value;
  const token = existing || crypto.randomBytes(32).toString('hex');
  const isProduction = process.env.NODE_ENV === 'production';

  const response = NextResponse.json({ csrfToken: token });
  if (!existing) {
    response.cookies.set('admin-csrf-token', token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });
  }

  return response;
}
