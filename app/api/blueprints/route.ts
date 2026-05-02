import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { ensureSession } from '@/lib/session';
import { supabaseService } from '@/lib/supabase';
import { PRICING_VERSION } from '@/lib/pricing';
import { notifyScout, type ScoutPayload } from '@/lib/scout-webhook';
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
 * After the row is written, fires a fire-and-forget webhook to Scout
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

    // Hand the Scout dispatch + email_log write to Vercel's waitUntil so
    // the runtime keeps the function instance alive long enough to finish
    // the work even after we've shipped the response. Plain `void promise()`
    // gets reaped on Vercel's serverless lifecycle the moment the response
    // is flushed, which was silently dropping every Scout dispatch.
    waitUntil(
      dispatchToScout(
        req,
        blueprint.id,
        blueprint.created_at as string,
        ans.answers as Partial<Answers>,
        hm.data as CapabilityMapData,
        sessionId
      )
    );

    return NextResponse.json({ ok: true, id: blueprint.id });
  } catch (e) {
    console.error('[blueprints] create failed', e);
    return NextResponse.json({ error: 'Persistence failed' }, { status: 500 });
  }
}

async function dispatchToScout(
  req: Request,
  blueprintId: string,
  createdAt: string,
  answers: Partial<Answers>,
  data: CapabilityMapData,
  sessionId: string
): Promise<void> {
  const email = answers.email?.trim();
  if (!email) {
    console.warn(`[scout-webhook] no email captured on session ${sessionId}, skipping dispatch`);
    return;
  }

  // Dedupe: now that Phase B auto-creates the blueprint on every visit
  // (including page reloads), /api/blueprints can fire multiple times for
  // the same session. Don't ping Scout twice — if email_log already has a
  // 'sent_to_scout' or 'scout_unavailable' row for this session, treat the
  // dispatch as already-attempted.
  const sb = supabaseService();
  try {
    const { data: prior } = await sb
      .from('email_log')
      .select('status')
      .eq('session_id', sessionId)
      .eq('template', 'scout_webhook')
      .in('status', ['sent_to_scout', 'scout_unavailable'])
      .limit(1);
    if (prior && prior.length > 0) {
      console.log(
        `[scout-webhook] dispatch already recorded for session ${sessionId} (${prior[0].status}), skipping`
      );
      return;
    }
  } catch (e) {
    // If the dedupe query fails for any reason, fall through and dispatch.
    // Better to occasionally double-fire than to silently skip every send.
    console.warn('[scout-webhook] dedupe query failed, dispatching anyway:', e);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || originFromRequest(req);
  const blueprintUrl = `${baseUrl}/blueprints/${blueprintId}`;

  const payload: ScoutPayload = {
    to: email,
    name: (answers.name ?? '').trim().split(/\s+/)[0] || 'there',
    company: (answers.company ?? '').trim(),
    blueprint_url: blueprintUrl,
    bottleneck_one_liner: deriveBottleneckOneLiner(answers, data),
    agent_count: data.team.agents.length,
    leverage_estimate: data.leverage_estimate,
    generated_at: createdAt,
  };

  const result = await notifyScout(payload);

  // Audit-trail every attempt to email_log.
  try {
    await sb.from('email_log').insert({
      session_id: sessionId,
      email,
      template: 'scout_webhook',
      status: result.status,
      resend_id: null,
    });
  } catch (e) {
    console.error('[email_log] insert failed', e);
  }
}

/**
 * Pull a one-line summary of the bottleneck for Scout's email body.
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
