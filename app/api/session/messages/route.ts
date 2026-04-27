import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureSession } from '@/lib/session';
import { supabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

const BodySchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  agent_persona: z.string().optional(),
});

/**
 * Append a chat message to this session's transcript. Called by
 * PhaseC for both the user-typed message and the assistant reply.
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

  try {
    const insertRes = await sb.from('chat_messages').insert({
      session_id: sessionId,
      role: body.role,
      content: body.content,
      agent_persona: body.agent_persona,
    });
    if (insertRes.error) throw insertRes.error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[messages] insert failed', e);
    return NextResponse.json({ error: 'Persistence failed' }, { status: 500 });
  }
}
