'use client';

import { useEffect, useState } from 'react';
import type { HomeRow } from './sample-data';
import s from './home.module.css';

type Props = { rows: readonly HomeRow[] };

const COLOR: Record<HomeRow['alloc'], string> = {
  human: 'var(--coral)',
  hybrid: 'var(--amber)',
  agent: 'var(--mint)',
};

const RGBA: Record<HomeRow['alloc'], string> = {
  human: '255, 122, 107',
  hybrid: '240, 184, 107',
  agent: '105, 252, 203',
};

export function HeatMapGrid({ rows }: Props) {
  const [active, setActive] = useState<number>(-1);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      setActive(i);
      i++;
      if (i > rows.length) clearInterval(iv);
    }, 180);
    return () => clearInterval(iv);
  }, [rows.length]);

  return (
    <div className={s.heatGrid}>
      <div className={s.heatHead}>
        <div className={s.heatHFn}>function</div>
        <div className={s.heatCol} style={{ color: 'var(--coral)' }}>HUMAN-LED</div>
        <div className={s.heatCol} style={{ color: 'var(--amber)' }}>HYBRID</div>
        <div className={s.heatCol} style={{ color: 'var(--mint)' }}>AGENT-EXEC</div>
      </div>
      {rows.map((r, i) => {
        const on = i <= active;
        return (
          <div key={i} className={s.heatRow}>
            <div className={s.heatFn}>{r.fn}</div>
            <Cell active={r.alloc === 'human' && on} alloc="human" />
            <Cell active={r.alloc === 'hybrid' && on} alloc="hybrid" />
            <Cell active={r.alloc === 'agent' && on} alloc="agent" />
          </div>
        );
      })}
      <div className={s.heatLegend}>
        <span style={{ color: 'var(--coral)' }}>38% human</span>
        <span style={{ color: 'var(--amber)' }}>12% hybrid</span>
        <span style={{ color: 'var(--mint)' }}>50% agent-executable</span>
        <span className={s.heatLegendSpacer}>based on shape_02 · pipeline_and_conversion</span>
      </div>
    </div>
  );
}

function Cell({ active, alloc }: { active: boolean; alloc: HomeRow['alloc'] }) {
  const col = COLOR[alloc];
  return (
    <div
      className={s.heatCell}
      style={{
        background: active ? col : 'var(--surface-2)',
        borderColor: active ? col : 'var(--border-soft)',
        boxShadow: active ? `0 0 24px rgba(${RGBA[alloc]}, 0.33)` : 'none',
      }}
    />
  );
}
