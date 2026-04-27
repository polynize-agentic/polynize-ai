import type { Answers, MultiTeamHeatMap, HeatMapTeam, Allocation, Percentages } from '../types';

/**
 * Rule-based fallback used when /api/heatmap/generate fails twice.
 * Produces a multi-team heat map from the answers without an LLM call.
 *
 * Selection: each functional area the user chose becomes a team. Each team
 * gets a generic CWU shape best-fitting its area, a couple of agent stubs,
 * and a small set of human/hybrid/agent functions.
 *
 * The output is always less personalised than the LLM version. The point is
 * to keep the flow alive when the LLM route is down or rate-limited.
 */

type AreaTemplate = {
  shape: string;
  shape_ids: number[];
  agents: { name: string; role: string; short_desc: string }[];
  functions: { label: string; allocation: Allocation }[];
};

const AREA_TEMPLATES: Record<string, AreaTemplate> = {
  'Marketing & Content': {
    shape: 'Creative Direction',
    shape_ids: [7],
    agents: [
      { name: 'Drip', role: 'Content Producer', short_desc: 'Drafts and iterates content in your voice.' },
      { name: 'Cog', role: 'Distribution Coordinator', short_desc: 'Schedules, publishes, and tracks reach.' },
    ],
    functions: [
      { label: 'Brand strategy and voice', allocation: 'human' },
      { label: 'Content drafting', allocation: 'hybrid' },
      { label: 'Editing and polish', allocation: 'hybrid' },
      { label: 'Distribution and scheduling', allocation: 'agent' },
      { label: 'Performance reporting', allocation: 'agent' },
      { label: 'Audience engagement', allocation: 'human' },
    ],
  },
  'Sales & BD': {
    shape: 'Pipeline and Conversion',
    shape_ids: [2],
    agents: [
      { name: 'Prep', role: 'Meeting Prep Analyst', short_desc: 'Briefs you for every call before it starts.' },
      { name: 'Bam', role: 'Pipeline Coordinator', short_desc: 'Watches every deal, surfaces what is slipping.' },
    ],
    functions: [
      { label: 'Lead research and triage', allocation: 'agent' },
      { label: 'Pre-meeting briefs', allocation: 'agent' },
      { label: 'Live discovery conversation', allocation: 'human' },
      { label: 'Proposal drafting', allocation: 'hybrid' },
      { label: 'Closing conversations', allocation: 'human' },
      { label: 'Pipeline tracking', allocation: 'agent' },
      { label: 'Follow-up scheduling', allocation: 'agent' },
    ],
  },
  'Operations & Delivery': {
    shape: 'Execution and Delivery',
    shape_ids: [3],
    agents: [
      { name: 'Sieve', role: 'Scope Analyst', short_desc: 'Turns scope into actionable work packets.' },
      { name: 'Tic', role: 'Status Coordinator', short_desc: 'Keeps stakeholders informed without you typing.' },
    ],
    functions: [
      { label: 'Scope decomposition', allocation: 'hybrid' },
      { label: 'Routine build tasks', allocation: 'agent' },
      { label: 'QA and review', allocation: 'hybrid' },
      { label: 'Client checkpoints', allocation: 'human' },
      { label: 'Status reporting', allocation: 'agent' },
      { label: 'Decision approvals', allocation: 'human' },
    ],
  },
  'Finance & Admin': {
    shape: 'High-Volume Operations',
    shape_ids: [6],
    agents: [
      { name: 'Tally', role: 'Bookkeeper Agent', short_desc: 'Categorises transactions and reconciles weekly.' },
      { name: 'Audit', role: 'Exception Handler', short_desc: 'Routes anomalies to you with context.' },
    ],
    functions: [
      { label: 'Transaction categorisation', allocation: 'agent' },
      { label: 'Reconciliation', allocation: 'agent' },
      { label: 'Cash-flow forecasting', allocation: 'hybrid' },
      { label: 'Exceptions and adjustments', allocation: 'human' },
      { label: 'Period-end review', allocation: 'human' },
      { label: 'Reporting', allocation: 'agent' },
    ],
  },
  'Product & Development': {
    shape: 'Execution and Delivery',
    shape_ids: [3],
    agents: [
      { name: 'Spec', role: 'Spec Decomposer', short_desc: 'Breaks features into ticketable work.' },
      { name: 'Test', role: 'QA Agent', short_desc: 'Runs the checklist before handoff.' },
    ],
    functions: [
      { label: 'Product strategy', allocation: 'human' },
      { label: 'Spec decomposition', allocation: 'hybrid' },
      { label: 'Routine implementation', allocation: 'agent' },
      { label: 'Code review', allocation: 'human' },
      { label: 'QA and regression', allocation: 'hybrid' },
      { label: 'Release coordination', allocation: 'agent' },
    ],
  },
  'Customer Success & Support': {
    shape: 'Relationship Continuity',
    shape_ids: [5],
    agents: [
      { name: 'Pulse', role: 'Health Monitor', short_desc: 'Spots churn signals before they happen.' },
      { name: 'Note', role: 'CRM Keeper', short_desc: 'Keeps the CRM honest after every call.' },
    ],
    functions: [
      { label: 'High-stakes client conversations', allocation: 'human' },
      { label: 'Onboarding cadence', allocation: 'hybrid' },
      { label: 'Account health monitoring', allocation: 'agent' },
      { label: 'Renewal preparation', allocation: 'hybrid' },
      { label: 'Routine follow-ups', allocation: 'agent' },
      { label: 'Escalation handling', allocation: 'human' },
    ],
  },
  'Creative & Brand': {
    shape: 'Creative Direction',
    shape_ids: [7],
    agents: [
      { name: 'Spark', role: 'Concept Generator', short_desc: 'Generates first-pass concepts on brief.' },
      { name: 'Tune', role: 'Iteration Specialist', short_desc: 'Iterates designs to your taste.' },
    ],
    functions: [
      { label: 'Brand vision and taste', allocation: 'human' },
      { label: 'Concept generation', allocation: 'hybrid' },
      { label: 'Production iteration', allocation: 'agent' },
      { label: 'Final review', allocation: 'human' },
      { label: 'Asset packaging', allocation: 'agent' },
    ],
  },
  'Research & Strategy': {
    shape: 'Analysis and Judgment',
    shape_ids: [1],
    agents: [
      { name: 'Sieve', role: 'Source Analyst', short_desc: 'Pulls sources, surfaces patterns.' },
      { name: 'Memo', role: 'Briefing Writer', short_desc: 'Drafts briefs in your voice.' },
    ],
    functions: [
      { label: 'Source gathering', allocation: 'agent' },
      { label: 'Synthesis and pattern surfacing', allocation: 'hybrid' },
      { label: 'Strategic interpretation', allocation: 'human' },
      { label: 'Briefing and memos', allocation: 'hybrid' },
      { label: 'Citation and fact-check', allocation: 'agent' },
      { label: 'Stakeholder presentation', allocation: 'human' },
    ],
  },
  'HR & People': {
    shape: 'Learning and Capability',
    shape_ids: [8],
    agents: [
      { name: 'Onboard', role: 'Onboarding Coordinator', short_desc: 'Tailors a ramp path for every new hire.' },
      { name: 'Skill', role: 'Capability Mapper', short_desc: 'Spots skill gaps before they bite.' },
    ],
    functions: [
      { label: 'Hiring decisions', allocation: 'human' },
      { label: 'Onboarding materials', allocation: 'agent' },
      { label: 'Skill-gap analysis', allocation: 'hybrid' },
      { label: 'Performance conversations', allocation: 'human' },
      { label: 'Policy upkeep', allocation: 'agent' },
    ],
  },
};

