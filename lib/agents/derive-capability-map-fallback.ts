import type { Answers, CapabilityMapData, Allocation, Percentages } from '../types';

/**
 * Rule-based fallback used when /api/capability-map/generate fails twice.
 * Produces a generic single-team capability map without an LLM call.
 *
 * The output is intentionally less personalised than the LLM version. The
 * point is to keep the flow alive when the LLM route is down or rate-limited.
 */

const GENERIC_CAPABILITIES: { label: string; allocation: Allocation; detail: string }[] = [
  {
    label: 'High-stakes decisions and trust calls',
    allocation: 'human',
    detail: 'Anything that carries reputational or financial risk stays with you.',
  },
  {
    label: 'Client-facing relationship work',
    allocation: 'human',
    detail: 'Conversations and judgment that depend on you specifically.',
  },
  {
    label: 'Exceptions outside the standard pattern',
    allocation: 'human',
    detail: 'When the work falls outside what the team has been trained on, you pick it up.',
  },
  {
    label: 'Routine intake and triage',
    allocation: 'agent',
    detail: 'Inbound items get classified, logged, and routed without you in the loop.',
  },
  {
    label: 'Status tracking and reporting',
    allocation: 'agent',
    detail: 'A live view of where every item sits, with delays flagged automatically.',
  },
  {
    label: 'Standard correspondence and follow-ups',
    allocation: 'agent',
    detail: 'Templated communications go out on schedule, drafted in your voice.',
  },
  {
    label: 'First-pass drafts and proposals',
    allocation: 'hybrid',
    detail: 'Agents produce the structure, you steer the substance.',
  },
  {
    label: 'Quality review on routine items',
    allocation: 'hybrid',
    detail: 'Agents flag what looks off, you make the call.',
  },
];

const GENERIC_AGENTS = [
  {
    name: 'Intake',
    role: 'Coordinator',
    short_desc: 'Logs every inbound item, routes to the right place, tracks status.',
  },
  {
    name: 'Draft',
    role: 'Writer',
    short_desc: 'Produces first-pass drafts in your voice, ready for your review.',
  },
  {
    name: 'Pulse',
    role: 'Operations Monitor',
    short_desc: 'Watches the pipeline, flags delays, sends routine status updates.',
  },
];

export function deriveCapabilityMapFallback(answers: Partial<Answers>): CapabilityMapData {
  const firstName = (answers.name ?? '').trim().split(/\s+/)[0] || 'You';
  const company = (answers.company ?? '').trim();

  const percentages = computePercentages(GENERIC_CAPABILITIES);

  return {
    interpretation: `${firstName}${company ? ` at ${company}` : ''}, here's a first-pass map of the bottleneck you described. Roughly ${percentages.agent}% of the work is structured enough for agents, freeing your team to focus on the judgment-heavy parts that need a human.`,
    capabilities: GENERIC_CAPABILITIES,
    percentages,
    team: {
      human_owner: {
        name: firstName,
        role: 'The person at the centre. Trust calls, relationships, and exceptions.',
      },
      agents: GENERIC_AGENTS,
    },
    leverage_estimate: '2-4x',
    leverage_rationale:
      'Solving this with traditional hiring would typically require 1 to 2 additional FTE at $50,000-$70,000 each, plus ongoing management overhead. Your agent team achieves equivalent throughput for the Map plus Transform plus Operate cost below, freeing your existing team to focus on the work that actually needs them.',
    pricing_indicative: {
      map: {
        label: 'Map',
        from: 5000,
        currency: 'AUD',
        description: 'Capability mapping and team design',
      },
      transform: {
        label: 'Transform',
        from: 10000,
        currency: 'AUD',
        description: 'Build, train, and deploy the agent team',
      },
      operate: {
        label: 'Operate',
        from: 999,
        currency: 'AUD',
        period: 'month',
        description: 'Ongoing agent team operation and optimisation',
      },
    },
    hiring_comparison: {
      equivalent_fte: 2,
      estimated_annual_cost: '110,000-130,000',
      currency: 'AUD',
      note: 'Plus recruitment, onboarding, leave, and management overhead',
    },
    shape_internal: 'Pipeline and Conversion',
    shape_id: 2,
    generated_by: 'rule_based',
  };
}

function computePercentages(rows: { allocation: Allocation }[]): Percentages {
  const total = rows.length || 1;
  const counts = { human: 0, hybrid: 0, agent: 0 };
  for (const r of rows) counts[r.allocation]++;
  const raw = {
    human: Math.round((counts.human / total) * 100),
    hybrid: Math.round((counts.hybrid / total) * 100),
    agent: Math.round((counts.agent / total) * 100),
  };
  return normaliseToHundred(raw);
}

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
