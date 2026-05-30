/**
 * Uplift Plan renderer (spec §9.8).
 *
 * Table, same rows as the capability map. Three move columns:
 *   - People (Train)    → Polynize.io
 *   - Process (Transform) → Transform consultancy
 *   - AI (Deploy)       → Polynize.ai
 *
 * Each cell shows the move text or "—" (null = no move in that lane).
 * "Held" rows show a Held tag across all lanes (working correctly today,
 * redesign around it, no moves).
 *
 * L7 read-only. L13 adds inline editing per cell (team-scope, unlocked).
 */

import type {
  CapabilityMapV05,
  EngagementModel,
} from '@/lib/blueprint/load-v2';
import { AllocationChip, orderedCapabilities } from './shared';
import s from './v2-sections.module.css';

function Move({ text }: { text: string | null }) {
  if (!text) return <span className={s.moveEmpty}>—</span>;
  return <>{text}</>;
}

export function UpliftPlan({
  map,
  model,
}: {
  map: CapabilityMapV05;
  model: EngagementModel;
}) {
  const rows = orderedCapabilities(map);

  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Capability</th>
            <th>Allocation</th>
            <th>
              <span className={s.moveColHead}>
                People
                <span className={s.moveColSub}>Train</span>
              </span>
            </th>
            <th>
              <span className={s.moveColHead}>
                Process
                <span className={s.moveColSub}>Transform</span>
              </span>
            </th>
            <th>
              <span className={s.moveColHead}>
                AI
                <span className={s.moveColSub}>Deploy</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((cap) => {
            const er = model.rows[cap.id];
            if (er?.held) {
              return (
                <tr key={cap.id}>
                  <td>
                    <span className={s.cellCapId}>{cap.id}</span>
                    <span className={s.cellCapName}>{cap.name}</span>
                  </td>
                  <td>
                    <AllocationChip allocation={cap.allocation} />
                  </td>
                  <td colSpan={3}>
                    <span className={s.heldTag}>Held</span>{' '}
                    <span className={s.moveEmpty} style={{ fontStyle: 'italic' }}>
                      working correctly today, redesign around it
                    </span>
                  </td>
                </tr>
              );
            }
            return (
              <tr key={cap.id}>
                <td>
                  <span className={s.cellCapId}>{cap.id}</span>
                  <span className={s.cellCapName}>{cap.name}</span>
                </td>
                <td>
                  <AllocationChip allocation={cap.allocation} />
                </td>
                <td>
                  <Move text={er?.uplift_moves.people_train ?? null} />
                </td>
                <td>
                  <Move text={er?.uplift_moves.process_transform ?? null} />
                </td>
                <td>
                  <Move text={er?.uplift_moves.ai_deploy ?? null} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
