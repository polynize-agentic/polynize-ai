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
 * Loads a blueprint payload by id. v1 always returns the demo (Sarah / Keel /
 * Pipeline), since the Supabase blueprints table isn't wired yet. The shape
 * of this function lets the upgrade be local: when Supabase lands, plug the
 * fetch into the non-demo branch.
 *
 * Demo paths:
 *   - id === 'demo'
 *   - any id with searchParams.demo === '1'
 *
 * CC-TODO (Phase 2): query supabase blueprints table by id; on miss, 404
 * instead of falling back to demo (keeps share links honest).
 */
export async function loadBlueprint(id: string, demoQuery: boolean): Promise<BlueprintPayload> {
  const isDemo = demoQuery || id === 'demo';
  // For Phase 1 every non-demo id also resolves to demo; replace with Supabase fetch.
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
