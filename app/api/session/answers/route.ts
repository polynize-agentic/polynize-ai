import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureSession } from '@/lib/session';
import { supabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

const BodySchema = z.object({
  answers: z.record(z.string(), z.unknown()),
  completed: z.boolean().optional(),
});

/**
 * Upsert the visitor's Phase A answers. Called by AgentsController on
 * each step change (debounce-free since it's max ~12 writes per flow).
 * When `completed: true`, also flips the session phase to 'B' and
 * stamps `completed_at`.
 */
export async function POST(req: Request) {
  if (!process.env.SUPABASE_URL) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const sessionId = await ensureSession();
  const sb = supabaseService();
  const completedAt = body.completed ? new Date().toISOString() : null;

  try {
    const upsertRes = await sb.from('answers').upsert(
      { session_id: sessionId, answers: body.answers, completed_at: completedAt },
      { onConflict: 'session_id' }
    );
    if (upsertRes.error) throw upsertRes.error;

    // Capture the email on the session row + flip phase if completed
    const sessionPatch: Record<string, unknown> = {};
    const email = (body.answers as Record<string, unknown>).email;
    if (typeof email === 'string' && email.includes('@')) sessionPatch.email = email;
    if (body.completed) sessionPatch.phase = 'B';

    if (Object.keys(sessionPatch).length > 0) {
      await sb.from('sessions').update(sessionPatch).eq('id', sessionId);
    }

    return NextResponse.json({ ok: true, sessionId });
  } catch (e) {
    console.error('[answers] upsert failed', e);
    return NextResponse.json({ error: 'Persistence failed' }, { status: 500 });
  }
}
