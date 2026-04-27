import type { CompleteArgs } from './index';

/**
 * Moonshot / Kimi Chat Completions transport. Moonshot's API is OpenAI-
 * compatible, so the request shape mirrors lib/llm/openai.ts exactly. Only
 * the URL, header key, and model default change.
 *
 * Default model is `moonshot-v1-128k` for stable behaviour. To switch to the
 * newer K2 lineup, set `KIMI_MODEL=kimi-k2-0905-preview` (or `kimi-latest`).
 *
 * Logs every failure loudly to the server console so dev terminals make the
 * root cause obvious.
 */
const KIMI_DEFAULT_URL = 'https://api.moonshot.cn/v1/chat/completions';
const KIMI_DEFAULT_MODEL = 'moonshot-v1-128k';

export async function completeWithKimi(args: CompleteArgs): Promise<string> {
  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    console.error('[llm.kimi] KIMI_API_KEY is not set');
    throw new Error('KIMI_API_KEY is not set');
  }
  const url = process.env.KIMI_BASE_URL ?? KIMI_DEFAULT_URL;
  const model = process.env.KIMI_MODEL ?? KIMI_DEFAULT_MODEL;
  const keyHint = `${apiKey.slice(0, 7)}…${apiKey.slice(-4)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
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
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(
      `[llm.kimi] HTTP ${res.status} from ${url}\n  model: ${model}\n  key:   ${keyHint}\n  body:  ${text.slice(0, 800)}`
    );
    throw new Error(`Kimi ${res.status}: ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    console.error(
      '[llm.kimi] response had no choices[0].message.content',
      JSON.stringify(data).slice(0, 500)
    );
    throw new Error('Kimi returned no content');
  }
  return content;
}
