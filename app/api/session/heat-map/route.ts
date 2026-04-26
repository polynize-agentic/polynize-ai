import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureSession } from '@/lib/session';
import { supabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

const BodySchema = z.object({
  shape_id: z.string(),
  shape_display_name: z.string(),
  shape_short_name: z.string(),
  percentages: z.object({
    human: z.number(),
    hybrid: z.number(),
    agent: z.number(),
  }),
  rows: z.array(z.object({ fn: z.string(), alloc: z.string() })),
  team: z.array(
    z
      .object({ name: z.string(), role: z.string(), type: z.string() })
      .passthrough()
  ),
});

/**
 * Upsert the derived heat map for this session. Called by
 * AgentsController when Phase B completes (chat nudge clicked).
 *
 * The `shape` column stores the shape_id; the human-readable
 * display/short names live inside the team/rows JSON snapshot when
 * we later denormalize into blueprints.data.
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

  try {
    const upsertRes = await sb.from('heat_maps').upsert(
      {
        session_id: sessionId,
        shape: body.shape_id,
        percentages: body.percentages,
        rows: body.rows,
        team: body.team,
        generated_by: 'rule_based',
      },
      { onConflict: 'session_id' }
    );
    if (upsertRes.error) throw upsertRes.error;

    await sb.from('sessions').update({ phase: 'C' }).eq('id', sessionId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[heat-map] upsert failed', e);
    return NextResponse.json({ error: 'Persistence failed' }, { status: 500 });
  }
}
