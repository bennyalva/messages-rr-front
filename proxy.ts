import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cookie name must match sessionService
const AUTH_COOKIE_NAME = 'sonidero_auth';

// Routes that require authentication
const PROTECTED_ROUTES = ['/chat', '/dashboard', '/profile', '/vote', '/dm-dj', '/about'];

// Routes that are public (no auth required)
const PUBLIC_ROUTES = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const hasSession = !!authToken;

  // Case 1: User WITH session tries to access /login
  // Redirect to logout-confirm page
  if (hasSession && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/logout-confirm';
    return NextResponse.redirect(url);
  }

  // Case 2: User WITHOUT session tries to access protected routes
  // Redirect to login
  if (!hasSession && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Case 3: User WITHOUT session tries to access /logout-confirm
  // Redirect to login (nothing to confirm)
  if (!hasSession && pathname === '/logout-confirm') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Allow all other requests
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
