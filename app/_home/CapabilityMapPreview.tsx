'use client';

import { useEffect, useRef, useState } from 'react';
import s from './home.module.css';

type Allocation = 'human' | 'hybrid' | 'agent';

type Row = { fn: string; alloc: Allocation };

const ROWS: Row[] = [
  { fn: 'Initial deal sourcing & qualification', alloc: 'agent' },
  { fn: 'Market sizing & trend analysis', alloc: 'agent' },
  { fn: 'Comparable transaction research', alloc: 'agent' },
  { fn: 'Financial modelling first-pass', alloc: 'hybrid' },
  { fn: 'Competitive landscape mapping', alloc: 'agent' },
  { fn: 'Legal document review & flagging', alloc: 'hybrid' },
  { fn: 'Compliance & regulatory verification', alloc: 'agent' },
  { fn: 'Risk assessment & synthesis', alloc: 'hybrid' },
  { fn: 'Investment thesis & recommendation', alloc: 'human' },
  { fn: 'Final valuation & pricing decision', alloc: 'human' },
];

const PCT = { human: 20, hybrid: 30, agent: 50 } as const;

const META = {
  bottleneck: 'Investment research & due diligence',
  business: 'Boutique investment advisory, 8 people',
  outcome: 'Recommendations in days, partner time on judgment calls',
};

/**
 * Sample capability map shown on the homepage. Mirrors the BOTTLENECK
 * dataset from design_handoff/designs/Homepage_v2.html.
 *
 * Rows reveal one at a time after the section enters the viewport. Once all
 * rows are lit, owners and totals fade in.
 */
export function CapabilityMapPreview() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealCount, setRevealCount] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.disconnect();
          let i = 0;
          const iv = setInterval(() => {
            i++;
            setRevealCount(i);
            if (i >= ROWS.length) clearInterval(iv);
          }, 140);
          return;
        }
      },
      { threshold: 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={s.dcMap} ref={ref}>
      <div className={s.dcMapFrame}>
        <div className={s.dcMapStrip} />

        <div className={s.dcMapIdent}>
          <div className={s.dcMapIdentAv}>
            <img src="/assets/aj-milne.jpg" alt="AJ Milne" />
          </div>
          <div className={s.dcMapIdentText}>AJ&apos;s team capability map.</div>
        </div>

        <div className={s.dcMapMeta}>
          <div>
            <div className={s.dcMapMetaK}>Bottleneck</div>
            <div className={s.dcMapMetaV}>{META.bottleneck}</div>
          </div>
          <div>
            <div className={s.dcMapMetaK}>Business</div>
            <div className={s.dcMapMetaV}>{META.business}</div>
          </div>
          <div>
            <div className={s.dcMapMetaK}>Outcome</div>
            <div className={s.dcMapMetaV}>{META.outcome}</div>
          </div>
        </div>

        <div className={s.dcMapTable}>
          <div className={s.dcMapThead}>
            <div className={s.dcMapThFn}>Capability</div>
            <div className={s.dcMapTh}>
              <span className={`${s.dot} ${s.dotCoral}`} />
              Human
            </div>
            <div className={s.dcMapTh}>
              <span className={`${s.dot} ${s.dotAmber}`} />
              Hybrid
            </div>
            <div className={s.dcMapTh}>
              <span className={`${s.dot} ${s.dotMint}`} />
              Agent
            </div>
            <div className={s.dcMapThMeta}>Owner</div>
          </div>

          {ROWS.map((r, i) => {
            const on = i < revealCount;
            const owner =
              r.alloc === 'human'
                ? 'You'
                : r.alloc === 'hybrid'
                  ? 'You + agent'
                  : 'Agent team';
            return (
              <div key={i} className={`${s.dcMapTr} ${on ? s.dcMapTrOn : ''}`} role="row">
                <div className={s.dcMapFn}>
                  <span className={s.dcMapRownum}>{String(i + 1).padStart(2, '0')}</span>
                  {r.fn}
                </div>
                <Cell active={r.alloc === 'human' && on} tone="coral" />
                <Cell active={r.alloc === 'hybrid' && on} tone="amber" />
                <Cell active={r.alloc === 'agent' && on} tone="mint" />
                <div className={`${s.dcMapOwner} ${on ? s.dcMapOwnerOn : ''}`}>{owner}</div>
              </div>
            );
          })}
        </div>

        <div className={s.dcMapFoot}>
          <div className={s.dcMapTotals}>
            <Total tone="coral" pct={PCT.human} label="stays human" />
            <Total tone="amber" pct={PCT.hybrid} label="hybrid" />
            <Total tone="mint" pct={PCT.agent} label="agent-executable" />
          </div>
          <div className={s.dcMapFootNote}>
            Sample map for a premium auction house. Yours will look different.
          </div>
        </div>
      </div>
    </div>
  );
}

function Cell({ active, tone }: { active: boolean; tone: 'coral' | 'amber' | 'mint' }) {
  const toneClass = tone === 'coral' ? s.dcCoral : tone === 'amber' ? s.dcAmber : s.dcMint;
  return (
    <div className={`${s.dcMapCell} ${active ? `${s.dcMapCellOn} ${toneClass}` : ''}`}>
      {active && <div className={s.dcMapCellInner} />}
    </div>
  );
}

function Total({
  tone,
  pct,
  label,
}: {
  tone: 'coral' | 'amber' | 'mint';
  pct: number;
  label: string;
}) {
  const toneClass =
    tone === 'coral' ? s.dcTotalCoral : tone === 'amber' ? s.dcTotalAmber : s.dcTotalMint;
  return (
    <div className={`${s.dcTotal} ${toneClass}`}>
      <div className={s.dcTotalNum}>
        {pct}
        <span>%</span>
      </div>
      <div className={s.dcTotalLabel}>{label}</div>
    </div>
  );
}
