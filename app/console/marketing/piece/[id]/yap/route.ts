/**
 * POST /console/marketing/piece/[id]/yap: make the yap from this split-screen (D102).
 *
 * Marrs: "the same question and content, just delivered in a different format: straight to camera,
 * no edits, easily tested... They might end up being the same script, but yaps are more natural."
 * So the yap is a sibling piece, written by April FROM the split-screen's beats as talk, opening on
 * the same title, with the same keyword. The two are joined by sibling_of so the leaderboard can
 * compare "same question, different format".
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getCurrentUser } from '@/lib/console-auth';
import { getPiece, savePiece, type MarketingPiece } from '@/lib/marketing/piece-store';
import { getBrandVoiceForStream } from '@/lib/marketing/brand-voice-store';
import { complete } from '@/lib/llm';
import { stripEmDashes } from '@/lib/em-dash';
import { llmErrorText } from '@/lib/llm/error-text';
import {
  SPLIT_SCREEN_FORMAT,
  YAP_FORMAT,
  parseSplitScreenScript,
  yapSystemPrompt,
  checkYapScript,
} from '@/lib/marketing/split-screen';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const piece = await getPiece(user.email, id);
  if (!piece) return NextResponse.json({ error: 'piece not found' }, { status: 404 });
  if (piece.format !== SPLIT_SCREEN_FORMAT) {
    return NextResponse.json({ error: 'a yap is made from a split-screen explainer' }, { status: 400 });
  }
  const source = parseSplitScreenScript(piece.script ?? '');
  if (source.beats.length < 4 || !source.title) {
    return NextResponse.json({ error: 'draft the split-screen script first: the yap is written from its four beats' }, { status: 400 });
  }

  let script: string;
  try {
    const voice = await getBrandVoiceForStream(piece.stream).catch(() => undefined);
    const raw = await complete({
      system: yapSystemPrompt(voice),
      messages: [
        {
          role: 'user',
          content: `TITLE:\n${source.title}\n\nBEATS:\n${source.beats.map((b, i) => `${i + 1}. ${b}`).join('\n\n')}\n\nCTA:\n${source.cta}`,
        },
      ],
      maxTokens: 2500,
      temperature: 0.7,
      apiKey: process.env.APRIL_OPENROUTER_API_KEY,
    });
    script = stripEmDashes(raw).trim();
  } catch (e) {
    return NextResponse.json({ error: llmErrorText(e, 'The writing assistant') }, { status: 502 });
  }
  const warnings = checkYapScript(script, source.title);

  const now = new Date().toISOString();
  const yap: MarketingPiece = {
    piece_id: randomUUID(),
    owner: user.email,
    stream: piece.stream,
    format: YAP_FORMAT,
    kind: 'video',
    title: `${source.title} (yap)`.slice(0, 120),
    script,
    angle: piece.angle,
    platforms: ['instagram', 'tiktok', 'youtube'],
    status: 'draft',
    provenance: 'hybrid',
    sibling_of: piece.piece_id,
    focus_anchor: piece.focus_anchor,
    cta_keyword: piece.cta_keyword,
    updated_at: now,
  };
  try {
    await savePiece(user.email, yap);
  } catch (err) {
    console.error('[yap] save failed:', err);
    return NextResponse.json({ error: 'could not save the yap' }, { status: 500 });
  }
  return NextResponse.json({ id: yap.piece_id, warnings });
}
