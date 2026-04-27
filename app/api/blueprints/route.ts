import { NextResponse } from 'next/server';
import { ensureSession } from '@/lib/session';
import { supabaseService } from '@/lib/supabase';
import { PRICING_VERSION } from '@/lib/pricing';

export const runtime = 'nodejs';

/**
 * Snapshot the current session's answers + multi-team heat map into a
 * blueprint row, return the new blueprint id. The visitor is then sent to
 * /blueprints/<id>.
 *
 * Idempotent per session: blueprints.session_id is UNIQUE, so calling
 * twice for the same session refreshes the snapshot rather than
 * creating a duplicate.
 */
export async function POST() {
  if (!process.env.SUPABASE_URL) {
    return NextResponse.json(
      { error: 'Persistence not configured' },
      { status: 503 }
    );
  }

  const sessionId = await ensureSession();
  const sb = supabaseService();

  try {
    const [{ data: ans }, { data: hm }] = await Promise.all([
      sb.from('answers').select('answers').eq('session_id', sessionId).maybeSingle(),
      sb.from('heat_maps').select('*').eq('session_id', sessionId).maybeSingle(),
    ]);

    if (!ans || !hm || !hm.data) {
      return NextResponse.json(
        { error: 'Complete Phase A and Phase B before generating a blueprint.' },
        { status: 400 }
      );
    }

    const snapshot = {
      answers: ans.answers,
      data: hm.data,
    };

    const { data: blueprint, error } = await sb
      .from('blueprints')
      .upsert(
        {
          session_id: sessionId,
          pricing_version: PRICING_VERSION,
          data: snapshot,
        },
        { onConflict: 'session_id' }
      )
      .select('id')
      .single();

    if (error || !blueprint) {
      console.error('[blueprints] upsert failed', error);
      return NextResponse.json({ error: 'Persistence failed' }, { status: 500 });
    }

    await sb.from('sessions').update({ phase: 'DONE' }).eq('id', sessionId);

    return NextResponse.json({ ok: true, id: blueprint.id });
  } catch (e) {
    console.error('[blueprints] create failed', e);
    return NextResponse.json({ error: 'Persistence failed' }, { status: 500 });
  }
}
