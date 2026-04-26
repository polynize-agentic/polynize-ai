import type { BlueprintPayload } from '@/lib/blueprint/load';
import s from './blueprint.module.css';
import { ALLOC_COLOR, firstNameOf, rgba } from './util';

export function Heatmap({ payload }: { payload: BlueprintPayload }) {
  const { answers, data } = payload;
  const firstName = firstNameOf(answers.name);
  const p = data.percentages;
  const biggest = p.human >= p.agent ? 'human' : 'agent';

  const summary =
    biggest === 'human'
      ? `Your business is weighted towards judgment. About ${p.human}% of the work here should stay with you. The danger is the ${p.agent + p.hybrid}% of execution sitting inside your calendar when it shouldn't be.`
      : `Your business has a large executable surface. About ${p.agent}% of the work here can live entirely with agents, ${p.hybrid}% belongs in a Cognitive Work Unit alongside you, and only ${p.human}% genuinely needs your judgment every time.`;

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
      </div>

      <div className={s.twocol}>
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
          {data.rows.map((r, i) => (
            <div key={i} className={s.gridRow} role="row" aria-label={`${r.fn}: allocated to ${r.alloc}`}>
              <div className={s.gridFn}>{r.fn}</div>
              {(['human', 'hybrid', 'agent'] as const).map((c) => {
                const on = r.alloc === c;
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

        <aside className={s.side}>
          <div className={s.statBlock}>
            <Stat label="Human-led" v={p.human} color="var(--coral)" />
            <Stat label="Hybrid" v={p.hybrid} color="var(--amber)" />
            <Stat label="Agent-exec" v={p.agent} color="var(--mint)" />
          </div>

          <div className={s.read}>
            <div className={s.eyebrow}>§ how to read this</div>
            <p>{summary}</p>
            <p>
              {firstName}, the work you&apos;ve been doing that sits in{' '}
              <span className={s.amber}>hybrid</span> or <span className={s.mint}>agent</span> cells
              is the work we can systematically relieve you of, starting with a Map engagement. The{' '}
              <span className={s.coral}>human</span> rows stay with you, sharper and with better
              context.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Stat({ label, v, color }: { label: string; v: number; color: string }) {
  return (
    <div>
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
