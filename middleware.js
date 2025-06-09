import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login'];

  // API routes that don't require authentication
  const publicApiRoutes = [
    '/api/auth/login',
    '/api/auth/init-db',
    '/api/test-db',
    '/api/test-env',
    '/api/setup-test-data',
    '/api/quick-setup',
    '/api/accounts',
    '/api/qa/next',
    '/api/qa/preview',
    '/api/qa/complete'
  ];

  // Check if the current path is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // For API routes
  if (pathname.startsWith('/api/')) {
    if (publicApiRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    const token = request.cookies.get('auth-token')?.value;

    // Simple token check - just verify it exists and is not empty
    // Full JWT verification will be done in the API routes themselves
    if (!token || token.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // For page routes
  const token = request.cookies.get('auth-token')?.value;

  // Simple token check for page routes
  if (!token || token.trim() === '') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
