import type { BlueprintPayload } from '@/lib/blueprint/load';
import s from './blueprint.module.css';
import { firstNameOf } from './util';

export function Cover({ payload }: { payload: BlueprintPayload }) {
  const { answers, data, issuedAt, docRef } = payload;
  const firstName = firstNameOf(answers.name);
  const company = (answers.company ?? '').trim();
  const issuedLabel = issuedAt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Build a compact preview that interleaves a couple of rows from each team.
  const previewRows = data.teams.flatMap((team) =>
    team.functions.slice(0, 2).map((fn) => ({ team: team.name, label: fn.label, alloc: fn.allocation }))
  );

  return (
    <section className={s.cover} data-screen-label="Page 01 · Cover">
      <div className={s.coverMeta}>
        <Meta k="document" v="agent_team_blueprint" />
        <Meta k="prepared_for" v={`${firstName}${company ? ` at ${company}` : ''}`} />
        <Meta k="shape" v={data.shape_primary} />
        <Meta k="teams" v={`${data.teams.length} teams`} />
        <Meta k="issued" v={issuedLabel} />
        <Meta k="ref" v={`BP-${docRef}`} />
      </div>

      <h1 className={s.coverTitle}>
        A blueprint
        <br />
        for <span className={s.mint}>{firstName}&apos;s</span>
        <br />
        next unit<span className={s.mint}>.</span>
      </h1>

      <p className={s.coverLede}>
        {company ? `${company} runs as` : 'You run as'} a <strong>{data.shape_primary}</strong> shape across {data.teams.length} teams.
        The page below is the first look at how we&apos;d organise the execution behind it,
        colour-coded, staffed, and priced. Read it like a draft. We&apos;ll sharpen it together.
      </p>

      <div className={s.coverMap}>
        <div className={s.eyebrow}>§ heat_map / preview</div>
        <div className={s.minimap}>
          {previewRows.map((r, i) => {
            const allocs: ('human' | 'hybrid' | 'agent')[] = ['human', 'hybrid', 'agent'];
            const colorFor = (a: 'human' | 'hybrid' | 'agent') =>
              a === 'human' ? 'var(--coral)' : a === 'hybrid' ? 'var(--amber)' : 'var(--mint)';
            const activeColor = colorFor(r.alloc);
            return (
              <div key={i} className={s.minimapRow}>
                <div className={s.minimapFn}>
                  <span style={{ color: 'var(--text-3)', marginRight: 6 }}>{r.team}</span>
                  {r.label}
                </div>
                <div className={s.minimapCells}>
                  {allocs.map((a) => {
                    const on = r.alloc === a;
                    return (
                      <span
                        key={a}
                        style={{
                          background: on ? activeColor : 'transparent',
                          borderColor: on ? activeColor : 'var(--border-soft)',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={s.scrollCue}>
        <span>keep scrolling</span>
        <div className={s.scrollLine} />
      </div>
    </section>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className={s.metaRow}>
      <span className={s.metaK}>{k}</span>
      <span className={s.metaV}>{v}</span>
    </div>
  );
}
