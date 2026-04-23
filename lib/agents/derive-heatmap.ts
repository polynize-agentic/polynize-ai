import type { Answers, HeatMapData, TeamMember } from '../types';
import { getShapeByQ4Trigger, SHAPES, type Shape } from './shape-library';
import { getHeatMapEntry, type HeatMapAgent } from './heat-map-data';

/**
 * Phase B rule-based shape derivation. v1 ships with this; LLM-driven
 * generation is the upgrade path (deferred past Phase 1).
 *
 * Selection: first ticked Q4 category → shape via q4_trigger map.
 * Compound shapes are out of v1 scope (see 06-shape-reconciliation.md).
 *
 * Visitor-facing rows + team names come from lib/agents/heat-map-data.ts
 * (ported verbatim from the prototype). Shape metadata (display_name,
 * short_name) comes from cwu-shapes.json via shape-library.ts.
 */
export function deriveHeatMap(answers: Partial<Answers>): HeatMapData {
  const q4 = answers.q4?.[0];
  const shape = pickShape(q4);
  const entry = getHeatMapEntry(q4);
  const team = composeTeam(entry.team, answers, shape.human_center_type, answers.name);

  return {
    shape_id: shape.id,
    shape_display_name: shape.display_name,
    shape_short_name: shape.short_name,
    percentages: percentages(entry.rows),
    rows: entry.rows,
    team,
  };
}

function pickShape(q4: string | undefined): Shape {
  if (q4) {
    const matched = getShapeByQ4Trigger(q4);
    if (matched) return matched;
  }
  return SHAPES.pipeline_and_conversion;
}

function percentages(rows: { alloc: 'human' | 'hybrid' | 'agent' }[]): {
  human: number;
  hybrid: number;
  agent: number;
} {
  const total = rows.length || 1;
  const counts = { human: 0, hybrid: 0, agent: 0 };
  for (const row of rows) counts[row.alloc]++;
  return {
    human: Math.round((counts.human / total) * 100),
    hybrid: Math.round((counts.hybrid / total) * 100),
    agent: Math.round((counts.agent / total) * 100),
  };
}

/**
 * Builds the visitor-facing team. Human at index 0, agents from index 1+.
 * Agent count caps by team size + urgency per 06-shape-reconciliation.md:
 *   Just me  / Exploring          → 2 agents
 *   2-5      / This quarter       → 3 agents
 *   6+       / This week or month → all 4 agents
 */
function composeTeam(
  agents: HeatMapAgent[],
  answers: Partial<Answers>,
  humanRole: string,
  visitorName: string | undefined
): TeamMember[] {
  const cap = agentCap(answers);
  const human: TeamMember = {
    name: visitorName?.trim().split(/\s+/)[0] || 'You',
    role: humanRole,
    type: 'human',
  };
  const agentMembers: TeamMember[] = agents.slice(0, cap).map((a) => ({
    name: a.name,
    role: a.role,
    type: 'agent',
  }));
  return [human, ...agentMembers];
}

function agentCap(answers: Partial<Answers>): 2 | 3 | 4 {
  const size = answers.q2_size ?? '';
  const urgency = answers.q9_urgency ?? '';
  if (size === 'Just me' || urgency === 'Exploring, no fixed timeline') return 2;
  if (size === '2-5' || urgency === 'This quarter') return 3;
  return 4;
}
