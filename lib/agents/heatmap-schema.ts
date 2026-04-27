import { z } from 'zod';

const AllocationSchema = z.enum(['human', 'hybrid', 'agent']);

const FunctionSchema = z.object({
  label: z.string().min(1),
  allocation: AllocationSchema,
});

const AgentSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  short_desc: z.string().min(1),
});

const PercentagesSchema = z.object({
  human: z.number().min(0).max(100),
  hybrid: z.number().min(0).max(100),
  agent: z.number().min(0).max(100),
});

const TeamSchema = z.object({
  name: z.string().min(1),
  shape: z.string().min(1),
  shape_ids: z.array(z.number()).optional(),
  agents: z.array(AgentSchema).min(1).max(4),
  functions: z.array(FunctionSchema).min(4).max(12),
  percentages: PercentagesSchema,
});

export const MultiTeamHeatMapSchema = z.object({
  business_summary: z.string().min(1),
  shape_primary: z.string().min(1),
  teams: z.array(TeamSchema).min(1).max(4),
  total: PercentagesSchema,
  leverage_estimate: z.string().min(1),
  leverage_rationale: z.string().min(1),
});

export type ParsedHeatMap = z.infer<typeof MultiTeamHeatMapSchema>;

/**
 * Validates the LLM response and runs sum-to-100 checks on percentages.
 * Allows 98-102 for rounding noise (per spec).
 */
export function validateHeatMap(json: unknown): { ok: true; data: ParsedHeatMap } | { ok: false; error: string } {
  const parsed = MultiTeamHeatMapSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') };
  }
  const data = parsed.data;

  const totalSum = data.total.human + data.total.hybrid + data.total.agent;
  if (totalSum < 98 || totalSum > 102) {
    return { ok: false, error: `total percentages sum to ${totalSum}, expected ~100` };
  }
  for (const team of data.teams) {
    const sum = team.percentages.human + team.percentages.hybrid + team.percentages.agent;
    if (sum < 98 || sum > 102) {
      return { ok: false, error: `team "${team.name}" percentages sum to ${sum}, expected ~100` };
    }
  }

  return { ok: true, data };
}
