/**
 * POST /console/marketing/piece/[id]/narrative: make a Story from a split-screen (D111).
 *
 * Marrs: "if I create a split screen and take that all the way through to the end, can I then
 * repurpose that split screen as a multi? Does that flow exist?" Now it does. The Story is created at
 * Gate 2 on his board with the hook, the arc and the script as its idea, so the article is drafted
 * from what the split-screen already argued. The split-screen itself is attached to the Story as its
 * shorts piece, so the kit reuses it rather than minting a second one.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/console-auth';
import { getPiece, savePiece } from '@/lib/marketing/piece-store';
import { createNarrative, saveNarrative, isNarrativeLane } from '@/lib/marketing/narrative-store';
import { isMarrsAttacksPiece, SPLIT_SCREEN_FORMAT } from '@/lib/marketing/split-screen';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const piece = await getPiece(user.email, id);
  if (!piece) return NextResponse.json({ error: 'piece not found' }, { status: 404 });
  if (!isMarrsAttacksPiece(piece) || piece.format !== SPLIT_SCREEN_FORMAT) {
    return NextResponse.json({ error: 'a Story is made from a split-screen explainer' }, { status: 400 });
  }
  if (piece.narrative_ref) {
    return NextResponse.json({ id: piece.narrative_ref, existing: true });
  }
  if (!isNarrativeLane(piece.stream)) {
    return NextResponse.json({ error: 'unknown stream' }, { status: 400 });
  }
  const hook = piece.hooks?.[0]?.trim() || piece.title;
  /**
   * THE IDEA IS EVERYTHING THE SPLIT-SCREEN SETTLED: the hook, the arc, the script. Gate 2 drafts the
   * article from the idea, so the article argues what the video argued, at length. Capped to what a
   * Story's idea can hold.
   */
  const idea = [
    hook,
    piece.outline?.trim() ? `THE ARC:\n${piece.outline.trim()}` : '',
    piece.script?.trim() ? `THE SPLIT-SCREEN SCRIPT:\n${piece.script.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
    .slice(0, 4000);

  try {
    const narrative = await createNarrative(piece.stream, idea);
    narrative.gate = 2;
    await saveNarrative(narrative);
    // The split-screen becomes the Story's shorts piece, so the kit reuses it (build finds by master).
    await savePiece(user.email, {
      ...piece,
      narrative_ref: narrative.id,
      master: 'shorts',
      updated_at: new Date().toISOString(),
    });
    return NextResponse.json({ id: narrative.id });
  } catch (err) {
    console.error('[piece.narrative] failed:', err);
    return NextResponse.json({ error: 'could not create the narrative' }, { status: 500 });
  }
}
