// Blueprint Page 2 — Full Heat Map + narrative + percentages
const BlueprintHeatMap = ({answers, data}) => {
  const firstName = (answers.name || '').trim().split(/\s+/)[0] || 'You';
  const p = data.percentages;
  const biggest = p.human >= p.agent ? 'human' : 'agent';

  const summary = biggest === 'human'
    ? `Your business is weighted towards judgment. About ${p.human}% of the work here should stay with you. The danger is the ${p.agent + p.hybrid}% of execution sitting inside your calendar when it shouldn't be.`
    : `Your business has a large executable surface. About ${p.agent}% of the work here can live entirely with agents, ${p.hybrid}% belongs in a Cognitive Work Unit alongside you, and only ${p.human}% genuinely needs your judgment every time.`;

  return (
    <section className="bp-page" data-screen-label="Page 02 · Heat Map">
      <div className="bp-page-head">
        <div className="bp-page-num">01 / 04</div>
        <div className="bp-eyebrow">§ your heat map</div>
        <h2 className="bp-page-title">
          Your business,<br/>colour-coded<span className="mint">.</span>
        </h2>
      </div>

      <div className="bp-twocol">
        <div className="bp-grid">
          <div className="bp-grid-head">
            <div className="bp-grid-h-fn">function</div>
            <div className="bp-grid-h" style={{color:'var(--coral)'}}>HUMAN</div>
            <div className="bp-grid-h" style={{color:'var(--amber)'}}>HYBRID</div>
            <div className="bp-grid-h" style={{color:'var(--mint)'}}>AGENT</div>
          </div>
          {data.rows.map((r, i) => (
            <div key={i} className="bp-grid-row">
              <div className="bp-grid-fn">{r.fn}</div>
              {['human','hybrid','agent'].map(c => {
                const col = c==='human'?'var(--coral)':c==='hybrid'?'var(--amber)':'var(--mint)';
                const on = r.alloc === c;
                return (
                  <div key={c} className="bp-grid-cell" style={{
                    background: on ? `linear-gradient(90deg, transparent, ${col}30, transparent)` : 'transparent',
                    borderColor: on ? col : 'var(--border-soft)',
                    boxShadow: on ? `0 0 24px ${col}55, inset 0 0 14px ${col}22` : 'none',
                  }}/>
                );
              })}
            </div>
          ))}
        </div>

        <aside className="bp-side">
          <div className="bp-stat-block">
            <Stat label="Human-led" v={p.human} color="var(--coral)"/>
            <Stat label="Hybrid"    v={p.hybrid} color="var(--amber)"/>
            <Stat label="Agent-exec" v={p.agent} color="var(--mint)"/>
          </div>

          <div className="bp-read">
            <div className="bp-eyebrow">§ how to read this</div>
            <p>{summary}</p>
            <p>
              {firstName}, the work you've been doing that sits in <span className="amber">hybrid</span> or <span className="mint">agent</span> cells
              is the work we can systematically relieve you of, starting with a Map engagement.
              The <span className="coral">human</span> rows stay with you, sharper and with better context.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
};

const Stat = ({label, v, color}) => (
  <div className="bp-stat">
    <div className="bp-stat-top"><span>{label}</span><span style={{color, fontFamily:'monospace'}}>{v}%</span></div>
    <div className="bp-stat-bar"><div style={{width:`${v}%`, background: color, boxShadow:`0 0 10px ${color}`}}/></div>
  </div>
);

window.BlueprintHeatMap = BlueprintHeatMap;
