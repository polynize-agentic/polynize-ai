/**
 * POST /console/marketing/learnings/[id]/publish (D115): { publish: true } puts the article live at
 * polynize.ai/library/{slug}; false takes it down. Nothing else changes: the page reads the stored
 * article, so an edit after publishing is live on the next request.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/console-auth';
import { getLearning, saveLearning, learningBody } from '@/lib/marketing/learning-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team') return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { publish?: unknown } | null;
  const on = body?.publish === true;
  const l = await getLearning(id);
  if (!l) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (on && learningBody(l.article).trim().length < 200) {
    return NextResponse.json({ error: 'the article is too short to publish; write it first' }, { status: 400 });
  }
  const next = { ...l };
  if (on) next.published_at = next.published_at ?? new Date().toISOString();
  else delete next.published_at;
  try {
    const saved = await saveLearning(next);
    return NextResponse.json({ learning: saved });
  } catch (err) {
    console.error('[learnings.publish] save failed:', err);
    return NextResponse.json({ error: 'could not change that' }, { status: 500 });
  }
}
