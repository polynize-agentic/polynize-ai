/**
 * POST /console/marketing/piece/[id]/outline — stage two of the staged build (D39).
 *
 * Given the hooks the operator already agreed, April proposes the narrative arc: the beats, what
 * each one argues, and the concept material each one stands on. That last part is the point of
 * the stage. It is the first time her selection from the concept is visible before a script
 * exists, which is where it is cheap to correct.
 *
 * Requires `hooks` on the piece: the arc has to hand over cleanly to every agreed hook, so
 * proposing one before they are chosen would be guessing at its own entry point. Nothing is
 * persisted here; the edited arc returns through /state. Team-scope only.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { llmErrorText } from '@/lib/llm/error-text';
import { getCurrentUser } from '@/lib/console-auth';
import { getPiece } from '@/lib/marketing/piece-store';
import { proposeOutline, DraftError, scriptModelInUse } from '@/lib/marketing/draft';
import { isMarrsAttacksFormat, checkArc } from '@/lib/marketing/split-screen';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const owner = user.email;

  let piece;
  try {
    piece = await getPiece(owner, id);
  } catch (err) {
    console.error('[outline] piece read failed:', err);
    return NextResponse.json({ error: 'could not read the piece' }, { status: 502 });
  }
  if (!piece) return NextResponse.json({ error: 'piece not found' }, { status: 404 });

  /**
   * THE ARC IN TWO MOVES (D106). `steer` is the "Any ideas or direction?" box. Without a `direction`,
   * a Marrs Attacks piece gets three directions to choose from; with one, the developed arc. A Story
   * piece gets its arc in one move, steered.
   */
  const body = (await req.json().catch(() => null)) as { steer?: unknown; direction?: unknown } | null;
  const steer = typeof body?.steer === 'string' ? body.steer.slice(0, 4000) : undefined;
  const direction = typeof body?.direction === 'string' ? body.direction.slice(0, 1000) : undefined;
  try {
    const result = await proposeOutline(owner, piece, { steer, direction });
    if (result.directions) return NextResponse.json({ directions: result.directions, model: scriptModelInUse() });
    const outline = result.outline ?? '';
    return NextResponse.json({
      outline,
      model: scriptModelInUse(),
      warnings: isMarrsAttacksFormat(piece.format) ? checkArc(outline, piece.hooks?.[0]) : [],
    });
  } catch (e) {
    if (e instanceof DraftError) {
      if (e.reason === 'no-concept') {
        return NextResponse.json(
          { error: 'no concept to work from. Re-plan this output from a concept.' },
          { status: 400 }
        );
      }
      if (e.reason === 'no-hooks') {
        return NextResponse.json(
          { error: 'choose the hooks first: the arc has to hand over to them.' },
          { status: 400 }
        );
      }
      if (e.reason === 'empty') {
        return NextResponse.json(
          { error: 'the arc came back empty. Try again.' },
          { status: 502 }
        );
      }
    }
    return NextResponse.json(
      { error: llmErrorText(e, 'The writing assistant') },
      { status: 502 }
    );
  }
}
