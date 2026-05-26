export type Allocation = 'human' | 'hybrid' | 'agent';

/**
 * Phase A answer set, redesigned for the bottleneck-focused capability map.
 *
 * Updated 2026-05-21 per Cap Matrix v0.5 spec (Landmark 6.1):
 *   time_waste → work_shape    (who's involved + triggers)
 *   primary_risk → volume      (single-select bucket)
 *   tools (string[]) → context (open text, optional)
 *
 * `bottleneck_full` accumulates the user's initial answer plus any follow-up
 * exchanges from the conversational probe pattern.
 */
export type Answers = {
  name: string;
  company: string;
  business_description: string;
  role: string;
  bottleneck_full: string;
  ideal_outcome: string;
  work_shape: string;
  volume: string;
  team_size: string;
  context: string;
  urgency: string;
  email?: string;
};

export type Percentages = { human: number; hybrid: number; agent: number };

export type CapabilityRow = {
  label: string;
  allocation: Allocation;
  detail: string;
};

export type CapabilityAgent = {
  name: string;
  role: string;
  short_desc: string;
};

export type HumanOwner = {
  name: string;
  role: string;
};

export type PricingBand = {
  label: string;
  from: number;
  currency: 'AUD';
  description: string;
  period?: string;
};

export type HiringComparison = {
  equivalent_fte: number;
  estimated_annual_cost: string;
  currency: 'AUD';
  note: string;
};

export type CapabilityMapData = {
  interpretation: string;
  capabilities: CapabilityRow[];
  percentages: Percentages;
  team: {
    human_owner: HumanOwner;
    agents: CapabilityAgent[];
  };
  leverage_estimate: string;
  leverage_rationale: string;
  pricing_indicative: {
    map: PricingBand;
    transform: PricingBand;
    operate: PricingBand;
  };
  hiring_comparison: HiringComparison;
  shape_internal: string;
  shape_id: number;
  /** 'llm' | 'rule_based' — set by the API layer, not the LLM. */
  generated_by?: 'llm' | 'rule_based';
};

export type SessionState = {
  phase: 'A' | 'B' | 'C' | 'DONE';
  answers: Partial<Answers>;
  data?: CapabilityMapData;
  messages?: { role: 'user' | 'assistant'; content: string }[];
};
