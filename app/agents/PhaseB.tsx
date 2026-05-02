'use client';

import { useEffect, useRef, useState } from 'react';
import type { Answers, CapabilityMapData } from '@/lib/types';
import { deriveCapabilityMapFallback } from '@/lib/agents/derive-capability-map-fallback';
import { completeBlueprintFlow } from '@/lib/persist-client';
import { track } from '@/lib/analytics';
import { ResetLink } from '@/app/_components/ResetLink';
import s from './phase-b.module.css';

const BOOKING_URL = 'https://calendly.com/marrscoiro/meeting30';

type Props = {
  answers: Partial<Answers>;
  /** Pre-loaded data (resume from localStorage) — skips LLM call + auto-create. */
  preloaded?: CapabilityMapData;
  /** Bubbles the data up to the controller for resume + persistence. */
  onDataReady: (data: CapabilityMapData) => void;
};

type Stage = 'loading' | 'intro' | 'reveal' | 'done';

const INTRO_MS = 1400;
const REVEAL_INTERVAL_MS = 220;
const DONE_DELAY_MS = 600;

export function PhaseB({ answers, preloaded, onDataReady }: Props) {
  const firstName = (answers.name ?? '').trim().split(/\s+/)[0] ?? '';
  const [data, setData] = useState<CapabilityMapData | null>(preloaded ?? null);
  const [stage, setStage] = useState<Stage>(preloaded ? 'done' : 'loading');
  const [revealIdx, setRevealIdx] = useState<number>(preloaded ? -2 : -1);
  const [blueprintId, setBlueprintId] = useState<string | null>(null);
  const [activeTip, setActiveTip] = useState<number | null>(null);
  const blueprintFiredRef = useRef(false);

  // 1. Fetch the capability map (skipped when preloaded).
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

  // 2. Auto-create the blueprint as soon as data is available.
  // Runs in parallel with the reveal animation so the CTAs are populated
  // by the time the user reaches the done state. Idempotent: the
  // /api/blueprints upsert + Scout dedupe handle re-fires safely.
  useEffect(() => {
    if (!data || blueprintFiredRef.current) return;
    blueprintFiredRef.current = true;
    onDataReady(data);

    // Skip the auto-create when data was preloaded (means the blueprint
    // was already created on an earlier visit). The visitor can still
    // share via the mailto, we just rebuild the URL from cached state.
    if (preloaded) {
      // We don't have the blueprint id in preloaded state; re-hit the
      // create endpoint to get it (cheap upsert, no Scout re-fire thanks
      // to server-side dedupe).
      void completeBlueprintFlow(data).then((res) => {
        if ('id' in res) setBlueprintId(res.id);
      });
      return;
    }

    void (async () => {
      const result = await completeBlueprintFlow(data);
      if ('id' in result) {
        track('blueprint_created', { id: result.id, shape_id: data.shape_internal });
        setBlueprintId(result.id);
      } else {
        console.warn('[phase-b] blueprint creation failed:', result.error);
      }
    })();
  }, [data, preloaded, onDataReady]);

  // 3. intro → reveal
  useEffect(() => {
    if (stage !== 'intro') return;
    const t = setTimeout(() => setStage('reveal'), INTRO_MS);
    return () => clearTimeout(t);
  }, [stage]);

  // 4. Reveal one capability at a time, then → done
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

  // Capability rows that have been revealed get the lit cell + tooltip behaviour.
  // When we're in 'done' (or preloaded), reveal everything.
  const allRevealed = stage === 'done' || preloaded;

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
            const on = allRevealed || i <= revealIdx;
            const tipOpen = activeTip === i;
            return (
              <div
                key={i}
                className={`${s.row} ${on ? s.rowLit : ''} ${tipOpen ? s.rowActive : ''}`}
                style={{ transitionDelay: `${i * 40}ms` }}
                role="row"
                aria-label={`${cap.label}: allocated to ${cap.allocation}`}
                onMouseEnter={on ? () => setActiveTip(i) : undefined}
                onMouseLeave={on ? () => setActiveTip(null) : undefined}
                onClick={on ? () => setActiveTip((cur) => (cur === i ? null : i)) : undefined}
              >
                <div className={s.fn}>
                  <div>{cap.label}</div>
                  <div className={s.fnDetail}>{cap.detail}</div>
                </div>
                {(['human', 'hybrid', 'agent'] as const).map((c) => {
                  const active = cap.allocation === c && on;
                  const toneClass =
                    c === 'human' ? s.cellHuman : c === 'hybrid' ? s.cellHybrid : s.cellAgent;
                  return (
                    <div
                      key={c}
                      className={`${s.cell} ${active ? toneClass : ''}`}
                      role="cell"
                      aria-hidden="true"
                    />
                  );
                })}
                {tipOpen && (
                  <CapabilityTooltip
                    label={cap.label}
                    allocation={cap.allocation}
                    detail={cap.detail}
                  />
                )}
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

              <div className={s.teamHumanRow}>
                <article className={`${s.dossierCard} ${s.dossierCardHuman}`}>
                  <div className={`${s.dossierAvatar} ${s.dossierAvatarHuman}`}>
                    <HumanIcon className={s.dossierIcon} />
                  </div>
                  <div className={s.dossierName}>{firstName || 'You'}</div>
                  <div className={s.dossierRole}>{data.team.human_owner.role}</div>
                </article>
              </div>

              <TeamBranchSvg agentCount={data.team.agents.length} />

              <div
                className={s.teamAgentRow}
                style={{ ['--agent-count' as string]: data.team.agents.length }}
              >
                {data.team.agents.map((a) => (
                  <article
                    key={`${a.name}-${a.role}`}
                    className={s.dossierCard}
                    aria-label={`${a.name}, ${a.role}`}
                  >
                    <div className={s.dossierAvatar}>
                      <BotIcon className={s.dossierIcon} />
                    </div>
                    <div className={s.dossierName}>{a.name}</div>
                    <div className={s.dossierRole}>{a.role}</div>
                    <p className={s.dossierDesc}>{a.short_desc}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className={s.pricingFootnote}>
              Indicative pricing: starting from <strong>$5,000 AUD</strong> +{' '}
              <strong>$399/mo per agent</strong>
            </div>

            <div className={s.ctas}>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${s.cta} ${s.ctaPrimary}`}
                onClick={() =>
                  track('booking_click', { surface: 'phase_b_cta' })
                }
              >
                Book a call with Marrs <span className={s.ctaArr}>→</span>
              </a>

              <ShareCta
                blueprintId={blueprintId}
                onClick={() =>
                  track('cta_click', {
                    surface: 'phase_b_cta',
                    label: 'send_this_to_someone',
                  })
                }
              />
            </div>

            <div className={s.startOverWrap}>
              <ResetLink
                className={s.startOverLink}
                eventProps={{ surface: 'phase_b_done', label: 'start_over' }}
              >
                + map another bottleneck
              </ResetLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

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

function CapabilityTooltip({
  label,
  allocation,
  detail,
}: {
  label: string;
  allocation: 'human' | 'hybrid' | 'agent';
  detail: string;
}) {
  const why =
    allocation === 'human'
      ? 'Human-critical: requires trust, judgment, or accountability that an agent cannot carry.'
      : allocation === 'hybrid'
        ? 'Hybrid: an agent does the groundwork, you review and steer the substance.'
        : 'Agent-executable: structured and repeatable enough for an agent to run end-to-end.';
  return (
    <div className={s.tooltip} role="tooltip">
      <div className={`${s.tooltipBadge} ${s[`tooltipBadge_${allocation}`]}`}>
        {allocation}
      </div>
      <div className={s.tooltipLabel}>{label}</div>
      <p className={s.tooltipDetail}>{detail}</p>
      <p className={s.tooltipWhy}>{why}</p>
    </div>
  );
}

function ShareCta({
  blueprintId,
  onClick,
}: {
  blueprintId: string | null;
  onClick: () => void;
}) {
  // Build the mailto on the fly. Falls back to /agents itself if the
  // blueprint hasn't been created yet (rare race — usually it's ready
  // by the time the user reaches the CTAs).
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick();
    if (!blueprintId) return; // let the disabled state stand; href is '#'
    const blueprintUrl = `${window.location.origin}/blueprints/${blueprintId}`;
    const subject = 'Check out this capability map I just created';
    const body = [
      'Hey,',
      '',
      'I just mapped a business bottleneck on polynize.ai and got back a really interesting capability map showing which parts of the work should stay human and which could be handled by agents.',
      '',
      `Take a look: ${blueprintUrl}`,
      '',
      'You can create your own at polynize.ai/agents',
      '',
      'Worth a look.',
    ].join('\n');
    e.preventDefault();
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const ready = Boolean(blueprintId);
  return (
    <div className={s.ctaShareWrap}>
      <p className={s.ctaShareLede}>
        Your capability map has been sent to your email. Want to share it with someone else?
      </p>
      <a
        href={ready ? '#' : '#'}
        className={`${s.cta} ${s.ctaSecondary} ${ready ? '' : s.ctaDisabled}`}
        onClick={handleClick}
        aria-disabled={!ready}
      >
        Send this to someone
      </a>
    </div>
  );
}

/* ---------- Icons ---------- */

function HumanIcon({ className }: { className?: string }) {
  // Solid filled person silhouette: head + shoulders.
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" />
      <path d="M3.5 21.25c0-4.4 3.8-7.75 8.5-7.75s8.5 3.35 8.5 7.75a.75.75 0 01-.75.75H4.25a.75.75 0 01-.75-.75z" />
    </svg>
  );
}

function BotIcon({ className }: { className?: string }) {
  // Solid filled bot: rounded head with antenna, eyes, mouth bar.
  // Eyes/mouth are punched out via even-odd fill so the icon reads on
  // any background.
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      aria-hidden="true"
    >
      {/* Antenna */}
      <path d="M12 2.5a.75.75 0 01.75.75V5h-1.5V3.25A.75.75 0 0112 2.5zM12 4.75a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
      {/* Head with cut-out eyes + mouth */}
      <path d="M5.5 8.5A2.5 2.5 0 018 6h8a2.5 2.5 0 012.5 2.5v8.75A2.75 2.75 0 0115.75 20h-7.5A2.75 2.75 0 015.5 17.25V8.5zM9 11a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-6 5.25a.75.75 0 010-1.5h6a.75.75 0 010 1.5H9z" />
      {/* Side ears */}
      <path d="M3.75 11.5a.75.75 0 01.75-.75H5v4H4.5a.75.75 0 01-.75-.75v-2.5zM19 10.75h.5a.75.75 0 01.75.75v2.5a.75.75 0 01-.75.75H19v-4z" />
    </svg>
  );
}

function TeamBranchSvg({ agentCount }: { agentCount: number }) {
  const n = Math.max(1, Math.min(5, agentCount));
  const legXs = Array.from({ length: n }, (_, i) => ((i + 0.5) / n) * 100);
  const leftX = legXs[0];
  const rightX = legXs[legXs.length - 1];
  return (
    <svg
      className={s.teamBranchSvg}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line
        x1={50} y1={0} x2={50} y2={12}
        stroke="currentColor" strokeWidth={1.5}
        vectorEffect="non-scaling-stroke" strokeLinecap="round"
      />
      {n > 1 && (
        <line
          x1={leftX} y1={12} x2={rightX} y2={12}
          stroke="currentColor" strokeWidth={1.5}
          vectorEffect="non-scaling-stroke" strokeLinecap="round"
        />
      )}
      {legXs.map((x) => (
        <line
          key={x}
          x1={x} y1={12} x2={x} y2={100}
          stroke="currentColor" strokeWidth={1.5}
          vectorEffect="non-scaling-stroke" strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
