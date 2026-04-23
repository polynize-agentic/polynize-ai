// Direction B — Technical Mono / Operator Terminal
// JetBrains Mono dominant, dense grid Heat Map, one-screen-per-section rhythm.
//
// ========================================================================
// TODOs for Claude Code (search for "CC-TODO" to find them all):
// ------------------------------------------------------------------------
// 1. PROOF CLAIMS (§07 proof.log section): The stats "+70% throughput",
//    "5× output", "48h first agent", "0 vendor lock-in" and the company
//    logos (OPTIO CAPITAL, MERRICK HOLDINGS, WESTFIELD LABS, KEEL OPERATIONS,
//    TOLLWORTH & CO) and the AJ Milne testimonial are PLACEHOLDERS provided
//    by the designer. Ask Marrs for real numbers, real logos (with
//    permission), and real testimonial copy before launch. If a claim
//    cannot be backed, cut it — do not leave the placeholder.
//
// 2. PODCAST CONTENT (§08 founders.podcast section): Episode titles,
//    durations, and guest names are PLACEHOLDERS. Marrs will provide the
//    real "Think Better" episode list. Wire to real YouTube/Spotify/Apple/
//    RSS feeds. Consider pulling from an RSS feed dynamically so the list
//    stays current.
//
// 3. "book_a_call" BUTTONS: Every CTA with href="#" or no href needs to
//    point to a real Cal.com / Calendly URL. Use
//    https://calendly.com/marrscoiro (confirmed working) unless Marrs
//    specifies a different booking surface for homepage traffic.
//
// 4. EDGE STATES: No empty/error/loading states are designed for this
//    homepage. For a static marketing page this is usually fine, but the
//    hero terminal animation should respect `prefers-reduced-motion`.
//
// 5. SOCIAL / OG PREVIEW: No OG image or Twitter card asset exists yet.
//    Generate a static card (1200×630) using the hero terminal aesthetic,
//    wire <meta property="og:image"> and twitter:image. Favicon / app icon
//    also not yet designed.
// ========================================================================

