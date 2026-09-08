/**
 * POST /console/marketing/piece/[id]/version: duplicate this piece as the next version (D102).
 *
 * Marrs: "I've got some ideas for the different walk-on styles... I want to try stuff like that...
 * Yes, work out how we do version testing." A version is the same question with one thing changed.
 * It is a copy of the piece (script, title, angle, outline, hooks) with a letter, and every calendar
 * entry made from it carries that letter, so the leaderboard shows the versions of one question side
 * by side. Media and recording state are not copied: a version is re-recorded, that is the point.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getCurrentUser } from '@/lib/console-auth';
import { getPiece, listSavedPieces, savePiece, type MarketingPiece } from '@/lib/marketing/piece-store';

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

  // The root of the family, and the letters already taken, so the new one is the next free letter.
  const root = piece.variant_of ?? piece.piece_id;
  let taken: string[] = [];
  try {
    const all = await listSavedPieces(user.email);
    taken = all.filter((p) => p.variant_of === root || p.piece_id === root).map((p) => p.variant ?? 'A');
  } catch {
    taken = [piece.variant ?? 'A'];
  }
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const next = [...letters].find((l) => !taken.includes(l)) ?? `V${taken.length + 1}`;

  const now = new Date().toISOString();
  const copy: MarketingPiece = {
    ...piece,
    piece_id: randomUUID(),
    title: `${piece.title.replace(/ · version [A-Z0-9]+$/, '')} · version ${next}`.slice(0, 120),
    variant: next,
    variant_of: root,
    media: [],
    shoot_ready: false,
    shoot_ready_at: undefined,
    recorded_at: undefined,
    exemplar: false,
    exemplar_note: undefined,
    exemplar_at: undefined,
    status: 'draft',
    updated_at: now,
  };
  try {
    await savePiece(user.email, copy);
  } catch (err) {
    console.error('[version] save failed:', err);
    return NextResponse.json({ error: 'could not save the version' }, { status: 500 });
  }
  return NextResponse.json({ id: copy.piece_id, variant: next });
}
