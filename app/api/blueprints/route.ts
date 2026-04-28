import { NextResponse } from 'next/server';
import { ensureSession } from '@/lib/session';
import { supabaseService } from '@/lib/supabase';
import { PRICING_VERSION } from '@/lib/pricing';
import { notifyRichie, type RichiePayload } from '@/lib/richie-webhook';
import type { Answers, CapabilityMapData } from '@/lib/types';

export const runtime = 'nodejs';

/**
 * Snapshot the current session's answers + capability map into a blueprint
 * row, return the new blueprint id. The visitor is then sent to
 * /blueprints/<id>.
 *
 * Idempotent per session: blueprints.session_id is UNIQUE, so calling
 * twice for the same session refreshes the snapshot rather than
 * creating a duplicate.
 *
 * After the row is written, fires a fire-and-forget webhook to Richie
 * (the agent who owns the actual email send). The visitor does not wait
 * for that dispatch — they get the blueprint id back immediately and
 * navigate to /blueprints/<id>.
 */
export async function POST(req: Request) {
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
      sb.from('capability_maps').select('*').eq('session_id', sessionId).maybeSingle(),
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
      .select('id, created_at')
      .single();

    if (error || !blueprint) {
      console.error('[blueprints] upsert failed', error);
      return NextResponse.json({ error: 'Persistence failed' }, { status: 500 });
    }

    await sb.from('sessions').update({ phase: 'DONE' }).eq('id', sessionId);

    // Fire-and-forget the Richie webhook so the visitor doesn't wait on it.
    // The dispatch + email_log write happens in the background; failures
    // are logged but never block the blueprint URL response.
    void dispatchToRichie(req, blueprint.id, blueprint.created_at as string, ans.answers as Partial<Answers>, hm.data as CapabilityMapData, sessionId);

    return NextResponse.json({ ok: true, id: blueprint.id });
  } catch (e) {
    console.error('[blueprints] create failed', e);
    return NextResponse.json({ error: 'Persistence failed' }, { status: 500 });
  }
}

async function dispatchToRichie(
  req: Request,
  blueprintId: string,
  createdAt: string,
  answers: Partial<Answers>,
  data: CapabilityMapData,
  sessionId: string
): Promise<void> {
  const email = answers.email?.trim();
  if (!email) {
    console.warn(`[richie-webhook] no email captured on session ${sessionId}, skipping dispatch`);
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || originFromRequest(req);
  const blueprintUrl = `${baseUrl}/blueprints/${blueprintId}`;

  const payload: RichiePayload = {
    to: email,
    name: (answers.name ?? '').trim().split(/\s+/)[0] || 'there',
    company: (answers.company ?? '').trim(),
    blueprint_url: blueprintUrl,
    bottleneck_one_liner: deriveBottleneckOneLiner(answers, data),
    agent_count: data.team.agents.length,
    leverage_estimate: data.leverage_estimate,
    generated_at: createdAt,
  };

  const result = await notifyRichie(payload);

  // Audit-trail every attempt to email_log so we can reconcile outcomes
  // later without depending on Richie's logs.
  try {
    const sb = supabaseService();
    await sb.from('email_log').insert({
      session_id: sessionId,
      email,
      template: 'richie_webhook',
      status: result.status,
      resend_id: null,
    });
  } catch (e) {
    console.error('[email_log] insert failed', e);
  }
}

/**
 * Pull a one-line summary of the bottleneck for Richie's email body.
 * Prefers the LLM's interpretation (always present); falls back to the
 * raw user input if needed.
 */
function deriveBottleneckOneLiner(
  answers: Partial<Answers>,
  data: CapabilityMapData
): string {
  const interp = data.interpretation?.trim();
  if (interp) {
    // First sentence of the LLM interpretation, capped.
    const first = interp.split(/(?<=[.!?])\s+/)[0] ?? interp;
    return first.length > 220 ? `${first.slice(0, 217).trim()}…` : first;
  }
  const raw = answers.bottleneck_full?.trim() ?? '';
  const firstLine = raw.split('\n')[0] ?? raw;
  return firstLine.length > 220 ? `${firstLine.slice(0, 217).trim()}…` : firstLine;
}

function originFromRequest(req: Request): string {
  try {
    const u = new URL(req.url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return 'https://polynize.ai';
  }
}
