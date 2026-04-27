import type { Answers, MultiTeamHeatMap } from '../types';

/**
 * Hand-crafted demo answer set + multi-team heat map. Used when ?demo=1 is in
 * the URL or when the id resolves to "demo". Mirrors the simplified PAM
 * (Keel Operations) sample from HEATMAP_REDESIGN_SPEC.md so the demo
 * actually shows the multi-team experience without hitting the LLM.
 */
export const DEMO_ANSWERS: Partial<Answers> = {
  name: 'Sarah',
  company: 'Keel Operations',
  business_description:
    'We run a professional services consultancy helping mid-market companies restructure their operations',
  team_size: '6-15',
  functional_areas: ['Marketing & Content', 'Sales & BD', 'Operations & Delivery'],
  primary_area: 'Operations & Delivery',
  drowning_work:
    'Client reporting, meeting prep, and proposal generation take up 60% of my week',
  human_critical:
    'Client relationships and strategic advisory, they hire us for my judgment specifically',
  primary_risk: 'Lost client',
  tools: ['Gmail', 'Slack', 'Google Docs', 'Notion'],
  urgency: 'Within the month',
  email: 'sarah@keel.co',
};

export const DEMO_HEATMAP: MultiTeamHeatMap = {
  business_summary:
    "Sarah, your business runs on three engines: marketing pulls in attention, sales converts it into engagements, and operations delivers. Each one currently leans on you in places it shouldn't, your judgment is the real product.",
  shape_primary: 'Pipeline and Conversion',
  generated_by: 'rule_based',
  teams: [
    {
      name: 'Marketing',
      shape: 'Creative Direction',
      shape_ids: [7],
      agents: [
        {
          name: 'Drip',
          role: 'Content Strategist',
          short_desc: 'Drafts and iterates content in your voice across channels.',
        },
        {
          name: 'Reach',
          role: 'Distribution Coordinator',
          short_desc: 'Schedules, publishes, and reports on what landed.',
        },
      ],
      functions: [
        { label: 'Brand voice and positioning', allocation: 'human' },
        { label: 'Long-form thought leadership', allocation: 'hybrid' },
        { label: 'Newsletter drafting', allocation: 'agent' },
        { label: 'Social distribution', allocation: 'agent' },
        { label: 'Performance reporting', allocation: 'agent' },
        { label: 'Audience replies and DMs', allocation: 'human' },
      ],
      percentages: { human: 33, hybrid: 17, agent: 50 },
    },
    {
      name: 'Sales',
      shape: 'Executive Leverage + Pipeline and Conversion',
      shape_ids: [4, 2],
      agents: [
        {
          name: 'Prep',
          role: 'Strategic EA',
          short_desc: 'Pre-meeting briefs and live context for every call.',
        },
        {
          name: 'Bam',
          role: 'Pipeline Manager',
          short_desc: 'Watches every deal, surfaces what is slipping.',
        },
        {
          name: 'Pitch',
          role: 'Proposal Writer',
          short_desc: 'Turns a 20-minute debrief into a complete first draft.',
        },
      ],
      functions: [
        { label: 'Lead context aggregation', allocation: 'agent' },
        { label: 'Pre-meeting brief generation', allocation: 'agent' },
        { label: 'Live discovery conversation', allocation: 'human' },
        { label: 'Reading the room and adapting', allocation: 'human' },
        { label: 'Proposal generation', allocation: 'hybrid' },
        { label: 'Client walk-through of proposal', allocation: 'human' },
        { label: 'Pipeline state tracking', allocation: 'agent' },
        { label: 'Follow-up scheduling', allocation: 'agent' },
      ],
      percentages: { human: 38, hybrid: 12, agent: 50 },
    },
    {
      name: 'Operations',
      shape: 'Execution and Delivery',
      shape_ids: [3],
      agents: [
        {
          name: 'Sieve',
          role: 'Scope Analyst',
          short_desc: 'Decomposes engagements into trackable workstreams.',
        },
        {
          name: 'Tic',
          role: 'Status Coordinator',
          short_desc: 'Keeps clients in the loop without you typing the update.',
        },
      ],
      functions: [
        { label: 'Engagement scoping', allocation: 'human' },
        { label: 'Workstream decomposition', allocation: 'hybrid' },
        { label: 'Routine deliverable production', allocation: 'agent' },
        { label: 'QA and review pass', allocation: 'hybrid' },
        { label: 'Client weekly status', allocation: 'agent' },
        { label: 'Strategic checkpoints with the client', allocation: 'human' },
        { label: 'Risk and exception escalation', allocation: 'human' },
      ],
      percentages: { human: 43, hybrid: 28, agent: 29 },
    },
  ],
  total: { human: 38, hybrid: 19, agent: 43 },
  leverage_estimate: '3-5x',
  leverage_rationale:
    'Parallel specialist work across marketing, sales prep, and delivery removes 15+ hours/week of meeting prep, follow-ups, and status reporting, concentrating your time on the conversations and decisions that actually need you.',
};
