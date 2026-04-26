import { NextResponse } from 'next/server';
import { ensureSession } from '@/lib/session';

export const runtime = 'nodejs';

/**
 * Issues a session uuid (httpOnly cookie) and creates the corresponding
 * sessions row in Supabase. Idempotent — calling repeatedly returns the
 * existing session.
 */
export async function POST() {
  const sessionId = await ensureSession();
  return NextResponse.json({ sessionId });
}
