/**
 * POST /console/marketing/learnings/[id]/story (D115): make a Story from a learning, on a board.
 *
 * The Story opens at Gate 2 with the learning's article already in place, so April does not draft
 * from a bare idea: the long form exists and the kit is cut from it. It carries the learning's use
 * case, and `learning_slug`, which is where every post's link will land (the article's page on
 * polynize.ai) instead of straight at a booking page. The learning counts the Story.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/console-auth';
import { getLearning, saveLearning } from '@/lib/marketing/learning-store';
import { createNarrative, saveNarrative, isNarrativeLane } from '@/lib/marketing/narrative-store';
import { canSeeStream } from '@/lib/marketing/streams';
import { usesUseCases } from '@/lib/marketing/use-case';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team') return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { lane?: unknown } | null;
  const lane = body?.lane;
  if (!isNarrativeLane(lane) || !canSeeStream(user.email, lane)) {
    return NextResponse.json({ error: 'pick a board' }, { status: 400 });
  }
  if (!usesUseCases(lane)) {
    return NextResponse.json({ error: 'A learning is Polynize content. Make the narrative on a Polynize board.' }, { status: 400 });
  }
  const l = await getLearning(id);
  if (!l) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (!l.article.trim()) return NextResponse.json({ error: 'write the article first' }, { status: 400 });

  try {
    const n = await createNarrative(lane, l.learning || l.article.split('\n')[0], undefined, l.use_case);
    n.article = l.article;
    n.gate = 2;
    n.learning_ref = l.id;
    n.learning_slug = l.slug;
    await saveNarrative(n);
    await saveLearning({ ...l, story_ids: [...(l.story_ids ?? []), n.id] });
    return NextResponse.json({ id: n.id });
  } catch (err) {
    console.error('[learnings.story] failed:', err);
    return NextResponse.json({ error: 'could not make the narrative' }, { status: 500 });
  }
}
