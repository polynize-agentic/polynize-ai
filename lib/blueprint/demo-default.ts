import type { Answers, CapabilityMapData } from '../types';

/**
 * Hand-crafted demo answer set + capability map. Used when ?demo=1 is in the
 * URL or when the id resolves to "demo". Mirrors the Roxbury Auctions sample
 * from HEATMAP_REDESIGN_SPEC.md v3.
 */
export const DEMO_ANSWERS: Partial<Answers> = {
  name: 'Scott',
  company: 'Roxbury Auctions',
  business_description: 'We run a boutique auction house specialising in fine art and estate sales',
  role: 'Founder / CEO',
  bottleneck_full: `"Our consignment intake process is entirely manual. Every item needs cataloguing, photographing, assessing for condition, priced, and listed across multiple platforms. It takes 3 people full-time and we're still falling behind."

[Follow-up: Where exactly does it break down?]
"The main bottleneck is between intake and listing. Items sit for days waiting for photography and condition assessment. High-value items need my personal review but I'm spending time on routine items under $1,000 that shouldn't need me. The team is constantly chasing each other for status updates and consignors keep asking where their items are in the process."`,
  ideal_outcome:
    "We could process 3x the consignments without hiring. I'd stop doing routine assessments and focus on high-value clients and pricing strategy. Consignors would get automatic updates instead of having to chase us.",
  time_waste:
    'Data entry into the catalogue system, sending status update emails to consignors, chasing the photography team for completion, basic condition reports for items under $5,000, manually creating listings on 4 different platforms',
  primary_risk: 'Lost revenue',
  team_size: '6-15',
  tools: ['Gmail', 'Excel', 'Google Docs'],
  urgency: 'This week',
  email: 'scott@roxbury.com.au',
};

export const DEMO_CAPABILITY_MAP: CapabilityMapData = {
  interpretation:
    "Scott, your consignment intake pipeline is running on manual coordination that doesn't need to be manual. By decomposing the workflow into its component capabilities, roughly 55% of the work is structured enough for agents to handle, freeing your team to focus on the high-value assessment and client relationship work that actually drives revenue.",
  capabilities: [
    {
      label: 'Consignment intake logging',
      allocation: 'agent',
      detail: 'Structured data entry from intake forms into the catalogue system.',
    },
    {
      label: 'Photography scheduling and tracking',
      allocation: 'agent',
      detail: 'Coordinates the photography queue, assigns items, tracks completion.',
    },
    {
      label: 'Standard condition assessment (items under $5,000)',
      allocation: 'agent',
      detail: 'Pattern-matching against condition criteria for routine items.',
    },
    {
      label: 'High-value condition assessment',
      allocation: 'human',
      detail: 'Requires expert judgment, provenance knowledge, and accountability.',
    },
    {
      label: 'Pricing strategy and reserve setting',
      allocation: 'human',
      detail: 'Requires market judgment, relationship context, and risk assessment.',
    },
    {
      label: 'Comparable sales research',
      allocation: 'agent',
      detail: 'Pulls recent auction results and market data for pricing reference.',
    },
    {
      label: 'Pricing recommendations (routine items)',
      allocation: 'hybrid',
      detail: 'Agent generates data-backed ranges, human approves or adjusts.',
    },
    {
      label: 'Consignor status communications',
      allocation: 'agent',
      detail: 'Automated updates at each pipeline stage via email.',
    },
    {
      label: 'Listing creation and multi-platform publication',
      allocation: 'agent',
      detail: 'Generates listing copy from catalogue data, publishes across platforms.',
    },
    {
      label: 'Client relationship management',
      allocation: 'human',
      detail: 'Trust-based conversations about timing, expectations, and high-value negotiations.',
    },
    {
      label: 'Intake pipeline monitoring',
      allocation: 'agent',
      detail: 'Real-time visibility into where every consignment sits, flags delays.',
    },
    {
      label: 'Exception handling and escalation',
      allocation: 'human',
      detail: 'Items outside standard categories, disputes, unusual provenance.',
    },
  ],
  percentages: { human: 28, hybrid: 17, agent: 55 },
  team: {
    human_owner: {
      name: 'Scott',
      role: 'High-value assessments, pricing strategy, client relationships, and exceptions.',
    },
    agents: [
      {
        name: 'Intake',
        role: 'Consignment Coordinator',
        short_desc:
          'Logs every incoming consignment, manages the photography queue, tracks pipeline status.',
      },
      {
        name: 'Scout',
        role: 'Pricing Analyst',
        short_desc: 'Pulls comparable sales data and generates pricing recommendations for review.',
      },
      {
        name: 'Catalogue',
        role: 'Listing Specialist',
        short_desc: 'Creates catalogue entries and publishes listings across platforms.',
      },
      {
        name: 'Pulse',
        role: 'Operations Monitor',
        short_desc:
          'Tracks the full intake pipeline, flags delays, sends consignor status updates.',
      },
    ],
  },
  leverage_estimate: '3-5x',
  leverage_rationale:
    "Solving this bottleneck with traditional hiring would require approximately 2 additional FTE (catalogue coordinator + listing specialist) at $55,000-$65,000 each, plus ongoing management overhead. Your agent team achieves equivalent throughput for a $10,000 build + $999/mo operation cost, compressing the intake-to-listing cycle and concentrating your team's time on the high-value assessment and client work that drives revenue.",
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
  shape_internal: 'High-Volume Operations',
  shape_id: 6,
  generated_by: 'rule_based',
};
