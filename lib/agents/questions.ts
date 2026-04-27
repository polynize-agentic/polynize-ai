/**
 * Phase A question set, redesigned for the bottleneck-focused capability map.
 * Spec: HEATMAP_REDESIGN_SPEC.md v3.
 *
 * 10 numbered screens (Q00 through Q09); Q03 is conversational with up to two
 * follow-up probes; Q09 combines urgency + email on a single screen. All
 * visitor-facing copy is final per CLAUDE.md §2 — do not paraphrase.
 */

export type QuestionType =
  | 'business'
  | 'textarea'
  | 'single'
  | 'multi'
  | 'bottleneck'
  | 'urgency_email';

export type Question = {
  id: string;
  type: QuestionType;
  tag: string;
  label: string | ((firstName: string) => string);
  sub?: string;
  placeholder?: string;
  options?: string[];
  /** Used by the urgency_email combined screen. */
  emailLabel?: string;
};

export const ROLE_OPTIONS = [
  'Founder / CEO',
  'Operations lead',
  'Department head',
  'Team lead',
  'Solo operator',
];

export const TEAM_SIZES = ['Just me', '2-5', '6-15', '16-50', '50+'];

export const RISK_OPTIONS = [
  'Lost revenue',
  'Lost client',
  'Wasted time',
  'Reputation damage',
  'Compliance risk',
  'Quality drops',
];

export const TOOL_OPTIONS = [
  'Gmail',
  'Slack',
  'Telegram',
  'WhatsApp',
  'Notion',
  'Google Docs',
  'Excel',
  'Figma',
  'Xero',
  'Salesforce',
  'Other',
];

export const URGENCY_OPTIONS = ['This week', 'Within the month', 'Just exploring'];

export const QUESTIONS: Question[] = [
  {
    id: 'name',
    type: 'business',
    label: "Before we map your bottleneck, what's your name?",
    sub: 'And the name of your business?',
    tag: 'Q00 · identity',
  },
  {
    id: 'business_description',
    type: 'textarea',
    label: 'In one line, what does your business do?',
    placeholder:
      'e.g. We run a boutique auction house specialising in fine art and estate sales',
    tag: 'Q01 · what you do',
  },
  {
    id: 'role',
    type: 'single',
    label: "What's your role in the business?",
    options: ROLE_OPTIONS,
    tag: 'Q02 · role',
  },
  {
    id: 'bottleneck_full',
    type: 'bottleneck',
    label:
      "What's the one thing choking your business right now? The bottleneck that, if it was solved, would change everything.",
    sub: 'Be as specific as you can. The more detail you give, the more accurate your capability map will be.',
    placeholder:
      "e.g. Our consignment intake process is entirely manual. Every item needs cataloguing, photographing, assessing, and listing. It takes 3 people full-time and we're still behind.",
    tag: 'Q03 · the bottleneck',
  },
  {
    id: 'ideal_outcome',
    type: 'textarea',
    label:
      'If this bottleneck was completely solved tomorrow, what would actually change for your business?',
    placeholder:
      "e.g. We could take on 3x the consignments without hiring. I'd stop doing routine assessments and focus on high-value clients.",
    tag: 'Q04 · ideal outcome',
  },
  {
    id: 'time_waste',
    type: 'textarea',
    label: "What's eating your team's time that honestly shouldn't need them?",
    placeholder:
      'e.g. Data entry, chasing status updates, basic categorisation, sending routine emails to clients',
    tag: 'Q05 · time waste',
  },
  {
    id: 'primary_risk',
    type: 'single',
    label: 'When this bottleneck causes a failure, what hurts most?',
    options: RISK_OPTIONS,
    tag: 'Q06 · stakes',
  },
  {
    id: 'team_size',
    type: 'single',
    label: 'How many people work in your business?',
    options: TEAM_SIZES,
    tag: 'Q07 · team size',
  },
  {
    id: 'tools',
    type: 'multi',
    label: 'What tools does your team live in?',
    options: TOOL_OPTIONS,
    tag: 'Q08 · tools',
  },
  {
    id: 'urgency',
    type: 'urgency_email',
    label: 'How soon do you want to solve this?',
    emailLabel: 'Where should we send your capability map?',
    options: URGENCY_OPTIONS,
    tag: 'Q09 · urgency + delivery',
  },
];

export function resolveLabel(q: Question, firstName: string): string {
  return typeof q.label === 'function' ? q.label(firstName) : q.label;
}