const DirectionB = () => {
  const d = window.POLYNIZE_SAMPLE;
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => { const i = setInterval(()=>setTick(t=>t+1), 1200); return ()=>clearInterval(i); }, []);

  React.useEffect(() => {
    const io = new IntersectionObserver((e) => e.forEach(x => x.isIntersecting && x.target.classList.add('in')),
      { threshold: 0.15 });
    document.querySelectorAll('.dirB-root .reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="dirB-root homepage" style={dirBStyles.root}>
      <style>{dirBStyles.css}</style>

      {/* NAV */}
      <nav style={dirBStyles.nav}>
        <div style={dirBStyles.wordmark}>
          <span style={{color:'var(--mint)'}}>[</span>polynize<span style={{color:'var(--text-3)'}}>.ai</span><span style={{color:'var(--mint)'}}>]</span>
        </div>
        <div style={dirBStyles.statusRow}>
          <span style={dirBStyles.dot}/> <span>cwu.v0.1</span>
          <span style={{opacity:.5}}>·</span>
          <span style={{color:'var(--text-3)'}}>build 2026.04.22</span>
        </div>
        <div style={dirBStyles.navLinks}>
          <a style={dirBStyles.navLink}>/thesis</a>
          <a style={dirBStyles.navLink}>/agents</a>
          <a style={dirBStyles.navLink}>/brand</a>
          <a style={dirBStyles.navLink}>polynize.io ↗</a>
        </div>
      </nav>

      {/* HERO, one screen, dense */}
      <section style={dirBStyles.hero}>
        <div style={dirBStyles.heroLeft}>
          <div style={dirBStyles.eyebrow}>§01 · the cognitive work unit</div>
          <h1 style={dirBStyles.h1}>
            THE NEW SHAPE<br/>
            OF A WORKING<br/>
            BUSINESS<span style={{color:'var(--mint)'}}>.</span>
          </h1>
          <p style={dirBStyles.lede}>
            Execution is no longer the constraint. We design agent teams around the shape of your work.
            One accountable human at the centre. A small team of agents on execution. One real outcome.
          </p>

          <div style={dirBStyles.equation}>
            <EqTerm num="1" label="human" color="var(--gold)" />
            <span style={dirBStyles.eqOp}>+</span>
            <EqTerm num="4" label="agents" color="var(--mint)" />
            <span style={dirBStyles.eqOp}>=</span>
            <EqTerm num="5×" label="output" color="var(--text)" emph />
          </div>

          <div style={dirBStyles.ctaRow}>
            <a style={dirBStyles.ctaPrimary}>
              <span style={{marginRight: 10, opacity:.6}}>→</span>
              map_your_business
            </a>
          </div>
        </div>

        <div style={dirBStyles.heroRight}>
          <TerminalPanel tick={tick} />
        </div>
      </section>

      {/* SECTION 2, THE SHIFT (dense, two columns) */}
      <section style={dirBStyles.section}>
        <SectionHeader n="02" title="the_shift()" subtitle="execution.cost → 0, judgment.value → ∞" />
        <div style={dirBStyles.twoCol}>
          <div>
            <h3 style={dirBStyles.h3}>old constraint</h3>
            <p style={dirBStyles.body}>
              "how do i get more work done." hire harder. stretch people thinner. output climbs linearly with cost.
            </p>
            <ComparisonBar label="headcount → output" ratio={0.92} tone="muted"/>
            <ComparisonBar label="cost → output"      ratio={0.98} tone="muted"/>
          </div>
          <div>
            <h3 style={dirBStyles.h3}>new constraint</h3>
            <p style={dirBStyles.body}>
              "how do i get more of the <em>right</em> work done without being in every decision." judgment scales. execution compounds.
            </p>
            <ComparisonBar label="agents → output"     ratio={0.45} tone="mint"/>
            <ComparisonBar label="judgment → outcome" ratio={0.28} tone="gold"/>
          </div>
        </div>
      </section>

      {/* SECTION 3, CWU */}
      <section style={dirBStyles.section}>
        <SectionHeader n="03" title="cognitive_work_unit" subtitle="1 human + 4 agents = 5× output" />
        <div style={dirBStyles.cwuGrid}>
          <CWUTable />
          <CWUSchematicB />
        </div>
      </section>

      {/* SECTION 4, recognition */}
      <section style={dirBStyles.section}>
        <SectionHeader n="04" title="recognition_first" subtitle="you can't redesign what you can't see" />
        <p style={{...dirBStyles.body, maxWidth: 720, fontSize: 18}}>
          most owners sense they should be using agents. they bolt AI onto legacy workflows and wonder
          why nothing compounds. <span style={{color:'var(--mint)'}}>the heat map makes it visible.</span>
          human-critical vs hybrid vs agent-executable, mapped across your actual work.
        </p>
        <HeatMapGrid rows={d.rows} />
      </section>

      {/* MID-PAGE CTA */}
      <section style={dirBStyles.midCta}>
        <div style={dirBStyles.midCtaInner}>
          <div>
            <div style={{...dirBStyles.eyebrow, marginBottom: 16}}>§04.5 · your turn</div>
            <div style={dirBStyles.midCtaTitle}>
              See your business,<br/>colour-coded<span style={{color:'var(--mint)'}}>.</span>
            </div>
            <p style={{fontSize: 15, color:'var(--text-2)', lineHeight: 1.6, marginTop: 20, maxWidth: 460, fontFamily:'"Inter", sans-serif'}}>
              Answer a handful of questions. Get a Heat Map of your own work,
              a suggested agent team, and a written Blueprint, in minutes.
            </p>
          </div>
          <a style={dirBStyles.midCtaBtn}>
            <span style={{marginRight: 12, opacity:.6}}>→</span>
            map_your_business
          </a>
        </div>
      </section>

      {/* SECTION 5, WHAT YOU GET */}
      <section style={dirBStyles.section}>
        <SectionHeader n="05" title="artifacts[]" subtitle="3 things you leave with" />
        <div style={dirBStyles.artifacts}>
          <Artifact k="01" name="heat_map.svg" body="every function colour-coded across human / hybrid / agent. directional, not precise." />
          <Artifact k="02" name="agent_team.json" body="3–5 named agents, shaped around your specific work. not generic assistants." />
          <Artifact k="03" name="blueprint.html" body="4-page written blueprint, emailed. shareable link, yours to keep." />
        </div>
      </section>

      {/* SECTION 6, HOW */}
      <section style={dirBStyles.section}>
        <SectionHeader n="06" title="pipeline()" subtitle="map → train → engineer → deploy" />
        <div style={dirBStyles.pipelineMono}>
          {[
            ["01","map","we map the work. judgment points, execution points, where throughput leaks."],
            ["02","train","we train the team on your context, voice, constraints, tooling."],
            ["03","engineer","we engineer connectors, handoffs, human touchpoints. quietly."],
            ["04","deploy","we deploy into your working week. one accountable human at the centre."],
          ].map(([n,t,s]) => (
            <div key={n} style={dirBStyles.pipeRow}>
              <div style={{color:'var(--text-3)', fontSize: 12}}>{n}</div>
              <div style={{color:'var(--mint)', fontSize: 18, fontWeight: 500}}>{t}()</div>
              <div style={{color:'var(--text-2)', fontSize: 14, lineHeight:1.6}}>{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7, PROOF */}
      {/* CC-TODO: Replace placeholder logos, metrics, and testimonial with real content — see file header note (1). */}
      <section style={dirBStyles.section}>
        <SectionHeader n="07" title="proof.log" subtitle="structural lifts, not marginal ones" />

        {/* Logo strip */}
        <div style={dirBStyles.logoStrip}>
          <div style={dirBStyles.logoLabel}>§ operated_with</div>
          <div style={dirBStyles.logoRow}>
            <span style={dirBStyles.logo}>OPTIO CAPITAL</span>
            <span style={dirBStyles.logoDot}>·</span>
            <span style={dirBStyles.logo}>MERRICK HOLDINGS</span>
            <span style={dirBStyles.logoDot}>·</span>
            <span style={dirBStyles.logo}>WESTFIELD LABS</span>
            <span style={dirBStyles.logoDot}>·</span>
            <span style={dirBStyles.logo}>KEEL OPERATIONS</span>
            <span style={dirBStyles.logoDot}>·</span>
            <span style={dirBStyles.logo}>TOLLWORTH &amp; CO</span>
          </div>
        </div>

        {/* Metrics strip */}
        <div style={dirBStyles.metricsStrip}>
          <div style={dirBStyles.metric}>
            <div style={dirBStyles.metricNum}>+70<span style={{color:'var(--text-3)'}}>%</span></div>
            <div style={dirBStyles.metricMeta}>throughput uplift<br/><span style={{color:'var(--text-3)'}}>global tech co, one engagement</span></div>
          </div>
          <div style={dirBStyles.metric}>
            <div style={dirBStyles.metricNum}>5<span style={{color:'var(--text-3)'}}>×</span></div>
            <div style={dirBStyles.metricMeta}>output per human lead<br/><span style={{color:'var(--text-3)'}}>average across units</span></div>
          </div>
          <div style={dirBStyles.metric}>
            <div style={dirBStyles.metricNum}>48<span style={{color:'var(--text-3)'}}>h</span></div>
            <div style={dirBStyles.metricMeta}>first agent live<br/><span style={{color:'var(--text-3)'}}>after map workshop</span></div>
          </div>
          <div style={dirBStyles.metric}>
            <div style={dirBStyles.metricNum}>0</div>
            <div style={dirBStyles.metricMeta}>cognitive layer vendors<br/><span style={{color:'var(--text-3)'}}>we build it, you keep it</span></div>
          </div>
        </div>

        {/* Featured testimonial */}
        <div style={dirBStyles.quoteCard}>
          <div style={{color:'var(--mint)', fontSize: 12, marginBottom: 16, fontFamily:'monospace', letterSpacing:'.15em'}}>/* testimonial_01 */</div>
          <p style={{fontSize: 22, lineHeight: 1.5, margin: 0, color: 'var(--text)', letterSpacing:'-0.005em'}}>
            "polynize didn't sell us a tool. they redesigned how our team works. our analysts now hold judgment, not task execution. the lift has been structural, not marginal."
          </p>
          <div style={{marginTop: 28, display:'flex', alignItems:'center', gap: 14}}>
            <div style={{width: 40, height: 40, borderRadius: '50%', background:'var(--surface-2)', color:'var(--mint)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'"Space Grotesk", sans-serif', fontWeight:600, fontSize:14}}>AJ</div>
            <div>
              <div style={{fontSize: 14, color:'var(--text)'}}>aj milne</div>
              <div style={{fontSize: 11, color:'var(--text-3)', fontFamily:'monospace', letterSpacing:'.1em', marginTop: 2}}>PARTNER · OPTIO CAPITAL</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8, FOUNDERS */}
      {/* CC-TODO: Wire real Think Better episodes + real YouTube/Spotify/Apple/RSS links — see file header note (2). */}
      <section style={dirBStyles.section}>
        <SectionHeader n="08" title="founders.podcast" subtitle="weekly, from the people doing the work" />

        <div style={dirBStyles.podGrid}>
          <a style={{...dirBStyles.podCard, ...dirBStyles.podCardFeatured}}>
            <div style={dirBStyles.podThumb}>
              <div style={dirBStyles.podWave}>
                {Array.from({length: 32}).map((_, i) => (
                  <span key={i} style={{
                    flex: 1,
                    height: `${20 + Math.sin(i*0.7) * 50 + (i%3)*15}%`,
                    background: i < 10 ? 'var(--mint)' : 'var(--border)',
                    maxWidth: 6,
                  }}/>
                ))}
              </div>
              <div style={dirBStyles.play}>▶</div>
            </div>
            <div style={{padding: '20px 4px 0'}}>
              <div style={{fontSize: 11, color:'var(--mint)', fontFamily:'monospace', letterSpacing:'.2em'}}>EP_014 · 42:15 · LATEST</div>
              <div style={{fontSize: 24, marginTop: 10, letterSpacing:'-0.015em', lineHeight: 1.2}}>
                the end of the employee as the unit of work
              </div>
              <div style={{fontSize: 13, color:'var(--text-2)', marginTop: 12, lineHeight: 1.55}}>
                sagar and vas on why the hiring-loop economy is finished, and what replaces it. with live reads of two recent heat maps.
              </div>
            </div>
          </a>

          <div style={dirBStyles.podSide}>
            <a style={dirBStyles.podCardMini}>
              <div style={{fontSize: 10, color:'var(--text-3)', fontFamily:'monospace', letterSpacing:'.2em'}}>EP_013 · 31:08</div>
              <div style={{fontSize: 15, marginTop: 6, lineHeight: 1.3}}>heat maps vs. org charts, a rehearsal</div>
            </a>
            <a style={dirBStyles.podCardMini}>
              <div style={{fontSize: 10, color:'var(--text-3)', fontFamily:'monospace', letterSpacing:'.2em'}}>EP_012 · 38:44</div>
              <div style={{fontSize: 15, marginTop: 6, lineHeight: 1.3}}>why agents hate your kanban board</div>
            </a>
            <a style={dirBStyles.podCardMini}>
              <div style={{fontSize: 10, color:'var(--text-3)', fontFamily:'monospace', letterSpacing:'.2em'}}>EP_011 · 29:52</div>
              <div style={{fontSize: 15, marginTop: 6, lineHeight: 1.3}}>the cognitive work unit, a working definition</div>
            </a>
            <a style={{...dirBStyles.podCardMini, borderColor:'var(--mint)', color:'var(--mint)'}}>
              $ ls episodes/*.mp3, all_episodes →
            </a>
          </div>
        </div>

        <div style={{marginTop: 32, display:'flex', gap: 20, fontFamily:'monospace', fontSize: 12, color:'var(--text-3)', letterSpacing:'.1em'}}>
          <a style={{color:'var(--text-2)'}}>YOUTUBE ↗</a>
          <a style={{color:'var(--text-2)'}}>SPOTIFY ↗</a>
          <a style={{color:'var(--text-2)'}}>APPLE ↗</a>
          <a style={{color:'var(--text-2)'}}>RSS ↗</a>
        </div>
      </section>

      {/* SECTION 9, FINAL CTA */}
      <section style={dirBStyles.finalCta}>
        <div style={dirBStyles.eyebrow}>§09 · next()</div>
        <h2 style={{...dirBStyles.h1, fontSize: 72, marginTop: 16}}>
          SEE THE SHAPE OF<br/>YOUR BUSINESS<span style={{color:'var(--mint)'}}>.</span>
        </h2>
        <div style={{...dirBStyles.ctaRow, marginTop: 48}}>
          <a style={dirBStyles.ctaPrimary}>
            <span style={{marginRight: 10, opacity:.6}}>→</span>map_your_business
          </a>
          <span style={dirBStyles.ctaNote}>$ curl -X POST /agents, 4 min</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={dirBStyles.footer}>
        <div style={dirBStyles.footerTop}>
          <div>
            <div style={dirBStyles.wordmark}>
              <span style={{color:'var(--mint)'}}>[</span>polynize<span style={{color:'var(--text-3)'}}>.ai</span><span style={{color:'var(--mint)'}}>]</span>
            </div>
            <p style={{color:'var(--text-3)', maxWidth: 340, fontSize: 13, marginTop: 16}}>
              the agentic arm of polynize. we design and deploy cognitive work units for small and mid-size businesses.
            </p>
          </div>
          <div style={dirBStyles.footerCols}>
            <FooterColB title="~/polynize" links={["polynize.io","enterprise","brand"]} />
            <FooterColB title="~/social"   links={["linkedin","youtube","instagram","tiktok"]} />
            <FooterColB title="~/contact"  links={["hello@polynize.io","book a call ↗"]} />
          </div>
        </div>
        <div style={dirBStyles.footerBase}>
          <span>© 2026 polynize pty ltd</span>
          <span style={{color:'var(--text-3)'}}>// built in sydney</span>
        </div>
      </footer>
    </div>
  );
};

// ───── subcomponents ─────
const TerminalPanel = ({tick}) => {
  const lines = [
    { t: '$ polynize diagnose', c: 'var(--text-3)' },
    { t: '→ fetching cwu shapes ............ ok', c: 'var(--text-2)' },
    { t: '→ detecting bottleneck ........... pipeline_and_conversion', c: 'var(--mint)' },
    { t: '→ allocating roles ............... 5 agents, 1 human_lead', c: 'var(--mint)' },
    { t: '→ human_critical % ............... 38', c: 'var(--coral)' },
    { t: '→ hybrid % ....................... 12', c: 'var(--amber)' },
    { t: '→ agent_executable % ............. 50', c: 'var(--mint)' },
    { t: '→ estimated throughput ........... ×5.0', c: 'var(--gold)' },
    { t: 'ready. press [map_your_business]', c: 'var(--text)' },
  ];
  return (
    <div style={dirBStyles.terminal}>
      <div style={dirBStyles.terminalBar}>
        <span style={{...dirBStyles.trafficLight, background:'#ff5f56'}}/>
        <span style={{...dirBStyles.trafficLight, background:'#ffbd2e'}}/>
        <span style={{...dirBStyles.trafficLight, background:'#27c93f'}}/>
        <span style={{color:'var(--text-3)', fontSize: 11, marginLeft: 12}}>polynize, /diagnose</span>
      </div>
      <div style={dirBStyles.terminalBody}>
        {lines.map((l,i) => (
          <div key={i} style={{color: l.c, fontSize: 13, lineHeight: 1.8, fontFamily:'"JetBrains Mono", monospace', opacity: i <= tick%lines.length ? 1 : 0.2, transition:'opacity .3s'}}>
            {l.t}{i === tick%lines.length && <span style={{color:'var(--mint)', animation:'blink 1s infinite'}}>▍</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

const EqTerm = ({num, label, color, sub, emph}) => (
  <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap: 2}}>
    <div style={{fontSize: emph ? 64 : 56, color, fontWeight: 500, letterSpacing:'-0.03em', lineHeight: 1, fontFamily:'"Space Grotesk", sans-serif'}}>{num}</div>
    <div style={{fontSize: 11, letterSpacing:'.2em', color:'var(--text-3)', textTransform:'uppercase', fontFamily:'"JetBrains Mono", monospace', marginTop: 8}}>{label}</div>
    {sub && <div style={{fontSize: 10, color:'var(--text-3)', fontFamily:'monospace', opacity: .7, marginTop: 2}}>{sub}</div>}
  </div>
);

const SectionHeader = ({n, title, subtitle}) => (
  <div style={dirBStyles.sectHead}>
    <div>
      <div style={dirBStyles.eyebrow}>§{n}</div>
      <h2 style={dirBStyles.h2}>{title}</h2>
    </div>
    {subtitle && <div style={{color:'var(--text-3)', fontSize: 13, fontFamily:'monospace', whiteSpace:'nowrap', marginTop: 28}}>{subtitle}</div>}
  </div>
);

const ComparisonBar = ({label, ratio, tone}) => {
  const color = tone === 'mint' ? 'var(--mint)' : tone === 'gold' ? 'var(--gold)' : 'var(--text-3)';
  return (
    <div style={{marginTop: 20, display:'grid', gridTemplateColumns:'1fr auto', gap: 16, alignItems:'center'}}>
      <div style={{fontSize: 12, fontFamily:'monospace', color:'var(--text-3)'}}>{label}</div>
      <div style={{display:'flex', gap:4}}>
        {[...Array(30)].map((_,i) => (
          <div key={i} style={{width: 6, height: i < ratio*30 ? 18 : 6, background: i < ratio*30 ? color : 'var(--border-soft)', transition:'all .3s', transitionDelay: `${i*20}ms`}}/>
        ))}
      </div>
    </div>
  );
};

const CWUTable = () => (
  <div style={dirBStyles.cwuTable}>
    {[
      ["humans", "1", "judgment, accountability, live decisions", "var(--gold)"],
      ["agents", "4", "execution, research, follow-through", "var(--mint)"],
      ["outcome", "1", "the real thing the unit exists for", "var(--blue)"],
      ["throughput", "≈5×", "vs traditional team structures", "var(--text)"],
    ].map(([k,v,d,c],i) => (
      <div key={i} style={{display:'grid', gridTemplateColumns:'140px 80px 1fr', padding:'24px 0', borderBottom:'1px solid var(--border-soft)', alignItems:'baseline'}}>
        <div style={{color:'var(--text-3)', fontSize: 12, fontFamily:'monospace', letterSpacing:'.15em', textTransform:'uppercase'}}>{k}</div>
        <div style={{color: c, fontSize: 36, fontWeight: 500, letterSpacing:'-0.02em'}}>{v}</div>
        <div style={{color:'var(--text-2)', fontSize: 14}}>{d}</div>
      </div>
    ))}
  </div>
);

const CWUSchematicB = () => {
  const [hover, setHover] = React.useState(null);
  const agents = ['A1','A2','A3','A4'];
  // agent x positions evenly spaced
  const ax = [60, 140, 220, 300];
  const ay = 200;
  const hx = 180, hy = 60;
  return (
    <div style={{padding: 32, background:'var(--surface)', border:'1px solid var(--border)', borderRadius: 4, position:'relative'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 24}}>
        <div style={{color:'var(--text-3)', fontSize: 11, fontFamily:'monospace', letterSpacing:'.15em'}}>// unit schematic</div>
        <div style={{color:'var(--text-3)', fontSize: 11, fontFamily:'monospace'}}>1 : 4</div>
      </div>
      <svg viewBox="0 0 360 280" style={{width:'100%'}}>
        <defs>
          <radialGradient id="humanGlowB" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#f0e1b6" stopOpacity=".25"/>
            <stop offset="1" stopColor="#f0e1b6" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* connection lines human → each agent */}
        {ax.map((x,i) => (
          <line key={i} x1={hx} y1={hy+28} x2={x} y2={ay}
            stroke={hover===i?'var(--mint)':'var(--border)'}
            strokeWidth={hover===i?1.5:1}
            style={{transition:'all .2s'}}/>
        ))}

        {/* human centre glow */}
        <circle cx={hx} cy={hy+4} r="48" fill="url(#humanGlowB)"/>

        {/* human icon, head + shoulders outline */}
        <g>
          <circle cx={hx} cy={hy-4} r="10" fill="none" stroke="var(--gold)" strokeWidth="1.5"/>
          <path d={`M ${hx-18} ${hy+22} Q ${hx-18} ${hy+8} ${hx} ${hy+8} Q ${hx+18} ${hy+8} ${hx+18} ${hy+22}`}
            fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
        <text x={hx} y={hy+40} textAnchor="middle" fontSize="9" fill="var(--text-3)" style={{fontFamily:'monospace', letterSpacing:'.2em'}}>HUMAN · JUDGMENT</text>

        {/* agents */}
        {ax.map((x,i) => {
          const active = hover === i;
          return (
            <g key={i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} style={{cursor:'pointer'}}>
              <rect x={x-24} y={ay} width="48" height="28"
                fill={active?'var(--mint)':'var(--surface-2)'}
                stroke={active?'var(--mint)':'var(--border)'}
                rx="2" style={{transition:'all .2s'}}/>
              <text x={x} y={ay+18} textAnchor="middle" fontSize="11"
                fill={active?'var(--bg)':'var(--mint)'}
                style={{fontFamily:'"JetBrains Mono", monospace', fontWeight: 500}}>{agents[i]}</text>
            </g>
          );
        })}
        <text x={hx} y={ay+48} textAnchor="middle" fontSize="9" fill="var(--text-3)" style={{fontFamily:'monospace', letterSpacing:'.2em'}}>AGENTS · EXECUTION</text>
      </svg>
    </div>
  );
};

const HeatMapGrid = ({rows}) => {
  const [active, setActive] = React.useState(null);
  React.useEffect(() => {
    let i = 0;
    const iv = setInterval(() => { setActive(i); i++; if (i > rows.length) clearInterval(iv); }, 180);
    return () => clearInterval(iv);
  }, [rows.length]);
  return (
    <div style={dirBStyles.heatGrid}>
      <div style={dirBStyles.heatHead}>
        <div style={{color:'var(--text-3)', fontSize: 11, fontFamily:'monospace', letterSpacing:'.15em'}}>function</div>
        <div style={{...dirBStyles.heatCol, color:'var(--coral)'}}>HUMAN-LED</div>
        <div style={{...dirBStyles.heatCol, color:'var(--amber)'}}>HYBRID</div>
        <div style={{...dirBStyles.heatCol, color:'var(--mint)'}}>AGENT-EXEC</div>
      </div>
      {rows.map((r,i) => {
        const on = i <= active;
        return (
          <div key={i} style={dirBStyles.heatRow}>
            <div style={{fontSize: 14, color:'var(--text)'}}>{r.fn}</div>
            <HeatCell active={r.alloc==='human' && on} color="var(--coral)"/>
            <HeatCell active={r.alloc==='hybrid' && on} color="var(--amber)"/>
            <HeatCell active={r.alloc==='agent' && on} color="var(--mint)"/>
          </div>
        );
      })}
      <div style={dirBStyles.heatLegend}>
        <span style={{color:'var(--coral)'}}>38% human</span>
        <span style={{color:'var(--amber)'}}>12% hybrid</span>
        <span style={{color:'var(--mint)'}}>50% agent-executable</span>
        <span style={{marginLeft:'auto', color:'var(--text-3)'}}>based on shape_02 · pipeline_and_conversion</span>
      </div>
    </div>
  );
};

const HeatCell = ({active, color}) => (
  <div style={{
    height: 40, borderRadius: 2,
    background: active ? color : 'var(--surface-2)',
    border: active ? `1px solid ${color}` : '1px solid var(--border-soft)',
    boxShadow: active ? `0 0 24px ${color}55` : 'none',
    transition: 'all .4s',
  }}/>
);

const Artifact = ({k, name, body}) => (
  <div style={dirBStyles.artifact}>
    <div style={{fontSize: 11, color:'var(--text-3)', fontFamily:'monospace', letterSpacing:'.15em'}}>{`>_ `}{k}</div>
    <div style={{marginTop: 16, fontFamily:'"JetBrains Mono", monospace', fontSize: 18, color:'var(--mint)'}}>{name}</div>
    <p style={{color:'var(--text-2)', lineHeight: 1.6, marginTop: 20, fontSize: 14}}>{body}</p>
  </div>
);

const FooterColB = ({title, links}) => (
  <div>
    <div style={{fontSize: 11, fontFamily:'monospace', color:'var(--text-3)', letterSpacing:'.15em', marginBottom: 16}}>{title}/</div>
    {links.map(l => <div key={l} style={{fontSize: 13, color:'var(--text-2)', marginBottom: 8, cursor:'pointer', fontFamily:'monospace'}}>{l}</div>)}
  </div>
);

// ───── styles ─────
const dirBStyles = {
  css: `
    .dirB-root { font-family: 'JetBrains Mono', 'Space Mono', monospace; }
    .dirB-root h1 { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.035em; }
    .dirB-root h2 { font-family: 'JetBrains Mono', monospace; }
    .dirB-root a { color: inherit; text-decoration: none; }
    @keyframes blink { 50% { opacity: 0; } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  `,
  root: { minHeight: 2000 },
  nav: { display:'grid', gridTemplateColumns:'auto 1fr auto', gap: 40, alignItems:'center', padding:'20px 40px', borderBottom:'1px solid var(--border-soft)', position:'sticky', top:0, background:'rgba(10,10,15,0.9)', backdropFilter:'blur(8px)', zIndex: 10, fontFamily:'"JetBrains Mono", monospace' },
  wordmark: { fontSize: 15, fontWeight: 500 },
  statusRow: { display:'flex', alignItems:'center', gap: 10, fontSize: 12, color:'var(--text-2)' },
  dot: { width: 6, height: 6, borderRadius: 6, background:'var(--mint)', boxShadow:'0 0 8px var(--mint)', animation:'pulse 2s infinite' },
  navLinks: { display:'flex', gap: 20 },
  navLink: { fontSize: 12, color:'var(--text-2)', cursor:'pointer' },
  hero: { display:'grid', gridTemplateColumns:'1.1fr 1fr', gap: 64, padding:'80px 48px 100px', maxWidth: 1400, margin:'0 auto', alignItems:'center', minHeight: 700 },
  heroLeft: {},
  heroRight: {},
  eyebrow: { fontSize: 11, letterSpacing:'.2em', color:'var(--text-3)', marginBottom: 32, fontFamily:'"JetBrains Mono", monospace', textTransform:'uppercase' },
  h1: { fontSize: 92, fontWeight: 700, lineHeight: 0.95, margin: 0, letterSpacing:'-0.04em', fontFamily:'"Space Grotesk", sans-serif' },
  lede: { fontSize: 17, color:'var(--text-2)', lineHeight: 1.6, maxWidth: 560, marginTop: 32, fontFamily:'"Inter", sans-serif' },
  ctaRow: { display:'flex', alignItems:'center', gap: 20, marginTop: 40, flexWrap:'wrap' },
  ctaPrimary: { background:'var(--mint)', color:'var(--bg)', padding:'16px 22px', fontSize: 14, fontWeight: 500, letterSpacing:'.02em', cursor:'pointer', display:'inline-flex', alignItems:'center', fontFamily:'"JetBrains Mono", monospace' },
  ctaNote: { fontSize: 12, color:'var(--text-3)', fontFamily:'monospace' },
  metaRow: { display:'flex', gap: 12, marginTop: 24, fontSize: 11, color:'var(--text-3)', fontFamily:'monospace', flexWrap:'wrap' },
  equation: { display:'flex', alignItems:'center', gap: 28, marginTop: 40, padding:'28px 32px', border:'1px solid var(--border)', borderRadius: 4, background:'rgba(105,252,203,0.03)', width:'fit-content' },
  eqOp: { fontSize: 44, color:'var(--text-3)', fontWeight: 300, fontFamily:'"Space Grotesk", sans-serif', lineHeight: 1, alignSelf:'flex-start', marginTop: 6 },
  terminal: { border:'1px solid var(--border)', borderRadius: 4, background:'var(--surface)', overflow:'hidden' },
  terminalBar: { display:'flex', alignItems:'center', gap: 8, padding:'12px 16px', background:'var(--surface-2)', borderBottom:'1px solid var(--border-soft)' },
  trafficLight: { width: 12, height: 12, borderRadius: 12 },
  terminalBody: { padding: 24, minHeight: 320 },
  section: { padding:'120px 48px', maxWidth: 1400, margin:'0 auto' },
  sectHead: { display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom: 64, borderBottom:'1px solid var(--border-soft)', paddingBottom: 32 },
  h2: { fontSize: 44, margin: '12px 0 0', fontWeight: 500, color:'var(--mint)', letterSpacing:'-0.02em' },
  h3: { fontSize: 13, color:'var(--text-3)', letterSpacing:'.2em', textTransform:'uppercase', marginBottom: 16, fontFamily:'"JetBrains Mono", monospace' },
  twoCol: { display:'grid', gridTemplateColumns:'1fr 1fr', gap: 64 },
  body: { fontSize: 15, color:'var(--text-2)', lineHeight: 1.65, fontFamily:'"Inter", sans-serif' },
  cwuGrid: { display:'grid', gridTemplateColumns:'1.2fr 1fr', gap: 48, alignItems:'start' },
  cwuTable: {},
  heatGrid: { marginTop: 48, background:'var(--surface)', border:'1px solid var(--border)', borderRadius: 4, padding: 28 },
  heatHead: { display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap: 12, paddingBottom: 16, borderBottom:'1px solid var(--border-soft)', marginBottom: 12 },
  heatCol: { fontSize: 10, fontFamily:'monospace', letterSpacing:'.2em', textAlign:'center' },
  heatRow: { display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap: 12, padding:'10px 0', alignItems:'center' },
  heatLegend: { display:'flex', gap: 24, marginTop: 20, paddingTop: 16, borderTop:'1px solid var(--border-soft)', fontSize: 12, fontFamily:'monospace' },
  artifacts: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 24 },
  artifact: { padding: 32, background:'var(--surface)', border:'1px solid var(--border-soft)', borderRadius: 4, minHeight: 240 },
  pipelineMono: { border:'1px solid var(--border-soft)', borderRadius: 4 },
  pipeRow: { display:'grid', gridTemplateColumns:'60px 200px 1fr', gap: 32, padding:'28px 28px', borderBottom:'1px solid var(--border-soft)', alignItems:'baseline' },
  logoStrip: { marginBottom: 56, paddingBottom: 40, borderBottom:'1px dashed var(--border-soft)' },
  logoLabel: { fontFamily:'monospace', fontSize: 11, letterSpacing:'.2em', color:'var(--text-3)', marginBottom: 20 },
  logoRow: { display:'flex', alignItems:'center', gap: 24, flexWrap:'wrap' },
  logo: { fontFamily:'"Space Grotesk", sans-serif', fontSize: 15, letterSpacing:'.12em', color:'var(--text-2)', fontWeight: 500 },
  logoDot: { color:'var(--text-3)', opacity:.5 },
  metricsStrip: { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 0, marginBottom: 56, border:'1px solid var(--border-soft)', borderRadius: 4, overflow:'hidden' },
  metric: { padding:'36px 32px', borderRight:'1px solid var(--border-soft)' },
  metricNum: { fontSize: 72, color:'var(--gold)', fontWeight: 500, letterSpacing:'-0.04em', lineHeight: 1, fontFamily:'"Space Grotesk", sans-serif' },
  metricMeta: { fontSize: 12, color:'var(--text-2)', marginTop: 14, lineHeight: 1.55, fontFamily:'monospace' },
  quoteCard: { background:'var(--surface)', border:'1px solid var(--border-soft)', borderRadius: 4, padding: 48 },
  podGrid: { display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 32, alignItems:'start' },
  podCard: { display:'block', cursor:'pointer', textDecoration:'none', color:'inherit' },
  podCardFeatured: {},
  podThumb: { aspectRatio:'16/9', background:'radial-gradient(circle at 30% 30%, var(--surface-2), var(--surface))', border:'1px solid var(--border)', borderRadius: 4, position:'relative', cursor:'pointer', overflow:'hidden' },
  podWave: { position:'absolute', inset: 0, display:'flex', alignItems:'flex-end', justifyContent:'space-between', padding:'20px 28px', gap: 2, opacity: 0.7 },
  play: { position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width: 64, height: 64, background:'var(--mint)', color:'var(--bg)', borderRadius: 64, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 20, paddingLeft: 4, zIndex: 2 },
  podSide: { display:'flex', flexDirection:'column', gap: 10 },
  podCardMini: { display:'block', padding:'18px 20px', border:'1px solid var(--border-soft)', borderRadius: 4, cursor:'pointer', textDecoration:'none', color:'inherit', background:'var(--surface)' },
  finalCta: { padding:'160px 48px', maxWidth: 1400, margin:'0 auto' },
  midCta: { padding:'80px 48px', maxWidth: 1400, margin:'0 auto' },
  midCtaInner: { background:'linear-gradient(180deg, rgba(105,252,203,0.05), transparent)', border:'1px solid var(--border)', borderRadius: 4, padding:'56px 56px', display:'grid', gridTemplateColumns:'1fr auto', gap: 48, alignItems:'center' },
  midCtaTitle: { fontSize: 48, fontWeight: 700, letterSpacing:'-0.03em', lineHeight: 1, fontFamily:'"Space Grotesk", sans-serif' },
  midCtaBtn: { background:'var(--mint)', color:'var(--bg)', padding:'22px 30px', fontSize: 16, fontWeight: 500, letterSpacing:'.02em', cursor:'pointer', display:'inline-flex', alignItems:'center', fontFamily:'"JetBrains Mono", monospace', whiteSpace:'nowrap' },
  footer: { borderTop:'1px solid var(--border-soft)', padding:'60px 48px 32px', maxWidth: 1400, margin:'0 auto' },
  footerTop: { display:'grid', gridTemplateColumns:'1fr 1fr', gap: 40, marginBottom: 64 },
  footerCols: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 24 },
  footerBase: { display:'flex', justifyContent:'space-between', paddingTop: 24, borderTop:'1px solid var(--border-soft)', fontSize: 11, fontFamily:'monospace', color:'var(--text-3)' },
};

window.DirectionB = DirectionB;
