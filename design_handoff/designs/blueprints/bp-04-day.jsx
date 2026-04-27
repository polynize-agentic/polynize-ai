// Blueprint Page 4 — Day in the life, timeline with chat bubbles
const BlueprintDay = ({answers, data}) => {
  const firstName = (answers.name || '').trim().split(/\s+/)[0] || 'you';
  const company = (answers.q1_company || '').trim() || 'your business';
  const outcome = answers.q3 || 'delivering the next outcome';
  const agents = data.team;
  const a = (i) => agents[i % agents.length];

  // Timeline is scripted from the pipeline shape as the default demo
  const timeline = [
    {
      time: '08:00',
      label: 'before you open your laptop',
      items: [
        { from: 'agent', agent: a(0), text: `Morning ${firstName}. Today's ranked pipeline is in your inbox. 4 accounts are worth a call this week, 1 is likely to slip without a nudge. Top of the list: Merrick Holdings.` },
        { from: 'agent', agent: a(1), text: `Your 10:30 with Merrick has a briefing doc ready. Two-page summary, three questions I'd expect, and the answer I'd lead with.` },
      ],
    },
    {
      time: '10:30',
      label: 'you walk into the call prepared',
      items: [
        { from: 'human', text: 'Merrick call ran 12 minutes over. They want to see pricing by Friday.' },
        { from: 'agent', agent: a(2), text: `On it. Draft proposal in your review folder by 2pm today. I've used the structure you approved for the Westfield deal and adjusted for their scope. Tagging you on one price call I'm not sure about.` },
      ],
    },
    {
      time: '13:00',
      label: 'lunch, actually',
      items: [
        { from: 'agent', agent: a(3), text: `While you were eating: Tollworth hasn't replied in 11 days. Drafted a warm nudge in your voice. Waiting for your yes before it goes out.` },
      ],
    },
    {
      time: '16:00',
      label: 'end of day',
      items: [
        { from: 'human', text: 'Review + sign-off sweep.' },
        { from: 'agent', agent: a(2), text: `Proposal ready for your eyes. One flagged section.` },
        { from: 'agent', agent: a(3), text: `Pipeline clean. HubSpot matches reality. 3 nudges sent, 1 held for your review.` },
        { from: 'agent', agent: a(0), text: `Tomorrow's shortlist brewing. Nothing's on fire.` },
      ],
    },
  ];

  return (
    <section className="bp-page" data-screen-label="Page 04 · Day in the Life">
      <div className="bp-page-head">
        <div className="bp-page-num">03 / 04</div>
        <div className="bp-eyebrow">§ a day in the life</div>
        <h2 className="bp-page-title">
          What a Tuesday<br/>actually looks like<span className="mint">.</span>
        </h2>
        <p className="bp-page-lede">
          Based on what you told us about {company}, here's a lightly fictionalised walk-through of a
          typical day with the team in place. The point isn't the specifics. It's the rhythm.
          You show up, you make decisions, the execution happens around you.
        </p>
      </div>

      <div className="bp-timeline">
        {timeline.map((block, bi) => (
          <div key={bi} className="bp-tl-block">
            <div className="bp-tl-time">
              <div className="bp-tl-hour">{block.time}</div>
              <div className="bp-tl-label">{block.label}</div>
            </div>
            <div className="bp-tl-messages">
              {block.items.map((m, i) => (
                <div key={i} className={'bp-tl-msg ' + (m.from === 'human' ? 'user' : 'agent')}>
                  {m.from === 'agent' ? (
                    <>
                      <div className="bp-tl-av" title={m.agent.name}>{m.agent.name[0]}</div>
                      <div className="bp-tl-bubble">
                        <div className="bp-tl-from">{m.agent.name} · {m.agent.role.split(/[&,]/)[0].trim()}</div>
                        <div className="bp-tl-text">{m.text}</div>
                      </div>
                    </>
                  ) : (
                    <div className="bp-tl-bubble human">
                      <div className="bp-tl-from">{firstName} (you)</div>
                      <div className="bp-tl-text">{m.text}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bp-day-close">
        <div className="bp-eyebrow">§ the shift</div>
        <p>
          You weren't in every decision. But every decision that mattered came to you
          with the context already gathered, drafted, and caveated. That's the difference
          between a team of humans and a Cognitive Work Unit.
        </p>
      </div>
    </section>
  );
};

window.BlueprintDay = BlueprintDay;
