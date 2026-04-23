import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'polynize_session';
const MAX_AGE_DAYS = Number(process.env.SESSION_COOKIE_MAX_AGE_DAYS ?? 30);

export async function POST() {
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME)?.value;
  const id = existing ?? randomUUID();

  if (!existing) {
    jar.set({
      name: COOKIE_NAME,
      value: id,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
    });
  }

  return NextResponse.json({ sessionId: id });
}
