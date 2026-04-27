import type { BlueprintPayload } from '@/lib/blueprint/load';
import s from './blueprint.module.css';
import { ALLOC_COLOR, firstNameOf, rgba } from './util';

export function Heatmap({ payload }: { payload: BlueprintPayload }) {
  const { answers, data } = payload;
  const firstName = firstNameOf(answers.name);
  const total = data.total;

  return (
    <section className={s.page} data-screen-label="Page 02 · Heat Map">
      <div className={s.pageHead}>
        <div className={s.pageNum}>01 / 04</div>
        <div className={s.eyebrow}>§ your heat map</div>
        <h2 className={s.pageTitle}>
          Your business,
          <br />
          colour-coded<span className={s.mint}>.</span>
        </h2>
        <p className={s.pageLede}>{data.business_summary}</p>
      </div>

      <div className={s.summaryRow}>
        <Stat label="Human-led" v={total.human} color="var(--coral)" />
        <Stat label="Hybrid" v={total.hybrid} color="var(--amber)" />
        <Stat label="Agent-exec" v={total.agent} color="var(--mint)" />
        <div className={s.leverageBadge}>
          <div className={s.eyebrow}>§ leverage</div>
          <div className={s.leverageVal}>{data.leverage_estimate}</div>
        </div>
      </div>

      <div className={s.teamsStack}>
        {data.teams.map((team, ti) => (
          <div key={`${team.name}-${ti}`} className={s.teamBlock}>
            <header className={s.teamBlockHead}>
              <div>
                <div className={s.teamBlockName}>{team.name}</div>
                <div className={s.teamBlockShape}>{team.shape}</div>
              </div>
              <div className={s.teamBlockPct}>
                <span style={{ color: 'var(--coral)' }}>{team.percentages.human}%</span>
                <span style={{ color: 'var(--amber)' }}>{team.percentages.hybrid}%</span>
                <span style={{ color: 'var(--mint)' }}>{team.percentages.agent}%</span>
              </div>
            </header>

            <div className={s.grid}>
              <div className={s.gridHead}>
                <div className={s.gridHFn}>function</div>
                <div className={s.gridH} style={{ color: 'var(--coral)' }}>
                  HUMAN
                </div>
                <div className={s.gridH} style={{ color: 'var(--amber)' }}>
                  HYBRID
                </div>
                <div className={s.gridH} style={{ color: 'var(--mint)' }}>
                  AGENT
                </div>
              </div>
              {team.functions.map((f, i) => (
                <div
                  key={i}
                  className={s.gridRow}
                  role="row"
                  aria-label={`${f.label}: allocated to ${f.allocation}`}
                >
                  <div className={s.gridFn}>{f.label}</div>
                  {(['human', 'hybrid', 'agent'] as const).map((c) => {
                    const on = f.allocation === c;
                    const col = ALLOC_COLOR[c];
                    return (
                      <div
                        key={c}
                        className={s.gridCell}
                        role="cell"
                        aria-hidden="true"
                        style={{
                          background: on
                            ? `linear-gradient(90deg, transparent, ${rgba(c, 0.19)}, transparent)`
                            : 'transparent',
                          borderColor: on ? col : 'var(--border-soft)',
                          boxShadow: on
                            ? `0 0 24px ${rgba(c, 0.33)}, inset 0 0 14px ${rgba(c, 0.13)}`
                            : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={s.read}>
        <div className={s.eyebrow}>§ how to read this</div>
        <p>
          {firstName}, the work in <span className={s.amber}>hybrid</span> or{' '}
          <span className={s.mint}>agent</span> cells is the work we can systematically relieve you
          of, starting with a Map engagement. The <span className={s.coral}>human</span> rows stay
          with you, sharper and with better context.
        </p>
        <p>{data.leverage_rationale}</p>
      </div>
    </section>
  );
}

function Stat({ label, v, color }: { label: string; v: number; color: string }) {
  return (
    <div className={s.statBlockItem}>
      <div className={s.statTop}>
        <span>{label}</span>
        <span style={{ color, fontFamily: 'monospace' }}>{v}%</span>
      </div>
      <div className={s.statBar}>
        <div
          style={{
            width: `${v}%`,
            background: color,
            boxShadow: `0 1px 0 rgba(255,255,255,0.4) inset, 0 -1px 0 rgba(0,0,0,0.25) inset, 0 0 12px ${color}`,
          }}
        />
      </div>
    </div>
  );
}