export function deriveHeatMapFallback(answers: Partial<Answers>): MultiTeamHeatMap {
  const areas = (answers.functional_areas ?? []).filter((a) => AREA_TEMPLATES[a]);
  const sourceAreas = areas.length > 0 ? areas : ['Sales & BD', 'Operations & Delivery'];
  const teamCap = Math.min(4, Math.max(2, sourceAreas.length));
  const chosen = sourceAreas.slice(0, teamCap);

  const teams: HeatMapTeam[] = chosen.map((area) => {
    const tpl = AREA_TEMPLATES[area];
    return {
      name: area.split(/\s+&\s+|\s+and\s+/i)[0] ?? area,
      shape: tpl.shape,
      shape_ids: tpl.shape_ids,
      agents: tpl.agents,
      functions: tpl.functions,
      percentages: percentageFromFns(tpl.functions),
    };
  });

  const totals = teams.reduce<Percentages>(
    (acc, t) => ({
      human: acc.human + t.percentages.human,
      hybrid: acc.hybrid + t.percentages.hybrid,
      agent: acc.agent + t.percentages.agent,
    }),
    { human: 0, hybrid: 0, agent: 0 }
  );
  const total = normaliseToHundred({
    human: Math.round(totals.human / teams.length),
    hybrid: Math.round(totals.hybrid / teams.length),
    agent: Math.round(totals.agent / teams.length),
  });

  const firstName = (answers.name ?? '').trim().split(/\s+/)[0] || 'You';
  const company = (answers.company ?? '').trim();

  return {
    business_summary: `${firstName}${company ? ` at ${company}` : ''}, here's a first-pass map across ${teams.length} teams. The agent-coloured cells are where execution can move off your plate first.`,
    shape_primary: teams[0]?.shape ?? 'Pipeline and Conversion',
    teams,
    total,
    leverage_estimate: teams.length >= 3 ? '3-5x' : '2-3x',
    leverage_rationale:
      'Parallel specialist work across your active areas, removing the highest-frequency execution from your week and keeping you on the decisions that need a human.',
    generated_by: 'rule_based',
  };
}

function percentageFromFns(fns: { allocation: Allocation }[]): Percentages {
  const total = fns.length || 1;
  const counts = { human: 0, hybrid: 0, agent: 0 };
  for (const f of fns) counts[f.allocation]++;
  return normaliseToHundred({
    human: Math.round((counts.human / total) * 100),
    hybrid: Math.round((counts.hybrid / total) * 100),
    agent: Math.round((counts.agent / total) * 100),
  });
}

/** Round-to-100 fixup. Pushes the rounding error onto the largest bucket. */
function normaliseToHundred(p: Percentages): Percentages {
  const sum = p.human + p.hybrid + p.agent;
  if (sum === 100) return p;
  const diff = 100 - sum;
  const out = { ...p };
  const largest = (['agent', 'hybrid', 'human'] as const).reduce((best, key) =>
    out[key] > out[best] ? key : best
  );
  out[largest] = Math.max(0, out[largest] + diff);
  return out;
}
