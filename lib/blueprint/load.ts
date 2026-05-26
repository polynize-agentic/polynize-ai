import type { Answers, CapabilityMapData, CapabilityMapV05 } from '../types';
import { DEMO_ANSWERS, DEMO_CAPABILITY_MAP } from './demo-default';
import { supabaseService } from '../supabase';
import { isV05, v05ToLegacy } from '../agents/v05-adapter';

export type BlueprintPayload = {
  id: string;
  isDemo: boolean;
  answers: Partial<Answers>;
  /** Adapted legacy view, drives the existing renderers. */
  data: CapabilityMapData;
  /** Raw v0.5 if available — present for new blueprints, absent for legacy. */
  v05?: CapabilityMapV05;
  issuedAt: Date;
  docRef: string;
};

/**
 * Loads a blueprint payload by id.
 *
 * Resolution order:
 *   1. id === 'demo' OR ?demo=1 → return demo payload
 *   2. SUPABASE_URL set → query blueprints table; null result triggers
 *      404 (page.tsx calls notFound())
 *   3. SUPABASE_URL not set (dev without creds) → return demo so the
 *      page is browseable
 */
export async function loadBlueprint(
  id: string,
  demoQuery: boolean
): Promise<BlueprintPayload | null> {
  const isDemo = demoQuery || id === 'demo';
  if (isDemo) return demoPayload(id, true);

  if (process.env.SUPABASE_URL) {
    try {
      const { data: row } = await supabaseService()
        .from('blueprints')
        .select('id, created_at, data')
        .eq('id', id)
        .maybeSingle();

      if (!row) return null;

      const snapshot = row.data as {
        answers: Partial<Answers>;
        data: CapabilityMapData | CapabilityMapV05;
      };

      // Detect schema version. New blueprints (post-2026-05-21) carry v0.5;
      // older blueprints have the legacy CapabilityMapData shape directly.
      const isNewShape = isV05(snapshot.data);
      const legacyView = isNewShape
        ? v05ToLegacy(snapshot.data as CapabilityMapV05)
        : (snapshot.data as CapabilityMapData);

      return {
        id: row.id,
        isDemo: false,
        answers: snapshot.answers,
        data: legacyView,
        v05: isNewShape ? (snapshot.data as CapabilityMapV05) : undefined,
        issuedAt: new Date(row.created_at as string),
        docRef: docRefFromId(row.id),
      };
    } catch (e) {
      console.error('[blueprint] supabase fetch failed', e);
      return null;
    }
  }

  return demoPayload(id, false);
}

function demoPayload(id: string, isDemo: boolean): BlueprintPayload {
  return {
    id,
    isDemo,
    answers: DEMO_ANSWERS,
    data: DEMO_CAPABILITY_MAP,
    issuedAt: new Date(),
    docRef: docRefFromId(id),
  };
}

function docRefFromId(id: string): string {
  let hash = 0;
  for (const ch of id) {
    hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  }
  return Math.abs(hash).toString(36).slice(0, 6).toUpperCase().padEnd(6, 'X');
}
