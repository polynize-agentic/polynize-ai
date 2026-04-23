// Blueprint Page 3 — Agent team cards
const BlueprintTeam = ({answers, data}) => {
  const firstName = (answers.name || '').trim().split(/\s+/)[0] || 'You';
  const detail = window.AGENT_DETAIL || {};

  return (
    <section className="bp-page" data-screen-label="Page 03 · Team">
      <div className="bp-page-head">
        <div className="bp-page-num">02 / 04</div>
        <div className="bp-eyebrow">§ your agent team</div>
        <h2 className="bp-page-title">
          One human.<br/><span className="mint">{data.team.length}</span> agents. One outcome<span className="mint">.</span>
        </h2>
        <p className="bp-page-lede">
          This is the team we'd build to cover the mint and amber cells on your heat map.
          Human-sounding names because you'll be working with them like colleagues.
          Each one is shaped around a specific slice of your {data.shape.toLowerCase()} work.
        </p>
      </div>

      {/* The human lead panel */}
      <div className="bp-human-lead">
        <div className="bp-eyebrow">§ the human at the centre</div>
        <div className="bp-lead-row">
          <div className="bp-lead-av">
            <div className="bp-lead-initial">{firstName[0]}</div>
            <div className="bp-lead-halo"/>
          </div>
          <div>
            <div className="bp-lead-name">{firstName} <span style={{color:'var(--text-3)'}}>(you)</span></div>
            <div className="bp-lead-role">Human Lead · judgment, direction, close</div>
            <p className="bp-lead-desc">
              The unit is shaped around you. You hold the strategic decisions, the client-facing
              conversations, and the final call on anything that carries risk. The agents below
              take everything else off your plate and bring you the work that needs your judgment,
              pre-chewed.
            </p>
          </div>
        </div>
      </div>

      {/* Agent cards */}
      <div className="bp-agent-grid">
        {data.team.map((a, i) => {
          const d = detail[a.role] || { owns: [], what: "Executes a specific slice of your workflow autonomously, surfacing exceptions to you." };
          return (
            <div key={i} className="bp-agent-card">
              <div className="bp-agent-head">
                <div className="bp-agent-num">A{String(i+1).padStart(2,'0')}</div>
                <div className="bp-agent-av">{a.name[0]}</div>
              </div>
              <div className="bp-agent-name">{a.name}</div>
              <div className="bp-agent-role">{a.role}</div>
              <p className="bp-agent-what">{d.what}</p>

              {d.owns.length > 0 && (
                <div className="bp-agent-owns">
                  <div className="bp-eyebrow">§ owns</div>
                  <ul>
                    {d.owns.map((o, j) => <li key={j}>{o}</li>)}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

window.BlueprintTeam = BlueprintTeam;
