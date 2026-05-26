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

/**
 * Permissive body schema. Accepts both legacy CapabilityMapData and Cap Matrix
 * v0.5 (CapabilityMapV05) shapes. We only mandate the fields needed for
 * indexing (shape_internal + percentages); the full payload is stored verbatim
 * in the `data` jsonb column. Schema validation against the v0.5 contract
 * happens server-side in /api/capability-map/generate before we get here.
 */
const BodySchema = z.object({
  data: z
    .object({
      stage: z.string().optional(),
      shape_internal: z.string(),
      // Legacy shape has percentages at the root; v0.5 nests them under
      // allocation_summary. We accept either and extract the right one below.
      percentages: PercentagesSchema.optional(),
      allocation_summary: z.object({ percentages: PercentagesSchema }).passthrough().optional(),
      generated_by: z.enum(['llm', 'rule_based']).optional(),
    })
    .passthrough(),
});

/**
 * Upsert the capability map for this session. Stores the full payload
 * in the `data` jsonb column. shape_internal and percentages are also
 * lifted into their own columns for indexing/querying.
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

  // Extract percentages from whichever shape we got.
  const percentages =
    body.data.percentages ??
    body.data.allocation_summary?.percentages ??
    { human: 0, hybrid: 0, agent: 0 };

  try {
    const upsertRes = await sb.from('capability_maps').upsert(
      {
        session_id: sessionId,
        shape_internal: body.data.shape_internal,
        percentages,
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
