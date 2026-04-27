// Blueprint Page 5 — Map / Transform / Operate pricing
//
// ========================================================================
// TODO (Claude Code): PRICING LOGIC NEEDS REAL RULES
// ------------------------------------------------------------------------
// Current state: static placeholder prices (Map $2,500 / Transform $8-15k /
// Operate $699+). These were set by the designer as a credible starting
// point but have no business logic behind them.
//
// Action needed:
//   1. Ask Marrs for the real pricing logic:
//        - How does team size affect Transform pricing?
//        - Is there a volume / complexity multiplier?
//        - Does Operate scale with agent count, message volume, or flat?
//        - Are there discount rules (annual commit, bundle, pilot)?
//   2. Implement as a function: `computePricing(answers, data)` in
//      `lib/pricing.ts` — return `{ map, transform, operate }` objects
//      with `from`, `unit`, `scope[]`.
//   3. Replace the static `stages` array below with a call to that function.
//   4. Add a pricing_version column to the blueprints table so old
//      blueprints keep their original numbers if pricing changes.
// ========================================================================
const BlueprintPricing = ({answers, data}) => {
  const teamCount = data.team.length;
  const firstName = (answers.name || '').trim().split(/\s+/)[0] || 'you';

  const stages = [
    {
      stage: 'Map',
      from: 'from $2,500',
      unit: 'AUD, one-off',
      window: 'Week 1 to 2',
      what: "We set up the cognitive layer and ship your first agent live. You see the heat map become real. The cheapest way to de-risk the rest of the decision.",
      scope: [
        'One agent deployed end-to-end',
        'Cognitive layer installed in your tools',
        'Workshop with you on your heat map',
        'Decision checkpoint before Transform',
      ],
      accent: 'mint',
    },
    {
      stage: 'Transform',
      from: '$8,000 to $15,000',
      unit: 'AUD, depending on team size',
      window: 'Week 3 to 6',
      what: `The full ${teamCount}-agent team built, trained in your voice, plugged into your tools, and deployed behind the human lead. This is where your calendar starts clearing.`,
      scope: [
        `${teamCount} agents designed, built and trained`,
        'Integration with your existing toolchain',
        'Human-in-the-loop review flows',
        'Handoff: you, running the unit',
      ],
      accent: 'amber',
      featured: true,
    },
    {
      stage: 'Operate',
      from: 'from $699',
      unit: 'AUD / month, service fee',
      window: 'Ongoing',
      what: "We keep the team healthy. Prompts tuned, tools updated, connectors working, and a monthly check-in on how the unit is actually performing against your metric.",
      scope: [
        'Monthly monitoring and tuning',
        'Connector maintenance',
        'Quarterly agent review',
        'Direct line to your Polynize team',
      ],
      accent: 'mint',
    },
  ];

  return (
    <section className="bp-page" data-screen-label="Page 05 · Pricing">
      <div className="bp-page-head">
        <div className="bp-page-num">04 / 04</div>
        <div className="bp-eyebrow">§ how we'd build this</div>
        <h2 className="bp-page-title">
          Map, Transform,<br/>Operate<span className="mint">.</span>
        </h2>
        <p className="bp-page-lede">
          Three stages. Each one earns the next. These are indicative bands, {firstName}.
          The exact numbers for {answers.q1_company ? answers.q1_company : 'your team'} get
          locked in a 30-minute conversation.
        </p>
      </div>

      <div className="bp-price-grid">
        {stages.map((s, i) => {
          const col = s.accent === 'mint' ? 'var(--mint)' : 'var(--amber)';
          return (
            <div key={i} className={'bp-price-card ' + (s.featured ? 'featured' : '')} style={{'--card-accent': col}}>
              <div className="bp-price-stage">
                <span className="bp-price-num">0{i+1}</span>
                <span className="bp-price-title">{s.stage}</span>
              </div>
              <div className="bp-price-window">{s.window}</div>

              <div className="bp-price-price">
                <div className="bp-price-from">{s.from}</div>
                <div className="bp-price-unit">{s.unit}</div>
              </div>

              <p className="bp-price-what">{s.what}</p>

              <ul className="bp-price-scope">
                {s.scope.map((item, j) => <li key={j}><span className="bp-tick">✓</span>{item}</li>)}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="bp-fine">
        Bands, not quotes. All prices indicative and subject to scope lock-in on a call.
      </div>
    </section>
  );
};

window.BlueprintPricing = BlueprintPricing;
