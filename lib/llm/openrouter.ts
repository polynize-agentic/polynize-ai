import type { CompleteArgs } from './index';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Hard ceiling on a single OpenRouter call. The capability-map route runs two
 * attempts; with a 300s Vercel function budget and a model that occasionally
 * hangs on the first token, an untimeboxed call can consume the entire budget
 * and leave us with no retries + a 504 to the browser. 120s gives the model
 * room to generate a healthy v0.5 envelope while preserving headroom for the
 * retry. Tunable via OPENROUTER_TIMEOUT_MS for incident workarounds.
 */
const DEFAULT_TIMEOUT_MS = 120_000;

export async function completeWithOpenRouter(args: CompleteArgs): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');
  const model = process.env.OPENROUTER_MODEL ?? 'minimax/minimax-01';
  const referer = process.env.OPENROUTER_REFERER ?? 'https://polynize.ai';
  const title = process.env.OPENROUTER_TITLE ?? 'Polynize Agent Builder';
  const timeoutMs = Number(process.env.OPENROUTER_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': referer,
        'X-Title': title,
      },
      body: JSON.stringify({
        model,
        max_tokens: args.maxTokens ?? 1000,
        temperature: args.temperature ?? 0.7,
        messages: [
          { role: 'system', content: args.system },
          ...args.messages,
        ],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        `OpenRouter call timed out after ${timeoutMs}ms (model=${model})`
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenRouter returned no content');
  return content;
}
