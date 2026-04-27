import { NextResponse } from 'next/server';
import { z } from 'zod';
import { complete } from '@/lib/llm';
import {
  CAPABILITY_MAP_SYSTEM_PROMPT,
  buildCapabilityMapUserMessage,
} from '@/lib/agents/capability-map-prompt';
import { validateCapabilityMap } from '@/lib/agents/capability-map-schema';
import { deriveCapabilityMapFallback } from '@/lib/agents/derive-capability-map-fallback';
import { stripEmDashes } from '@/lib/em-dash';
import type { CapabilityMapData } from '@/lib/types';

export const runtime = 'nodejs';

const AnswersSchema = z.object({
  name: z.string(),
  company: z.string().optional().default(''),
  business_description: z.string(),
  role: z.string(),
  bottleneck_full: z.string(),
  ideal_outcome: z.string(),
  time_waste: z.string(),
  primary_risk: z.string(),
  team_size: z.string(),
  tools: z.array(z.string()),
  urgency: z.string(),
  email: z.string().optional(),
});

const BodySchema = z.object({ answers: AnswersSchema });

/**
 * POST /api/capability-map/generate
 *
 * Calls OpenAI (default gpt-4o) with the Capability Map prompt, validates the JSON, retries
 * once on validation failure, and falls back to the rule-based derivation if
 * both attempts fail. Always returns a CapabilityMapData.
 */
export async function POST(req: Request) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
  }

  const userMessage = buildCapabilityMapUserMessage(body.answers);

  const provider = process.env.LLM_PROVIDER ?? 'openai';
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o';
  console.log(`[capability-map.generate] starting, provider=${provider} model=${model}`);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await complete({
        system: CAPABILITY_MAP_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 3500,
        temperature: attempt === 1 ? 0.7 : 0.4,
      });

      const json = parseJsonLoose(raw);
      const validation = validateCapabilityMap(json);
      if (!validation.ok) {
        console.error(
          `[capability-map.generate] attempt ${attempt} VALIDATION FAILED: ${validation.error}`
        );
        continue;
      }

      const data: CapabilityMapData = {
        ...validation.data,
        interpretation: stripEmDashes(validation.data.interpretation),
        leverage_rationale: stripEmDashes(validation.data.leverage_rationale),
        capabilities: validation.data.capabilities.map((c) => ({
          ...c,
          label: stripEmDashes(c.label),
          detail: stripEmDashes(c.detail),
        })),
        team: {
          human_owner: {
            ...validation.data.team.human_owner,
            role: stripEmDashes(validation.data.team.human_owner.role),
          },
          agents: validation.data.team.agents.map((a) => ({
            ...a,
            short_desc: stripEmDashes(a.short_desc),
          })),
        },
        hiring_comparison: {
          ...validation.data.hiring_comparison,
          note: stripEmDashes(validation.data.hiring_comparison.note),
        },
        generated_by: 'llm',
      };

      console.log(`[capability-map.generate] attempt ${attempt} OK, returning LLM result`);
      return NextResponse.json({ ok: true, data });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[capability-map.generate] attempt ${attempt} THREW: ${msg}`);
    }
  }

  console.error('[capability-map.generate] both attempts failed, returning rule-based fallback');
  const fallback = deriveCapabilityMapFallback(body.answers);
  return NextResponse.json({ ok: true, data: fallback, fallback: true });
}

function parseJsonLoose(raw: string): unknown {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no JSON object in LLM response');
  return JSON.parse(candidate.slice(start, end + 1));
}
