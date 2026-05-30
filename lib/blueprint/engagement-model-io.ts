/**
 * Server-side read/mutate/write helpers for engagement-model.json.
 *
 * Shared by the Tier 1 / Tier 2 write endpoints (current-state, benchmark,
 * uplift-moves, motion). Centralises lock enforcement and the
 * read-modify-write pattern so every endpoint behaves identically.
 *
 * Lock model: the engagement-model.json carries lock_state (mirrored from
 * client-config). Engagement-section writes are blocked (423) when locked.
 * The caller decides whether a given write is lock-gated.
 */

import { readClientFile, writeClientFile } from '../github-client';
import {
  EngagementModelSchema,
  type EngagementModel,
  type EngagementRow,
  UNLOCKED_INITIAL,
} from './schema-v2';

const MODEL_PATH = 'modelling/engagement-model.json';

export type LoadResult =
  | { ok: true; model: EngagementModel; existed: boolean }
  | { ok: false; status: number; error: string };

/**
 * Load the engagement model for a write. If the file does not exist yet
 * (first Modelling edit), synthesise an empty unlocked scaffold so the
 * first edit creates the file.
 */
export async function loadEngagementModelForWrite(
  slug: string
): Promise<LoadResult> {
  let raw: string | null = null;
  try {
    raw = await readClientFile(slug, MODEL_PATH);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/Not Found|404/i.test(msg)) {
      // Synthesize an empty scaffold.
      return {
        ok: true,
        existed: false,
        model: {
          schema_version: '1.0',
          generated_from: 'console-edit',
          last_updated: new Date().toISOString(),
          lock_state: { ...UNLOCKED_INITIAL },
          rows: {},
          motions: [],
        },
      };
    }
    return { ok: false, status: 500, error: `Read failed: ${msg}` };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, status: 422, error: 'engagement-model.json is not valid JSON' };
  }
  const parsed = EngagementModelSchema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      status: 422,
      error: `engagement-model.json failed validation: ${parsed.error.issues
        .slice(0, 2)
        .map((i) => `${i.path.join('.')} ${i.message}`)
        .join('; ')}`,
    };
  }
  return { ok: true, model: parsed.data, existed: true };
}

export function isLocked(model: EngagementModel): boolean {
  return model.lock_state.locked === true;
}

/**
 * Get or create a row for a capability id. Returns a fresh draft row when
 * absent so the first edit on an un-benchmarked capability works.
 */
export function ensureRow(
  model: EngagementModel,
  capId: string
): EngagementRow {
  const existing = model.rows[capId];
  if (existing) return existing;
  const fresh: EngagementRow = {
    capability_id: capId,
    current_state: '',
    benchmark: '',
    uplift_needed: 'Moderate',
    uplift_moves: {
      people_train: null,
      process_transform: null,
      ai_deploy: null,
    },
    held: false,
    row_status: 'draft',
  };
  model.rows[capId] = fresh;
  return fresh;
}

export async function writeEngagementModel(
  slug: string,
  model: EngagementModel,
  commitMessage: string
): Promise<{ sha: string; url: string }> {
  model.last_updated = new Date().toISOString();
  const json = JSON.stringify(model, null, 2) + '\n';
  return writeClientFile(slug, MODEL_PATH, json, commitMessage);
}
