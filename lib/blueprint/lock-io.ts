/**
 * Lock state I/O. The canonical lock lives in client-config.yaml's `lock`
 * block (spec §6.1) and is mirrored into engagement-model.json. All
 * lock-gated write endpoints check the canonical client-config lock.
 */

import YAML from 'yaml';
import { readClientFile, writeClientFile } from '../github-client';
import { type LockState, UNLOCKED_INITIAL } from './schema-v2';

const CONFIG_PATH = '.polynize/client-config.yaml';

type ConfigShape = {
  lock?: Partial<LockState> | null;
  [key: string]: unknown;
};

function coerceLock(raw: Partial<LockState> | null | undefined): LockState {
  if (!raw || typeof raw !== 'object') return { ...UNLOCKED_INITIAL };
  return {
    locked: raw.locked === true,
    locked_at: typeof raw.locked_at === 'string' ? raw.locked_at : null,
    locked_by: typeof raw.locked_by === 'string' ? raw.locked_by : null,
    lock_version:
      typeof raw.lock_version === 'number' ? raw.lock_version : 0,
    unlock_reason:
      typeof raw.unlock_reason === 'string' ? raw.unlock_reason : null,
  };
}

/** Read the canonical lock state. Missing/malformed → unlocked. */
export async function getLockState(slug: string): Promise<LockState> {
  try {
    const yamlText = await readClientFile(slug, CONFIG_PATH);
    const cfg = (YAML.parse(yamlText) ?? {}) as ConfigShape;
    return coerceLock(cfg.lock);
  } catch {
    return { ...UNLOCKED_INITIAL };
  }
}

/**
 * Write the lock block into client-config.yaml, preserving all other keys.
 * Returns the commit + the new lock state.
 */
export async function setLockStateInConfig(
  slug: string,
  next: LockState,
  commitMessage: string
): Promise<{ sha: string; url: string; lock: LockState }> {
  const yamlText = await readClientFile(slug, CONFIG_PATH);
  const cfg = (YAML.parse(yamlText) ?? {}) as ConfigShape;
  cfg.lock = next;
  const commit = await writeClientFile(
    slug,
    CONFIG_PATH,
    YAML.stringify(cfg),
    commitMessage
  );
  return { sha: commit.sha, url: commit.url, lock: next };
}
