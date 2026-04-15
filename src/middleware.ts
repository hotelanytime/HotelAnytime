import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  const isProtectedAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi =
    pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/admin/auth') &&
    !pathname.startsWith('/api/admin/csrf');

  const isProtectedContentWriteApi =
    (pathname.startsWith('/api/hero') ||
      pathname.startsWith('/api/about') ||
      pathname.startsWith('/api/contact') ||
      pathname.startsWith('/api/gallery') ||
      pathname.startsWith('/api/rooms') ||
      pathname.startsWith('/api/upload') ||
      pathname.startsWith('/api/assets')) &&
    method !== 'GET';
  const isFinanceApi = pathname.startsWith('/api/finance');
  const isProtectedFinanceWriteApi = isFinanceApi && method !== 'GET';

  const shouldProtect = isProtectedAdminPage || isAdminApi || isProtectedContentWriteApi || isFinanceApi;

  if (shouldProtect) {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isProtectedContentWriteApi || isProtectedFinanceWriteApi) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
      }
    }

    const csrfCookie = request.cookies.get('admin-csrf-token')?.value || '';
    const csrfHeader = request.headers.get('x-csrf-token') || '';
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*']
};
