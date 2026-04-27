// Phase B — heat map reveal, linger, then pulse a "chat to your team" notification
const SHAPE_LIBRARY = {
  'Sales and pipeline': { shape: 'Pipeline and Conversion', rows: [
    { fn: 'Prospecting and qualification', alloc: 'agent'  },
    { fn: 'Meeting prep and intel briefs', alloc: 'agent'  },
    { fn: 'Live client conversations',     alloc: 'human'  },
    { fn: 'Proposal drafting',              alloc: 'hybrid' },
    { fn: 'Objection handling',             alloc: 'human'  },
    { fn: 'Follow-through and pipeline',    alloc: 'agent'  },
    { fn: 'Close and commitment',           alloc: 'human'  },
    { fn: 'Post-sale handoff',              alloc: 'agent'  },
  ], team: [
    { name:'Nora',  role:'Targeting & Qualification Specialist' },
    { name:'Arlo',  role:'Meeting Prep & Intelligence Analyst' },
    { name:'Sena',  role:'Proposal Specialist' },
    { name:'Jules', role:'Pipeline Coordinator' },
  ]},
  'Analysis and research': { shape: 'Analysis and Judgment', rows: [
    { fn: 'Source gathering and triage',    alloc: 'agent'  },
    { fn: 'Synthesis and pattern surfacing', alloc: 'hybrid' },
    { fn: 'Judgment and interpretation',    alloc: 'human'  },
    { fn: 'Recommendation framing',         alloc: 'human'  },
    { fn: 'Drafting briefs and memos',      alloc: 'hybrid' },
    { fn: 'Citation and fact-check',        alloc: 'agent'  },
    { fn: 'Distribution and tracking',      alloc: 'agent'  },
  ], team: [
    { name:'Iris',  role:'Research & Synthesis Analyst' },
    { name:'Theo',  role:'Briefing & Memo Writer' },
    { name:'Vera',  role:'Source & Citation Keeper' },
    { name:'Milo',  role:'Distribution Coordinator' },
  ]},
  'Building and delivery': { shape: 'Execution and Delivery', rows: [
    { fn: 'Scoping and planning',           alloc: 'human'  },
    { fn: 'Breakdown into work packets',    alloc: 'hybrid' },
    { fn: 'Routine build tasks',            alloc: 'agent'  },
    { fn: 'QA and review',                  alloc: 'hybrid' },
    { fn: 'Final sign-off',                 alloc: 'human'  },
    { fn: 'Progress tracking',              alloc: 'agent'  },
    { fn: 'Status updates and reporting',   alloc: 'agent'  },
  ], team: [
    { name:'Rex',  role:'Scope & Breakdown Analyst' },
    { name:'Finn', role:'Build Operator' },
    { name:'Cora', role:'QA & Review Specialist' },
    { name:'Dex',  role:'Progress & Status Coordinator' },
  ]},
  'Managing my own time and attention': { shape: 'Executive Leverage', rows: [
    { fn: 'Inbox triage',                   alloc: 'agent'  },
    { fn: 'Calendar shaping',               alloc: 'hybrid' },
    { fn: 'Priority decisions',             alloc: 'human'  },
    { fn: 'Meeting prep briefs',            alloc: 'agent'  },
    { fn: 'Follow-up tracking',             alloc: 'agent'  },
    { fn: 'Strategic reflection',           alloc: 'human'  },
    { fn: 'Written correspondence',         alloc: 'hybrid' },
  ], team: [
    { name:'Sol',  role:'Chief of Staff Agent' },
    { name:'Juno', role:'Inbox & Follow-up Keeper' },
    { name:'Pax',  role:'Meeting Brief Writer' },
    { name:'Lyra', role:'Correspondence Drafter' },
  ]},
  'Account and relationship management': { shape: 'Relationship Continuity', rows: [
    { fn: 'Account monitoring',             alloc: 'agent'  },
    { fn: 'Health signals and alerts',      alloc: 'agent'  },
    { fn: 'Relationship conversations',     alloc: 'human'  },
    { fn: 'Check-in and nudge cadence',     alloc: 'hybrid' },
    { fn: 'Renewal and expansion calls',    alloc: 'human'  },
    { fn: 'Note-taking and CRM updates',    alloc: 'agent'  },
    { fn: 'Escalation handling',            alloc: 'human'  },
  ], team: [
    { name:'Wren', role:'Client Health Monitor' },
    { name:'Kai',  role:'Cadence & Nudge Coordinator' },
    { name:'Opal', role:'CRM & Note Keeper' },
    { name:'Rue',  role:'Expansion Prep Analyst' },
  ]},
  'High-volume operations': { shape: 'High-Volume Operations', rows: [
    { fn: 'Inbound sorting and routing',    alloc: 'agent'  },
    { fn: 'Standard transactions',          alloc: 'agent'  },
    { fn: 'Exception handling',             alloc: 'hybrid' },
    { fn: 'Quality sampling',               alloc: 'hybrid' },
    { fn: 'Escalations and refunds',        alloc: 'human'  },
    { fn: 'SLA and volume reporting',       alloc: 'agent'  },
    { fn: 'Process improvement',            alloc: 'human'  },
  ], team: [
    { name:'Ori',  role:'Routing & Intake Operator' },
    { name:'Tess', role:'Transaction Processor' },
    { name:'Bodie',role:'Exception Handler' },
    { name:'Ness', role:'SLA & Reporting Agent' },
  ]},
  'Creative and content production': { shape: 'Creative Direction', rows: [
    { fn: 'Concept and direction',          alloc: 'human'  },
    { fn: 'Research and references',        alloc: 'agent'  },
    { fn: 'Drafting and iteration',         alloc: 'hybrid' },
    { fn: 'Editing and polish',             alloc: 'hybrid' },
    { fn: 'Final approval',                 alloc: 'human'  },
    { fn: 'Publishing and distribution',    alloc: 'agent'  },
    { fn: 'Asset management',               alloc: 'agent'  },
  ], team: [
    { name:'Echo', role:'Reference & Research Agent' },
    { name:'Onyx', role:'Draft & Iteration Specialist' },
    { name:'Vale', role:'Editor & Polisher' },
    { name:'Rhea', role:'Publishing Coordinator' },
  ]},
  'Team learning and development': { shape: 'Learning and Capability', rows: [
    { fn: 'Knowledge capture',              alloc: 'agent'  },
    { fn: 'Documentation upkeep',           alloc: 'agent'  },
    { fn: 'Skill gap analysis',             alloc: 'hybrid' },
    { fn: '1:1 coaching conversations',     alloc: 'human'  },
    { fn: 'Curriculum design',              alloc: 'human'  },
    { fn: 'Onboarding materials',           alloc: 'hybrid' },
    { fn: 'Learning tracking',              alloc: 'agent'  },
  ], team: [
    { name:'Astra',role:'Knowledge Capture Agent' },
    { name:'Cyrus',role:'Documentation Keeper' },
    { name:'Nova', role:'Skill Gap Analyst' },
    { name:'Pip',  role:'Onboarding Coordinator' },
  ]},
};

