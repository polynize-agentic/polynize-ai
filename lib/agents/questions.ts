/**
 * Phase A question set.
 *
 * Updated 2026-05-21 per Cap Matrix v0.5 spec — three swaps:
 *   Q05 time_waste → work_shape (who's involved + triggers)
 *   Q06 primary_risk → volume (single-select bucket)
 *   Q08 tools → context (open text, optional)
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
  /** Optional — when true, the question can be skipped without entering text. */
  optional?: boolean;
};

export const ROLE_OPTIONS = [
  'Founder / CEO',
  'Operations lead',
  'Department head',
  'Team lead',
  'Solo operator',
];

export const TEAM_SIZES = ['Just me', '2-5', '6-15', '16-50', '50+'];

export const VOLUME_OPTIONS = [
  'Hundreds of touches a day',
  'Dozens a day',
  'A few a day',
  'Weekly cadence',
  'Less than that',
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
    id: 'work_shape',
    type: 'textarea',
    label:
      "Walk us through the work for a moment. When this bottleneck happens, who's involved and what triggers it?",
    placeholder:
      'e.g. Every consignment inquiry hits the inbox. Lacy and Gwen tag-team initial replies. Scott reviews anything borderline. Triggers roughly daily, heavier around auction weeks.',
    tag: 'Q05 · work shape',
  },
  {
    id: 'volume',
    type: 'single',
    label: 'Roughly how much of this is happening?',
    options: VOLUME_OPTIONS,
    tag: 'Q06 · volume',
  },
  {
    id: 'team_size',
    type: 'single',
    label: 'How many people work in your business?',
    options: TEAM_SIZES,
    tag: 'Q07 · team size',
  },
  {
    id: 'context',
    type: 'textarea',
    label:
      'Anything we should know about how your team works? Tools you live in, anything unusual about the setup.',
    sub: 'Optional. Skip if nothing comes to mind.',
    placeholder:
      "e.g. Everything runs through Zendesk. Scott isn't on Slack. We've tried adding triage staff before and it didn't stick.",
    tag: 'Q08 · context',
    optional: true,
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
