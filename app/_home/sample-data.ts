/**
 * Homepage sample heat map (Pipeline & Conversion shape).
 * Ported verbatim from design_handoff/designs/shared/data.js.
 *
 * Used by §04 recognition_first to demo the heat map output. This is
 * static marketing copy, not derived from real session data.
 */

import type { Allocation } from '@/lib/types';

export type HomeRow = { fn: string; alloc: Allocation };

export const HOME_SAMPLE = {
  business: 'B2B services, we help mid-market ops teams roll out internal tooling',
  role: 'Founder',
  teamSize: '2-5',
  primaryOutcome: 'More qualified pipeline without me being in every call',
  shape: 'Pipeline and Conversion',
  rows: [
    { fn: 'Prospecting and qualification', alloc: 'agent' },
    { fn: 'Meeting prep and intel briefs', alloc: 'agent' },
    { fn: 'Live client conversations', alloc: 'human' },
    { fn: 'Proposal drafting and customisation', alloc: 'hybrid' },
    { fn: 'Objection handling and negotiation', alloc: 'human' },
    { fn: 'Follow-through and pipeline state', alloc: 'agent' },
    { fn: 'Close and commitment management', alloc: 'human' },
    { fn: 'Post-sale handoff and documentation', alloc: 'agent' },
  ] as HomeRow[],
  percentages: { human: 38, hybrid: 12, agent: 50 },
} as const;
