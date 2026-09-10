/**
 * THE POLYNIZE CONTENT LIBRARY OF CORE LEARNINGS (D115).
 *
 * Marrs, 10 September, after the leadership meeting: "from client interactions we extract core
 * insights and learnings, turn these into a core concept and build a content package for it...
 * I think we promote the core learnings module just above the narratives module... just like we
 * have a media library, we should also have a learnings library... We're moving towards collecting
 * these to be the atoms that we use to make our full partner enablement console."
 *
 * A LEARNING IS ONE ATOM: the insight in a sentence, the article April wrote from what was said or
 * pasted, where it came from, who brought it, and (once published) its page on polynize.ai/library.
 * Stories are made FROM it (narrative-store keeps `learning_ref`), so one learning can become many
 * content packages over time and the library knows how many.
 *
 * SHARED, NOT PER OWNER. The concept bank was partitioned by the signed-in email, which is why
 * Shourov's concepts were only Shourov's. A learning is the company's the moment it is written, so
 * every file lives under one prefix and `added_by` records the person.
 *
 * FILES ARE TRUTH, THE INDEX IS A CONVENIENCE, exactly as narratives do it: one JSON per learning,
 * one index of cards for the library screen and the public list. Bucket when configured, else the
 * interim sheet-state row under the same key.
 *
 * WHAT GOES PUBLIC. The public page renders `article` and the hero only. `source` and `raw` are
 * internal (they can name a client); they never reach the public page and the public list.
 */

import { randomUUID } from 'node:crypto';
import { getSheetState, saveSheetState, deleteSheetState } from '@/lib/content/shoot-sheet-store';
import {
  isBucketConfigured,
  getObjectText,
  putObjectText,
  deleteObject,
} from '@/lib/agents/bucket';
import { isUseCaseId } from './use-case';

export type Learning = {
  id: string;
  /** The public address: polynize.ai/library/{slug}. Made from the title once, kept stable after. */
  slug: string;
  /** The insight itself, one sentence. April's first pass, editable. */
  learning: string;
  /**
   * Plain text, first line the title, then the body: the same convention as a Story's article, so
   * April's editor, the headline helper and the public page all read it the same way.
   */
  article: string;
  /** Where it came from, in the operator's words ("PwC L&D session, 9 Sept"). INTERNAL ONLY. */
  source?: string;
  /** What was said or pasted, kept for the record. INTERNAL ONLY. */
  raw?: string;
  /** Who brought it: the signed-in email. */
  added_by: string;
  /** One of the Polynize use cases, so the public page can carry the right magnet. */
  use_case?: string;
  /** The image on the public page, and its library id when it has one. */
  hero_url?: string;
  hero_media_id?: string;
  /** Set when it is live on polynize.ai/library; cleared when taken down. */
  published_at?: string;
  /** Stories made from it, newest last. */
  story_ids?: string[];
  created_at: string;
  updated_at: string;
};

/** The library row: enough for a list, nothing internal beyond who brought it. */
export type LearningCard = {
  id: string;
  slug: string;
  title: string;
  learning: string;
  added_by: string;
  use_case?: string;
  published_at?: string;
  stories: number;
  updated_at: string;
};

const PREFIX = 'pam/learnings/';
const INDEX_KEY = `${PREFIX}index.json`;
const SAFE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_ARTICLE_CHARS = 40000;
const MAX_RAW_CHARS = 60000;

function keyFor(id: string): string {
  if (!SAFE_ID.test(id)) throw new Error(`[learnings] unsafe id: ${id}`);
  return `${PREFIX}${id}.json`;
}

/** The title is the first non-empty line of the article, as it is for a Story. */
export function learningTitle(article: string): string {
  const line = article
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  return (line ?? 'Untitled learning').slice(0, 140);
}

/** The body is everything after the title line. */
export function learningBody(article: string): string {
  const lines = article.split('\n');
  const i = lines.findIndex((l) => l.trim().length > 0);
  return i === -1 ? '' : lines.slice(i + 1).join('\n').trim();
}

