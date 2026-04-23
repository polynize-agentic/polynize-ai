import { NextResponse } from 'next/server';
import { z } from 'zod';
import { complete, type ChatMessage } from '@/lib/llm';
import { stripEmDashes } from '@/lib/em-dash';

export const runtime = 'nodejs';

const BodySchema = z.object({
  system: z.string().min(1),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1),
    })
  ).min(1),
});

export async function POST(req: Request) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const text = await complete({
      system: body.system,
      messages: body.messages as ChatMessage[],
    });
    return NextResponse.json({ text: stripEmDashes(text) });
  } catch (err) {
    console.error('chat route error', err);
    return NextResponse.json({ error: 'LLM call failed' }, { status: 502 });
  }
}
