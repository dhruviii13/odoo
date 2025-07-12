import { NextResponse } from 'next/server';

// Minimal JWT decode (does NOT verify signature, but works for role checks)
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/', '/login', '/signup', '/api/auth'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Admin routes
  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // Protected routes
  const protectedRoutes = ['/profile', '/user', '/swap-history'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // API routes that require authentication
  const protectedApiRoutes = ['/api/user/profile', '/api/swap', '/api/feedback'];
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for JWT token in Authorization header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  let decodedToken = null;
  if (token) {
    decodedToken = decodeJwt(token);
  }

  if (!decodedToken && (isProtectedRoute || isProtectedApiRoute)) {
    if (isProtectedApiRoute) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAdminRoute && decodedToken?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (decodedToken && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 