import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth-utils-edge';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/admin',
  '/import',
  '/api/admin',
  '/api/ai/chat',
  '/api/ai/chat-stream',
  '/api/ai/analyze-image',
  '/api/ai/quota',
];

// Paths that are public
const publicPaths = [
  '/',
  '/features',
  '/why',
  '/how',
  '/download',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/desktop-initiate',
  '/api/auth/desktop-exchange',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));
  const isPublicPath = publicPaths.some((p) => path === p || path.startsWith(p + '/'));
  const isApiRoute = path.startsWith('/api/');

  // Skip middleware for public paths
  if (isPublicPath && !isProtectedPath) {
    return NextResponse.next();
  }

  // Get token from cookie or Authorization header
  const token = request.cookies.get('accessToken')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');

  // Protected routes check
  if (isProtectedPath) {
    if (!token) {
      console.log('No token found for protected path:', path);
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      console.log('Verifying token for path:', path);
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
      console.log('JWT_SECRET defined:', !!process.env.JWT_SECRET);
      
      const payload = await verifyJWT(token);
      console.log('Token verified successfully for user:', payload.userId);
      
      // Admin routes check
      if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
        if (payload.role !== 'admin') {
          if (isApiRoute) {
            return NextResponse.json(
              { error: 'Forbidden' },
              { status: 403 }
            );
          }
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      // Add user info to request headers for API routes
      if (isApiRoute) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.userId);
        requestHeaders.set('x-user-role', payload.role || 'user');
        
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
    } catch (error) {
      console.error('Token verification failed for path:', path);
      console.error('Error details:', error);
      
      // Prevent redirect loop - if already on login page, don't redirect again
      if (path === '/login') {
        console.log('Already on login page, preventing redirect loop');
        return NextResponse.next();
      }
      
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      
      // Clear the invalid token cookie before redirecting
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};