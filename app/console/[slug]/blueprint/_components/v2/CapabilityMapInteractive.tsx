'use client';

/**
 * Client wrapper around the (presentational) CapabilityMap that adds the
 * glance modal (L8). Holds the selected-capability state, resolves the
 * owning agent from the work-plan registry, and the benchmark from the
 * engagement model, then renders CapabilityModal.
 *
 * CapabilityMap itself is presentational (types + CSS only), so it can be
 * rendered inside this client component without pulling server-only code
 * into the client bundle.
 */

import { useMemo, useState } from 'react';
import type {
  CapabilityMapV05,
  EngagementModel,
  WorkPlanRegistryEntry,
} from '@/lib/blueprint/load-v2';
import { CapabilityMap } from './CapabilityMap';
import { CapabilityModal } from './CapabilityModal';

export function CapabilityMapInteractive({
  map,
  engagementModel,
  workPlanRegistry,
}: {
  map: CapabilityMapV05;
  engagementModel: EngagementModel | null;
  workPlanRegistry: WorkPlanRegistryEntry[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedCap = useMemo(
    () => map.capabilities.find((c) => c.id === selectedId) ?? null,
    [map.capabilities, selectedId]
  );

  const owningAgent = useMemo(() => {
    if (!selectedId) return null;
    const wp = workPlanRegistry.find((w) =>
      w.covers_capabilities.includes(selectedId)
    );
    return wp ? wp.title : null;
  }, [selectedId, workPlanRegistry]);

  const benchmark = useMemo(() => {
    if (!selectedId || !engagementModel) return null;
    return engagementModel.rows[selectedId]?.benchmark || null;
  }, [selectedId, engagementModel]);

  return (
    <>
      <CapabilityMap map={map} onSelect={setSelectedId} />
      {selectedCap && (
        <CapabilityModal
          cap={selectedCap}
          owningAgent={owningAgent}
          benchmark={benchmark}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
