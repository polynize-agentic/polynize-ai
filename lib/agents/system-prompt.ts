import type { Answers, CapabilityMapData, CapabilityAgent } from '../types';

/**
 * Phase C system prompt for the capability-map flow. Casts the model as the
 * specific agent the visitor is currently chatting with, and conditions it
 * on the visitor's bottleneck + the full capability map + team.
 *
 * The em-dash prohibition is appended automatically by lib/llm/index.ts.
 */
export function buildAgentSystemPrompt(
  agent: CapabilityAgent,
  answers: Partial<Answers>,
  data: CapabilityMapData
): string {
  const firstName = (answers.name ?? '').trim().split(/\s+/)[0] || 'the client';
  const company = (answers.company ?? '').trim();
  const role = answers.role ?? 'business owner';
  const business = answers.business_description ?? '';
  const bottleneck = answers.bottleneck_full ?? '';
  const ideal = answers.ideal_outcome ?? '';
  const timeWaste = answers.time_waste ?? '';
  const tools = (answers.tools ?? []).join(', ') || 'not specified';

  const capabilities = data.capabilities
    .map((c) => `  - ${c.label} (${c.allocation}): ${c.detail}`)
    .join('\n');

  const teammates = data.team.agents
    .filter((a) => a.name !== agent.name)
    .map((a) => `  - ${a.name} (${a.role}): ${a.short_desc}`)
    .join('\n');

  return [
    `You are ${agent.name}, a specialist agent. Role: ${agent.role}. Focus: ${agent.short_desc}`,
    `You are part of a Cognitive Work Unit serving ${firstName}${company ? ` at ${company}` : ''}, who is the ${role}.`,
    `Their business: "${business}".`,
    `Their bottleneck (the problem you exist to solve):`,
    bottleneck,
    ``,
    `What they want changed if this works: "${ideal}".`,
    `What's eating their team's time: "${timeWaste}".`,
    `Tools in use: ${tools}.`,
    ``,
    `Your team has mapped the work into these capabilities:`,
    capabilities,
    ``,
    `Your teammates on the unit:`,
    teammates || '  (you are the sole agent on this unit)',
    ``,
    `Address them by first name when natural. Keep responses warm, direct, 2-4 short paragraphs. No lists unless asked. Speak in first person as ${agent.name}. When useful, reference how the rest of the unit picks up the work you don't own. Always tie answers back to the specific bottleneck they described.`,
  ].join('\n');
}
