import type { AutonomyLevel } from '@/lib/console/types';
import { AUTONOMY_LEVELS } from '@/lib/console/seed';
import p from './projects.module.css';

type Props = {
  value: AutonomyLevel;
  onChange: (next: AutonomyLevel) => void;
};

export function AutonomyDial({ value, onChange }: Props) {
  const meta = AUTONOMY_LEVELS[value];
  return (
    <div>
      <div className={p.autonomyDial}>
        {AUTONOMY_LEVELS.map((lvl, i) => (
          <button
            key={lvl.key}
            type="button"
            className={`${p.autonomyStep} ${i === value ? p.autonomyStepOn : ''}`}
            onClick={() => onChange(i as AutonomyLevel)}
          >
            L{i}
          </button>
        ))}
      </div>
      <div className={p.autonomyBanner}>
        <div className={p.autonomyBannerName}>{meta.name}</div>
        {meta.description}
      </div>
    </div>
  );
}
