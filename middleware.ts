import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PAM_HOSTNAMES = new Set(['pam.polynize.ai', 'pam.localhost']);

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').toLowerCase().split(':')[0];

  if (PAM_HOSTNAMES.has(host)) {
    const { pathname } = request.nextUrl;
    if (!pathname.startsWith('/console')) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === '/' ? '/console' : `/console${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
