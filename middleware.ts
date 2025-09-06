import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Protect all /app/* routes
  if (pathname.startsWith('/app')) {
    const token = req.cookies.get('session')?.value;
    if (!token) {
      const url = new URL('/account/login', req.url);
      const fullPath = req.nextUrl.pathname + (req.nextUrl.search || '');
      url.searchParams.set('next', fullPath);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*']
};
