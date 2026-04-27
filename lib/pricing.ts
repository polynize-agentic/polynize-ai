import type { Answers } from './types';

export const PRICING_VERSION = process.env.PRICING_VERSION ?? 'v1.0-baseline-2026-04';

export type PricingBreakdown = {
  version: string;
  currency: 'AUD';
  map: { from: number };
  transform: { from: number };
  operate: { from_per_month: number };
};

/**
 * v1 baseline: flat floors. Real per-shape / per-team-size math lands when
 * Marrs delivers the refined pricing doc. Persist PRICING_VERSION on every
 * blueprint so old blueprints stay valid when this function changes.
 */
export function computePricing(_answers: Partial<Answers>): PricingBreakdown {
  return {
    version: PRICING_VERSION,
    currency: 'AUD',
    map: { from: 5000 },
    transform: { from: 10000 },
    operate: { from_per_month: 999 },
  };
}
