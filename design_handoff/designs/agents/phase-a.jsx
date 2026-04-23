// Phase A — deeper question set that actually shapes team composition
const PhaseA = ({onComplete}) => {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState({
    name: '',
    q1: '', q1_company: '',
    q2_role: '', q2_size: '',
    q3: '',
    q4: [],
    q5_volume: '',
    q6_tools: [],
    q7_constraint: '',
    q8_metric: '',
    q9_urgency: '',
    q10_stance: '',
    email: '',
  });
  const [direction, setDirection] = React.useState(1);

  const firstName = answers.name.trim().split(/\s+/)[0];

  const questions = [
    { id: 'name', type: 'text',
      label: 'First, what should we call you?',
      placeholder: 'your first name',
      short: true,
      tag: 'Q00 · hello' },

    { id: 'q1', type: 'business',
      label: firstName ? `Nice to meet you, ${firstName}. What does your business do?` : 'What does your business do?',
      sub: 'One or two sentences, plus the name so we can brand your report.',
      tag: 'Q01 · context' },

    { id: 'q2', type: 'role_size',
      label: "What's your role, and how big is your team?",
      tag: 'Q02 · shape' },

    { id: 'q3', type: 'text',
      label: "What's the one outcome you most need your team to deliver better right now?",
      placeholder: 'e.g. more qualified pipeline without me being in every call',
      tag: 'Q03 · outcome' },

    { id: 'q4', type: 'multi',
      label: "Where's the bottleneck? Pick as many as apply.",
      sub: "We'll use your first pick as the shape of your Cognitive Work Unit.",
      options: ['Analysis and research','Sales and pipeline','Building and delivery','Managing my own time and attention','Account and relationship management','High-volume operations','Creative and content production','Team learning and development'],
      tag: 'Q04 · bottleneck' },

    { id: 'q5_volume', type: 'single',
      label: "What's the current volume in that bottleneck area?",
      sub: "Rough order of magnitude per week, helps us size the agent team.",
      options: ['Low, under 20 items / week','Medium, 20 to 100 / week','High, 100 to 500 / week','Very high, 500+ / week'],
      tag: 'Q05 · volume' },

    { id: 'q6_tools', type: 'multi',
      label: "Which tools does this work already live in?",
      sub: "Your agents will plug into these.",
      options: ['Gmail / Outlook','Slack','Notion','Linear / Jira','HubSpot','Salesforce','Airtable / sheets','Figma','GitHub','Google Docs','Calendar','Other / we\'ll tell you later'],
      tag: 'Q06 · surface area' },

    { id: 'q7_constraint', type: 'single',
      label: "What's currently preventing you from fixing this yourself?",
      options: ['I don\'t have the time','I don\'t have the team capacity','I don\'t have the right expertise','I\'ve tried and it didn\'t stick','I haven\'t seen a good enough approach yet'],
      tag: 'Q07 · constraint' },

    { id: 'q8_metric', type: 'text',
      label: "If this worked, what would change that you could measure?",
      placeholder: 'e.g. cut meeting prep time by 80%, 2× qualified demos, response time under 2h',
      tag: 'Q08 · success metric' },

    { id: 'q9_urgency', type: 'single',
      label: "When do you need this working?",
      options: ['This week','Within the month','This quarter','Exploring, no fixed timeline'],
      tag: 'Q09 · urgency' },

    { id: 'q10_stance', type: 'single',
      label: "How hands-on do you want to be?",
      options: ['Build and deploy it for me, I\'ll review','Partner with me, I want to shape it','I want to build it myself, point me in the right direction'],
      tag: 'Q10 · stance' },

    { id: 'email', type: 'email',
      label: firstName ? `${firstName}, where should we send your Heat Map?` : 'Where should we send your Heat Map?',
      sub: 'A full PDF report + your team blueprint, tailored to your answers. No spam, one email, yours to keep.',
      tag: 'Q11 · delivery' },
  ];

  const q = questions[step];
  const progress = ((step+1) / questions.length) * 100;

  const canAdvance = () => {
    if (q.id === 'name') return answers.name.trim().length >= 2;
    if (q.id === 'q1') return answers.q1.trim().length > 3;
    if (q.type === 'text') return answers[q.id].trim().length > 3;
    if (q.type === 'business') return answers.q1.trim().length > 3;
    if (q.type === 'role_size') return answers.q2_role && answers.q2_size;
    if (q.type === 'multi') return answers[q.id].length > 0;
    if (q.type === 'email') return /^\S+@\S+\.\S+$/.test(answers.email);
    return answers[q.id] !== '';
  };

  const next = () => {
    if (!canAdvance()) return;
    setDirection(1);
    if (step < questions.length - 1) setStep(step + 1);
    else onComplete(answers);
  };
  const prev = () => {
    if (step > 0) { setDirection(-1); setStep(step - 1); }
  };

  React.useEffect(() => {
    const h = (e) => {
      if (e.keyCode === 13 && !e.shiftKey && q.type !== 'text') { e.preventDefault(); next(); }
      if (e.keyCode === 13 && (e.metaKey || e.ctrlKey) && q.type === 'text') { e.preventDefault(); next(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  return (
    <div className="phaseA">
      <style>{phaseAStyles}</style>
      <div className="pa-progress">
        <div className="pa-progress-fill" style={{width: `${progress}%`}}/>
        <div className="pa-progress-label">{q.tag} · {step+1} / {questions.length}</div>
      </div>

      <div className="pa-stage">
        <div className="pa-card" key={step} style={{animation: direction===1?'slideInR .5s both':'slideInL .5s both'}}>
          <div className="pa-num">[{String(step+1).padStart(2,'0')}]</div>
          <h2 className="pa-q">{q.label}</h2>
          {q.sub && <p className="pa-sub">{q.sub}</p>}

          {q.type === 'text' && q.short && (
            <input
              className="pa-input"
              type="text"
              placeholder={q.placeholder}
              value={answers[q.id]}
              autoFocus
              onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
              onKeyDown={e => { if (e.keyCode === 13) { e.preventDefault(); next(); } }}
            />
          )}

          {q.type === 'text' && !q.short && (
            <textarea
              className="pa-input"
              placeholder={q.placeholder}
              value={answers[q.id]}
              autoFocus
              onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
            />
          )}

          {q.type === 'business' && (
            <div className="pa-business">
              <textarea
                className="pa-input"
                placeholder="e.g. we help mid-market ops teams roll out internal tooling"
                value={answers.q1}
                autoFocus
                onChange={e => setAnswers({...answers, q1: e.target.value})}
              />
              <input
                className="pa-input pa-input-thin"
                type="text"
                placeholder="business name (optional)"
                value={answers.q1_company}
                onChange={e => setAnswers({...answers, q1_company: e.target.value})}
              />
            </div>
          )}

          {q.type === 'email' && (
            <div className="pa-email">
              <input
                className="pa-input"
                type="email"
                placeholder="you@company.com"
                value={answers.email}
                autoFocus
                onChange={e => setAnswers({...answers, email: e.target.value})}
                onKeyDown={e => { if (e.keyCode === 13 && canAdvance()) { e.preventDefault(); next(); } }}
              />
              <div className="pa-email-promise">
                <span className="pa-lock">▲</span>
                We won't share it. You'll get your report within two minutes.
              </div>
            </div>
          )}

          {q.type === 'role_size' && (
            <div className="pa-pairs">
              <div>
                <div className="pa-sublabel">Role</div>
                <div className="pa-chips">
                  {['Founder','CEO','Operator','Team Lead','IC / Specialist','Other'].map(r => (
                    <button key={r} className={'pa-chip ' + (answers.q2_role===r?'on':'')} onClick={()=>setAnswers({...answers, q2_role:r})}>{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="pa-sublabel">Team size</div>
                <div className="pa-chips">
                  {['Just me','2-5','6-20','20+'].map(r => (
                    <button key={r} className={'pa-chip ' + (answers.q2_size===r?'on':'')} onClick={()=>setAnswers({...answers, q2_size:r})}>{r}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {q.type === 'multi' && (
            <div className="pa-multi">
              {q.options.map(o => {
                const on = answers[q.id].includes(o);
                return (
                  <button key={o} className={'pa-multi-opt '+(on?'on':'')} onClick={()=>{
                    const cur = answers[q.id];
                    const nextVal = on ? cur.filter(x=>x!==o) : [...cur, o];
                    setAnswers({...answers, [q.id]: nextVal});
                  }}>
                    <span className="pa-check">{on ? '●' : '○'}</span>
                    <span>{o}</span>
                  </button>
                );
              })}
            </div>
          )}

          {q.type === 'single' && (
            <div className="pa-single">
              {q.options.map(o => (
                <button key={o} className={'pa-single-opt '+(answers[q.id]===o?'on':'')} onClick={()=>{
                  setAnswers({...answers, [q.id]: o});
                  setTimeout(next, 260);
                }}>
                  <span className="pa-check">{answers[q.id]===o?'●':'○'}</span>
                  <span>{o}</span>
                </button>
              ))}
            </div>
          )}

          <div className="pa-controls">
            {step > 0 && <button className="pa-back" onClick={prev}>← back</button>}
            <div style={{flex:1}}/>
            <button className="pa-next" disabled={!canAdvance()} onClick={next}>
              {q.type === 'email' ? 'send_my_heat_map →' : step === questions.length - 1 ? 'generate_heat_map →' : 'next →'}
            </button>
            {q.type === 'text' && <span className="pa-hint">⌘ + enter</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const phaseAStyles = `
  .phaseA { min-height: 100vh; display: flex; flex-direction: column; padding: 72px 24px 24px; background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; }
  .pa-progress { position: relative; height: 2px; background: var(--border-soft); margin-bottom: 80px; }
  .pa-progress-fill { position: absolute; inset: 0; background: var(--mint); transition: width .5s; box-shadow: 0 0 12px var(--mint); }
  .pa-progress-label { position: absolute; top: 12px; left: 0; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: .2em; color: var(--text-3); text-transform: uppercase; }
  .pa-stage { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
  .pa-card { max-width: 720px; width: 100%; }
  .pa-num { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--mint); letter-spacing: .15em; margin-bottom: 24px; }
  .pa-q { font-family: 'Space Grotesk', sans-serif; font-size: clamp(26px, 3.6vw, 44px); font-weight: 500; letter-spacing: -0.025em; line-height: 1.15; margin: 0 0 16px; color: var(--text); }
  .pa-sub { font-size: 15px; color: var(--text-3); line-height: 1.5; margin: 0 0 40px; max-width: 560px; }
  .pa-q + .pa-input, .pa-q + .pa-pairs, .pa-q + .pa-multi, .pa-q + .pa-single { margin-top: 32px; }
  .pa-input { width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--border); color: var(--text); font-size: 22px; font-family: 'Inter', sans-serif; padding: 16px 0; outline: none; resize: none; min-height: 80px; transition: border-color .2s; }
  .pa-input:focus { border-color: var(--mint); }
  .pa-input::placeholder { color: var(--text-3); }
  .pa-input-thin { font-size: 16px; min-height: 0; padding: 12px 0; }
  .pa-business { display: flex; flex-direction: column; gap: 8px; }
  .pa-email { max-width: 520px; }
  .pa-email-promise { margin-top: 18px; display: flex; gap: 10px; align-items: center; font-size: 12px; color: var(--text-3); font-family: 'JetBrains Mono', monospace; }
  .pa-lock { color: var(--mint); font-size: 10px; }
  .pa-pairs { display: grid; gap: 32px; }
  .pa-sublabel { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-3); letter-spacing: .2em; text-transform: uppercase; margin-bottom: 14px; }
  .pa-chips { display: flex; flex-wrap: wrap; gap: 10px; }
  .pa-chip { padding: 12px 20px; border: 1px solid var(--border); background: transparent; color: var(--text-2); font-family: 'JetBrains Mono', monospace; font-size: 13px; border-radius: 2px; cursor: pointer; transition: all .15s; }
  .pa-chip:hover { border-color: var(--mint); color: var(--text); }
  .pa-chip.on { background: var(--mint); color: var(--bg); border-color: var(--mint); }
  .pa-multi, .pa-single { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
  .pa-single { grid-template-columns: 1fr; max-width: 560px; }
  .pa-multi-opt, .pa-single-opt { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border: 1px solid var(--border); background: transparent; color: var(--text); font-family: 'Inter', sans-serif; font-size: 15px; cursor: pointer; text-align: left; border-radius: 2px; transition: all .15s; }
  .pa-multi-opt:hover, .pa-single-opt:hover { border-color: var(--mint); background: rgba(105,252,203,0.04); }
  .pa-multi-opt.on, .pa-single-opt.on { border-color: var(--mint); background: rgba(105,252,203,0.1); }
  .pa-check { color: var(--mint); font-size: 14px; }
  .pa-controls { display: flex; align-items: center; gap: 16px; margin-top: 48px; }
  .pa-back { background: transparent; border: none; color: var(--text-3); font-family: 'JetBrains Mono', monospace; font-size: 13px; cursor: pointer; padding: 8px 0; }
  .pa-next { background: var(--mint); color: var(--bg); border: none; padding: 14px 24px; font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 500; cursor: pointer; letter-spacing: .02em; transition: opacity .2s; }
  .pa-next:disabled { opacity: 0.3; cursor: not-allowed; }
  .pa-hint { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-3); }
  @keyframes slideInR { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: none; } }
  @keyframes slideInL { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: none; } }
`;

window.PhaseA = PhaseA;
