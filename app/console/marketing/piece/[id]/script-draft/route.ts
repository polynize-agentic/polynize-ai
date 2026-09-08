/**
 * POST /console/marketing/piece/[id]/script-draft — draft the spoken script for a
 * video output (D25). The video-screen counterpart to text-draft: April writes a
 * full short-form script from the concept + ICP + brand voice + template recipe,
 * so "Use this template" and the "Draft from the concept" button both produce a
 * real script grounded in the concept, not the generic scaffold.
 *
 * Loads the piece server-side, returns the script; the client applies it through
 * the existing /state autosave (one validated write path). Team-scope only.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { llmErrorText } from '@/lib/llm/error-text';
import { getCurrentUser } from '@/lib/console-auth';
import { getPiece } from '@/lib/marketing/piece-store';
import { draftVideoScript, DraftError, scriptModelInUse } from '@/lib/marketing/draft';
import { SPLIT_SCREEN_FORMAT, YAP_FORMAT, checkSplitScreenScript, checkYapScript } from '@/lib/marketing/split-screen';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
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
    console.error('[script-draft] piece read failed:', err);
    return NextResponse.json({ error: 'could not read the piece' }, { status: 502 });
  }
  if (!piece) {
    return NextResponse.json({ error: 'piece not found' }, { status: 404 });
  }

  try {
    const script = await draftVideoScript(owner, piece);
    // The model rides back with the draft so the screen can say who wrote it.
    /**
     * THE REJECTION BEHAVIOUR (D102): for the two Marrs Attacks formats every test the script fails is
     * named back to him. The script is still returned (he can fix one word himself); nothing is
     * silently adapted to fit.
     */
    const warnings =
      piece.format === SPLIT_SCREEN_FORMAT
        ? checkSplitScreenScript(script)
        : piece.format === YAP_FORMAT
          ? checkYapScript(script)
          : [];
    return NextResponse.json({ script, model: scriptModelInUse(), warnings });
  } catch (e) {
    if (e instanceof DraftError) {
      if (e.reason === 'no-concept') {
        return NextResponse.json(
          { error: 'no concept to draft from. Re-plan this output from a concept.' },
          { status: 400 }
        );
      }
      if (e.reason === 'empty') {
        return NextResponse.json(
          { error: 'the draft came back empty. Try again.' },
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
