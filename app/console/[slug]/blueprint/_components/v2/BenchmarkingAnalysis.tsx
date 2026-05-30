/**
 * Benchmarking Analysis renderer (spec §9.7).
 *
 * Table, same row order as the capability map, keyed by capability id.
 * Columns: Capability (name + id) / Allocation chip / Current State /
 * Benchmark (marked contractual once locked) / Uplift Needed (bar + label).
 *
 * Reads engagement-model.json rows. If the engagement model is absent
 * (Lead, pre-Modelling), the parent renders a placeholder instead.
 *
 * L7 ships read-only. L13 adds inline editing on Current State + Benchmark
 * for team-scope users when unlocked.
 */

import type {
  CapabilityMapV05,
  EngagementModel,
} from '@/lib/blueprint/load-v2';
import { AllocationChip, UpliftNeededBar, orderedCapabilities } from './shared';
import s from './v2-sections.module.css';

export function BenchmarkingAnalysis({
  map,
  model,
}: {
  map: CapabilityMapV05;
  model: EngagementModel;
}) {
  const rows = orderedCapabilities(map);
  const locked = model.lock_state.locked;

  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Capability</th>
            <th>Allocation</th>
            <th>Current state</th>
            <th>Benchmark</th>
            <th>Uplift needed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((cap) => {
            const er = model.rows[cap.id];
            return (
              <tr key={cap.id}>
                <td>
                  <span className={s.cellCapId}>{cap.id}</span>
                  <span className={s.cellCapName}>{cap.name}</span>
                </td>
                <td>
                  <AllocationChip allocation={cap.allocation} />
                </td>
                <td>{er?.current_state || <span className={s.moveEmpty}>—</span>}</td>
                <td>
                  {er?.benchmark || <span className={s.moveEmpty}>—</span>}
                  {er?.benchmark && locked && (
                    <span className={s.contractual}>· contractual</span>
                  )}
                </td>
                <td>
                  {er ? (
                    <UpliftNeededBar level={er.uplift_needed} />
                  ) : (
                    <span className={s.moveEmpty}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
