import { randomUUID } from 'node:crypto';
import { getSheetState, saveSheetState } from '@/lib/content/shoot-sheet-store';
import { isBucketConfigured, getObjectText, putObjectText } from '@/lib/agents/bucket';

/**
 * IDEAS: the notes before the concept.
 *
 * Marrs: "I take a lot of notes on my phone where I just type around the core concept before
 * I actually create the core concept. I want to shift that into the dashboard."
 *
 * So this is deliberately the least structured thing in the console. A concept doc has eight
 * required sections and an interview that refuses to finish without them; an idea is a text
 * box. Imposing any shape here would push the thinking back to the notes app, which is the
 * behaviour this exists to replace.
 *
 * ONE FILE PER STREAM (`pam/ideas/{stream}.json`), not one file for everything, so two people
 * writing in two streams cannot overwrite each other on a read-merge-write.
 *
 * Server-side only. Same bucket-or-interim dispatch as the rest of the marketing config.
 */

export type Idea = {
  id: string;
  /** Free text. No title, no fields: this is a notes app page, not a form. */
  text: string;
  created_at: string;
  updated_at: string;
  /** Set when an idea has been turned into a concept, so it can be shown as spent. */
  used_at?: string;
  /**
   * IN FLIGHT (D109): the piece this idea became, while it is being worked on and before a post from it
   * has shipped. Marrs: "if I have an unfinished idea, it's showing up in Gate 1 as well as in the idea
   * section on the dashboard... Just keep it to Gate 1." The dashboard hides an idea with a piece_ref;
   * Gate 1 shows it with an "in progress" mark. Cleared if the piece is deleted, so the idea comes back.
   */
  piece_ref?: string;
};

const SAFE_STREAM = /^[a-z0-9_-]{1,40}$/;

function keyFor(stream: string): string {
  if (!SAFE_STREAM.test(stream)) throw new Error(`[ideas] unsafe stream id: ${stream}`);
  return `pam/ideas/${stream}.json`;
}

/** Cap the list so a stream cannot grow unbounded and slow the page it renders on. */
const MAX_IDEAS = 200;
const MAX_CHARS = 20000;

function normalize(x: unknown): Idea[] {
  if (!Array.isArray(x)) return [];
  const out: Idea[] = [];
  for (const raw of x) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const id = typeof r.id === 'string' ? r.id : '';
    if (!id) continue;
    out.push({
      id,
      text: typeof r.text === 'string' ? r.text.slice(0, MAX_CHARS) : '',
      created_at: typeof r.created_at === 'string' ? r.created_at : '',
      updated_at: typeof r.updated_at === 'string' ? r.updated_at : '',
      used_at: typeof r.used_at === 'string' ? r.used_at : undefined,
      piece_ref: typeof r.piece_ref === 'string' && r.piece_ref ? r.piece_ref : undefined,
    });
  }
  return out.slice(0, MAX_IDEAS);
}

async function read(stream: string): Promise<Idea[]> {
  const key = keyFor(stream);
  if (isBucketConfigured()) {
    return normalize(JSON.parse((await getObjectText(key)) || '[]') as unknown);
  }
  const s = (await getSheetState(key)) as { ideas?: unknown } | null;
  return normalize(s?.ideas);
}

async function write(stream: string, ideas: Idea[]): Promise<void> {
  const key = keyFor(stream);
  const clean = normalize(ideas);
  if (isBucketConfigured()) {
    await putObjectText(key, JSON.stringify(clean, null, 2));
  } else {
    await saveSheetState(key, { ideas: clean });
  }
}

/**
 * A stream's ideas, newest first.
 *
 * Returns [] on a read failure rather than throwing, because this renders inside the stream
 * page: a broken idea list must not take the concepts and pieces down with it.
 */
export async function listIdeas(stream: string): Promise<Idea[]> {
  try {
    return (await read(stream)).sort((a, b) =>
      String(b.created_at).localeCompare(String(a.created_at))
    );
  } catch (err) {
    console.error(`[ideas] read failed for ${stream}:`, err);
    return [];
  }
}

export async function getIdea(stream: string, id: string): Promise<Idea | null> {
  return (await listIdeas(stream)).find((i) => i.id === id) ?? null;
}

export async function createIdea(stream: string, text = ''): Promise<Idea> {
  const now = new Date().toISOString();
  const idea: Idea = { id: randomUUID(), text: text.slice(0, MAX_CHARS), created_at: now, updated_at: now };
  const all = await read(stream);
  await write(stream, [idea, ...all]);
  return idea;
}

/**
 * Patch one idea. Read, merge, write, because the file holds the whole stream's list.
 *
 * Returns null when the id is unknown rather than creating one: a PATCH that silently
 * inserts turns a stale browser tab into a duplicate.
 */
export async function updateIdea(
  stream: string,
  id: string,
  patch: { text?: string; used_at?: string | null; piece_ref?: string | null }
): Promise<Idea | null> {
  const all = await read(stream);
  const i = all.findIndex((x) => x.id === id);
  if (i === -1) return null;
  const next: Idea = {
    ...all[i],
    ...(patch.text !== undefined ? { text: patch.text.slice(0, MAX_CHARS) } : {}),
    ...(patch.used_at !== undefined ? { used_at: patch.used_at ?? undefined } : {}),
    ...(patch.piece_ref !== undefined ? { piece_ref: patch.piece_ref ?? undefined } : {}),
    updated_at: new Date().toISOString(),
  };
  all[i] = next;
  await write(stream, all);
  return next;
}

/**
 * MOVE IDEAS BETWEEN STREAMS, IDS KEPT (D114). The one-off that carries the hook library from the
 * marrs board to the Marrs Attacks board: a piece's `hook_ref` points at an idea id, so the ids
 * have to survive the move or every locked hook loses its inbox entry. Read both, write both,
 * destination first so a failure between the two duplicates rather than loses. Returns how many moved.
 */
export async function moveIdeas(
  from: string,
  to: string,
  pick: (idea: Idea) => boolean
): Promise<number> {
  if (from === to) return 0;
  const source = await read(from);
  const moving = source.filter(pick);
  if (moving.length === 0) return 0;
  const dest = await read(to);
  const have = new Set(dest.map((i) => i.id));
  await write(to, [...moving.filter((i) => !have.has(i.id)), ...dest]);
  await write(from, source.filter((i) => !pick(i)));
  return moving.length;
}

export async function deleteIdea(stream: string, id: string): Promise<void> {
  const all = await read(stream);
  await write(
    stream,
    all.filter((x) => x.id !== id)
  );
}

/** The first line, for a card heading. Ideas have no title, so one is derived to look at. */
export function ideaHeadline(text: string, max = 60): string {
  const first = text.trim().split('\n').find((l) => l.trim() !== '')?.trim() ?? '';
  if (first === '') return 'Empty note';
  return first.length <= max ? first : `${first.slice(0, max - 1).trimEnd()}…`;
}
