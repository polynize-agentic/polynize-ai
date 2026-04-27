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

const BodySchema = z.object({
  data: z
    .object({
      interpretation: z.string(),
      capabilities: z.array(
        z.object({ label: z.string(), allocation: z.string(), detail: z.string() })
      ),
      percentages: PercentagesSchema,
      team: z.object({}).passthrough(),
      leverage_estimate: z.string(),
      leverage_rationale: z.string(),
      pricing_indicative: z.object({}).passthrough(),
      hiring_comparison: z.object({}).passthrough(),
      shape_internal: z.string(),
      shape_id: z.number(),
      generated_by: z.enum(['llm', 'rule_based']).optional(),
    })
    .passthrough(),
});

/**
 * Upsert the capability map for this session. Stores the full payload
 * in the `data` jsonb column.
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
    const upsertRes = await sb.from('capability_maps').upsert(
      {
        session_id: sessionId,
        shape_internal: body.data.shape_internal,
        percentages: body.data.percentages,
        data: body.data,
        generated_by: body.data.generated_by ?? 'llm',
      },
      { onConflict: 'session_id' }
    );
    if (upsertRes.error) throw upsertRes.error;

    await sb.from('sessions').update({ phase: 'C' }).eq('id', sessionId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[capability-map] upsert failed', e);
    return NextResponse.json({ error: 'Persistence failed' }, { status: 500 });
  }
}
