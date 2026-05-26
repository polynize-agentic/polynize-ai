import type { CapabilityMapData, CapabilityMapV05, Allocation } from '../types';

/**
 * Adapt a Cap Matrix v0.5 capability map down to the legacy CapabilityMapData
 * shape used by the existing PhaseB reveal animation and /blueprints/[id]
 * renderer. Lossy by design — GHOST rows are filtered out, evidence/gaps/
 * work_shape/edge_cases/completeness/handoff/cluster grouping are all dropped.
 *
 * The full v0.5 map is still stored in blueprints.data so a richer renderer
 * (a future Landmark 6.4 polish) can reach for the dropped fields without
 * re-fetching.
 */
export function v05ToLegacy(v05: CapabilityMapV05): CapabilityMapData {
  // Hide ghost rows from the visitor-facing view. They're seeds for the
  // modeling call, not statements about the prospect's business.
  const visibleRows = v05.capabilities.filter(
    (c) => c.completeness !== 'GHOST'
  );

  return {
    interpretation: v05.interpretation,
    capabilities: visibleRows.map((c) => ({
      label: c.name,
      allocation: c.allocation.toLowerCase() as Allocation,
      detail: c.description,
    })),
    percentages: v05.allocation_summary.percentages,
    team: v05.team,
    leverage_estimate: v05.leverage_estimate,
    leverage_rationale: v05.leverage_rationale,
    pricing_indicative: v05.pricing_indicative,
    hiring_comparison: v05.hiring_comparison,
    shape_internal: v05.shape_internal,
    shape_id: v05.shape_id,
    generated_by: 'llm',
  };
}

/**
 * Detect whether a stored capability map blob is v0.5 or legacy.
 * v0.5 maps carry `stage: "MAP_V0_5"`; legacy maps have no stage field.
 */
export function isV05(
  data: unknown
): data is CapabilityMapV05 {
  return (
    typeof data === 'object' &&
    data !== null &&
    'stage' in data &&
    (data as { stage?: unknown }).stage === 'MAP_V0_5'
  );
}
