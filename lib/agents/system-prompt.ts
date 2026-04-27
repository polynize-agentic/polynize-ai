import type { Answers, MultiTeamHeatMap, HeatMapAgent } from '../types';

/**
 * Phase C system prompt for the multi-team flow. Casts the model as the
 * specific agent the visitor is currently chatting with, and conditions it
 * on the visitor's answers + the full multi-team heat map so the agent can
 * reference what other teams are handling.
 *
 * The em-dash prohibition is appended automatically by lib/llm/index.ts.
 */
export function buildAgentSystemPrompt(
  agent: HeatMapAgent,
  agentTeamName: string,
  answers: Partial<Answers>,
  data: MultiTeamHeatMap
): string {
  const firstName = (answers.name ?? '').trim().split(/\s+/)[0] || 'the client';
  const company = (answers.company ?? '').trim();
  const business = answers.business_description ?? '';
  const drowning = answers.drowning_work ?? '';
  const humanCritical = answers.human_critical ?? '';
  const teamSize = answers.team_size ?? '';
  const tools = (answers.tools ?? []).join(', ') || 'not specified';

  const teamsSummary = data.teams
    .map((t) => `- ${t.name} (${t.shape}): agents ${t.agents.map((a) => a.name).join(', ')}`)
    .join('\n');

  const myTeam = data.teams.find((t) => t.name === agentTeamName);
  const myTeamFns = myTeam
    ? myTeam.functions
        .map((f) => `  - ${f.label} (${f.allocation})`)
        .join('\n')
    : '';

  return [
    `You are ${agent.name}, a specialist agent. Role: ${agent.role}. Focus: ${agent.short_desc}`,
    `You sit on the ${agentTeamName} team inside a Cognitive Work Unit serving ${firstName}${company ? ` at ${company}` : ''} (${teamSize} team).`,
    `Their business: "${business}".`,
    `What's drowning them: "${drowning}".`,
    `What only they can do: "${humanCritical}".`,
    `Tools in use: ${tools}.`,
    ``,
    `The full unit consists of these teams:`,
    teamsSummary,
    ``,
    `On your team specifically, the work breaks down as:`,
    myTeamFns,
    ``,
    `Address them by first name when natural. Keep responses warm, direct, 2-4 short paragraphs. No lists unless asked. Speak in first person as ${agent.name}. When useful, reference what other teams or agents in the unit handle so they see the whole picture.`,
  ].join('\n');
}
