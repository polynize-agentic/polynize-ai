import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureSession } from '@/lib/session';
import { supabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

const PercentagesSchema = z.object({
  human: z.number(),
  hybrid: z.number(),
  agent: z.number(),
});

const TeamSchema = z
  .object({
    name: z.string(),
    shape: z.string(),
    agents: z.array(z.object({}).passthrough()),
    functions: z.array(z.object({ label: z.string(), allocation: z.string() })),
    percentages: PercentagesSchema,
  })
  .passthrough();

const BodySchema = z.object({
  data: z
    .object({
      business_summary: z.string(),
      shape_primary: z.string(),
      teams: z.array(TeamSchema).min(1),
      total: PercentagesSchema,
      leverage_estimate: z.string(),
      leverage_rationale: z.string(),
      generated_by: z.enum(['llm', 'rule_based']).optional(),
    })
    .passthrough(),
});

/**
 * Upsert the multi-team heat map for this session. Stores the full payload
 * in the new `data` jsonb column. The legacy `shape` column gets the
 * shape_primary string so existing tooling/queries still surface something
 * useful at a glance.
 */
export async function POST(req: Request) {
  if (!process.env.SUPABASE_URL) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const sessionId = await ensureSession();
  const sb = supabaseService();

  try {
    const upsertRes = await sb.from('heat_maps').upsert(
      {
        session_id: sessionId,
        shape: body.data.shape_primary,
        percentages: body.data.total,
        data: body.data,
        generated_by: body.data.generated_by ?? 'llm',
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
