import type { Tweaks } from './types';

export const STORAGE_KEY = 'polynize_console_v1';

export const DEFAULT_TWEAKS: Tweaks = {
  theme: 'dark',
  density: 'comfortable',
  autonomy: 1,
  layout: 'columns',
  depth: 'tactile',
};

export const TASK_STATUSES = ['proposed', 'todo', 'doing', 'blocked', 'done'] as const;

/**
 * Random pool for the simulation tick when it chooses to propose a new task.
 * Matches the reference prototype's pool.
 */
export const PROPOSE_POOL: { project: string; agent: string; title: string; urgency: number }[] = [
  { project: 'p_1', agent: 'a_paralegal', title: 'Update Morrison fact chronology with late-production docs', urgency: 7 },
  { project: 'p_1', agent: 'a_research', title: 'Pull 3 additional appellate citations for summary judgment brief', urgency: 6 },
  { project: 'p_2', agent: 'a_intake', title: 'Follow up with Patel enquiry (conflicts cleared)', urgency: 6 },
  { project: 'p_2', agent: 'a_intake', title: 'Send bilingual intake packet to Morales', urgency: 5 },
  { project: 'p_3', agent: 'a_research', title: 'Delaware GST settlor-intent memo draft', urgency: 8 },
  { project: 'p_3', agent: 'a_compliance', title: 'Jersey trustee licensing requirement summary', urgency: 7 },
  { project: 'p_4', agent: 'a_compliance', title: 'SEC amendments cross-check against Vantage Capital matter', urgency: 7 },
];
