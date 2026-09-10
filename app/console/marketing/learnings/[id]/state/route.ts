/** PUT /console/marketing/learnings/[id]/state (D115): the one save path for a learning's fields. */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/console-auth';
import { getLearning, saveLearning } from '@/lib/marketing/learning-store';
import { isUseCaseId } from '@/lib/marketing/use-case';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const Body = z.object({
  article: z.string().max(40000).optional(),
  learning: z.string().max(600).optional(),
  source: z.string().max(400).optional(),
  use_case: z.string().max(60).nullable().optional(),
  hero_url: z.string().max(2000).optional(),
  hero_media_id: z.string().max(200).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team') return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const l = await getLearning(id);
  if (!l) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const next = { ...l };
  if (body.article !== undefined) next.article = body.article;
  if (body.learning !== undefined) next.learning = body.learning;
  if (body.source !== undefined) {
    if (body.source.trim()) next.source = body.source.trim();
    else delete next.source;
  }
  if (body.use_case !== undefined) {
    if (isUseCaseId(body.use_case)) next.use_case = body.use_case;
    else delete next.use_case;
  }
  if (body.hero_url !== undefined) next.hero_url = body.hero_url;
  if (body.hero_media_id !== undefined) next.hero_media_id = body.hero_media_id;
  try {
    const saved = await saveLearning(next);
    return NextResponse.json({ learning: saved });
  } catch (err) {
    console.error('[learnings.state] save failed:', err);
    return NextResponse.json({ error: 'could not save' }, { status: 500 });
  }
}
