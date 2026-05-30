/**
 * Gap Register renderer (Stage 2, spec §9.10).
 *
 * Derived at render time (nothing stored) from three sources via
 * deriveGapRegister():
 *   1. capabilities[].gaps_to_close[]
 *   2. map_reflection.scope_uncertainty[]
 *   3. map_reflection.decisions_deferred[]
 *
 * Grouped:
 *   - Blocking gaps first (coral marker, coral inset edge)
 *   - Non-blocking gaps grouped by capability
 *   - Scope uncertainties (own subsection)
 *   - Decisions deferred (own subsection)
 *
 * Team users see a "mark addressed" affordance. L9 renders it (gated on
 * canEdit); L13 wires it to the gap-status write endpoint. For now the
 * button is a no-op placeholder when canEdit is true — it is NOT shown
 * to client-scoped users (read-only policy).
 *
 * Named GapRegisterV2 to avoid colliding with the legacy GapRegister
 * component used by the 1.x renderer.
 */

import type { DerivedGap } from '@/lib/blueprint/load-v2';
import { deriveGapRegister } from '@/lib/blueprint/load-v2';
import type { CapabilityMapV05 } from '@/lib/blueprint/load-v2';
import { GapAddressButton } from './GapAddressButton';
import s from './v2-sections.module.css';

function GapRow({
  gap,
  slug,
  canEdit,
  locked,
}: {
  gap: DerivedGap;
  slug: string;
  canEdit: boolean;
  locked: boolean;
}) {
  return (
    <div
      className={`${s.gapItem} ${gap.blocking ? s.gapItemBlocking : ''}`}
    >
      <span
        className={`${s.gapMarker} ${gap.blocking ? s.gapMarkerBlocking : ''}`}
        aria-hidden
      />
      <div className={s.gapBody}>
        <div className={s.gapMeta}>
          {gap.source_capability_id && (
            <a
              href={`#cap-${gap.source_capability_id}`}
              className={s.gapSource}
            >
              {gap.source_capability_id}
              {gap.capability_name ? ` · ${gap.capability_name}` : ''}
            </a>
          )}
          {gap.topic && !gap.source_capability_id && (
            <span className={s.gapSource}>{gap.topic}</span>
          )}
          {gap.gap_type && <span className={s.gapType}>{gap.gap_type}</span>}
        </div>
        <div className={s.gapQuestion}>{gap.question}</div>
        {gap.reason && <div className={s.gapReason}>{gap.reason}</div>}
      </div>
      {canEdit && (
        <GapAddressButton slug={slug} gapRef={gap.ref} locked={locked} />
      )}
    </div>
  );
}

function Group({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className={s.gapGroup}>
      <div className={s.gapGroupHead}>
        <h3 className={s.gapGroupTitle}>{title}</h3>
        <span className={s.gapGroupCount}>{count}</span>
      </div>
      <div className={s.gapList}>{children}</div>
    </div>
  );
}

export function GapRegisterV2({
  map,
  slug,
  canEdit,
  locked,
}: {
  map: CapabilityMapV05;
  slug: string;
  canEdit: boolean;
  locked: boolean;
}) {
  const reg = deriveGapRegister({ capabilityMap: map });

  if (reg.openCount === 0) {
    return (
      <p className={s.gapEmpty}>
        No open gaps. The capability map is complete and no scope
        uncertainties or deferred decisions remain.
      </p>
    );
  }

  const nonBlockingCount = reg.nonBlockingByCapability.reduce(
    (sum, g) => sum + g.gaps.length,
    0
  );

  return (
    <div>
      {reg.blocking.length > 0 && (
        <Group title="Blocking gaps" count={reg.blocking.length}>
          {reg.blocking.map((gap) => (
            <GapRow
              key={gap.ref}
              gap={gap}
              slug={slug}
              canEdit={canEdit}
              locked={locked}
            />
          ))}
        </Group>
      )}

      {nonBlockingCount > 0 && (
        <Group title="Non-blocking gaps" count={nonBlockingCount}>
          {reg.nonBlockingByCapability.map((group) =>
            group.gaps.map((gap) => (
              <GapRow
                key={gap.ref}
                gap={gap}
                slug={slug}
                canEdit={canEdit}
                locked={locked}
              />
            ))
          )}
        </Group>
      )}

      {reg.scopeUncertainties.length > 0 && (
        <Group title="Scope uncertainties" count={reg.scopeUncertainties.length}>
          {reg.scopeUncertainties.map((gap) => (
            <GapRow
              key={gap.ref}
              gap={gap}
              slug={slug}
              canEdit={canEdit}
              locked={locked}
            />
          ))}
        </Group>
      )}

      {reg.decisionsDeferred.length > 0 && (
        <Group title="Decisions deferred" count={reg.decisionsDeferred.length}>
          {reg.decisionsDeferred.map((gap) => (
            <GapRow
              key={gap.ref}
              gap={gap}
              slug={slug}
              canEdit={canEdit}
              locked={locked}
            />
          ))}
        </Group>
      )}
    </div>
  );
}
