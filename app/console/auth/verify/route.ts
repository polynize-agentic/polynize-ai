import { NextResponse } from 'next/server';
import {
  COOKIE_MAX_AGE_DAYS,
  COOKIE_NAME,
  createSessionToken,
  resolveUserScope,
  verifyMagicLinkToken,
} from '@/lib/console-auth';

const FLASH_TTL_SECONDS = 60;

function redirectWithError(requestUrl: string) {
  const response = NextResponse.redirect(new URL('/console', requestUrl));
  response.cookies.set({
    name: 'console_signin_error',
    value: 'invalid_link',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/console',
    maxAge: FLASH_TTL_SECONDS,
  });
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return redirectWithError(request.url);
  }

  const email = await verifyMagicLinkToken(token);
  if (!email) {
    return redirectWithError(request.url);
  }

  // Resolve scope at verify time — the magic-link token only proves the
  // email; whether it's a team email or a client email is determined now,
  // against the current env. If the email was removed from both lists
  // between request and click, deny.
  const scope = resolveUserScope(email);
  if (!scope) {
    return redirectWithError(request.url);
  }

  const sessionToken = await createSessionToken({ email, scope });

  // Redirect destination:
  //   team   → /console (master client index)
  //   client → /console/{slug}/blueprint (their blueprint, direct)
  const destination =
    scope.type === 'client'
      ? `/console/${scope.slug}/blueprint`
      : '/console';

  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.set({
    name: COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
  });
  response.cookies.delete('console_signin_submitted');
  return response;
}
