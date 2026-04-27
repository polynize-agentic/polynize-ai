/**
 * Phase A question set — redesigned for the multi-team LLM heat map.
 * Spec: HEATMAP_REDESIGN_SPEC.md (the 11 questions feed POST /api/heatmap/generate).
 *
 * All visitor-facing copy is final per CLAUDE.md §2 — do not paraphrase.
 *
 * The shape closely mirrors the prior question set so PhaseA.tsx can reuse the
 * same renderers (text/business/multi/single/email). Q04 ("primary_area") is
 * dynamic: its option list is derived from the answer to Q03 (functional_areas).
 */

export type QuestionType = 'text' | 'business' | 'textarea' | 'multi' | 'single' | 'email';

export type Question = {
  id: string;
  type: QuestionType;
  tag: string;
  label: string | ((firstName: string) => string);
  sub?: string;
  placeholder?: string;
  short?: boolean;
  options?: string[];
  /**
   * When true, options are derived at runtime from another field's answer.
   * PhaseA wires the resolver explicitly for `primary_area`.
   */
  dynamicOptions?: boolean;
};

export const FUNCTIONAL_AREAS = [
  'Marketing & Content',
  'Sales & BD',
  'Operations & Delivery',
  'Finance & Admin',
  'Product & Development',
  'Customer Success & Support',
  'Creative & Brand',
  'Research & Strategy',
  'HR & People',
];

export const TEAM_SIZES = ['Just me', '2-5', '6-15', '16-50', '50+'];
export const RISK_OPTIONS = [
  'Lost money',
  'Lost client',
  'Lost time',
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
    label: "Before we map your business, what's your name?",
    sub: 'And the name of your business?',
    tag: 'Q00 · identity',
  },
  {
    id: 'business_description',
    type: 'textarea',
    label: 'Describe your business in a sentence. What do you sell or deliver?',
    placeholder:
      'e.g. We run a boutique investment advisory firm managing portfolios for high-net-worth clients',
    tag: 'Q01 · what you do',
  },
  {
    id: 'team_size',
    type: 'single',
    label: 'How many people work in your business, including you?',
    options: TEAM_SIZES,
    tag: 'Q02 · team size',
  },
  {
    id: 'functional_areas',
    type: 'multi',
    label: 'Which of these areas does your business actively run?',
    sub: 'Select all that apply',
    options: FUNCTIONAL_AREAS,
    tag: 'Q03 · functional areas',
  },
  {
    id: 'primary_area',
    type: 'single',
    label: 'Which of those areas do YOU spend most of your time in?',
    options: [],
    dynamicOptions: true,
    tag: 'Q04 · where you sit',
  },
  {
    id: 'drowning_work',
    type: 'textarea',
    label:
      "What's the work that's drowning you right now? The stuff that takes up your week but shouldn't need you.",
    placeholder:
      'e.g. I spend half my week on client reporting and meeting prep that could be templated',
    tag: 'Q05 · drowning',
  },
  {
    id: 'human_critical',
    type: 'textarea',
    label:
      "What's the one thing in your business that completely falls apart if you're not personally doing it?",
    placeholder:
      'e.g. Client relationships and investment decisions, they trust me specifically',
    tag: 'Q06 · human-only',
  },
  {
    id: 'primary_risk',
    type: 'single',
    label: 'When something goes wrong in your business, what hurts most?',
    options: RISK_OPTIONS,
    tag: 'Q07 · stakes',
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
    type: 'single',
    label: 'How soon do you want to start building agent teams?',
    options: URGENCY_OPTIONS,
    tag: 'Q09 · urgency',
  },
  {
    id: 'email',
    type: 'email',
    label: (firstName) =>
      firstName ? `${firstName}, where should we send your business map?` : 'Where should we send your business map?',
    sub: 'A full PDF report + your team blueprint, tailored to your answers. No spam, one email, yours to keep.',
    tag: 'Q10 · delivery',
  },
];

export function resolveLabel(q: Question, firstName: string): string {
  return typeof q.label === 'function' ? q.label(firstName) : q.label;
}
