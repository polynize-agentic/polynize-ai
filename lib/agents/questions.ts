/**
 * Phase A question set, ported verbatim from
 * design_handoff/designs/agents/phase-a.jsx. All visitor-facing copy is final
 * per CLAUDE.md §2 — do not paraphrase.
 *
 * Q4 option labels match the `q4_trigger` strings in config/cwu-shapes.json
 * exactly so derive-heatmap.ts can map a tick straight to a shape.
 */

export type QuestionType = 'text' | 'business' | 'role_size' | 'multi' | 'single' | 'email';

export type Question = {
  id: string;
  type: QuestionType;
  tag: string;
  label: string | ((firstName: string) => string);
  sub?: string;
  placeholder?: string;
  short?: boolean;
  options?: string[];
};

export const ROLE_OPTIONS = ['Founder', 'CEO', 'Operator', 'Team Lead', 'IC / Specialist', 'Other'];
export const SIZE_OPTIONS = ['Just me', '2-5', '6-20', '20+'];

export const QUESTIONS: Question[] = [
  {
    id: 'name',
    type: 'text',
    short: true,
    label: 'First, what should we call you?',
    placeholder: 'your first name',
    tag: 'Q00 · hello',
  },
  {
    id: 'q1',
    type: 'business',
    label: (firstName) =>
      firstName
        ? `Nice to meet you, ${firstName}. What does your business do?`
        : 'What does your business do?',
    sub: 'One or two sentences, plus the name so we can brand your report.',
    tag: 'Q01 · context',
  },
  {
    id: 'q2',
    type: 'role_size',
    label: "What's your role, and how big is your team?",
    tag: 'Q02 · shape',
  },
  {
    id: 'q3',
    type: 'text',
    label: "What's the one outcome you most need your team to deliver better right now?",
    placeholder: 'e.g. more qualified pipeline without me being in every call',
    tag: 'Q03 · outcome',
  },
  {
    id: 'q4',
    type: 'multi',
    label: "Where's the bottleneck? Pick as many as apply.",
    sub: "We'll use your first pick as the shape of your Cognitive Work Unit.",
    options: [
      'Analysis and research',
      'Sales and pipeline',
      'Building and delivery',
      'Managing my own time and attention',
      'Account and relationship management',
      'High-volume operations',
      'Creative and content production',
      'Team learning and development',
    ],
    tag: 'Q04 · bottleneck',
  },
  {
    id: 'q5_volume',
    type: 'single',
    label: "What's the current volume in that bottleneck area?",
    sub: 'Rough order of magnitude per week, helps us size the agent team.',
    options: [
      'Low, under 20 items / week',
      'Medium, 20 to 100 / week',
      'High, 100 to 500 / week',
      'Very high, 500+ / week',
    ],
    tag: 'Q05 · volume',
  },
  {
    id: 'q6_tools',
    type: 'multi',
    label: 'Which tools does this work already live in?',
    sub: 'Your agents will plug into these.',
    options: [
      'Gmail / Outlook',
      'Slack',
      'Notion',
      'Linear / Jira',
      'HubSpot',
      'Salesforce',
      'Airtable / sheets',
      'Figma',
      'GitHub',
      'Google Docs',
      'Calendar',
      "Other / we'll tell you later",
    ],
    tag: 'Q06 · surface area',
  },
  {
    id: 'q7_constraint',
    type: 'single',
    label: "What's currently preventing you from fixing this yourself?",
    options: [
      "I don't have the time",
      "I don't have the team capacity",
      "I don't have the right expertise",
      "I've tried and it didn't stick",
      "I haven't seen a good enough approach yet",
    ],
    tag: 'Q07 · constraint',
  },
  {
    id: 'q8_metric',
    type: 'text',
    label: 'If this worked, what would change that you could measure?',
    placeholder: 'e.g. cut meeting prep time by 80%, 2× qualified demos, response time under 2h',
    tag: 'Q08 · success metric',
  },
  {
    id: 'q9_urgency',
    type: 'single',
    label: 'When do you need this working?',
    options: ['This week', 'Within the month', 'This quarter', 'Exploring, no fixed timeline'],
    tag: 'Q09 · urgency',
  },
  {
    id: 'q10_stance',
    type: 'single',
    label: 'How hands-on do you want to be?',
    options: [
      "Build and deploy it for me, I'll review",
      'Partner with me, I want to shape it',
      'I want to build it myself, point me in the right direction',
    ],
    tag: 'Q10 · stance',
  },
  {
    id: 'email',
    type: 'email',
    label: (firstName) =>
      firstName ? `${firstName}, where should we send your Heat Map?` : 'Where should we send your Heat Map?',
    sub: 'A full PDF report + your team blueprint, tailored to your answers. No spam, one email, yours to keep.',
    tag: 'Q11 · delivery',
  },
];

export function resolveLabel(q: Question, firstName: string): string {
  return typeof q.label === 'function' ? q.label(firstName) : q.label;
}
