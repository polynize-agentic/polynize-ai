import { STORAGE_KEY, DEFAULT_TWEAKS } from './constants';
import { PROJECTS, TASKS, SEED_ACTIVITY } from './seed';
import type { PersistedState } from './types';

export const SEED_STATE: PersistedState = {
  tab: 'dashboard',
  openProjectId: null,
  openAgentId: null,
  projects: PROJECTS,
  tasks: TASKS,
  activity: SEED_ACTIVITY,
  tweaks: DEFAULT_TWEAKS,
};

export function loadPersisted(): PersistedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      tab: parsed.tab ?? SEED_STATE.tab,
      openProjectId: parsed.openProjectId ?? null,
      openAgentId: parsed.openAgentId ?? null,
      projects: parsed.projects ?? SEED_STATE.projects,
      tasks: parsed.tasks ?? SEED_STATE.tasks,
      activity: parsed.activity ?? SEED_STATE.activity,
      tweaks: { ...DEFAULT_TWEAKS, ...(parsed.tweaks ?? {}) },
    };
  } catch {
    return null;
  }
}

export function savePersisted(state: PersistedState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode, ignore */
  }
}

export function clearPersisted(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
