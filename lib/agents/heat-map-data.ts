/**
 * Visitor-facing heat-map content per shape, ported verbatim from
 * design_handoff/designs/agents/phase-b.jsx. The row labels and team names
 * are user-facing copy and final per CLAUDE.md §2 (do not paraphrase).
 *
 * Keys are the Q4 trigger labels (matching cwu-shapes.json q4_trigger).
 *
 * Shape metadata (display_name, short_name, methodology fields) lives in
 * lib/agents/shape-library.ts (loaded from config/cwu-shapes.json). This
 * file only carries the heat-map's visitor-facing rows + team names.
 */

import type { Allocation } from '../types';

export type HeatMapRow = { fn: string; alloc: Allocation };
export type HeatMapAgent = { name: string; role: string };
export type HeatMapEntry = { rows: HeatMapRow[]; team: HeatMapAgent[] };

export const HEAT_MAP_BY_Q4: Record<string, HeatMapEntry> = {
  'Sales and pipeline': {
    rows: [
      { fn: 'Prospecting and qualification', alloc: 'agent' },
      { fn: 'Meeting prep and intel briefs', alloc: 'agent' },
      { fn: 'Live client conversations', alloc: 'human' },
      { fn: 'Proposal drafting', alloc: 'hybrid' },
      { fn: 'Objection handling', alloc: 'human' },
      { fn: 'Follow-through and pipeline', alloc: 'agent' },
      { fn: 'Close and commitment', alloc: 'human' },
      { fn: 'Post-sale handoff', alloc: 'agent' },
    ],
    team: [
      { name: 'Nora', role: 'Targeting & Qualification Specialist' },
      { name: 'Arlo', role: 'Meeting Prep & Intelligence Analyst' },
      { name: 'Sena', role: 'Proposal Specialist' },
      { name: 'Jules', role: 'Pipeline Coordinator' },
    ],
  },
  'Analysis and research': {
    rows: [
      { fn: 'Source gathering and triage', alloc: 'agent' },
      { fn: 'Synthesis and pattern surfacing', alloc: 'hybrid' },
      { fn: 'Judgment and interpretation', alloc: 'human' },
      { fn: 'Recommendation framing', alloc: 'human' },
      { fn: 'Drafting briefs and memos', alloc: 'hybrid' },
      { fn: 'Citation and fact-check', alloc: 'agent' },
      { fn: 'Distribution and tracking', alloc: 'agent' },
    ],
    team: [
      { name: 'Iris', role: 'Research & Synthesis Analyst' },
      { name: 'Theo', role: 'Briefing & Memo Writer' },
      { name: 'Vera', role: 'Source & Citation Keeper' },
      { name: 'Milo', role: 'Distribution Coordinator' },
    ],
  },
  'Building and delivery': {
    rows: [
      { fn: 'Scoping and planning', alloc: 'human' },
      { fn: 'Breakdown into work packets', alloc: 'hybrid' },
      { fn: 'Routine build tasks', alloc: 'agent' },
      { fn: 'QA and review', alloc: 'hybrid' },
      { fn: 'Final sign-off', alloc: 'human' },
      { fn: 'Progress tracking', alloc: 'agent' },
      { fn: 'Status updates and reporting', alloc: 'agent' },
    ],
    team: [
      { name: 'Rex', role: 'Scope & Breakdown Analyst' },
      { name: 'Finn', role: 'Build Operator' },
      { name: 'Cora', role: 'QA & Review Specialist' },
      { name: 'Dex', role: 'Progress & Status Coordinator' },
    ],
  },
  'Managing my own time and attention': {
    rows: [
      { fn: 'Inbox triage', alloc: 'agent' },
      { fn: 'Calendar shaping', alloc: 'hybrid' },
      { fn: 'Priority decisions', alloc: 'human' },
      { fn: 'Meeting prep briefs', alloc: 'agent' },
      { fn: 'Follow-up tracking', alloc: 'agent' },
      { fn: 'Strategic reflection', alloc: 'human' },
      { fn: 'Written correspondence', alloc: 'hybrid' },
    ],
    team: [
      { name: 'Sol', role: 'Chief of Staff Agent' },
      { name: 'Juno', role: 'Inbox & Follow-up Keeper' },
      { name: 'Pax', role: 'Meeting Brief Writer' },
      { name: 'Lyra', role: 'Correspondence Drafter' },
    ],
  },
  'Account and relationship management': {
    rows: [
      { fn: 'Account monitoring', alloc: 'agent' },
      { fn: 'Health signals and alerts', alloc: 'agent' },
      { fn: 'Relationship conversations', alloc: 'human' },
      { fn: 'Check-in and nudge cadence', alloc: 'hybrid' },
      { fn: 'Renewal and expansion calls', alloc: 'human' },
      { fn: 'Note-taking and CRM updates', alloc: 'agent' },
      { fn: 'Escalation handling', alloc: 'human' },
    ],
    team: [
      { name: 'Wren', role: 'Client Health Monitor' },
      { name: 'Kai', role: 'Cadence & Nudge Coordinator' },
      { name: 'Opal', role: 'CRM & Note Keeper' },
      { name: 'Rue', role: 'Expansion Prep Analyst' },
    ],
  },
  'High-volume operations': {
    rows: [
      { fn: 'Inbound sorting and routing', alloc: 'agent' },
      { fn: 'Standard transactions', alloc: 'agent' },
      { fn: 'Exception handling', alloc: 'hybrid' },
      { fn: 'Quality sampling', alloc: 'hybrid' },
      { fn: 'Escalations and refunds', alloc: 'human' },
      { fn: 'SLA and volume reporting', alloc: 'agent' },
      { fn: 'Process improvement', alloc: 'human' },
    ],
    team: [
      { name: 'Ori', role: 'Routing & Intake Operator' },
      { name: 'Tess', role: 'Transaction Processor' },
      { name: 'Bodie', role: 'Exception Handler' },
      { name: 'Ness', role: 'SLA & Reporting Agent' },
    ],
  },
  'Creative and content production': {
    rows: [
      { fn: 'Concept and direction', alloc: 'human' },
      { fn: 'Research and references', alloc: 'agent' },
      { fn: 'Drafting and iteration', alloc: 'hybrid' },
      { fn: 'Editing and polish', alloc: 'hybrid' },
      { fn: 'Final approval', alloc: 'human' },
      { fn: 'Publishing and distribution', alloc: 'agent' },
      { fn: 'Asset management', alloc: 'agent' },
    ],
    team: [
      { name: 'Echo', role: 'Reference & Research Agent' },
      { name: 'Onyx', role: 'Draft & Iteration Specialist' },
      { name: 'Vale', role: 'Editor & Polisher' },
      { name: 'Rhea', role: 'Publishing Coordinator' },
    ],
  },
  'Team learning and development': {
    rows: [
      { fn: 'Knowledge capture', alloc: 'agent' },
      { fn: 'Documentation upkeep', alloc: 'agent' },
      { fn: 'Skill gap analysis', alloc: 'hybrid' },
      { fn: '1:1 coaching conversations', alloc: 'human' },
      { fn: 'Curriculum design', alloc: 'human' },
      { fn: 'Onboarding materials', alloc: 'hybrid' },
      { fn: 'Learning tracking', alloc: 'agent' },
    ],
    team: [
      { name: 'Astra', role: 'Knowledge Capture Agent' },
      { name: 'Cyrus', role: 'Documentation Keeper' },
      { name: 'Nova', role: 'Skill Gap Analyst' },
      { name: 'Pip', role: 'Onboarding Coordinator' },
    ],
  },
};

export const DEFAULT_Q4 = 'Sales and pipeline';

export function getHeatMapEntry(q4Trigger: string | undefined): HeatMapEntry {
  return HEAT_MAP_BY_Q4[q4Trigger ?? DEFAULT_Q4] ?? HEAT_MAP_BY_Q4[DEFAULT_Q4];
}
