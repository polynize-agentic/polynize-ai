/**
 * POST /console/marketing/stream/[stream]/split-screen: the door into a split-screen explainer (D102).
 *
 * Marrs Attacks content is question-driven, not Story-driven: there is no article to write first, no
 * kit of twenty outputs. A question (or the idea behind one) comes in, and the piece opens on the
 * script screen at the title step, where April proposes titles against his rules. So this mints a
 * piece directly, the way the finished-media door does, with the idea stored as the piece's angle:
 * that is what the title and script prompts read when there is no Story.
 *
 * Marrs Attacks stream only (D114: his own board, private to him). The format is his and the rules say not to generalise it.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getCurrentUser } from '@/lib/console-auth';
import { isStreamId, canSeeStream } from '@/lib/marketing/streams';
import { savePiece, type MarketingPiece } from '@/lib/marketing/piece-store';
import { SPLIT_SCREEN_FORMAT, YAP_FORMAT } from '@/lib/marketing/split-screen';
import { usesUseCases } from '@/lib/marketing/use-case';
import { formatById } from '@/lib/marketing/output-plan';
import { updateIdea } from '@/lib/marketing/idea-store';
import { isHookText, ensureHookIdea } from '@/lib/marketing/hook-archive';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ stream: string }> }) {
  const { stream } = await params;
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!isStreamId(stream)) return NextResponse.json({ error: 'unknown stream' }, { status: 400 });
  if (!canSeeStream(user.email, stream)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (usesUseCases(stream)) {
    return NextResponse.json({ error: 'The split-screen explainer is a Marrs Attacks format. Polynize boards use narratives.' }, { status: 400 });
  }
  const body = (await req.json().catch(() => null)) as { idea?: unknown; format?: unknown; idea_ref?: unknown } | null;
  const idea = typeof body?.idea === 'string' ? body.idea.trim().slice(0, 4000) : '';
  const ideaRef = typeof body?.idea_ref === 'string' ? body.idea_ref : undefined;
  if (!idea) return NextResponse.json({ error: 'write the idea or the question first' }, { status: 400 });
  const format = body?.format === YAP_FORMAT ? YAP_FORMAT : SPLIT_SCREEN_FORMAT;
  const fmt = formatById(format);

  /**
   * A TITLE AT GATE 1 IS THE HOOK, LOCKED (D105). If what came in is already a title (opens with Why or
   * How and passes the tests), it is the agreed hook: stored as the piece's one hook, named as the
   * piece, and nothing on the script screen will propose another. It also lives in the inbox as a
   * hook-library entry so it can be archived once a post from it is scheduled. A rough idea that is
   * not yet a title goes to the title step as before.
   */
  const asHook = isHookText(idea);
  const hookRef = asHook ? await ensureHookIdea(stream, idea) : undefined;

  const now = new Date().toISOString();
  const piece: MarketingPiece = {
    piece_id: randomUUID(),
    owner: user.email,
    stream,
    format,
    kind: 'video',
    // The first line of the idea names the piece until a title is agreed; the screen lets him rename.
    title: idea.split('\n')[0].trim().slice(0, 90) || (fmt?.label ?? 'Split-screen explainer'),
    script: '',
    angle: idea,
    ...(asHook ? { hooks: [idea], hook_locked: true, ...(hookRef ? { hook_ref: hookRef } : {}) } : {}),
    platforms: fmt?.channels.slice(0, 3) ?? ['instagram', 'tiktok', 'youtube'],
    status: 'draft',
    provenance: 'hybrid',
    updated_at: now,
  };
  try {
    await savePiece(user.email, piece);
  } catch (err) {
    console.error('[split-screen.new] save failed:', err);
    return NextResponse.json({ error: 'could not create the piece' }, { status: 500 });
  }
  /**
   * NOT MARKED USED HERE (D105). A hook leaves circulation when a post made from it is SCHEDULED,
   * not when a piece is started, so an abandoned piece gives its hook back. A rough idea that is not
   * a hook is still spent by becoming a piece, as it is by becoming a Story.
   */
  if (ideaRef && !asHook) void updateIdea(stream, ideaRef, { used_at: now }).catch(() => {});
  // IN FLIGHT (D109): the hook's inbox entry points at the piece, so the dashboard can hide it and
  // Gate 1 can mark it, until a post from it ships or the piece is deleted.
  if (hookRef) void updateIdea(stream, hookRef, { piece_ref: piece.piece_id }).catch(() => {});
  return NextResponse.json({ id: piece.piece_id });
}
