import { NextResponse } from 'next/server';
import { z } from 'zod';
import { complete } from '@/lib/llm';
import {
  CAPABILITY_MAP_SYSTEM_PROMPT,
  buildCapabilityMapUserMessage,
} from '@/lib/agents/capability-map-prompt';
import { validateCapabilityMapV05 } from '@/lib/agents/capability-map-schema-v05';
import { stripEmDashes } from '@/lib/em-dash';
import type { CapabilityMapV05 } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const AnswersSchema = z.object({
  name: z.string(),
  company: z.string().optional().default(''),
  business_description: z.string(),
  role: z.string(),
  bottleneck_full: z.string(),
  ideal_outcome: z.string(),
  work_shape: z.string(),
  volume: z.string(),
  team_size: z.string(),
  context: z.string().optional().default(''),
  urgency: z.string(),
  email: z.string().optional(),
});

const BodySchema = z.object({ answers: AnswersSchema });

/**
 * POST /api/capability-map/generate
 *
 * Cap Matrix v0.5: calls the configured LLM (default OpenRouter + DeepSeek)
 * with the v0.5 master prompt, validates the JSON envelope, retries once on
 * validation failure with lower temperature. On double-fail, returns a
 * structured error so PhaseB can render its graceful-error state.
 *
 * No rule-based fallback. The v0.5 schema is too rich to fake convincingly;
 * a degraded fallback would misrepresent the contract.
 */
export async function POST(req: Request) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const userMessage = buildCapabilityMapUserMessage(body.answers);
  const provider = process.env.LLM_PROVIDER ?? 'kimi';
  const model = modelForProvider(provider);
  console.log(
    `[capability-map.generate] starting v0.5, provider=${provider} model=${model}`
  );

  let lastError = 'unknown';

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await complete({
        system: CAPABILITY_MAP_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        // v0.5 output is 3-4x the size of legacy; allow generous headroom.
        maxTokens: 16000,
        temperature: attempt === 1 ? 0.6 : 0.3,
      });

      const json = parseJsonLoose(raw);
      const validation = validateCapabilityMapV05(json);
      if (!validation.ok) {
        lastError = `schema validation failed: ${validation.error}`;
        console.error(
          `[capability-map.generate] attempt ${attempt} VALIDATION FAILED: ${validation.error}`
        );
        continue;
      }

      // Strip em-dashes from every string field in the response, recursively.
      // Belt-and-braces over the system-prompt instruction.
      const cleaned = stripEmDashesRecursively(validation.data) as CapabilityMapV05;

      console.log(
        `[capability-map.generate] attempt ${attempt} OK, returning v0.5 map`
      );
      return NextResponse.json({ ok: true, data: cleaned });
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      console.error(
        `[capability-map.generate] attempt ${attempt} THREW: ${lastError}`
      );
    }
  }

  console.error(
    '[capability-map.generate] both attempts failed, returning structured error'
  );
  return NextResponse.json(
    {
      ok: false,
      error: 'generation_failed',
      detail: lastError,
    },
    { status: 502 }
  );
}

function modelForProvider(provider: string): string {
  switch (provider) {
    case 'kimi':
    case 'moonshot':
      return process.env.KIMI_MODEL ?? 'moonshot-v1-128k';
    case 'openai':
      return process.env.OPENAI_MODEL ?? 'gpt-4o';
    case 'minimax':
    case 'openrouter':
      return process.env.OPENROUTER_MODEL ?? 'unknown';
    default:
      return 'unknown';
  }
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

function stripEmDashesRecursively(value: unknown): unknown {
  if (typeof value === 'string') return stripEmDashes(value);
  if (Array.isArray(value)) return value.map(stripEmDashesRecursively);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = stripEmDashesRecursively(v);
    }
    return out;
  }
  return value;
}
