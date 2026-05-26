import type { CompleteArgs } from './index';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function completeWithOpenRouter(args: CompleteArgs): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');
  const model = process.env.OPENROUTER_MODEL ?? 'minimax/minimax-01';
  const referer = process.env.OPENROUTER_REFERER ?? 'https://polynize.ai';
  const title = process.env.OPENROUTER_TITLE ?? 'Polynize Agent Builder';

  const res = await fetch(OPENROUTER_URL, {
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
  });

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
