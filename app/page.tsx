import Link from 'next/link';
import s from './_home/home.module.css';
import { Terminal } from './_home/Terminal';
import { HeatMapGrid } from './_home/HeatMapGrid';
import { CWUSchematic } from './_home/CWUSchematic';
import { HOME_SAMPLE } from './_home/sample-data';
import { TrackedLink } from './_components/TrackedLink';

const BOOKING_URL = 'https://calendly.com/marrscoiro/meeting30';
const POLYNIZE_IO = 'https://polynize.io';

export const metadata = {
  title: 'polynize.ai · the new shape of a working business',
  description:
    'We design agent teams around the shape of your work. One accountable human at the centre. A small team of agents on execution. One real outcome.',
};

export default function HomePage() {
  return (
    <div className={s.root}>
      {/* NAV */}
      <nav className={s.nav}>
        <div className={s.wordmark}>
          <span style={{ color: 'var(--mint)' }}>[</span>polynize
          <span style={{ color: 'var(--text-3)' }}>.ai</span>
          <span style={{ color: 'var(--mint)' }}>]</span>
        </div>
        <div className={s.statusRow}>
          <span className={s.dot} /> <span>cwu.v0.1</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span style={{ color: 'var(--text-3)' }}>build 2026.04.23</span>
        </div>
        <div className={s.navLinks}>
          {/* CC-TODO: /thesis page does not exist yet — placeholder anchor */}
          <a className={s.navLink} href="#thesis">/thesis</a>
          <Link className={s.navLink} href="/agents">/agents</Link>
          <Link className={s.navLink} href="/brand">/brand</Link>
          <a className={s.navLink} href={POLYNIZE_IO} target="_blank" rel="noopener noreferrer">
            polynize.io ↗
          </a>
        </div>
      </nav>

      {/* §01 HERO */}
      <section className={s.hero}>
        <div>
          <div className={s.eyebrow}>§01 · the cognitive work unit</div>
          <h1 className={s.h1}>
            THE NEW SHAPE
            <br />
            OF A WORKING
            <br />
            BUSINESS<span style={{ color: 'var(--mint)' }}>.</span>
          </h1>
          <p className={s.lede}>
            Execution is no longer the constraint. We design agent teams around the shape of your
            work. One accountable human at the centre. A small team of agents on execution. One real
            outcome.
          </p>

          <div className={s.equation}>
            <EqTerm num="1" label="human" color="var(--gold)" />
            <span className={s.eqOp}>+</span>
            <EqTerm num="4" label="agents" color="var(--mint)" />
            <span className={s.eqOp}>=</span>
            <EqTerm num="5×" label="output" color="var(--text)" emph />
          </div>

          <div className={s.ctaRow}>
            <TrackedLink
              className={s.ctaPrimary}
              href="/agents"
              event="cta_click"
              eventProps={{ surface: 'home_hero', label: 'map_your_business' }}
            >
              <span className={s.ctaArrow}>→</span>
              map_your_business
            </TrackedLink>
          </div>
        </div>

        <div>
          <Terminal />
        </div>
      </section>

      {/* §02 THE SHIFT */}
      <section className={s.section} id="thesis">
        <SectionHeader n="02" title="the_shift()" subtitle="execution.cost → 0, judgment.value → ∞" />
        <div className={s.twoCol}>
          <div>
            <h3 className={s.h3}>old constraint</h3>
            <p className={s.body}>
              &quot;how do i get more work done.&quot; hire harder. stretch people thinner. output
              climbs linearly with cost.
            </p>
            <ComparisonBar label="headcount → output" ratio={0.92} tone="muted" />
            <ComparisonBar label="cost → output" ratio={0.98} tone="muted" />
          </div>
          <div>
            <h3 className={s.h3}>new constraint</h3>
            <p className={s.body}>
              &quot;how do i get more of the <em>right</em> work done without being in every
              decision.&quot; judgment scales. execution compounds.
            </p>
            <ComparisonBar label="agents → output" ratio={0.45} tone="mint" />
            <ComparisonBar label="judgment → outcome" ratio={0.28} tone="gold" />
          </div>
        </div>
      </section>

      {/* §03 CWU */}
      <section className={s.section}>
        <SectionHeader n="03" title="cognitive_work_unit" subtitle="1 human + 4 agents = 5× output" />
        <div className={s.cwuGrid}>
          <CWUTable />
          <CWUSchematic />
        </div>
      </section>

      {/* §04 RECOGNITION */}
      <section className={s.section}>
        <SectionHeader n="04" title="recognition_first" subtitle="you can't redesign what you can't see" />
        <p className={s.body} style={{ maxWidth: 720, fontSize: 18 }}>
          most owners sense they should be using agents. they bolt AI onto legacy workflows and
          wonder why nothing compounds.{' '}
          <span style={{ color: 'var(--mint)' }}>the heat map makes it visible.</span> human-critical
          vs hybrid vs agent-executable, mapped across your actual work.
        </p>
        <HeatMapGrid rows={HOME_SAMPLE.rows} />
      </section>

      {/* §04.5 MID CTA */}
      <section className={s.midCta}>
        <div className={s.midCtaInner}>
          <div>
            <div className={s.eyebrow} style={{ marginBottom: 16 }}>§04.5 · your turn</div>
            <div className={s.midCtaTitle}>
              See your business,
              <br />
              colour-coded<span style={{ color: 'var(--mint)' }}>.</span>
            </div>
            <p className={s.midCtaBlurb}>
              Answer a handful of questions. Get a Heat Map of your own work, a suggested agent
              team, and a written Blueprint, in minutes.
            </p>
          </div>
          <TrackedLink
            className={s.midCtaBtn}
            href="/agents"
            event="cta_click"
            eventProps={{ surface: 'home_mid_cta', label: 'map_your_business' }}
          >
            <span className={s.ctaArrow}>→</span>
            map_your_business
          </TrackedLink>
        </div>
      </section>

      {/* §05 ARTIFACTS */}
      <section className={s.section}>
        <SectionHeader n="05" title="artifacts[]" subtitle="3 things you leave with" />
        <div className={s.artifacts}>
          <Artifact
            k="01"
            name="heat_map.svg"
            body="every function colour-coded across human / hybrid / agent. directional, not precise."
          />
          <Artifact
            k="02"
            name="agent_team.json"
            body="3-5 named agents, shaped around your specific work. not generic assistants."
          />
          <Artifact
            k="03"
            name="blueprint.html"
            body="4-page written blueprint, emailed. shareable link, yours to keep."
          />
        </div>
      </section>

      {/* §06 PIPELINE */}
      <section className={s.section}>
        <SectionHeader n="06" title="pipeline()" subtitle="map → train → engineer → deploy" />
        <div className={s.pipelineMono}>
          {[
            ['01', 'map', 'we map the work. judgment points, execution points, where throughput leaks.'],
            ['02', 'train', 'we train the team on your context, voice, constraints, tooling.'],
            ['03', 'engineer', 'we engineer connectors, handoffs, human touchpoints. quietly.'],
            ['04', 'deploy', 'we deploy into your working week. one accountable human at the centre.'],
          ].map(([n, t, body]) => (
            <div key={n} className={s.pipeRow}>
              <div className={s.pipeNum}>{n}</div>
              <div className={s.pipeName}>{t}()</div>
              <div className={s.pipeDesc}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* §07 PROOF */}
      {/* CC-TODO: Replace placeholder logos and metrics with real content per CLAUDE.md
          "Placeholders that need real data". AJ Milne / Optio Capital testimonial is real and approved. */}
      <section className={s.section}>
        <SectionHeader n="07" title="proof.log" subtitle="structural lifts, not marginal ones" />

        <div className={s.logoStrip}>
          <div className={s.logoLabel}>§ operated_with</div>
          <div className={s.logoRow}>
            <span className={s.logo}>OPTIO CAPITAL</span>
            <span className={s.logoDot}>·</span>
            <span className={s.logo}>MERRICK HOLDINGS</span>
            <span className={s.logoDot}>·</span>
            <span className={s.logo}>WESTFIELD LABS</span>
            <span className={s.logoDot}>·</span>
            <span className={s.logo}>KEEL OPERATIONS</span>
            <span className={s.logoDot}>·</span>
            <span className={s.logo}>TOLLWORTH &amp; CO</span>
          </div>
        </div>

        <div className={s.metricsStrip}>
          <Metric num="+70" suffix="%" meta="throughput uplift" sub="global tech co, one engagement" />
          <Metric num="5" suffix="×" meta="output per human lead" sub="average across units" />
          <Metric num="48" suffix="h" meta="first agent live" sub="after map workshop" />
          <Metric num="0" meta="cognitive layer vendors" sub="we build it, you keep it" />
        </div>

        <div className={s.quoteCard}>
          <div className={s.quoteLabel}>/* testimonial_01 */</div>
          <p className={s.quoteText}>
            &quot;The Polynize team built me an investment analyst agent. On the first day I used
            it, it was the best day of work I&apos;d had in nine months. After that, I knew I
            needed the whole team.&quot;
          </p>
          <div className={s.quoteFoot}>
            <div className={s.quoteAv}>AJ</div>
            <div>
              <div className={s.quoteName}>aj milne</div>
              <div className={s.quoteRole}>
                PARTNER ·{' '}
                <a
                  href="https://www.optio.capital/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  OPTIO CAPITAL
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §08 PODCAST */}
      {/* CC-TODO: Wire real Think Better episodes, swap placeholder copy with RSS pull. */}
      <section className={s.section}>
        <SectionHeader n="08" title="founders.podcast" subtitle="weekly, from the people doing the work" />

        <div className={s.podGrid}>
          <a href="#" className={s.podMeta} style={{ display: 'block' }}>
            <div className={s.podThumb}>
              <div className={s.podWave}>
                {Array.from({ length: 32 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      height: `${20 + Math.sin(i * 0.7) * 50 + (i % 3) * 15}%`,
                      background: i < 10 ? 'var(--mint)' : 'var(--border)',
                    }}
                  />
                ))}
              </div>
              <div className={s.podPlay}>▶</div>
            </div>
            <div className={s.podMeta}>
              <div className={s.podMetaTag}>EP_014 · 42:15 · LATEST</div>
              <div className={s.podMetaTitle}>
                the end of the employee as the unit of work
              </div>
              <div className={s.podMetaDesc}>
                sagar and vas on why the hiring-loop economy is finished, and what replaces it.
                with live reads of two recent heat maps.
              </div>
            </div>
          </a>

          <div className={s.podSide}>
            <a className={s.podCardMini} href="#">
              <div className={s.podMiniTag}>EP_013 · 31:08</div>
              <div className={s.podMiniTitle}>heat maps vs. org charts, a rehearsal</div>
            </a>
            <a className={s.podCardMini} href="#">
              <div className={s.podMiniTag}>EP_012 · 38:44</div>
              <div className={s.podMiniTitle}>why agents hate your kanban board</div>
            </a>
            <a className={s.podCardMini} href="#">
              <div className={s.podMiniTag}>EP_011 · 29:52</div>
              <div className={s.podMiniTitle}>the cognitive work unit, a working definition</div>
            </a>
            <a className={`${s.podCardMini} ${s.podMiniMore}`} href="#">
              $ ls episodes/*.mp3, all_episodes →
            </a>
          </div>
        </div>

        <div className={s.podLinks}>
          <a href="#">YOUTUBE ↗</a>
          <a href="#">SPOTIFY ↗</a>
          <a href="#">APPLE ↗</a>
          <a href="#">RSS ↗</a>
        </div>
      </section>

      {/* §09 FINAL CTA */}
      <section className={s.finalCta}>
        <div className={s.eyebrow}>§09 · next()</div>
        <h2 className={s.finalH1}>
          SEE THE SHAPE OF
          <br />
          YOUR BUSINESS<span style={{ color: 'var(--mint)' }}>.</span>
        </h2>
        <div className={s.ctaRow} style={{ marginTop: 48 }}>
          <TrackedLink
            className={s.ctaPrimary}
            href="/agents"
            event="cta_click"
            eventProps={{ surface: 'home_final_cta', label: 'map_your_business' }}
          >
            <span className={s.ctaArrow}>→</span>map_your_business
          </TrackedLink>
          <span className={s.ctaNote}>$ curl -X POST /agents, 4 min</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={s.footer}>
        <div className={s.footerTop}>
          <div>
            <div className={s.wordmark}>
              <span style={{ color: 'var(--mint)' }}>[</span>polynize
              <span style={{ color: 'var(--text-3)' }}>.ai</span>
              <span style={{ color: 'var(--mint)' }}>]</span>
            </div>
            <p className={s.footerBlurb}>
              the agentic arm of polynize. we design and deploy cognitive work units for small and
              mid-size businesses.
            </p>
          </div>
          <div className={s.footerCols}>
            <FooterCol
              title="~/polynize"
              links={[
                { label: 'polynize.io', href: POLYNIZE_IO, external: true },
                { label: 'enterprise', href: '#' },
                { label: 'brand', href: '/brand' },
              ]}
            />
            <FooterCol
              title="~/social"
              links={[
                { label: 'linkedin', href: '#' },
                { label: 'youtube', href: '#' },
                { label: 'instagram', href: '#' },
                { label: 'tiktok', href: '#' },
              ]}
            />
            <FooterCol
              title="~/contact"
              links={[
                { label: 'hello@polynize.io', href: 'mailto:hello@polynize.io' },
                { label: 'book a call ↗', href: BOOKING_URL, external: true },
              ]}
            />
          </div>
        </div>
        <div className={s.footerBase}>
          <span>© 2026 polynize pty ltd</span>
          <span style={{ color: 'var(--text-3)' }}>// built in sydney</span>
        </div>
      </footer>
    </div>
  );
}

