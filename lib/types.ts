export type Allocation = 'human' | 'hybrid' | 'agent';

export type Answers = {
  name: string;
  q1: string;
  q1_company?: string;
  q2_role: string;
  q2_size: string;
  q3: string;
  q4: string[];
  q5_volume: string;
  q6_tools: string[];
  q7_constraint: string;
  q8_metric: string;
  q9_urgency: string;
  q10_stance: string;
  email?: string;
};

export type HeatMapRow = {
  fn: string;
  alloc: Allocation;
};

export type TeamMember = {
  name: string;
  role: string;
  type: 'human' | 'agent';
  priority?: 1 | 2 | 3;
  first_agent?: boolean;
  description?: string;
};

export type HeatMapData = {
  shape_id: string;
  shape_display_name: string;
  shape_short_name: string;
  percentages: { human: number; hybrid: number; agent: number };
  rows: HeatMapRow[];
  team: TeamMember[];
};

export type SessionState = {
  phase: 'A' | 'B' | 'C' | 'DONE';
  answers: Partial<Answers>;
  data?: HeatMapData;
  messages?: { role: 'user' | 'assistant'; content: string }[];
};
