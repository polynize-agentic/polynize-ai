import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { supabaseService } from './supabase';

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'polynize_session';
const MAX_AGE_DAYS = Number(process.env.SESSION_COOKIE_MAX_AGE_DAYS ?? 30);

/**
 * Read the session id from cookie. Returns null if not present.
 * Server-only.
 */
export async function getSessionId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}

/**
 * Ensure a session id exists. If the cookie is already set, return it.
 * If not, mint a new uuid, insert a sessions row in Supabase (when
 * SUPABASE_URL is configured), set the httpOnly cookie, and return it.
 *
 * Safe to call from any server route — every write endpoint calls this
 * first so a session exists before any answers/heat-map/message rows
 * are created.
 */
export async function ensureSession(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const id = randomUUID();

  if (process.env.SUPABASE_URL) {
    try {
      await supabaseService().from('sessions').insert({ id, phase: 'A' });
    } catch (e) {
      // Insert failures (e.g. duplicate uuid race) shouldn't block the
      // user — we still set the cookie and let downstream upserts handle
      // the row.
      console.error('[session] insert failed', e);
    }
  }

  jar.set({
    name: COOKIE_NAME,
    value: id,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
  });

  return id;
}