/* ===== Server-component subcomponents (static) ===== */

function EqTerm({
  num,
  label,
  color,
  emph,
}: {
  num: string;
  label: string;
  color: string;
  emph?: boolean;
}) {
  return (
    <div className={s.eqTerm}>
      <div className={s.eqNum} style={{ color, fontSize: emph ? 64 : 56 }}>
        {num}
      </div>
      <div className={s.eqLabel}>{label}</div>
    </div>
  );
}

function SectionHeader({ n, title, subtitle }: { n: string; title: string; subtitle?: string }) {
  return (
    <div className={s.sectHead}>
      <div>
        <div className={s.eyebrow}>§{n}</div>
        <h2 className={s.h2}>{title}</h2>
      </div>
      {subtitle && <div className={s.subtitle}>{subtitle}</div>}
    </div>
  );
}

function ComparisonBar({
  label,
  ratio,
  tone,
}: {
  label: string;
  ratio: number;
  tone: 'mint' | 'gold' | 'muted';
}) {
  const color = tone === 'mint' ? 'var(--mint)' : tone === 'gold' ? 'var(--gold)' : 'var(--text-3)';
  const ticks = 30;
  return (
    <div className={s.barRow}>
      <div className={s.barLabel}>{label}</div>
      <div className={s.barTicks}>
        {Array.from({ length: ticks }).map((_, i) => {
          const lit = i < ratio * ticks;
          return (
            <span
              key={i}
              style={{
                height: lit ? 18 : 6,
                background: lit ? color : 'var(--border-soft)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function CWUTable() {
  const ROWS: [string, string, string, string][] = [
    ['humans', '1', 'judgment, accountability, live decisions', 'var(--gold)'],
    ['agents', '4', 'execution, research, follow-through', 'var(--mint)'],
    ['outcome', '1', 'the real thing the unit exists for', 'var(--blue)'],
    ['throughput', '≈5×', 'vs traditional team structures', 'var(--text)'],
  ];
  return (
    <div>
      {ROWS.map(([k, v, d, c]) => (
        <div key={k} className={s.cwuRow}>
          <div className={s.cwuKey}>{k}</div>
          <div className={s.cwuVal} style={{ color: c }}>
            {v}
          </div>
          <div className={s.cwuDesc}>{d}</div>
        </div>
      ))}
    </div>
  );
}

function Artifact({ k, name, body }: { k: string; name: string; body: string }) {
  return (
    <div className={s.artifact}>
      <div className={s.artifactKey}>&gt;_ {k}</div>
      <div className={s.artifactName}>{name}</div>
      <p className={s.artifactBody}>{body}</p>
    </div>
  );
}

function Metric({
  num,
  suffix,
  meta,
  sub,
}: {
  num: string;
  suffix?: string;
  meta: string;
  sub: string;
}) {
  return (
    <div className={s.metric}>
      <div className={s.metricNum}>
        {num}
        {suffix && <span className={s.muted}>{suffix}</span>}
      </div>
      <div className={s.metricMeta}>
        {meta}
        <br />
        <span className={s.muted}>{sub}</span>
      </div>
    </div>
  );
}

type FooterLink = { label: string; href: string; external?: boolean };

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className={s.footerCol}>
      <div className={s.footerColTitle}>{title}/</div>
      {links.map((l) => (
        <a
          key={l.label}
          className={s.footerLink}
          href={l.href}
          {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
