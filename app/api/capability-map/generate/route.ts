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
// 300s ceiling per Vercel's current default (was 60s, hardcoded too low for
// DeepSeek V4 Pro generating the v0.5 envelope; two retry attempts on a
// 16k-token output could blow past 60s and surface as a "function timeout"
// connection abort on the client). Bumped 2026-05-26 during Step 7A.3
// triage of "mapping your bottleneck" hangs in production.
export const maxDuration = 300;

/**
 * Hard cap per LLM attempt enforced by Promise.race in the route handler. Sits
 * ABOVE the per-call AbortController timeout in lib/llm/openrouter.ts as a
 * safety net for the case where fetch's signal fails to terminate the in-flight
 * request (intermittent on Vercel/undici with long upstream connections).
 *
 * Production logs (Step 7A.3 triage) showed deepseek/deepseek-v4-pro taking
 * ~180s to generate a 4k-char v0.5 envelope. To survive slow models we use
 * a single generous-deadline attempt rather than two tight attempts: the
 * old two-attempt loop (110s × 2) was guaranteed to fail by arithmetic on
 * any model taking >110s for a single generation. Single attempt at 250s
 * leaves ~50s headroom under maxDuration=300s for parse/validate/respond.
 *
 * Trade-off accepted: no auto-retry on schema-validation failure. The user
 * gets a clean "Try again" button instead — same UX, manual retry.
 */
const HARD_ATTEMPT_TIMEOUT_MS = 250_000;

/**
 * Race a promise against a fixed deadline. If the deadline fires first, throw
 * a clear error. The underlying promise may still resolve later but the caller
 * has moved on by then.
 */
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} exceeded ${ms}ms deadline`)),
      ms
    );
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer !== null) clearTimeout(timer);
  }
}

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
  const routeStartedAt = Date.now();
  console.log(
    `[capability-map.generate] starting v0.5, provider=${provider} model=${model}`
  );

  let lastError = 'unknown';

  // Single attempt. Two-attempt retry was abandoned in Step 7A.3 when prod
  // logs showed deepseek/deepseek-v4-pro taking ~180s per generation. Two
  // tight attempts couldn't fit under maxDuration=300s; single generous
  // attempt gives slow models a real chance to finish. UX trade-off: no auto-
  // retry on validation failure, user clicks "Try again" instead.
  let raw: string | null = null;
  const attemptStartedAt = Date.now();
  try {
    // Belt + braces over the AbortController inside completeWithOpenRouter:
    // if fetch's signal fails to terminate the in-flight request (known
    // intermittent undici/Vercel behavior on long-running upstream
    // connections), Promise.race forces the route handler to proceed past
    // this await within HARD_ATTEMPT_TIMEOUT_MS regardless.
    raw = await withTimeout(
      complete({
        system: CAPABILITY_MAP_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        // Empirical sizing: a complete v0.5 envelope with 10-13 capability
        // rows lands around 4000-6000 tokens. 8000 gives comfortable
        // headroom without paying for tokens we never use.
        maxTokens: 8000,
        temperature: 0.5,
      }),
      HARD_ATTEMPT_TIMEOUT_MS,
      'LLM call'
    );
    const llmMs = Date.now() - attemptStartedAt;
    console.log(
      `[capability-map.generate] LLM call returned in ${llmMs}ms, raw length ${raw.length} (${
        raw.length > 0 ? Math.round((raw.length / llmMs) * 1000) : 0
      } chars/sec)`
    );

    const json = parseJsonLoose(raw);
    const validation = validateCapabilityMapV05(json);
    if (!validation.ok) {
      lastError = `schema validation failed: ${validation.error}`;
      console.error(
        `[capability-map.generate] VALIDATION FAILED: ${validation.error}`
      );
      // Log the truncated raw response so we can see exactly what the model
      // emitted that the schema rejected. Server-side only; never returned
      // to the client.
      console.error(
        `[capability-map.generate] raw response (first 2000 chars): ${raw.slice(0, 2000)}`
      );
    } else {
      // Strip em-dashes from every string field in the response, recursively.
      // Belt-and-braces over the system-prompt instruction.
      const cleaned = stripEmDashesRecursively(
        validation.data
      ) as CapabilityMapV05;

      console.log(
        `[capability-map.generate] OK, returning v0.5 map (total ${
          Date.now() - routeStartedAt
        }ms)`
      );
      return NextResponse.json({ ok: true, data: cleaned });
    }
  } catch (e) {
    lastError = e instanceof Error ? e.message : String(e);
    console.error(
      `[capability-map.generate] THREW after ${
        Date.now() - attemptStartedAt
      }ms: ${lastError}`
    );
    // If the LLM call returned but JSON parsing threw, raw is populated and
    // worth logging — that's the case where the model emitted something that
    // didn't have a parseable JSON object inside (truncation, wrong format).
    if (raw) {
      console.error(
        `[capability-map.generate] raw response (first 2000 chars): ${raw.slice(0, 2000)}`
      );
    }
  }

  console.error(
    `[capability-map.generate] failed after ${
      Date.now() - routeStartedAt
    }ms, returning structured error: ${lastError}`
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
