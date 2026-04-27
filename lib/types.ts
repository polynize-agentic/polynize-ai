export type Allocation = 'human' | 'hybrid' | 'agent';

/**
 * Phase A answer set, redesigned for the multi-team LLM heat map.
 * Spec: HEATMAP_REDESIGN_SPEC.md.
 */
export type Answers = {
  name: string;
  company: string;
  business_description: string;
  team_size: string;
  functional_areas: string[];
  primary_area: string;
  drowning_work: string;
  human_critical: string;
  primary_risk: string;
  tools: string[];
  urgency: string;
  email?: string;
};

export type HeatMapRow = {
  fn: string;
  alloc: Allocation;
};

export type Percentages = { human: number; hybrid: number; agent: number };

export type HeatMapAgent = {
  name: string;
  role: string;
  short_desc: string;
};

export type HeatMapTeam = {
  name: string;
  shape: string;
  shape_ids?: number[];
  agents: HeatMapAgent[];
  functions: { label: string; allocation: Allocation }[];
  percentages: Percentages;
};

export type MultiTeamHeatMap = {
  business_summary: string;
  shape_primary: string;
  teams: HeatMapTeam[];
  total: Percentages;
  leverage_estimate: string;
  leverage_rationale: string;
  /** 'llm' | 'rule_based' — set by the API layer, not the LLM. */
  generated_by?: 'llm' | 'rule_based';
};

export type SessionState = {
  phase: 'A' | 'B' | 'C' | 'DONE';
  answers: Partial<Answers>;
  data?: MultiTeamHeatMap;
  messages?: { role: 'user' | 'assistant'; content: string }[];
};
