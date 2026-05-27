'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  COOKIE_NAME,
  createMagicLinkToken,
  isEmailAllowed,
} from '@/lib/console-auth';
import { sendEmail } from '@/lib/resend-client';

const emailSchema = z.string().email();
const FLASH_TTL_SECONDS = 60;

const FLASH_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/console',
  maxAge: FLASH_TTL_SECONDS,
};

/**
 * Three flash cookies drive the sign-in card's state:
 *  - console_signin_submitted=1  + console_signin_email=<email>  → "Check
 *    your inbox" confirmation card replaces the form.
 *  - console_signin_error=invalid_email | send_failed | invalid_link →
 *    inline error on the form.
 * Set with TTL 60s; the user will have moved on by then.
 */
export async function requestMagicLinkAction(formData: FormData): Promise<void> {
  const raw = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const parsed = emailSchema.safeParse(raw);

  const jar = await cookies();
  const setFlash = (name: string, value: string) => {
    jar.set({
      name,
      value,
      ...FLASH_OPTS,
      secure: process.env.NODE_ENV === 'production',
    });
  };

  // Clear stale flash from any prior attempt so the new state wins cleanly.
  jar.delete('console_signin_submitted');
  jar.delete('console_signin_email');
  jar.delete('console_signin_error');

  if (!parsed.success) {
    setFlash('console_signin_error', 'invalid_email');
    redirect('/console');
  }

  let sendFailed = false;
  if (isEmailAllowed(raw)) {
    try {
      const token = await createMagicLinkToken(raw);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://pam.polynize.ai';
      const link = `${baseUrl}/console/auth/verify?token=${encodeURIComponent(token)}`;

      await sendEmail({
        to: raw,
        subject: 'Sign in to Polynize Agentic Management Console',
        html: `<p>Click the link below to sign in to the Polynize Agentic Management Console (PAM):</p>
<p><a href="${link}">Sign in to Polynize Agentic Management Console</a></p>
<p>This link expires in 15 minutes.</p>
<p>If you did not request this, you can safely ignore this email.</p>`,
        text: `Sign in to the Polynize Agentic Management Console (PAM):

${link}

This link expires in 15 minutes.

If you did not request this, you can safely ignore this email.`,
      });
    } catch (err) {
      console.error('[console-auth] failed to send magic link', err);
      sendFailed = true;
    }
  }

  if (sendFailed) {
    setFlash('console_signin_error', 'send_failed');
  } else {
    // Set confirmation cookies regardless of allowlist membership. The
    // confirmation card just echoes the submitted email back; it does not
    // reveal whether the email is authorized (the link would simply fail
    // verification if not). Non-disclosure preserved.
    setFlash('console_signin_submitted', '1');
    setFlash('console_signin_email', raw);
  }

  redirect('/console');
}

/**
 * Clears the sign-in flash cookies so the form re-appears. Wired up to the
 * "Use a different email" button in the confirmation card.
 */
export async function resetSignInAction(): Promise<void> {
  const jar = await cookies();
  jar.delete('console_signin_submitted');
  jar.delete('console_signin_email');
  jar.delete('console_signin_error');
  redirect('/console');
}

export async function signOutAction(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  redirect('/console');
}