/** A url slug from a title: lowercase, hyphens, nothing else, at most 80 characters. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/['"’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

export function isSafeSlug(x: unknown): x is string {
  return typeof x === 'string' && SAFE_SLUG.test(x) && x.length <= 80;
}

/** The slug, made unique against the ones taken: "title", then "title-2", "title-3". */
export function uniqueSlug(title: string, taken: Iterable<string>): string {
  const base = slugify(title) || 'learning';
  const have = new Set(taken);
  if (!have.has(base)) return base;
  for (let n = 2; n < 1000; n += 1) {
    const s = `${base}-${n}`.slice(0, 80);
    if (!have.has(s)) return s;
  }
  return `${base}-${randomUUID().slice(0, 8)}`;
}

/**
 * Tolerant, field by field. Only a bad id or slug rejects the whole record, because neither can be
 * keyed or addressed; everything else falls back to empty rather than taking the library down.
 */
export function normalizeLearning(x: unknown): Learning | null {
  if (!x || typeof x !== 'object') return null;
  const r = x as Record<string, unknown>;
  const id = typeof r.id === 'string' ? r.id : '';
  if (!SAFE_ID.test(id)) return null;
  if (!isSafeSlug(r.slug)) return null;
  const story_ids = Array.isArray(r.story_ids)
    ? r.story_ids.filter((s): s is string => typeof s === 'string')
    : undefined;
  const str = (k: string, max: number): string | undefined =>
    typeof r[k] === 'string' && (r[k] as string).trim() ? (r[k] as string).slice(0, max) : undefined;
  return {
    id,
    slug: r.slug,
    learning: str('learning', 600) ?? '',
    article: typeof r.article === 'string' ? r.article.slice(0, MAX_ARTICLE_CHARS) : '',
    ...(str('source', 400) ? { source: str('source', 400) } : {}),
    ...(str('raw', MAX_RAW_CHARS) ? { raw: str('raw', MAX_RAW_CHARS) } : {}),
    added_by: str('added_by', 200) ?? '',
    ...(isUseCaseId(r.use_case) ? { use_case: r.use_case } : {}),
    ...(str('hero_url', 2000) ? { hero_url: str('hero_url', 2000) } : {}),
    ...(str('hero_media_id', 200) ? { hero_media_id: str('hero_media_id', 200) } : {}),
    ...(str('published_at', 40) ? { published_at: str('published_at', 40) } : {}),
    ...(story_ids !== undefined ? { story_ids } : {}),
    created_at: typeof r.created_at === 'string' ? r.created_at : '',
    updated_at: typeof r.updated_at === 'string' ? r.updated_at : '',
  };
}

export function cardFor(l: Learning): LearningCard {
  return {
    id: l.id,
    slug: l.slug,
    title: learningTitle(l.article),
    learning: l.learning,
    added_by: l.added_by,
    ...(l.use_case ? { use_case: l.use_case } : {}),
    ...(l.published_at ? { published_at: l.published_at } : {}),
    stories: l.story_ids?.length ?? 0,
    updated_at: l.updated_at,
  };
}

