'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Answers, MultiTeamHeatMap, HeatMapTeam } from '@/lib/types';
import { deriveHeatMapFallback } from '@/lib/agents/derive-heatmap-fallback';
import s from './phase-b.module.css';

type Props = {
  answers: Partial<Answers>;
  /** Pre-loaded data (e.g. from localStorage). When set, Phase B skips the API call. */
  preloaded?: MultiTeamHeatMap;
  onReady: (data: MultiTeamHeatMap) => void;
};

type Stage = 'loading' | 'intro' | 'reveal' | 'done';

const INTRO_MS = 1400;
const REVEAL_INTERVAL_MS = 180;
const TEAM_GAP_MS = 600;
const DONE_DELAY_MS = 500;
const NUDGE_DELAY_MS = 3800;

const ALLOC_COLOR: Record<'human' | 'hybrid' | 'agent', string> = {
  human: 'var(--coral)',
  hybrid: 'var(--amber)',
  agent: 'var(--mint)',
};

export function PhaseB({ answers, preloaded, onReady }: Props) {
  const firstName = (answers.name ?? '').trim().split(/\s+/)[0] ?? '';
  const [data, setData] = useState<MultiTeamHeatMap | null>(preloaded ?? null);
  const [stage, setStage] = useState<Stage>(preloaded ? 'intro' : 'loading');
  const [activeTeam, setActiveTeam] = useState(0);
  const [revealIdx, setRevealIdx] = useState(-1);
  const [showNudge, setShowNudge] = useState(false);

  // Fetch the LLM-generated heat map once we don't already have data.
  // Note: the `data === null` guard handles StrictMode + Fast Refresh remounts —
  // a fresh mount with no data re-fires the fetch; an aborted fetch from a
  // cleanup just leaves data null and the next mount picks it up.
  useEffect(() => {
    if (data) return;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/heatmap/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
          signal: controller.signal,
        });
        const body = (await res.json()) as { ok: boolean; data?: MultiTeamHeatMap; error?: string };
        if (controller.signal.aborted) return;
        if (body.ok && body.data) {
          setData(body.data);
          setStage('intro');
        } else {
          setData(deriveHeatMapFallback(answers));
          setStage('intro');
        }
      } catch (e) {
        if (controller.signal.aborted) return;
        setData(deriveHeatMapFallback(answers));
        setStage('intro');
      }
    })();
    return () => controller.abort();
  }, [answers, data]);

  // intro → reveal (per-team)
  useEffect(() => {
    if (stage !== 'intro') return;
    const t = setTimeout(() => setStage('reveal'), INTRO_MS);
    return () => clearTimeout(t);
  }, [stage]);

  // Reveal one cell at a time within the active team. When the team finishes,
  // either move to the next team or transition to done.
  useEffect(() => {
    if (stage !== 'reveal' || !data) return;
    const team = data.teams[activeTeam];
    if (!team) return;
    setRevealIdx(-1);
    let i = 0;
    const iv = setInterval(() => {
      setRevealIdx(i);
      i++;
      if (i > team.functions.length) {
        clearInterval(iv);
        if (activeTeam < data.teams.length - 1) {
          setTimeout(() => setActiveTeam(activeTeam + 1), TEAM_GAP_MS);
        } else {
          setTimeout(() => setStage('done'), DONE_DELAY_MS);
        }
      }
    }, REVEAL_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [stage, data, activeTeam]);

  // Linger on the heat map, then pulse the chat nudge.
  useEffect(() => {
    if (stage !== 'done') return;
    const t = setTimeout(() => setShowNudge(true), NUDGE_DELAY_MS);
    return () => clearTimeout(t);
  }, [stage]);

  const firstAgent = useMemo(() => {
    if (!data) return null;
    return data.teams[0]?.agents[0] ?? null;
  }, [data]);

  if (stage === 'loading' || !data) {
    return (
      <div className={s.phaseB}>
        <div className={s.intro}>
          <div className={s.tag}>mapping your business</div>
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
          <div className={s.tag}>generating heat_map</div>
          <div className={s.scan}>
            <div className={s.scanLine} />
            <div className={`${s.scanLine} ${s.scanLineD2}`} />
            <div className={`${s.scanLine} ${s.scanLineD3}`} />
          </div>
          <div className={s.stat}>
            shape detected
            <span className={s.statValue}>{data.shape_primary}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.phaseB}>
      <div className={s.main}>
        <div className={s.head}>
          <div className={s.eyebrow}>§ heat_map / {data.teams.length} teams</div>
          <h1 className={s.title}>
            {firstName ? `${firstName}, here's your business,` : "Here's your business,"}
            <br />
            colour-coded<span className={s.titleAccent}>.</span>
          </h1>
        </div>

        <div className={s.teamStack}>
          {data.teams.map((team, ti) => {
            const isActive = stage === 'reveal' ? ti <= activeTeam : true;
            const isCurrent = stage === 'reveal' && ti === activeTeam;
            return (
              <TeamCard
                key={`${team.name}-${ti}`}
                team={team}
                visible={isActive}
                revealIdx={isCurrent ? revealIdx : team.functions.length}
                showPercentages={stage === 'done' || (stage === 'reveal' && ti < activeTeam)}
              />
            );
          })}
        </div>

        {stage === 'done' && (
          <div className={s.summary}>
            <div className={s.eyebrow}>§ across the business</div>
            <div className={s.pct}>
              <Pct label="Human-led" v={data.total.human} color="var(--coral)" />
              <Pct label="Hybrid" v={data.total.hybrid} color="var(--amber)" />
              <Pct label="Agent-exec" v={data.total.agent} color="var(--mint)" />
            </div>
            <p className={s.caption}>{data.business_summary}</p>
            <div className={s.captionSub}>
              Estimated leverage{' '}
              <span style={{ color: 'var(--mint)', fontFamily: 'var(--font-jetbrains-mono)' }}>
                {data.leverage_estimate}
              </span>
              . {data.leverage_rationale}
            </div>
          </div>
        )}
      </div>

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

function TeamCard({
  team,
  visible,
  revealIdx,
  showPercentages,
}: {
  team: HeatMapTeam;
  visible: boolean;
  revealIdx: number;
  showPercentages: boolean;
}) {
  return (
    <section
      className={`${s.team} ${visible ? s.teamOn : ''}`}
      aria-label={`${team.name} team heat map`}
    >
      <header className={s.teamHead}>
        <div>
          <div className={s.teamName}>{team.name}</div>
          <div className={s.teamShape}>{team.shape}</div>
        </div>
        <div className={s.teamAgents}>
          {team.agents.map((a) => (
            <span key={a.name} className={s.teamAgent} title={a.role}>
              {a.name}
            </span>
          ))}
        </div>
      </header>

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
        {team.functions.map((f, i) => {
          const on = i <= revealIdx;
          return (
            <div
              key={i}
              className={`${s.row} ${on ? s.rowLit : ''}`}
              style={{ transitionDelay: `${i * 40}ms` }}
              role="row"
              aria-label={`${f.label}: allocated to ${f.allocation}`}
            >
              <div className={s.fn}>{f.label}</div>
              {(['human', 'hybrid', 'agent'] as const).map((c) => {
                const active = f.allocation === c && on;
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

      {showPercentages && (
        <div className={s.teamPct} aria-label={`${team.name} percentages`}>
          <Pct label="Human" v={team.percentages.human} color="var(--coral)" compact />
          <Pct label="Hybrid" v={team.percentages.hybrid} color="var(--amber)" compact />
          <Pct label="Agent" v={team.percentages.agent} color="var(--mint)" compact />
        </div>
      )}
    </section>
  );
}

function Pct({
  label,
  v,
  color,
  compact,
}: {
  label: string;
  v: number;
  color: string;
  compact?: boolean;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(v), 200);
    return () => clearTimeout(t);
  }, [v]);
  return (
    <div>
      <div className={s.pctTop} style={compact ? { fontSize: 11 } : undefined}>
        <span>{label}</span>
        <span className={s.pctValue} style={{ color }}>
          {v}%
        </span>
      </div>
      <div className={s.pctBar} style={compact ? { height: 4 } : undefined}>
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
