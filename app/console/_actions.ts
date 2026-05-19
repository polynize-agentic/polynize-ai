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

export async function requestMagicLinkAction(formData: FormData): Promise<void> {
  const raw = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const parsed = emailSchema.safeParse(raw);

  if (parsed.success && isEmailAllowed(raw)) {
    try {
      const token = await createMagicLinkToken(raw);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://pam.polynize.ai';
      const link = `${baseUrl}/console/auth/verify?token=${encodeURIComponent(token)}`;

      await sendEmail({
        to: raw,
        subject: 'Sign in to Polynize PAM Console',
        html: `<p>Click the link below to sign in to the Polynize PAM Console:</p>
<p><a href="${link}">Sign in to PAM Console</a></p>
<p>This link expires in 15 minutes.</p>
<p>If you did not request this, you can safely ignore this email.</p>`,
        text: `Sign in to the Polynize PAM Console:

${link}

This link expires in 15 minutes.

If you did not request this, you can safely ignore this email.`,
      });
    } catch (err) {
      console.error('[console-auth] failed to send magic link', err);
    }
  }

  // Always set the same flash regardless of allowlist membership.
  const jar = await cookies();
  jar.set({
    name: 'console_signin_submitted',
    value: '1',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/console',
    maxAge: FLASH_TTL_SECONDS,
  });
  jar.delete('console_signin_error');

  redirect('/console');
}

export async function signOutAction(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  redirect('/console');
}