function normalizeCards(x: unknown): LearningCard[] {
  if (!Array.isArray(x)) return [];
  const out: LearningCard[] = [];
  for (const raw of x) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const id = typeof r.id === 'string' ? r.id : '';
    if (!SAFE_ID.test(id) || !isSafeSlug(r.slug)) continue;
    out.push({
      id,
      slug: r.slug,
      title: typeof r.title === 'string' && r.title ? r.title.slice(0, 140) : 'Untitled learning',
      learning: typeof r.learning === 'string' ? r.learning.slice(0, 600) : '',
      added_by: typeof r.added_by === 'string' ? r.added_by : '',
      ...(isUseCaseId(r.use_case) ? { use_case: r.use_case } : {}),
      ...(typeof r.published_at === 'string' && r.published_at ? { published_at: r.published_at } : {}),
      stories: typeof r.stories === 'number' && r.stories >= 0 ? Math.floor(r.stories) : 0,
      updated_at: typeof r.updated_at === 'string' ? r.updated_at : '',
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Storage.
// ---------------------------------------------------------------------------

async function readFile(id: string): Promise<Learning | null> {
  const key = keyFor(id);
  if (isBucketConfigured()) {
    const text = await getObjectText(key);
    if (text === null || text === undefined) return null;
    return normalizeLearning(JSON.parse(text) as unknown);
  }
  const row = (await getSheetState(key)) as { learning?: unknown } | null;
  return normalizeLearning(row?.learning);
}

async function writeFile(l: Learning): Promise<void> {
  const key = keyFor(l.id);
  if (isBucketConfigured()) await putObjectText(key, JSON.stringify(l, null, 2));
  else await saveSheetState(key, { learning: l });
}

async function readIndex(): Promise<LearningCard[]> {
  try {
    if (isBucketConfigured()) {
      return normalizeCards(JSON.parse((await getObjectText(INDEX_KEY)) || '[]') as unknown);
    }
    const s = (await getSheetState(INDEX_KEY)) as { cards?: unknown } | null;
    return normalizeCards(s?.cards);
  } catch (err) {
    console.error('[learnings] index read failed:', err);
    return [];
  }
}

async function writeIndex(cards: LearningCard[]): Promise<void> {
  const clean = normalizeCards(cards);
  if (isBucketConfigured()) await putObjectText(INDEX_KEY, JSON.stringify(clean, null, 2));
  else await saveSheetState(INDEX_KEY, { cards: clean });
}

async function upsertIndexRow(l: Learning): Promise<void> {
  const cards = await readIndex();
  const row = cardFor(l);
  const i = cards.findIndex((c) => c.id === l.id);
  if (i === -1) cards.push(row);
  else cards[i] = row;
  await writeIndex(cards);
}

// ---------------------------------------------------------------------------
// The surface the screens use.
// ---------------------------------------------------------------------------

export async function createLearning(input: {
  article: string;
  learning: string;
  added_by: string;
  source?: string;
  raw?: string;
  use_case?: string;
}): Promise<Learning> {
  const now = new Date().toISOString();
  const cards = await readIndex();
  const l: Learning = {
    id: randomUUID(),
    slug: uniqueSlug(learningTitle(input.article), cards.map((c) => c.slug)),
    learning: input.learning.slice(0, 600),
    article: input.article.slice(0, MAX_ARTICLE_CHARS),
    ...(input.source?.trim() ? { source: input.source.trim().slice(0, 400) } : {}),
    ...(input.raw?.trim() ? { raw: input.raw.slice(0, MAX_RAW_CHARS) } : {}),
    added_by: input.added_by,
    ...(isUseCaseId(input.use_case) ? { use_case: input.use_case } : {}),
    created_at: now,
    updated_at: now,
  };
  await writeFile(l);
  await upsertIndexRow(l);
  return l;
}

/** Null for an unknown id, a malformed id, or a read failure: a url param is never a 500. */
export async function getLearning(id: string): Promise<Learning | null> {
  if (!SAFE_ID.test(id)) return null;
  try {
    return await readFile(id);
  } catch (err) {
    console.error(`[learnings] read failed for ${id}:`, err);
    return null;
  }
}

/** The public page's lookup: by slug, and only if it is published. */
export async function getPublishedLearningBySlug(slug: string): Promise<Learning | null> {
  if (!isSafeSlug(slug)) return null;
  const card = (await readIndex()).find((c) => c.slug === slug);
  if (!card || !card.published_at) return null;
  const l = await getLearning(card.id);
  return l && l.published_at ? l : null;
}

export async function saveLearning(l: Learning): Promise<Learning> {
  const clean = normalizeLearning(l);
  if (!clean) throw new Error('[learnings] refusing to save a learning with a bad id or slug');
  const next: Learning = { ...clean, updated_at: new Date().toISOString() };
  await writeFile(next);
  await upsertIndexRow(next);
  return next;
}

/** Every learning's card, newest updated first. [] on any failure. */
export async function listLearningCards(): Promise<LearningCard[]> {
  return (await readIndex()).sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
}

/** The public list: published only, newest published first. */
export async function listPublishedLearningCards(): Promise<LearningCard[]> {
  return (await readIndex())
    .filter((c) => !!c.published_at)
    .sort((a, b) => String(b.published_at).localeCompare(String(a.published_at)));
}

/** File first, index second, for the same reason narratives do it that way. */
export async function deleteLearning(id: string): Promise<void> {
  if (!SAFE_ID.test(id)) return;
  const key = keyFor(id);
  try {
    if (isBucketConfigured()) await deleteObject(key);
    else await deleteSheetState(key);
  } catch (err) {
    console.error(`[learnings] delete failed for ${key}:`, err);
  }
  const cards = await readIndex();
  await writeIndex(cards.filter((c) => c.id !== id));
}
