import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect API routes, not pages - let client-side handle page protection
  if (request.nextUrl.pathname.startsWith('/api/admin') && 
      !request.nextUrl.pathname.includes('/auth')) {
    
    // Check for Authorization header first
    const authHeader = request.headers.get('authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Fallback to cookie
      token = request.cookies.get('admin-token')?.value;
    }
    
    console.log('API Middleware - Path:', request.nextUrl.pathname);
    console.log('API Middleware - Has auth header:', !!authHeader);
    console.log('API Middleware - Token exists:', !!token);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: []  // Temporarily disable all middleware
};
