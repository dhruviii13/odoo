import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
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
  
  // Skip middleware for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check for authentication token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Redirect to login if no token and trying to access protected routes
  if (!token && (isProtectedRoute || isProtectedApiRoute)) {
    if (isProtectedApiRoute) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check admin access for admin routes
  if (isAdminRoute && token?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If user is authenticated and trying to access login/signup, redirect to home
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
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