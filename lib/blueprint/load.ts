import type { Answers, HeatMapData } from '../types';
import { deriveHeatMap } from '../agents/derive-heatmap';
import { DEMO_ANSWERS } from './demo-default';

export type BlueprintPayload = {
  id: string;
  isDemo: boolean;
  answers: Partial<Answers>;
  data: HeatMapData;
  issuedAt: Date;
  docRef: string;
};

/**
 * Loads a blueprint payload by id.
 *
 * Resolution order:
 *   1. id === 'demo' OR ?demo=1 → return demo payload
 *   2. SUPABASE_URL set → query blueprints table; null result triggers 404
 *      (page.tsx calls notFound())
 *   3. SUPABASE_URL not set (dev without creds) → return demo so the
 *      page is browseable
 *
 * The Supabase fetch is a CC-TODO; the shape of the function lets the
 * upgrade be local. A null return from this function should always
 * trigger notFound() in the calling page.
 */
export async function loadBlueprint(
  id: string,
  demoQuery: boolean
): Promise<BlueprintPayload | null> {
  const isDemo = demoQuery || id === 'demo';
  if (isDemo) return demoPayload(id, true);

  if (process.env.SUPABASE_URL) {
    // CC-TODO: real Supabase fetch
    // const { data: row } = await supabaseService()
    //   .from('blueprints').select('*').eq('id', id).maybeSingle();
    // if (!row) return null;  // → triggers notFound() in page.tsx
    // return rowToPayload(row);
    //
    // Until then, even with SUPABASE_URL set, we 404 unknown ids so the
    // share-link surface stays honest.
    return null;
  }

  // No Supabase wired (dev) — fall back to demo so the route is browseable.
  return demoPayload(id, false);
}

function demoPayload(id: string, isDemo: boolean): BlueprintPayload {
  const answers = DEMO_ANSWERS;
  const data = deriveHeatMap(answers);
  return {
    id,
    isDemo,
    answers,
    data,
    issuedAt: new Date(),
    docRef: docRefFromId(id),
  };
}

function docRefFromId(id: string): string {
  // Deterministic 6-char ref, derived from the id so server + client agree
  // and a given share link always shows the same BP-XXXXXX.
  let hash = 0;
  for (const ch of id) {
    hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  }
  return Math.abs(hash).toString(36).slice(0, 6).toUpperCase().padEnd(6, 'X');
}
