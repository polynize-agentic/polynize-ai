'use client';

import { useEffect, useState } from 'react';
import type { Answers, CapabilityMapData } from '@/lib/types';
import { deriveCapabilityMapFallback } from '@/lib/agents/derive-capability-map-fallback';
import s from './phase-b.module.css';

type Props = {
  answers: Partial<Answers>;
  /** Pre-loaded data (e.g. from localStorage). When set, Phase B skips the API call. */
  preloaded?: CapabilityMapData;
  onReady: (data: CapabilityMapData) => void;
};

type Stage = 'loading' | 'intro' | 'reveal' | 'done';

const INTRO_MS = 1400;
const REVEAL_INTERVAL_MS = 220;
const DONE_DELAY_MS = 600;
const NUDGE_DELAY_MS = 3800;

const ALLOC_COLOR: Record<'human' | 'hybrid' | 'agent', string> = {
  human: 'var(--coral)',
  hybrid: 'var(--amber)',
  agent: 'var(--mint)',
};

export function PhaseB({ answers, preloaded, onReady }: Props) {
  const firstName = (answers.name ?? '').trim().split(/\s+/)[0] ?? '';
  const [data, setData] = useState<CapabilityMapData | null>(preloaded ?? null);
  const [stage, setStage] = useState<Stage>(preloaded ? 'intro' : 'loading');
  const [revealIdx, setRevealIdx] = useState(-1);
  const [showNudge, setShowNudge] = useState(false);

  // Fetch the capability map once.
  useEffect(() => {
    if (data) return;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/capability-map/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
          signal: controller.signal,
        });
        const body = (await res.json()) as { ok: boolean; data?: CapabilityMapData };
        if (controller.signal.aborted) return;
        if (body.ok && body.data) {
          setData(body.data);
          setStage('intro');
        } else {
          setData(deriveCapabilityMapFallback(answers));
          setStage('intro');
        }
      } catch {
        if (controller.signal.aborted) return;
        setData(deriveCapabilityMapFallback(answers));
        setStage('intro');
      }
    })();
    return () => controller.abort();
  }, [answers, data]);

  // intro → reveal
  useEffect(() => {
    if (stage !== 'intro') return;
    const t = setTimeout(() => setStage('reveal'), INTRO_MS);
    return () => clearTimeout(t);
  }, [stage]);

  // Reveal one capability at a time.
  useEffect(() => {
    if (stage !== 'reveal' || !data) return;
    setRevealIdx(-1);
    let i = 0;
    const iv = setInterval(() => {
      setRevealIdx(i);
      i++;
      if (i > data.capabilities.length) {
        clearInterval(iv);
        setTimeout(() => setStage('done'), DONE_DELAY_MS);
      }
    }, REVEAL_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [stage, data]);

  // Nudge after the done state.
  useEffect(() => {
    if (stage !== 'done') return;
    const t = setTimeout(() => setShowNudge(true), NUDGE_DELAY_MS);
    return () => clearTimeout(t);
  }, [stage]);

  const firstAgent = data?.team.agents[0] ?? null;

  if (stage === 'loading' || !data) {
    return (
      <div className={s.phaseB}>
        <div className={s.intro}>
          <div className={s.tag}>mapping your bottleneck</div>
          <div className={s.scan}>
            <div className={s.scanLine} />
            <div className={`${s.scanLine} ${s.scanLineD2}`} />
            <div className={`${s.scanLine} ${s.scanLineD3}`} />
          </div>
          <div className={s.stat}>this takes a few seconds</div>
        </div>
      </div>
    );
  }

  if (stage === 'intro') {
    return (
      <div className={s.phaseB}>
        <div className={s.intro}>
          <div className={s.tag}>capability_map / generated</div>
          <div className={s.scan}>
            <div className={s.scanLine} />
            <div className={`${s.scanLine} ${s.scanLineD2}`} />
            <div className={`${s.scanLine} ${s.scanLineD3}`} />
          </div>
          <div className={s.stat}>{data.capabilities.length} capabilities identified</div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.phaseB}>
      <div className={s.main}>
        <div className={s.head}>
          <div className={s.eyebrow}>§ capability_map</div>
          <h1 className={s.title}>
            {firstName ? `${firstName}, here's your bottleneck,` : "Here's your bottleneck,"}
            <br />
            mapped<span className={s.titleAccent}>.</span>
          </h1>
        </div>

        <div className={s.grid}>
          <div className={s.colHead}>
            <div className={s.colHeadFn}>capability</div>
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
          {data.capabilities.map((cap, i) => {
            const on = i <= revealIdx;
            return (
              <div
                key={i}
                className={`${s.row} ${on ? s.rowLit : ''}`}
                style={{ transitionDelay: `${i * 40}ms` }}
                role="row"
                aria-label={`${cap.label}: allocated to ${cap.allocation}`}
              >
                <div className={s.fn}>
                  <div>{cap.label}</div>
                  <div className={s.fnDetail}>{cap.detail}</div>
                </div>
                {(['human', 'hybrid', 'agent'] as const).map((c) => {
                  const active = cap.allocation === c && on;
                  const col = ALLOC_COLOR[c];
                  return (
                    <div
                      key={c}
                      className={s.cell}
                      role="cell"
                      aria-hidden="true"
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
            <p className={s.caption}>{data.interpretation}</p>

            <div className={s.leverageRow}>
              <div className={s.leverageBadge}>
                <div className={s.eyebrow}>§ estimated leverage</div>
                <div className={s.leverageValue}>{data.leverage_estimate}</div>
              </div>
              <p className={s.captionSub}>{data.leverage_rationale}</p>
            </div>

            <div className={s.teamPreview}>
              <div className={s.eyebrow}>§ the team that emerges</div>
              <div className={s.teamHuman}>
                <div className={s.humanNode} title={data.team.human_owner.role}>
                  <PersonIcon className={s.personIconHuman} />
                </div>
                <div className={s.humanLabel}>{firstName || 'You'}</div>
              </div>
              <div className={s.teamAgentRow}>
                {data.team.agents.map((a) => (
                  <div
                    key={a.name}
                    className={s.agentSquare}
                    title={`${a.name} · ${a.role}`}
                    aria-label={`${a.name}, ${a.role}`}
                  >
                    <PersonIcon className={s.personIconAgent} />
                  </div>
                ))}
              </div>
            </div>

            <div className={s.hiringCallout}>
              <div className={s.eyebrow}>§ vs hiring</div>
              <div className={s.hiringRow}>
                <div className={s.hiringHire}>
                  <div className={s.hiringFte}>~{data.hiring_comparison.equivalent_fte} FTE</div>
                  <div className={s.hiringCost}>
                    ${data.hiring_comparison.estimated_annual_cost} {data.hiring_comparison.currency}
                    /year
                  </div>
                  <div className={s.hiringNote}>{data.hiring_comparison.note}</div>
                </div>
                <div className={s.hiringDivider}>vs</div>
                <div className={s.hiringAgent}>
                  <div className={s.hiringFte}>This team</div>
                  <div className={s.hiringCost}>from $5,000 to build + $399/mo</div>
                  <div className={s.hiringNote}>
                    Build, train, deploy your team. Ongoing operation and tuning.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showNudge && firstAgent && (
        <button type="button" className={s.nudge} onClick={() => onReady(data)}>
          <span className={s.nudgeAv} aria-hidden>
            <img src="/assets/agents/nudge.png" alt="" />
          </span>
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

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

function rgbaFromVar(alloc: 'human' | 'hybrid' | 'agent', alpha: number): string {
  const rgb =
    alloc === 'human' ? '255, 122, 107' : alloc === 'hybrid' ? '240, 184, 107' : '105, 252, 203';
  return `rgba(${rgb}, ${alpha})`;
}
