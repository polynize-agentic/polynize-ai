import type { CompleteArgs } from './index';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * OpenAI Chat Completions transport. Logs every failure loudly to the
 * server console so dev terminals make the root cause obvious.
 */
export async function completeWithOpenAI(args: CompleteArgs): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[llm.openai] OPENAI_API_KEY is not set');
    throw new Error('OPENAI_API_KEY is not set');
  }
  const model = process.env.OPENAI_MODEL ?? 'gpt-5.4';
  const keyHint = `${apiKey.slice(0, 7)}…${apiKey.slice(-4)}`;

  const res = await fetch(OPENAI_URL, {
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
      `[llm.openai] HTTP ${res.status} from ${OPENAI_URL}\n  model: ${model}\n  key:   ${keyHint}\n  body:  ${text.slice(0, 800)}`
    );
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    console.error('[llm.openai] response had no choices[0].message.content', JSON.stringify(data).slice(0, 500));
    throw new Error('OpenAI returned no content');
  }
  return content;
}
