// Blueprint Page 1 — Editorial cover with heat map preview
const BlueprintCover = ({answers, data}) => {
  const firstName = (answers.name || '').trim().split(/\s+/)[0] || 'You';
  const company = (answers.q1_company || '').trim();
  const today = new Date().toLocaleDateString('en-GB', {day:'numeric', month:'long', year:'numeric'});
  const docId = React.useMemo(() => Math.random().toString(36).slice(2,8).toUpperCase(), []);

  return (
    <section className="bp-cover" data-screen-label="Page 01 · Cover">
      <div className="bp-cover-meta">
        <div className="bp-meta-row">
          <span className="bp-meta-k">document</span>
          <span className="bp-meta-v">agent_team_blueprint</span>
        </div>
        <div className="bp-meta-row">
          <span className="bp-meta-k">prepared_for</span>
          <span className="bp-meta-v">{firstName}{company ? ` at ${company}` : ''}</span>
        </div>
        <div className="bp-meta-row">
          <span className="bp-meta-k">shape</span>
          <span className="bp-meta-v">{data.shape}</span>
        </div>
        <div className="bp-meta-row">
          <span className="bp-meta-k">issued</span>
          <span className="bp-meta-v">{today}</span>
        </div>
        <div className="bp-meta-row">
          <span className="bp-meta-k">ref</span>
          <span className="bp-meta-v">BP-{docId}</span>
        </div>
      </div>

      <h1 className="bp-cover-title">
        A blueprint<br/>
        for <span className="mint">{firstName}'s</span><br/>
        next team<span className="mint">.</span>
      </h1>

      <p className="bp-cover-lede">
        {company ? `${company} has` : "You have"} a <strong>{data.shape}</strong> shape.
        The page below is the first look at how we'd organise the execution behind it,
        colour-coded, staffed, and priced. Read it like a draft. We'll sharpen it together.
      </p>

      {/* mini heat map preview */}
      <div className="bp-cover-map">
        <div className="bp-eyebrow">§ heat_map / preview</div>
        <div className="bp-minimap">
          {data.rows.map((r,i) => {
            const col = r.alloc==='human'?'var(--coral)':r.alloc==='hybrid'?'var(--amber)':'var(--mint)';
            return (
              <div key={i} className="bp-minimap-row">
                <div className="bp-minimap-fn">{r.fn}</div>
                <div className="bp-minimap-cells">
                  <span style={{background: r.alloc==='human'?col:'transparent', borderColor: r.alloc==='human'?col:'var(--border-soft)'}}/>
                  <span style={{background: r.alloc==='hybrid'?col:'transparent', borderColor: r.alloc==='hybrid'?col:'var(--border-soft)'}}/>
                  <span style={{background: r.alloc==='agent'?col:'transparent', borderColor: r.alloc==='agent'?col:'var(--border-soft)'}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bp-scroll-cue">
        <span>keep scrolling</span>
        <div className="bp-scroll-line"/>
      </div>
    </section>
  );
};

window.BlueprintCover = BlueprintCover;
