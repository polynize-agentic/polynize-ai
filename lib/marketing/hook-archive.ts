/**
 * THE HOOK LIBRARY'S ARCHIVE (D105). Marrs: "there should be a separate section at the bottom:
 * archived hooks, ones that have already been used. Once they're scheduled, we take them out of
 * circulation and put them in archived hooks."
 *
 * The library IS the ideas inbox: a hook is an inbox idea whose text is a title. Active hooks have no
 * `used_at`; archived hooks have one. A hook goes to the archive at the moment a post made from it is
 * scheduled or handed over to be posted, not when the piece is created, so a piece that is started
 * and abandoned gives its hook back.
 *
 * Server-side only. Best effort by contract: archiving is bookkeeping and must never cost a post.
 */

import type { CalendarEntry } from './calendar-store';
import { getPiece } from './piece-store';
import { listIdeas, createIdea, updateIdea } from './idea-store';
import { isMarrsAttacksFormat, titleShape, titleChecks } from './split-screen';

/** True when this text is a hook in the library's sense: a title that passes the mechanical tests. */
export function isHookText(text: string): boolean {
  return Boolean(titleShape(text)) && titleChecks(text).length === 0;
}

/**
 * The inbox idea holding this hook, made if it is not there yet (a scored hook from the calibration
 * set enters the inbox the first time it is chosen, so it can be archived like any other). Returns the
 * idea id, or undefined when the inbox cannot be read or written.
 */
export async function ensureHookIdea(stream: string, hook: string): Promise<string | undefined> {
  const want = hook.trim().toLowerCase();
  try {
    const existing = (await listIdeas(stream)).find((i) => i.text.trim().toLowerCase() === want);
    if (existing) return existing.id;
    const made = await createIdea(stream, hook.trim());
    return made.id;
  } catch (err) {
    console.error('[hook-archive] inbox unavailable:', err);
    return undefined;
  }
}

/** Called after a post ships. If it came from a Marrs Attacks piece with a hook, the hook is archived. */
export async function archiveHookOnShip(owner: string, entry: CalendarEntry): Promise<void> {
  try {
    const piece = await getPiece(owner, entry.piece_id);
    if (!piece || !isMarrsAttacksFormat(piece.format)) return;
    const hook = piece.hooks?.[0]?.trim();
    if (!hook) return;
    const id = piece.hook_ref ?? (await ensureHookIdea(piece.stream, hook));
    if (!id) return;
    await updateIdea(piece.stream, id, { used_at: new Date().toISOString() });
  } catch (err) {
    console.error('[hook-archive] could not archive the hook:', err);
  }
}
