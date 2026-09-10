/**
 * POST /console/marketing/stream/[stream]/adopt: bring the split-screen formula across from the marrs
 * board to the Marrs Attacks board (D114), once.
 *
 * Until 10 September the marrs stream carried both Marrs the co-founder and Marrs Attacks. The split
 * gave Marrs Attacks its own private board, and everything made under the formula in the week before
 * (split-screen pieces, yaps, their calendar drafts, the hook library, any Story cut from a split-screen)
 * was still filed under marrs. This moves exactly that set and nothing else: a piece is moved because
 * of its FORMAT, an idea because it is a hook or points at a moved piece, a Story because it owns a
 * moved piece. His LinkedIn narratives and his ordinary ideas stay where they are.
 *
 * It also copies, never overwrites, two settings the new board needs to work on day one: the brand
 * voice document (his own words, so a fair starting point for the second voice) and the Metricool
 * brand mapping (Marrs: "Just Marrs and Marrs Attacks go to the same brand account in Metricool").
 *
 * IDEMPOTENT. Running it again finds nothing on marrs with a formula format and moves nothing. The
 * board only offers the button while there is something to move.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/console-auth';
import { canSeeStream, isStreamId } from '@/lib/marketing/streams';
import { MARRS_ATTACKS_STREAM } from '@/lib/marketing/use-case';
import { isMarrsAttacksFormat } from '@/lib/marketing/split-screen';
import { listSavedPieces, savePiece } from '@/lib/marketing/piece-store';
import { listEntries, saveEntry } from '@/lib/marketing/calendar-store';
import { listNarrativeCards, getNarrative, saveNarrative } from '@/lib/marketing/narrative-store';
import { moveIdeas } from '@/lib/marketing/idea-store';
import { isHookText } from '@/lib/marketing/hook-archive';
import { getBrandVoiceForStream, saveBrandVoiceForStream } from '@/lib/marketing/brand-voice-store';
import { getBrandMap, saveBrandMap } from '@/lib/marketing/metricool-config-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** The board the formula lived on before it had its own. */
const FORMULA_CAME_FROM = 'marrs';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ stream: string }> }) {
  const { stream } = await params;
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!isStreamId(stream) || stream !== MARRS_ATTACKS_STREAM) {
    return NextResponse.json({ error: 'only the Marrs Attacks board adopts the formula' }, { status: 400 });
  }
  if (!canSeeStream(user.email, stream)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const moved = { pieces: 0, entries: 0, narratives: 0, ideas: 0, voice: false, brand: false };
  const failures: string[] = [];

  // Pieces first: everything else is decided by which pieces moved.
  const movedIds = new Set<string>();
  try {
    const pieces = await listSavedPieces(user.email);
    const seen = new Set<string>();
    for (const p of pieces) {
      if (seen.has(p.piece_id)) continue;
      seen.add(p.piece_id);
      if (p.stream !== FORMULA_CAME_FROM || !isMarrsAttacksFormat(p.format)) continue;
      await savePiece(user.email, { ...p, stream, updated_at: new Date().toISOString() });
      movedIds.add(p.piece_id);
      moved.pieces += 1;
    }
  } catch (err) {
    failures.push(`pieces: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Their calendar drafts and posts, so the calendar and the analytics join keep pointing at the right board.
  try {
    const entries = await listEntries(user.email);
    for (const e of entries) {
      if (e.stream !== FORMULA_CAME_FROM || !movedIds.has(e.piece_id)) continue;
      await saveEntry(user.email, { ...e, stream });
      moved.entries += 1;
    }
  } catch (err) {
    failures.push(`calendar: ${err instanceof Error ? err.message : String(err)}`);
  }

  // A Story cut from a split-screen ("Make a narrative from this") belongs with the split-screen.
  try {
    const cards = await listNarrativeCards(FORMULA_CAME_FROM);
    for (const c of cards) {
      const n = await getNarrative(c.id);
      if (!n || !(n.piece_ids ?? []).some((id) => movedIds.has(id))) continue;
      await saveNarrative({ ...n, lane: stream });
      moved.narratives += 1;
    }
  } catch (err) {
    failures.push(`narratives: ${err instanceof Error ? err.message : String(err)}`);
  }

  // The hook library: a hook is a hook wherever it sits, and an idea in flight follows its piece.
  try {
    moved.ideas = await moveIdeas(
      FORMULA_CAME_FROM,
      stream,
      (i) => isHookText(i.text) || (!!i.piece_ref && movedIds.has(i.piece_ref))
    );
  } catch (err) {
    failures.push(`ideas: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Two settings copied so the board works today. Never overwritten: a second run cannot undo an edit.
  try {
    const [mine, theirs] = await Promise.all([
      getBrandVoiceForStream(stream),
      getBrandVoiceForStream(FORMULA_CAME_FROM),
    ]);
    if (!mine && theirs) {
      await saveBrandVoiceForStream(stream, theirs);
      moved.voice = true;
    }
  } catch (err) {
    failures.push(`brand voice: ${err instanceof Error ? err.message : String(err)}`);
  }
  try {
    const map = await getBrandMap();
    if (!map[stream] && map[FORMULA_CAME_FROM]) {
      await saveBrandMap({ ...map, [stream]: map[FORMULA_CAME_FROM] });
      moved.brand = true;
    }
  } catch (err) {
    failures.push(`metricool: ${err instanceof Error ? err.message : String(err)}`);
  }

  return NextResponse.json({ moved, failures });
}
