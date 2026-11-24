/**
 * THE CHRISTMAS RSVP PURGE (D128). The replies to /christmas26 hold allergies, which are health
 * information, and the brief says they are deleted after the event, by 31 December 2026.
 *
 * Runs daily (vercel.json). Before RSVP_PURGE_FROM (21 December, Melbourne) it does nothing; from
 * then on it deletes every row of christmas26_rsvps. Running it again on an empty table is a no-op,
 * so the ten days between the start and the brief's deadline are ten chances, not ten risks.
 *
 * AUTH exactly as the other crons: Vercel sends `Authorization: Bearer $CRON_SECRET`, the route
 * refuses to run without it, constant-time compare.
 *
 * What this does NOT delete: the reply emails in marrs@polynize.io, and Resend's copy of each
 * sent email. Those are deleted by hand (see D128).
 *
 * After January 2027 this route and its vercel.json entry can go.
 */

import { timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { RSVP_PURGE_FROM } from '@/lib/christmas26/event';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function authorised(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (Date.now() < RSVP_PURGE_FROM) {
    return NextResponse.json({ ok: true, purged: 0, waitingUntil: new Date(RSVP_PURGE_FROM).toISOString() });
  }

  const { error, count } = await supabaseService()
    .from('christmas26_rsvps')
    .delete({ count: 'exact' })
    .not('id', 'is', null);

  if (error) {
    // 42P01: the table was never made, or was already dropped. Nothing to delete is a success.
    if (error.code === '42P01') return NextResponse.json({ ok: true, purged: 0, note: 'no table' });
    console.error('[christmas26-purge] delete failed:', error.code, error.message);
    return NextResponse.json({ error: 'delete failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, purged: count ?? 0 });
}
