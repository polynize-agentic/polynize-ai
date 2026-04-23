// Phase C — conversational chat panel, agent-aware, Claude-powered
//
// ========================================================================
// CC-TODO (edge states): This prototype does not design:
//   - LLM failure state (network error, rate limit, 500)
//   - Empty state when user has no messages yet (currently fine, but audit)
//   - "Agent is typing" / streaming indicator (prototype shows a dot loop)
//   - Long-conversation truncation / scroll behavior on mobile
//   - Unsaved-chat warning if user navigates away
// Also: replace window.claude.complete with server-side Anthropic SDK call
// (or Minimax per original brief §13). Key must not be in the browser.
// ========================================================================
const PhaseC = ({data, answers, onBack}) => {
  const firstName = (answers.name || '').trim().split(/\s+/)[0];
  const company = (answers.q1_company || '').trim();
  const greet = firstName ? `Hi ${firstName}, ` : 'Hi, ';
  const companyNote = company ? ` I know ${company} is focused on ${(answers.q3 || 'the outcome you mentioned').toLowerCase().replace(/\.$/,'')}.` : (answers.q3 ? ` I've read your notes on "${answers.q3}".` : '');

  const [messages, setMessages] = React.useState(() => ([
    { role: 'agent', agent: data.team[0], text: `${greet}I'm ${data.team[0].name}, your ${data.team[0].role}.${companyNote} Ask me anything, or pick a starter below.` }
  ]));
  const [input, setInput] = React.useState('');
  const [activeAgent, setActiveAgent] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef(null);

  const starters = [
    "Walk me through a typical day with this team",
    "What should I work on first thing tomorrow?",
    "How do you decide what's Agent vs Hybrid vs Human?",
    "Show me a sample deliverable from Week 1",
  ];

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const agent = data.team[activeAgent];
    const userMsg = { role: 'user', text };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);

    const system = `You are ${agent.name}, a specialist agent, ${agent.role}. You are part of a Cognitive Work Unit serving ${firstName || 'the client'}, a ${answers.q2_role || 'founder'} of a ${answers.q2_size || 'small'} team${company ? ' at ' + company : ''}. Their business: "${answers.q1}". Their primary outcome goal: "${answers.q3}". Success metric: "${answers.q8_metric || 'not specified'}". Tools in use: ${(answers.q6_tools || []).join(', ') || 'not specified'}. The team's shape is "${data.shape}". Address them by first name when natural. Keep responses warm, direct, 2-4 short paragraphs. No lists unless asked. Speak in first person as ${agent.name}.`;

    try {
      const response = await window.claude.complete({
        messages: [
          { role: 'user', content: `${system}\n\nUser says: ${text}` }
        ]
      });
      setMessages(m => [...m, { role: 'agent', agent, text: response }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'agent', agent, text: "I'm having trouble reaching my context. Try again in a moment?" }]);
    }
    setLoading(false);
  };

  return (
    <div className="phaseC">
      <style>{phaseCStyles}</style>

      <div className="pc-left">
        <div className="pc-mini-head">
          <button className="pc-back" onClick={onBack}>← heat_map</button>
          <div className="pc-mini-title">§ your team</div>
        </div>
        <div className="pc-team-list">
          {data.team.map((a, i) => (
            <button key={i} className={'pc-team-item ' + (i===activeAgent?'on':'')} onClick={()=>setActiveAgent(i)}>
              <div className="pc-avatar" style={{background: i===activeAgent ? 'var(--mint)':'var(--surface-2)', color: i===activeAgent ? 'var(--bg)' : 'var(--text-2)'}}>
                {a.name[0]}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div className="pc-team-name">{a.name}</div>
                <div className="pc-team-role">{a.role}</div>
              </div>
              {i === activeAgent && <span className="pc-dot" />}
            </button>
          ))}
        </div>
        <div className="pc-mini-stat">
          <div className="pc-eyebrow">shape</div>
          <div className="pc-mini-stat-v">{data.shape}</div>
        </div>
      </div>

      <div className="pc-right">
        <div className="pc-chat-head">
          <div>
            <div className="pc-eyebrow" style={{marginBottom:4}}>talking to</div>
            <div className="pc-chat-name">{data.team[activeAgent].name} <span style={{color:'var(--text-3)', fontWeight:400, fontSize:14}}>· {data.team[activeAgent].role}</span></div>
          </div>
          <div className="pc-live"><span className="pc-live-dot"/> online</div>
        </div>

        <div className="pc-msgs" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={'pc-msg ' + (m.role==='user'?'user':'agent')}>
              {m.role === 'agent' && (
                <div className="pc-avatar sm" style={{background:'var(--surface-2)', color:'var(--mint)'}}>
                  {m.agent.name[0]}
                </div>
              )}
              <div className="pc-bubble">
                {m.role === 'agent' && <div className="pc-bubble-name">{m.agent.name}</div>}
                <div className="pc-bubble-text">{m.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="pc-msg agent">
              <div className="pc-avatar sm" style={{background:'var(--surface-2)', color:'var(--mint)'}}>
                {data.team[activeAgent].name[0]}
              </div>
              <div className="pc-bubble">
                <div className="pc-bubble-name">{data.team[activeAgent].name}</div>
                <div className="pc-typing"><span/><span/><span/></div>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && !loading && (
          <div className="pc-starters">
            {starters.map((s,i)=>(
              <button key={i} className="pc-starter" onClick={()=>send(s)}>{s}</button>
            ))}
          </div>
        )}

        <form className="pc-composer" onSubmit={e => { e.preventDefault(); send(input); }}>
          <input
            className="pc-input"
            placeholder={`Message ${data.team[activeAgent].name}…`}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button className="pc-send" type="submit" disabled={!input.trim() || loading}>send →</button>
        </form>
      </div>
    </div>
  );
};

