/**
 * Shared bits for the Stage 2 section renderers — allocation chips,
 * uplift-needed severity mapping, capability lookup helpers.
 */

import type {
  CapabilityMapV05,
  UpliftNeeded,
} from '@/lib/blueprint/load-v2';
import s from './v2-sections.module.css';

type Allocation = 'Agent' | 'Hybrid' | 'Human';

export function AllocationChip({ allocation }: { allocation: Allocation }) {
  const cls =
    allocation === 'Human'
      ? `${s.allocChip} ${s.allocChipHuman}`
      : allocation === 'Hybrid'
        ? `${s.allocChip} ${s.allocChipHybrid}`
        : `${s.allocChip} ${s.allocChipAgent}`;
  const label =
    allocation === 'Agent'
      ? 'AGENTIC'
      : allocation === 'Hybrid'
        ? 'HYBRID'
        : 'HUMAN';
  return <span className={cls}>{label}</span>;
}

/**
 * Map an uplift-needed level to a 0-100 fill width and a colour.
 * Severity gradient (spec §9.7 Judgment Call 11): mint at-benchmark
 * through coral at major.
 */
export function upliftSeverity(level: UpliftNeeded): {
  pct: number;
  color: string;
} {
  switch (level) {
    case 'At Benchmark':
      return { pct: 8, color: 'var(--bp-mint)' };
    case 'Low':
      return { pct: 30, color: 'var(--bp-mint)' };
    case 'Moderate':
      return { pct: 55, color: 'var(--bp-amber)' };
    case 'High':
      return { pct: 80, color: 'var(--bp-coral)' };
    case 'Major':
      return { pct: 100, color: 'var(--bp-coral)' };
    default:
      return { pct: 0, color: 'var(--bp-text-3)' };
  }
}

export function UpliftNeededBar({ level }: { level: UpliftNeeded }) {
  const { pct, color } = upliftSeverity(level);
  return (
    <div className={s.upliftBar}>
      <span className={s.upliftLabel} style={{ color }}>
        {level}
      </span>
      <div className={s.upliftTrack}>
        <div
          className={s.upliftFill}
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}

/**
 * Build an ordered list of capability rows for table rendering: the same
 * order as the capability map (sequential by id). Each entry carries the
 * name + allocation from capability-map.json keyed by id.
 */
export function orderedCapabilities(map: CapabilityMapV05): {
  id: string;
  name: string;
  allocation: Allocation;
}[] {
  return [...map.capabilities]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((c) => ({ id: c.id, name: c.name, allocation: c.allocation }));
}
