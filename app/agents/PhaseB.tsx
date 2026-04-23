'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Answers, HeatMapData } from '@/lib/types';
import { deriveHeatMap } from '@/lib/agents/derive-heatmap';
import s from './phase-b.module.css';

type Props = {
  answers: Partial<Answers>;
  onReady: (data: HeatMapData) => void;
};

type Stage = 'intro' | 'reveal' | 'done';

const INTRO_MS = 1400;
const REVEAL_INTERVAL_MS = 220;
const DONE_DELAY_MS = 500;
const NUDGE_DELAY_MS = 3800;

const ALLOC_COLOR: Record<'human' | 'hybrid' | 'agent', string> = {
  human: 'var(--coral)',
  hybrid: 'var(--amber)',
  agent: 'var(--mint)',
};

export function PhaseB({ answers, onReady }: Props) {
  const data = useMemo(() => deriveHeatMap(answers), [answers]);
  const firstName = (answers.name ?? '').trim().split(/\s+/)[0] ?? '';
  const [stage, setStage] = useState<Stage>('intro');
  const [revealIdx, setRevealIdx] = useState(-1);
  const [showNudge, setShowNudge] = useState(false);

  // intro → reveal
  useEffect(() => {
    const t = setTimeout(() => setStage('reveal'), INTRO_MS);
    return () => clearTimeout(t);
  }, []);

  // reveal one cell at a time, then → done
  useEffect(() => {
    if (stage !== 'reveal') return;
    let i = 0;
    const iv = setInterval(() => {
      setRevealIdx(i);
      i++;
      if (i > data.rows.length) {
        clearInterval(iv);
        setTimeout(() => setStage('done'), DONE_DELAY_MS);
      }
    }, REVEAL_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [stage, data.rows.length]);

  // linger on the heat map, then pulse the chat nudge
  useEffect(() => {
    if (stage !== 'done') return;
    const t = setTimeout(() => setShowNudge(true), NUDGE_DELAY_MS);
    return () => clearTimeout(t);
  }, [stage]);

  const firstAgent = data.team.find((m) => m.type === 'agent');

  return (
    <div className={s.phaseB}>
      {stage === 'intro' && (
        <div className={s.intro}>
          <div className={s.tag}>generating heat_map</div>
          <div className={s.scan}>
            <div className={s.scanLine} />
            <div className={`${s.scanLine} ${s.scanLineD2}`} />
            <div className={`${s.scanLine} ${s.scanLineD3}`} />
          </div>
          <div className={s.stat}>
            shape detected
            <span className={s.statValue}>{data.shape_short_name}</span>
          </div>
        </div>
      )}

      {stage !== 'intro' && (
        <div className={s.main}>
          <div className={s.head}>
            <div className={s.eyebrow}>§ heat_map / {data.shape_short_name.toLowerCase()}</div>
            <h1 className={s.title}>
              {firstName ? `${firstName}, here's your business,` : "Here's your business,"}
              <br />
              colour-coded<span className={s.titleAccent}>.</span>
            </h1>
          </div>

          <div className={s.grid}>
            <div className={s.colHead}>
              <div className={s.colHeadFn}>function</div>
              <div className={s.colHeadC} style={{ color: 'var(--coral)' }}>
                HUMAN
              </div>
              <div className={s.colHeadC} style={{ color: 'var(--amber)' }}>
                HYBRID
              </div>
              <div className={s.colHeadC} style={{ color: 'var(--mint)' }}>
                AGENT
              </div>
            </div>
            {data.rows.map((r, i) => {
              const on = i <= revealIdx;
              return (
                <div
                  key={i}
                  className={`${s.row} ${on ? s.rowLit : ''}`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className={s.fn}>{r.fn}</div>
                  {(['human', 'hybrid', 'agent'] as const).map((c) => {
                    const active = r.alloc === c && on;
                    const col = ALLOC_COLOR[c];
                    return (
                      <div
                        key={c}
                        className={s.cell}
                        style={{
                          background: active
                            ? `linear-gradient(90deg, transparent, ${rgbaFromVar(c, 0.19)}, transparent)`
                            : 'transparent',
                          borderColor: active ? col : 'var(--border-soft)',
                          boxShadow: active
                            ? `0 0 32px ${rgbaFromVar(c, 0.4)}, inset 0 0 20px ${rgbaFromVar(c, 0.13)}`
                            : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {stage === 'done' && (
            <div className={s.summary}>
              <div className={s.pct}>
                <Pct label="Human-led" v={data.percentages.human} color="var(--coral)" />
                <Pct label="Hybrid" v={data.percentages.hybrid} color="var(--amber)" />
                <Pct label="Agent-exec" v={data.percentages.agent} color="var(--mint)" />
              </div>
              <p className={s.caption}>
                Roughly{' '}
                <span style={{ color: 'var(--coral)' }}>{data.percentages.human}%</span> of your
                workload should stay human,{' '}
                <span style={{ color: 'var(--amber)' }}>{data.percentages.hybrid}%</span> belongs
                inside a Cognitive Work Unit, and{' '}
                <span style={{ color: 'var(--mint)' }}>{data.percentages.agent}%</span> should not
                be consuming your team&apos;s time at all.
              </p>
              <div className={s.captionSub}>
                Sit with this for a moment. We&apos;ve drafted a team of{' '}
                <strong>
                  {data.team.filter((m) => m.type === 'agent').length} agents
                </strong>{' '}
                ready to pick up the mint and amber cells.
              </div>
            </div>
          )}
        </div>
      )}

      {showNudge && firstAgent && (
        <button type="button" className={s.nudge} onClick={() => onReady(data)}>
          <span className={s.nudgeDot} />
          <span className={s.nudgeAv}>{firstAgent.name[0]}</span>
          <div className={s.nudgeBody}>
            <div className={s.nudgeFrom}>
              {firstAgent.name} · {firstAgent.role.split(' ')[0]}
            </div>
            <div className={s.nudgeMsg}>
              {firstName
                ? `${firstName}, your team is ready, chat with us →`
                : 'Your team is ready, chat with us →'}
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

function Pct({ label, v, color }: { label: string; v: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(v), 200);
    return () => clearTimeout(t);
  }, [v]);
  return (
    <div>
      <div className={s.pctTop}>
        <span>{label}</span>
        <span className={s.pctValue} style={{ color }}>
          {v}%
        </span>
      </div>
      <div className={s.pctBar}>
        <div
          style={{
            width: `${w}%`,
            background: color,
            boxShadow: `0 1px 0 rgba(255,255,255,0.4) inset, 0 -1px 0 rgba(0,0,0,0.25) inset, 0 0 12px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

function rgbaFromVar(alloc: 'human' | 'hybrid' | 'agent', alpha: number): string {
  const rgb =
    alloc === 'human' ? '255, 122, 107' : alloc === 'hybrid' ? '240, 184, 107' : '105, 252, 203';
  return `rgba(${rgb}, ${alpha})`;
}
