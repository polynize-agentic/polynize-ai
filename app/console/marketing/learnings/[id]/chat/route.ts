/**
 * POST /console/marketing/learnings/[id]/chat (D115): one instruction to April, the complete revised
 * article back. Same reviser as Gate 2, in the Polynize voice, and the same honesty rule (D111): if
 * nothing changed, say so rather than "done".
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/console-auth';
import { llmErrorText } from '@/lib/llm/error-text';
import { getLearning, saveLearning } from '@/lib/marketing/learning-store';
import { reviseArticle, paragraphsChanged } from '@/lib/marketing/article-draft';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team') return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { instruction?: unknown; article?: unknown } | null;
  const instruction = typeof body?.instruction === 'string' ? body.instruction.trim().slice(0, 2000) : '';
  if (!instruction) return NextResponse.json({ error: 'say what to change' }, { status: 400 });
  const l = await getLearning(id);
  if (!l) return NextResponse.json({ error: 'not found' }, { status: 404 });
  // The screen's text wins over the stored one: an unsaved edit must not be reverted by April.
  const current = typeof body?.article === 'string' && body.article.trim() ? body.article : l.article;
  if (!current.trim()) return NextResponse.json({ error: 'no article to edit yet' }, { status: 400 });

  let revised: string;
  try {
    revised = await reviseArticle('polynize', current, instruction);
  } catch (err) {
    console.error('[learnings.chat] revise failed:', err);
    return NextResponse.json({ error: llmErrorText(err) }, { status: 502 });
  }
  const changed = paragraphsChanged(current, revised);
  try {
    await saveLearning({ ...l, article: revised });
  } catch (err) {
    console.error('[learnings.chat] save failed:', err);
    return NextResponse.json({ error: 'April rewrote it but it could not be saved' }, { status: 500 });
  }
  const note =
    changed === 0
      ? 'Nothing changed. Say the change more specifically, or make it by hand in the text.'
      : `Done. ${changed} paragraph${changed === 1 ? '' : 's'} changed.`;
  return NextResponse.json({ article: revised, note });
}
