'use client';

import { useEffect, useState } from 'react';
import s from './home.module.css';

const LINES: { t: string; c: string }[] = [
  { t: '$ polynize diagnose', c: 'var(--text-3)' },
  { t: '→ fetching cwu shapes ............ ok', c: 'var(--text-2)' },
  { t: '→ detecting bottleneck ........... pipeline_and_conversion', c: 'var(--mint)' },
  { t: '→ allocating roles ............... 5 agents, 1 human_lead', c: 'var(--mint)' },
  { t: '→ human_critical % ............... 38', c: 'var(--coral)' },
  { t: '→ hybrid % ....................... 12', c: 'var(--amber)' },
  { t: '→ agent_executable % ............. 50', c: 'var(--mint)' },
  { t: '→ estimated throughput ........... ×5.0', c: 'var(--gold)' },
  { t: 'ready. press [map_your_bottleneck]', c: 'var(--text)' },
];

export function Terminal() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1200);
    return () => clearInterval(i);
  }, []);

  const active = tick % LINES.length;

  return (
    <div className={s.terminal}>
      <div className={s.terminalBar}>
        <span className={s.trafficLight} style={{ background: '#ff5f56' }} />
        <span className={s.trafficLight} style={{ background: '#ffbd2e' }} />
        <span className={s.trafficLight} style={{ background: '#27c93f' }} />
        <span style={{ color: 'var(--text-3)', fontSize: 11, marginLeft: 12 }}>
          polynize, /diagnose
        </span>
      </div>
      <div className={s.terminalBody}>
        {LINES.map((l, i) => (
          <div
            key={i}
            className={s.terminalLine}
            style={{ color: l.c, opacity: i <= active ? 1 : 0.2 }}
          >
            {l.t}
            {i === active && <span className={s.terminalCursor}>▍</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
