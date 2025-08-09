import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get('admin_token')?.value || '';

  const publicPaths = ['/signin', '/forgotPassword'];
  const isPublicPath = publicPaths.some((path) => url.pathname.startsWith(path));

  // If no token and not on a public path, redirect to sign-in
  if (!token || token.trim() === '') {
    if (!isPublicPath) {
      url.pathname = '/signin';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Optional: prevent authenticated users from visiting public auth pages
  if (isPublicPath) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
