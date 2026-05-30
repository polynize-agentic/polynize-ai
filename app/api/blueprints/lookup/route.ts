/**
 * GET /api/blueprints/lookup?email=<email>&firstName=<name>
 *
 * Lookup endpoint called by the PAM Console seed flow (Stage 2 Landmark 5).
 * Returns the most recent blueprint for the given email, with optional
 * firstName disambiguation.
 *
 * Auth: Bearer $POLYNIZE_LOOKUP_KEY. Shared secret between this API and
 * the Console. Missing/invalid key → 401.
 *
 * Privacy: this endpoint is keyed (not publicly readable). It returns the
 * full v0.5 capability_map envelope plus the user's Phase A answers (which
 * include email + name + bottleneck). It is NOT for general visitors.
 *
 * Spec: stage2-data-model.md §8.6.
 */

import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { supabaseService } from '@/lib/supabase';
import { normalizeToV05Envelope } from '@/lib/blueprint/schema-v2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function verifyBearer(request: Request): boolean {
  const expected = process.env.POLYNIZE_LOOKUP_KEY;
  if (!expected) return false;
  const header = request.headers.get('authorization');
  if (!header) return false;
  const sep = header.indexOf(' ');
  if (sep === -1) return false;
  const scheme = header.slice(0, sep);
  const key = header.slice(sep + 1).trim();
  if (scheme.toLowerCase() !== 'bearer' || !key) return false;
  try {
    return constantTimeEqual(key, expected);
  } catch {
    return false;
  }
}

type SnapshotShape = {
  answers?: Record<string, unknown>;
  data?: unknown;
};

export async function GET(req: Request) {
  if (!verifyBearer(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.SUPABASE_URL) {
    return NextResponse.json(
      { error: 'Persistence not configured' },
      { status: 503 }
    );
  }

  const url = new URL(req.url);
  const emailRaw = url.searchParams.get('email');
  const firstNameRaw = url.searchParams.get('firstName');

  const email = (emailRaw ?? '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { error: 'Missing or invalid email' },
      { status: 400 }
    );
  }
  const firstName = (firstNameRaw ?? '').trim().toLowerCase();

  const sb = supabaseService();

  // Fetch by email. Sorted newest first. Limit 10 to disambiguate.
  // We pull a slice rather than one row because firstName can pick a
  // non-most-recent row when the same email submitted multiple times
  // for different people on shared inboxes.
  const { data: rows, error } = await sb
    .from('blueprints')
    .select('id, created_at, data')
    .order('created_at', { ascending: false })
    .limit(10)
    .filter('data->answers->>email', 'eq', email);

  if (error) {
    console.error('[blueprints/lookup] supabase query failed', error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json(
      { error: 'No blueprint found for email' },
      { status: 404 }
    );
  }

  // Disambiguation: if firstName provided and we have multiple rows,
  // prefer the most recent row whose answers.name starts with firstName
  // (case-insensitive). Otherwise fall back to the most recent.
  let chosen = rows[0];
  if (firstName) {
    const match = rows.find((r) => {
      const snap = r.data as SnapshotShape;
      const name = String(
        (snap?.answers?.name as string | undefined) ?? ''
      )
        .trim()
        .toLowerCase();
      return name.startsWith(firstName);
    });
    if (match) chosen = match;
  }

  const snap = chosen.data as SnapshotShape;
  if (!snap || !snap.data) {
    return NextResponse.json(
      { error: 'Blueprint row malformed (no data field)' },
      { status: 500 }
    );
  }

  // The Supabase row stores `data: { answers: {...}, data: <map> }`, where
  // `data.data` is the BARE v0.5 map (stage at top) for fresh rows, or the
  // legacy flat shape for older rows. Normalise to the canonical envelope
  // `{ capability_map: {...} }` so the seed flow gets one consistent shape.
  const v05Envelope = normalizeToV05Envelope(snap.data);
  if (!v05Envelope) {
    // The matched row is a legacy intake (pre-v0.5). There is no v0.5
    // envelope to seed a 2.0 Blueprint from. 422 with a clear reason so
    // the seed flow can surface it rather than failing opaquely.
    return NextResponse.json(
      {
        error:
          'The matched blueprint is a legacy (pre-v0.5) capability map; it cannot seed a 2.0 Lead Blueprint.',
        uuid: chosen.id,
        generatedAt: chosen.created_at as string,
        schema: 'legacy',
      },
      { status: 422 }
    );
  }

  return NextResponse.json({
    uuid: chosen.id,
    v05Envelope,
    answers: snap.answers ?? {},
    generatedAt: chosen.created_at as string,
  });
}
