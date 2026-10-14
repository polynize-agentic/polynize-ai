import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { OPERATOR_EMAILS } from './lib/marketing/streams';

const PAM_HOSTNAMES = new Set(['pam.polynize.ai', 'pam.localhost']);

/**
 * THE MARKETING ENGINE IS MARRS'S ALONE (D121). Marrs, 14 October: "remove access to the marketing
 * portal for everyone except me, so when they come into the PAM console, all they see is the CRM."
 * Checked here as well as on the pages, because the pages are only the screens: every marketing and
 * studio ROUTE behind them is refused too, so nothing is reachable by typing an address. A missing or
 * bad session falls through to the console's own sign-in, which is not this check's job.
 */
const OPERATOR_ONLY = [/^\/console\/marketing(\/|$)/, /^\/console\/studio(\/|$)/, /^\/console\/prezie(\/|$)/];

async function sessionEmail(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('polynize_console_auth')?.value;
  const secret = process.env.POLYNIZE_AUTH_SECRET;
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.type === 'session' && typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').toLowerCase().split(':')[0];
  const { pathname } = request.nextUrl;
  const isPam = PAM_HOSTNAMES.has(host);

  // The console path this request is for, whichever host it came in on.
  const consolePath = isPam && !pathname.startsWith('/console') ? (pathname === '/' ? '/console' : `/console${pathname}`) : pathname;
  if (OPERATOR_ONLY.some((re) => re.test(consolePath))) {
    const email = await sessionEmail(request);
    if (email && !OPERATOR_EMAILS.includes(email)) {
      const isPage = request.method === 'GET' && (request.headers.get('accept') ?? '').includes('text/html');
      if (!isPage) return NextResponse.json({ error: 'not available' }, { status: 403 });
      const url = request.nextUrl.clone();
      url.pathname = isPam ? '/' : '/console';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  let response: NextResponse;

  if (isPam && !pathname.startsWith('/console')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? '/console' : `/console${pathname}`;
    response = NextResponse.rewrite(url);
  } else {
    response = NextResponse.next();
  }

  // Hard cache-disable for every /console route (and every pam.polynize.ai
  // request, since middleware rewrites it to /console). The Console depends
  // on flash cookies that change between requests; any cache layer holding
  // a /console response stale breaks the sign-in confirmation card flow.
  // We already tried (Step 7A.6): dynamic='force-dynamic' on layout +
  // revalidatePath('/console','layout') after each action. The user could
  // still reproduce by signing in then NOT seeing the confirmation card
  // until hard-refresh — exact signature of a cache layer that ignores
  // Next.js's dynamic-rendering signals. These headers are belt + braces:
  //  - Cache-Control: no-store — Vercel edge + browser HTTP cache
  //  - Pragma: no-cache — legacy HTTP/1.0 fallback
  // Together they also disable browser bfcache (per HTML spec, no-store
  // pages are ineligible for bfcache).
  if (isPam || pathname.startsWith('/console')) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, max-age=0'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  // The trailing `.*\\..*` exclusion keeps static PUBLIC files (avatars, images,
  // robots.txt: any path whose last segment has an extension) out of the
  // middleware entirely: on pam.polynize.ai they must be served as-is, not
  // rewritten to /console/<file> (which 404s, the broken-avatars bug).
  // App routes never contain dots, so no page loses the rewrite/cache headers.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
