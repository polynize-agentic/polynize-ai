import { z } from 'zod';

const AllocationSchema = z.enum(['human', 'hybrid', 'agent']);

const CapabilitySchema = z.object({
  label: z.string().min(1),
  allocation: AllocationSchema,
  detail: z.string().min(1),
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

const PricingBandSchema = z.object({
  label: z.string(),
  from: z.number().min(0),
  currency: z.literal('AUD'),
  description: z.string(),
  period: z.string().optional(),
});

const HiringComparisonSchema = z.object({
  equivalent_fte: z.number().min(0),
  estimated_annual_cost: z.string().min(1),
  currency: z.literal('AUD'),
  note: z.string().min(1),
});

const LeverageEstimateSchema = z.enum(['1.5-2x', '2-4x', '3-5x', '5x+']);

export const CapabilityMapSchema = z.object({
  interpretation: z.string().min(1),
  capabilities: z.array(CapabilitySchema).min(6).max(14),
  percentages: PercentagesSchema,
  team: z.object({
    human_owner: z.object({ name: z.string().min(1), role: z.string().min(1) }),
    agents: z.array(AgentSchema).min(2).max(5),
  }),
  leverage_estimate: LeverageEstimateSchema,
  leverage_rationale: z.string().min(1),
  pricing_indicative: z.object({
    map: PricingBandSchema,
    transform: PricingBandSchema,
    operate: PricingBandSchema,
  }),
  hiring_comparison: HiringComparisonSchema,
  shape_internal: z.string().min(1),
  shape_id: z.number().int().min(1).max(8),
});

export type ParsedCapabilityMap = z.infer<typeof CapabilityMapSchema>;

/**
 * Validates the LLM response and runs sum-to-100 check on percentages
 * (allow 95-105 for rounding noise per spec).
 */
export function validateCapabilityMap(
  json: unknown
): { ok: true; data: ParsedCapabilityMap } | { ok: false; error: string } {
  const parsed = CapabilityMapSchema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    };
  }
  const data = parsed.data;
  const sum = data.percentages.human + data.percentages.hybrid + data.percentages.agent;
  if (sum < 95 || sum > 105) {
    return { ok: false, error: `percentages sum to ${sum}, expected ~100` };
  }
  return { ok: true, data };
}