const deriveHeatMap = (answers) => {
  const primary = (answers.q4 && answers.q4[0]) || 'Sales and pipeline';
  const lib = SHAPE_LIBRARY[primary] || SHAPE_LIBRARY['Sales and pipeline'];
  const counts = { human:0, hybrid:0, agent:0 };
  lib.rows.forEach(r => counts[r.alloc]++);
  const total = lib.rows.length;
  return {
    shape: lib.shape,
    rows: lib.rows,
    team: lib.team,
    percentages: {
      human:  Math.round(counts.human/total*100),
      hybrid: Math.round(counts.hybrid/total*100),
      agent:  Math.round(counts.agent/total*100),
    }
  };
};

const PhaseB = ({answers, onReady}) => {
  const data = React.useMemo(() => deriveHeatMap(answers), [answers]);
  const firstName = (answers.name || '').trim().split(/\s+/)[0];
  const [stage, setStage] = React.useState('intro'); // intro → reveal → done → nudge
  const [revealIdx, setRevealIdx] = React.useState(-1);
  const [showNudge, setShowNudge] = React.useState(false);

  React.useEffect(() => {
    const t1 = setTimeout(() => setStage('reveal'), 1400);
    return () => clearTimeout(t1);
  }, []);

  React.useEffect(() => {
    if (stage !== 'reveal') return;
    let i = 0;
    const iv = setInterval(() => {
      setRevealIdx(i);
      i++;
      if (i > data.rows.length) {
        clearInterval(iv);
        setTimeout(() => setStage('done'), 500);
      }
    }, 220);
    return () => clearInterval(iv);
  }, [stage]);

  // Linger on heat map, THEN pulse the notification
  React.useEffect(() => {
    if (stage !== 'done') return;
    const t = setTimeout(() => setShowNudge(true), 3800);
    return () => clearTimeout(t);
  }, [stage]);

  const enterChat = () => onReady(data);

  return (
    <div className="phaseB">
      <style>{phaseBStyles}</style>

      {stage === 'intro' && (
        <div className="pb-intro">
          <div className="pb-tag">generating heat_map</div>
          <div className="pb-scan">
            <div className="pb-line"/><div className="pb-line d2"/><div className="pb-line d3"/>
          </div>
          <div className="pb-stat">shape detected<span className="pb-stat-v">{data.shape}</span></div>
        </div>
      )}

      {stage !== 'intro' && (
        <div className="pb-main">
          <div className="pb-head">
            <div className="pb-eyebrow">§ heat_map / {data.shape.toLowerCase()}</div>
            <h1 className="pb-title">
              {firstName ? `${firstName}, here's your business,` : "Here's your business,"}<br/>colour-coded<span style={{color:'var(--mint)'}}>.</span>
            </h1>
          </div>

          <div className="pb-grid">
            <div className="pb-col-head">
              <div className="pb-col-head-fn">function</div>
              <div className="pb-col-head-c" style={{color:'var(--coral)'}}>HUMAN</div>
              <div className="pb-col-head-c" style={{color:'var(--amber)'}}>HYBRID</div>
              <div className="pb-col-head-c" style={{color:'var(--mint)'}}>AGENT</div>
            </div>
            {data.rows.map((r, i) => {
              const on = i <= revealIdx;
              return (
                <div key={i} className={'pb-row ' + (on ? 'lit' : '')} style={{transitionDelay: `${i*60}ms`}}>
                  <div className="pb-fn">{r.fn}</div>
                  {['human','hybrid','agent'].map(c => {
                    const active = r.alloc === c && on;
                    const col = c==='human'?'var(--coral)':c==='hybrid'?'var(--amber)':'var(--mint)';
                    return (
                      <div key={c} className={'pb-cell '+(active?'on':'')} style={{
                        background: active ? `linear-gradient(90deg, transparent, ${col}30, transparent)` : 'transparent',
                        borderColor: active ? col : 'var(--border-soft)',
                        boxShadow: active ? `0 0 32px ${col}66, inset 0 0 20px ${col}22` : 'none',
                      }}/>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {stage === 'done' && (
            <div className="pb-summary">
              <div className="pb-pct">
                <Pct label="Human-led"  v={data.percentages.human}  color="var(--coral)"/>
                <Pct label="Hybrid"     v={data.percentages.hybrid} color="var(--amber)"/>
                <Pct label="Agent-exec" v={data.percentages.agent}  color="var(--mint)"/>
              </div>
              <p className="pb-caption">
                Roughly <span style={{color:'var(--coral)'}}>{data.percentages.human}%</span> of your workload
                should stay human, <span style={{color:'var(--amber)'}}>{data.percentages.hybrid}%</span> belongs
                inside a Cognitive Work Unit, and <span style={{color:'var(--mint)'}}>{data.percentages.agent}%</span> should
                not be consuming your team's time at all.
              </p>
              <div className="pb-caption-sub">
                Sit with this for a moment. We've drafted a team of <strong style={{color:'var(--text)'}}>{data.team.length} agents</strong> ready to pick up the mint and amber cells.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating chat-nudge notification */}
      {showNudge && (
        <button className="pb-nudge" onClick={enterChat}>
          <span className="pb-nudge-dot"/>
          <span className="pb-nudge-av">{data.team[0].name[0]}</span>
          <div className="pb-nudge-body">
            <div className="pb-nudge-from">{data.team[0].name} · {data.team[0].role.split(' ')[0]}</div>
            <div className="pb-nudge-msg">{firstName ? `${firstName}, your team is ready, chat with us →` : 'Your team is ready, chat with us →'}</div>
          </div>
          <span className="pb-nudge-ring"/>
        </button>
      )}
    </div>
  );
};

const Pct = ({label, v, color}) => {
  const [w, setW] = React.useState(0);
  React.useEffect(() => { const t = setTimeout(()=>setW(v), 200); return ()=>clearTimeout(t); }, [v]);
  return (
    <div className="pb-pct-item">
      <div className="pb-pct-top"><span>{label}</span><span style={{color, fontFamily:'monospace'}}>{v}%</span></div>
      <div className="pb-pct-bar"><div style={{width:`${w}%`, background:color, boxShadow:`0 0 12px ${color}`}}/></div>
    </div>
  );
};

const phaseBStyles = `
  .phaseB { min-height: 100vh; background: var(--bg); color: var(--text); padding: 88px 48px 180px; font-family: 'Inter', sans-serif; position: relative; }
  .pb-intro { min-height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 40px; }
  .pb-tag { font-family: 'JetBrains Mono', monospace; font-size: 14px; letter-spacing: .2em; color: var(--mint); text-transform: uppercase; }
  .pb-scan { width: 320px; height: 4px; background: var(--surface-2); position: relative; overflow: hidden; border-radius: 4px; }
  .pb-line { position: absolute; top: 0; height: 100%; width: 60%; background: linear-gradient(90deg, transparent, var(--mint), transparent); animation: scan 1.2s infinite; }
  .pb-line.d2 { animation-delay: .3s; opacity: .6; }
  .pb-line.d3 { animation-delay: .6s; opacity: .3; }
  @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(220%); } }
  .pb-stat { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--text-3); display: flex; gap: 14px; align-items: center; }
  .pb-stat-v { color: var(--mint); }
  .pb-main { max-width: 1200px; margin: 0 auto; }
  .pb-head { margin-bottom: 56px; }
  .pb-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: .2em; color: var(--text-3); text-transform: uppercase; margin-bottom: 20px; }
  .pb-title { font-family: 'Space Grotesk', sans-serif; font-size: clamp(40px, 6vw, 72px); font-weight: 700; letter-spacing: -0.035em; line-height: 1; margin: 0; }
  .pb-grid { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 28px; }
  .pb-col-head { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--border-soft); margin-bottom: 12px; }
  .pb-col-head-fn { color: var(--text-3); font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: .2em; text-transform: uppercase; }
  .pb-col-head-c { font-size: 10px; font-family: 'JetBrains Mono', monospace; letter-spacing: .2em; text-align: center; }
  .pb-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 12px; padding: 12px 0; align-items: center; opacity: 0; transform: translateY(8px); transition: all .5s; }
  .pb-row.lit { opacity: 1; transform: none; }
  .pb-fn { font-size: 14px; color: var(--text); }
  .pb-cell { height: 32px; border: 1px solid; border-radius: 2px; transition: all .4s; margin: 0 6px; }
  .pb-summary { margin-top: 56px; animation: fadeIn .8s both; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  .pb-pct { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
  .pb-pct-top { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: var(--text-2); }
  .pb-pct-bar { height: 4px; background: var(--surface-2); border-radius: 4px; overflow: hidden; }
  .pb-pct-bar > div { height: 100%; transition: width 1s ease; }
  .pb-caption { font-size: 18px; line-height: 1.6; color: var(--text-2); max-width: 820px; margin: 0 0 18px; }
  .pb-caption-sub { font-size: 15px; line-height: 1.6; color: var(--text-3); max-width: 820px; }

  /* Floating chat nudge */
  .pb-nudge {
    position: fixed; bottom: 32px; right: 32px; z-index: 200;
    display: flex; align-items: center; gap: 12px;
    background: var(--surface); color: var(--text);
    border: 1px solid var(--mint);
    padding: 14px 22px 14px 14px; border-radius: 999px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 0 rgba(105,252,203,0.6);
    cursor: pointer; font-family: 'Inter', sans-serif;
    animation: nudgeIn .5s both, nudgePulse 2s 0.6s infinite;
    text-align: left;
  }
  .pb-nudge:hover { transform: translateY(-2px); box-shadow: 0 28px 80px rgba(0,0,0,0.7), 0 0 24px rgba(105,252,203,0.4); }
  .pb-nudge-av { width: 36px; height: 36px; border-radius: 50%; background: var(--mint); color: var(--bg); display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 15px; }
  .pb-nudge-body { display: flex; flex-direction: column; gap: 2px; }
  .pb-nudge-from { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--mint); letter-spacing: .12em; text-transform: uppercase; }
  .pb-nudge-msg { font-size: 14px; color: var(--text); font-weight: 500; }
  .pb-nudge-dot { position: absolute; top: 10px; left: 10px; width: 10px; height: 10px; border-radius: 50%; background: var(--coral); box-shadow: 0 0 10px var(--coral); animation: dotBlink 1.2s infinite; }
  @keyframes nudgeIn { from { opacity: 0; transform: translateY(30px) scale(0.9); } to { opacity: 1; transform: none; } }
  @keyframes nudgePulse {
    0% { box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 0 rgba(105,252,203,0.55); }
    70% { box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 22px rgba(105,252,203,0); }
    100% { box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 0 rgba(105,252,203,0); }
  }
  @keyframes dotBlink { 0%, 60% { opacity: 1; } 80% { opacity: 0.3; } 100% { opacity: 1; } }

  @media (max-width: 640px) {
    .phaseB { padding: 32px 20px 160px; }
    .pb-col-head, .pb-row { grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 6px; }
    .pb-fn { font-size: 12px; }
    .pb-cell { height: 24px; margin: 0 2px; }
    .pb-nudge { right: 16px; bottom: 16px; left: 16px; justify-content: flex-start; }
  }
`;

window.PhaseB = PhaseB;
window.deriveHeatMap = deriveHeatMap;
