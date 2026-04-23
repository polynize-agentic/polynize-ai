import type { Answers } from '../types';

/**
 * Default demo answer set, ported from
 * design_handoff/designs/blueprints/blueprint-data.js (BLUEPRINT_DEFAULT).
 * Used when ?demo=1 is in the URL or when the id resolves to "demo".
 *
 * The HeatMapData is derived from these answers via deriveHeatMap() so the
 * demo always reflects current shape logic.
 */
export const DEMO_ANSWERS: Partial<Answers> = {
  name: 'Sarah',
  q1: 'we help mid-market ops teams roll out internal tooling, specifically replacing legacy ERP workflows with modern platforms',
  q1_company: 'Keel Operations',
  q2_role: 'Founder',
  q2_size: '2-5',
  q3: 'more qualified pipeline without me being in every discovery call',
  q4: ['Sales and pipeline', 'Account and relationship management'],
  q5_volume: 'Medium, 20 to 100 / week',
  q6_tools: ['Gmail / Outlook', 'Slack', 'HubSpot', 'Notion', 'Calendar'],
  q7_constraint: "I don't have the time",
  q8_metric: 'cut my discovery-call load in half while keeping conversion above 25%',
  q9_urgency: 'Within the month',
  q10_stance: "Build and deploy it for me, I'll review",
  email: 'sarah@keel.ops',
};
