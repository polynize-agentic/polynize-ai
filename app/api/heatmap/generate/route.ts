import { NextResponse } from 'next/server';
import { z } from 'zod';
import { complete } from '@/lib/llm';
import { HEATMAP_SYSTEM_PROMPT, buildHeatMapUserMessage } from '@/lib/agents/heatmap-prompt';
import { validateHeatMap } from '@/lib/agents/heatmap-schema';
import { deriveHeatMapFallback } from '@/lib/agents/derive-heatmap-fallback';
import { stripEmDashes } from '@/lib/em-dash';
import type { MultiTeamHeatMap } from '@/lib/types';

export const runtime = 'nodejs';

const AnswersSchema = z.object({
  name: z.string(),
  company: z.string().optional().default(''),
  business_description: z.string(),
  team_size: z.string(),
  functional_areas: z.array(z.string()),
  primary_area: z.string(),
  drowning_work: z.string(),
  human_critical: z.string(),
  primary_risk: z.string(),
  tools: z.array(z.string()),
  urgency: z.string(),
  email: z.string().optional(),
});

const BodySchema = z.object({ answers: AnswersSchema });

/**
 * POST /api/heatmap/generate
 *
 * Calls GPT-5.4 with the Pre-Mapper prompt, validates the JSON, retries once
 * on validation failure, and falls back to the rule-based derivation if both
 * attempts fail. Always returns a MultiTeamHeatMap.
 *
 * The endpoint does NOT persist. The caller (PhaseB) hands the result up to
 * AgentsController which calls /api/session/heat-map separately.
 */
export async function POST(req: Request) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
  }

  const userMessage = buildHeatMapUserMessage(body.answers);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await complete({
        system: HEATMAP_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 3000,
        temperature: attempt === 1 ? 0.7 : 0.4,
      });

      const json = parseJsonLoose(raw);
      const validation = validateHeatMap(json);
      if (!validation.ok) {
        console.warn(`[heatmap.generate] attempt ${attempt} validation failed: ${validation.error}`);
        continue;
      }

      const data: MultiTeamHeatMap = {
        ...validation.data,
        business_summary: stripEmDashes(validation.data.business_summary),
        leverage_rationale: stripEmDashes(validation.data.leverage_rationale),
        teams: validation.data.teams.map((t) => ({
          ...t,
          agents: t.agents.map((a) => ({
            ...a,
            short_desc: stripEmDashes(a.short_desc),
          })),
          functions: t.functions.map((f) => ({
            ...f,
            label: stripEmDashes(f.label),
          })),
        })),
        generated_by: 'llm',
      };

      return NextResponse.json({ ok: true, data });
    } catch (e) {
      console.warn(`[heatmap.generate] attempt ${attempt} threw`, e);
    }
  }

  console.error('[heatmap.generate] both attempts failed, returning rule-based fallback');
  const fallback = deriveHeatMapFallback(body.answers);
  return NextResponse.json({ ok: true, data: fallback, fallback: true });
}

/**
 * GPT models occasionally wrap their JSON in ```json fences or include
 * stray prose. Strip the obvious cases before JSON.parse.
 */
function parseJsonLoose(raw: string): unknown {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;
  // Find the first { and last } as a final safety net.
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no JSON object in LLM response');
  return JSON.parse(candidate.slice(start, end + 1));
}
