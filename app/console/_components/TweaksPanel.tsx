import type { Tweaks } from '@/lib/console/types';
import { SettingsIcon, XIcon } from './Icons';
import s from '../console.module.css';

type Props = {
  open: boolean;
  tweaks: Tweaks;
  onToggle: () => void;
  onChange: (patch: Partial<Tweaks>) => void;
  onSimulate: () => void;
  onReset: () => void;
};

export function TweaksPanel({ open, tweaks, onToggle, onChange, onSimulate, onReset }: Props) {
  if (!open) {
    return (
      <button
        type="button"
        className={s.tweaksButton}
        onClick={onToggle}
        aria-label="Open tweaks panel"
      >
        <SettingsIcon />
      </button>
    );
  }

  return (
    <div className={s.tweaksPanel} role="dialog" aria-label="Tweaks">
      <div className={s.tweaksHead}>
        <span>§ tweaks</span>
        <button
          type="button"
          onClick={onToggle}
          className={s.iconBtn}
          style={{ width: 26, height: 26 }}
          aria-label="Close tweaks"
        >
          <XIcon width={14} height={14} />
        </button>
      </div>

      <div className={s.tweaksSection}>
        <div className={s.tweaksLabel}>Theme</div>
        <div className={s.seg}>
          <button
            type="button"
            className={`${s.segBtn} ${tweaks.theme === 'dark' ? s.segBtnOn : ''}`}
            onClick={() => onChange({ theme: 'dark' })}
          >
            Dark
          </button>
          <button
            type="button"
            className={`${s.segBtn} ${tweaks.theme === 'light' ? s.segBtnOn : ''}`}
            onClick={() => onChange({ theme: 'light' })}
          >
            Light
          </button>
        </div>
      </div>

      <div className={s.tweaksSection}>
        <div className={s.tweaksLabel}>Depth</div>
        <div className={s.seg}>
          <button
            type="button"
            className={`${s.segBtn} ${tweaks.depth === 'flat' ? s.segBtnOn : ''}`}
            onClick={() => onChange({ depth: 'flat' })}
          >
            Flat
          </button>
          <button
            type="button"
            className={`${s.segBtn} ${tweaks.depth === 'tactile' ? s.segBtnOn : ''}`}
            onClick={() => onChange({ depth: 'tactile' })}
          >
            Tactile
          </button>
        </div>
      </div>

      <div className={s.tweaksSection}>
        <div className={s.tweaksLabel}>Density</div>
        <div className={s.seg}>
          <button
            type="button"
            className={`${s.segBtn} ${tweaks.density === 'comfortable' ? s.segBtnOn : ''}`}
            onClick={() => onChange({ density: 'comfortable' })}
          >
            Comfortable
          </button>
          <button
            type="button"
            className={`${s.segBtn} ${tweaks.density === 'compact' ? s.segBtnOn : ''}`}
            onClick={() => onChange({ density: 'compact' })}
          >
            Compact
          </button>
        </div>
      </div>

      <div className={s.tweaksSection}>
        <div className={s.tweaksLabel}>Layout</div>
        <div className={s.seg}>
          <button
            type="button"
            className={`${s.segBtn} ${tweaks.layout === 'columns' ? s.segBtnOn : ''}`}
            onClick={() => onChange({ layout: 'columns' })}
          >
            Columns
          </button>
          <button
            type="button"
            className={`${s.segBtn} ${tweaks.layout === 'list' ? s.segBtnOn : ''}`}
            onClick={() => onChange({ layout: 'list' })}
          >
            List
          </button>
        </div>
      </div>

      <div className={s.tweaksSection}>
        <button type="button" className={s.btnPrimary} onClick={onSimulate}>
          + Simulate proposal
        </button>
        <button type="button" className={s.btn} onClick={onReset}>
          Reset demo
        </button>
      </div>
    </div>
  );
}
