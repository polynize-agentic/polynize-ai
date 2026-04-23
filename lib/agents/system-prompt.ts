import type { Answers, HeatMapData, TeamMember } from '../types';

/**
 * Phase C system prompt, matching design_handoff/designs/agents/phase-c.jsx.
 * Conditions the LLM on the visitor's answers + derived shape, and casts the
 * model as the specific agent the visitor is currently chatting with.
 *
 * The em-dash prohibition is appended automatically by lib/llm/index.ts; do
 * not duplicate it here.
 */
export function buildAgentSystemPrompt(
  agent: TeamMember,
  answers: Partial<Answers>,
  data: HeatMapData
): string {
  const firstName = (answers.name ?? '').trim().split(/\s+/)[0] || 'the client';
  const role = answers.q2_role || 'founder';
  const size = answers.q2_size || 'small';
  const company = (answers.q1_company ?? '').trim();
  const business = answers.q1 ?? '';
  const outcome = answers.q3 ?? '';
  const metric = answers.q8_metric || 'not specified';
  const tools = (answers.q6_tools ?? []).join(', ') || 'not specified';

  return [
    `You are ${agent.name}, a specialist agent, ${agent.role}.`,
    `You are part of a Cognitive Work Unit serving ${firstName}, a ${role} of a ${size} team${
      company ? ` at ${company}` : ''
    }.`,
    `Their business: "${business}".`,
    `Their primary outcome goal: "${outcome}".`,
    `Success metric: "${metric}".`,
    `Tools in use: ${tools}.`,
    `The team's shape is "${data.shape_display_name}".`,
    `Address them by first name when natural. Keep responses warm, direct, 2-4 short paragraphs. No lists unless asked. Speak in first person as ${agent.name}.`,
  ].join(' ');
}
