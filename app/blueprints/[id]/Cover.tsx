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

  // Take the first 6 capabilities for the cover preview.
  const previewRows = data.capabilities.slice(0, 6);

  return (
    <section className={s.cover} data-screen-label="Page 01 · Cover">
      <div className={s.coverMeta}>
        <Meta k="document" v="capability_map" />
        <Meta k="prepared_for" v={`${firstName}${company ? ` at ${company}` : ''}`} />
        <Meta k="agents" v={`${data.team.agents.length} agents`} />
        <Meta k="leverage" v={data.leverage_estimate} />
        <Meta k="issued" v={issuedLabel} />
        <Meta k="ref" v={`BP-${docRef}`} />
      </div>

      <h1 className={s.coverTitle}>
        Your <span className={s.mint}>capability</span>
        <br />
        map<span className={s.mint}>.</span>
      </h1>

      <p className={s.coverLede}>
        {company ? `${company} hit a bottleneck.` : 'You hit a bottleneck.'} The pages below are
        how we&apos;d map it, who picks up which capability, and what it costs to build
        compared to hiring. Read it like a draft. We&apos;ll sharpen it together.
      </p>

      <div className={s.coverMap}>
        <div className={s.eyebrow}>§ capability_map / preview</div>
        <div className={s.minimap}>
          {previewRows.map((r, i) => {
            const allocs: ('human' | 'hybrid' | 'agent')[] = ['human', 'hybrid', 'agent'];
            const colorFor = (a: 'human' | 'hybrid' | 'agent') =>
              a === 'human' ? 'var(--coral)' : a === 'hybrid' ? 'var(--amber)' : 'var(--mint)';
            const activeColor = colorFor(r.allocation);
            return (
              <div key={i} className={s.minimapRow}>
                <div className={s.minimapFn}>{r.label}</div>
                <div className={s.minimapCells}>
                  {allocs.map((a) => {
                    const on = r.allocation === a;
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
