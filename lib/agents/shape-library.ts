import shapesData from '@/config/cwu-shapes.json';
import type { Allocation, HeatMapRow, TeamMember } from '../types';

type RawAllocation = 'human-led' | 'hybrid' | 'agent-executable';
type RawRow = { function: string; allocation: RawAllocation };
type RawTeamRole = {
  title: string;
  priority: 1 | 2 | 3;
  first_agent?: boolean;
  description: string;
};

type RawShape = {
  id: string;
  shape_number: number;
  display_name: string;
  q4_trigger: string;
  what_it_is: string;
  human_center_type: string;
  structural_signature: string;
  leverage_range: string;
  leverage_source: string;
  rows: RawRow[];
  team_roles: RawTeamRole[];
  discriminating_signals: string[];
  domain_examples: string[];
};

export type Shape = {
  id: string;
  shape_number: number;
  display_name: string;       // CWU full name, e.g. "Pipeline and Conversion"
  short_name: string;         // visitor-facing on Heat Map, e.g. "Pipeline"
  q4_trigger: string;
  what_it_is: string;
  human_center_type: string;
  structural_signature: string;
  leverage_range: string;
  leverage_source: string;
  rows: HeatMapRow[];
  team_roles: TeamMember[];
  discriminating_signals: string[];
  domain_examples: string[];
};

/**
 * Visitor-facing short names for the Heat Map title.
 * Locked decision: full CWU display_name lives in the data layer and Blueprint;
 * the Heat Map shows the shorter, more accessible name.
 */
const SHORT_NAMES: Record<string, string> = {
  analysis_and_judgment: 'Analysis',
  pipeline_and_conversion: 'Pipeline',
  execution_and_delivery: 'Execution',
  executive_leverage: 'Leverage',
  relationship_continuity: 'Continuity',
  high_volume_operations: 'Operations',
  creative_direction: 'Creative',
  learning_and_capability: 'Learning',
};

const ALLOC_MAP: Record<RawAllocation, Allocation> = {
  'human-led': 'human',
  hybrid: 'hybrid',
  'agent-executable': 'agent',
};

function normalize(raw: RawShape): Shape {
  return {
    id: raw.id,
    shape_number: raw.shape_number,
    display_name: raw.display_name,
    short_name: SHORT_NAMES[raw.id] ?? raw.display_name,
    q4_trigger: raw.q4_trigger,
    what_it_is: raw.what_it_is,
    human_center_type: raw.human_center_type,
    structural_signature: raw.structural_signature,
    leverage_range: raw.leverage_range,
    leverage_source: raw.leverage_source,
    rows: raw.rows.map((r) => ({ fn: r.function, alloc: ALLOC_MAP[r.allocation] })),
    team_roles: raw.team_roles.map((t) => ({
      name: '',
      role: t.title,
      type: 'agent' as const,
      priority: t.priority,
      first_agent: t.first_agent,
      description: t.description,
    })),
    discriminating_signals: raw.discriminating_signals,
    domain_examples: raw.domain_examples,
  };
}

const rawShapes = (shapesData as { shapes: Record<string, RawShape> }).shapes;

export const SHAPES: Record<string, Shape> = Object.fromEntries(
  Object.entries(rawShapes).map(([id, raw]) => [id, normalize(raw)])
);

export const SHAPES_BY_Q4_TRIGGER: Record<string, Shape> = Object.fromEntries(
  Object.values(SHAPES).map((s) => [s.q4_trigger, s])
);

export function getShape(id: string): Shape | undefined {
  return SHAPES[id];
}

export function getShapeByQ4Trigger(trigger: string): Shape | undefined {
  return SHAPES_BY_Q4_TRIGGER[trigger];
}
