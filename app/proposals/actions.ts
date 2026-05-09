'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME, expectedToken, passwordMatches } from './_auth';

/**
 * Validate the password and, if correct, set the unlock cookie + redirect
 * back to /proposals. Wrong password redirects with ?error=1 so the form
 * can render an inline message.
 */
export async function unlockAction(formData: FormData): Promise<void> {
  const password = String(formData.get('password') ?? '');
  if (!passwordMatches(password)) {
    redirect('/proposals?error=1');
  }
  const c = await cookies();
  c.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/proposals',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  redirect('/proposals');
}

/**
 * Drop the cookie and bounce back to /proposals (which will then render
 * the gate). Used by the "lock" button on the index page.
 */
export async function lockAction(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
  redirect('/proposals');
}
