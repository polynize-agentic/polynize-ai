/**
 * POST /console/studio/prompter (D119): paste a yap, get a prompter and a place in the queue.
 *
 * Marrs: "a way in the studio to just dump a script in and generate a teleprompter version of it with
 * the QR code... I need it for yaps that I've already written." The yap was written elsewhere; nothing
 * here drafts, checks or plans it. It becomes a yap piece on his Marrs Attacks board, queued for the
 * Studio at once, so the queue prints its QR the moment the page refreshes and Recorded takes it off
 * the list as usual. Being a real yap, it then goes on to captions, the calendar and the numbers like
 * any other.
 *
 * The first non-empty line is the title unless one was typed. Operator only, like the Studio itself.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/console-auth';
import { canUseStudio } from '@/lib/marketing/streams';
import { MARRS_ATTACKS_STREAM } from '@/lib/marketing/use-case';
import { formatById } from '@/lib/marketing/output-plan';
import { YAP_FORMAT } from '@/lib/marketing/split-screen';
import { getPiece, savePiece, type MarketingPiece } from '@/lib/marketing/piece-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const Body = z.object({
  title: z.string().trim().max(120).optional(),
  script: z.string().trim().min(1).max(20000),
});
const EditBody = z.object({
  piece_id: z.string().trim().min(1).max(200),
  title: z.string().trim().max(120).optional(),
  script: z.string().trim().min(1).max(20000),
});

/**
 * PATCH: edit a queued script in place (D119). Marrs: "add an edit button to that yap when it gets
 * created, so if I have to edit the script, I can do it directly from there." Reads the piece, changes
 * the words and the name, saves. The prompter reads the saved script, so the iPad shows the edit on
 * its next load.
 */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team' || !canUseStudio(user.email)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  let body: z.infer<typeof EditBody>;
  try {
    body = EditBody.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'the script cannot be empty' }, { status: 400 });
  }
  const piece = await getPiece(user.email, body.piece_id).catch(() => null);
  if (!piece) return NextResponse.json({ error: 'piece not found' }, { status: 404 });
  const firstLine = body.script.split('\n').map((l) => l.trim()).find((l) => l.length > 0) ?? piece.title;
  try {
    await savePiece(user.email, {
      ...piece,
      title: (body.title || firstLine).slice(0, 90),
      script: body.script,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[studio.prompter] edit failed:', err);
    return NextResponse.json({ error: 'could not save the edit' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team' || !canUseStudio(user.email)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'paste the script first' }, { status: 400 });
  }
  const firstLine = body.script.split('\n').map((l) => l.trim()).find((l) => l.length > 0) ?? 'Pasted yap';
  const now = new Date().toISOString();
  const piece: MarketingPiece = {
    piece_id: randomUUID(),
    owner: user.email,
    stream: MARRS_ATTACKS_STREAM,
    format: YAP_FORMAT,
    kind: 'video',
    title: (body.title || firstLine).slice(0, 90),
    script: body.script,
    platforms: formatById(YAP_FORMAT)?.channels.slice() ?? ['instagram', 'tiktok', 'youtube'],
    status: 'draft',
    provenance: 'human_capture',
    shoot_ready: true,
    shoot_ready_at: now,
    updated_at: now,
  };
  try {
    await savePiece(user.email, piece);
  } catch (err) {
    console.error('[studio.prompter] save failed:', err);
    return NextResponse.json({ error: 'could not save the script' }, { status: 502 });
  }
  return NextResponse.json({ id: piece.piece_id, teleprompter_url: `/console/marketing/piece/${piece.piece_id}/teleprompter` });
}
