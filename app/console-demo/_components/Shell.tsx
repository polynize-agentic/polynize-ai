import Image from 'next/image';
import type { Tab } from '@/lib/console-demo/types';
import { BellIcon, MoonIcon, SunIcon } from './Icons';
import { HumanAvatar } from './Avatar';
import { HUMAN_BY_ID } from '@/lib/console-demo/seed';
import s from '../console.module.css';

const TABS: { key: Tab; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'projects', label: 'Projects' },
  { key: 'agents', label: 'Agents' },
  { key: 'humans', label: 'Humans' },
];

type Props = {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  pendingApprovals: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  projectCount: number;
  agentCount: number;
  humanCount: number;
};

export function Shell({
  activeTab,
  onTabChange,
  pendingApprovals,
  theme,
  onToggleTheme,
  projectCount,
  agentCount,
  humanCount,
}: Props) {
  const you = HUMAN_BY_ID['h_1'];
  const counts: Record<Tab, number> = {
    dashboard: 0,
    projects: projectCount,
    agents: agentCount,
    humans: humanCount,
  };

  return (
    <header className={s.topbar}>
      <div className={s.topbarInner}>
        <div className={s.brand}>
          <Image
            className={s.brandLogo}
            src="/console-assets/logo-mark-colour.png"
            alt="polynize"
            width={28}
            height={28}
          />
          <div className={s.brandText}>
            <div className={s.brandName}>Agent Team Console</div>
            <div className={s.brandClient}>Harrow &amp; West LLP</div>
          </div>
        </div>

        <nav className={s.tabs} role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={activeTab === t.key}
              className={`${s.tab} ${activeTab === t.key ? s.tabActive : ''}`}
              onClick={() => onTabChange(t.key)}
              type="button"
            >
              {t.label}
              {counts[t.key] > 0 && <span className={s.tabCount}>{counts[t.key]}</span>}
            </button>
          ))}
        </nav>

        <div className={s.topbarRight}>
          <button type="button" className={s.iconBtn} aria-label="Notifications">
            <BellIcon />
            {pendingApprovals > 0 && <span className={s.iconBtnDot} />}
          </button>
          <button
            type="button"
            className={s.iconBtn}
            aria-label="Toggle theme"
            onClick={onToggleTheme}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          {you && (
            <button type="button" className={s.avatarChip}>
              <HumanAvatar human={you} />
              <span>{you.name.split(' ')[0]}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