const phaseCStyles = `
  .phaseC { min-height: 100vh; background: var(--bg); color: var(--text); display: grid; grid-template-columns: 320px 1fr; font-family: 'Inter', sans-serif; padding-top: 64px; }
  @media (max-width: 860px) { .phaseC { grid-template-columns: 1fr; } .pc-left { border-right: none !important; border-bottom: 1px solid var(--border); } .pc-team-list { flex-direction: row !important; overflow-x: auto; } .pc-team-item { min-width: 240px; } }
  .pc-left { border-right: 1px solid var(--border); padding: 24px; display: flex; flex-direction: column; gap: 20px; }
  .pc-mini-head { display: flex; justify-content: space-between; align-items: center; }
  .pc-back { background: transparent; border: none; color: var(--text-3); font-family: 'JetBrains Mono', monospace; font-size: 12px; cursor: pointer; padding: 0; }
  .pc-back:hover { color: var(--mint); }
  .pc-mini-title { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: .2em; color: var(--text-3); text-transform: uppercase; }
  .pc-team-list { display: flex; flex-direction: column; gap: 6px; }
  .pc-team-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: transparent; border: 1px solid transparent; border-radius: 2px; cursor: pointer; text-align: left; color: var(--text); transition: all .15s; }
  .pc-team-item:hover { background: var(--surface); }
  .pc-team-item.on { background: var(--surface); border-color: var(--mint); }
  .pc-avatar { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 600; border-radius: 50%; flex-shrink: 0; font-size: 15px; }
  .pc-avatar.sm { width: 32px; height: 32px; font-size: 13px; }
  .pc-team-name { font-size: 14px; font-weight: 500; margin-bottom: 2px; }
  .pc-team-role { font-size: 11px; color: var(--text-3); font-family: 'JetBrains Mono', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pc-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mint); box-shadow: 0 0 8px var(--mint); }
  .pc-mini-stat { margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border-soft); }
  .pc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .2em; color: var(--text-3); text-transform: uppercase; margin-bottom: 8px; }
  .pc-mini-stat-v { font-size: 14px; color: var(--text-2); }
  .pc-right { display: flex; flex-direction: column; min-height: 100vh; }
  .pc-chat-head { padding: 24px 32px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .pc-chat-name { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
  .pc-live { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--mint); display: flex; align-items: center; gap: 6px; }
  .pc-live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mint); box-shadow: 0 0 8px var(--mint); animation: pulse 2s infinite; }
  @keyframes pulse { 50% { opacity: 0.4; } }
  .pc-msgs { flex: 1; padding: 32px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; max-height: calc(100vh - 220px); }
  .pc-msg { display: flex; gap: 12px; animation: slideUp .4s both; max-width: 780px; }
  @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .pc-msg.user { margin-left: auto; }
  .pc-msg.user .pc-bubble { background: var(--mint); color: var(--bg); }
  .pc-msg.user .pc-bubble-text { color: var(--bg); }
  .pc-bubble { padding: 14px 18px; background: var(--surface); border-radius: 8px; max-width: 560px; }
  .pc-bubble-name { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .15em; color: var(--mint); text-transform: uppercase; margin-bottom: 6px; }
  .pc-bubble-text { font-size: 15px; line-height: 1.6; color: var(--text); white-space: pre-wrap; }
  .pc-typing { display: flex; gap: 4px; padding: 6px 0; }
  .pc-typing span { width: 6px; height: 6px; background: var(--text-3); border-radius: 50%; animation: typing 1.2s infinite; }
  .pc-typing span:nth-child(2) { animation-delay: .2s; }
  .pc-typing span:nth-child(3) { animation-delay: .4s; }
  @keyframes typing { 0%, 60%, 100% { opacity: .3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-4px); } }
  .pc-starters { padding: 0 32px 16px; display: flex; flex-wrap: wrap; gap: 8px; }
  .pc-starter { padding: 10px 14px; background: transparent; border: 1px solid var(--border); color: var(--text-2); font-family: 'Inter', sans-serif; font-size: 13px; border-radius: 20px; cursor: pointer; transition: all .15s; }
  .pc-starter:hover { border-color: var(--mint); color: var(--text); background: rgba(105,252,203,0.05); }
  .pc-composer { padding: 20px 32px 32px; border-top: 1px solid var(--border); display: flex; gap: 12px; }
  .pc-input { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 2px; padding: 14px 18px; color: var(--text); font-family: 'Inter', sans-serif; font-size: 15px; outline: none; transition: border-color .15s; }
  .pc-input:focus { border-color: var(--mint); }
  .pc-send { padding: 14px 20px; background: var(--mint); color: var(--bg); border: none; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500; cursor: pointer; letter-spacing: .02em; }
  .pc-send:disabled { opacity: 0.3; cursor: not-allowed; }
`;

window.PhaseC = PhaseC;
