import Link from 'next/link';
import s from './_home/home.module.css';
import { CapabilityMapPreview } from './_home/CapabilityMapPreview';
import { TrackedLink } from './_components/TrackedLink';

const BOOKING_URL = 'https://calendly.com/marrscoiro/meeting30';
const POLYNIZE_IO = 'https://polynize.io';
const YOUTUBE_CHANNEL = 'https://www.youtube.com/@polynize.agentic';

export const metadata = {
  title: 'polynize.ai · map your bottleneck',
  description:
    "We take the one thing choking your business, decompose it into capabilities, and design a small team of agents to handle the parts a person doesn't need to.",
};

export default function HomePage() {
  return (
    <div className={s.dirC}>
      {/* ===== NAV ===== */}
      <nav className={s.dcNav}>
        <Link className={s.dcWordmark} href="/">
          <span className={s.dcMark} aria-hidden />
          <span>
            polynize<span style={{ color: 'var(--text-3)' }}>.ai</span>
          </span>
        </Link>
        <div className={s.dcNavLinks}>
          <Link href="/">Home</Link>
          <Link href="/agents">Map Your Bottleneck</Link>
          <Link href="/brand">Brand</Link>
          <Link href="/console">Console</Link>
        </div>
        <TrackedLink
          className={`${s.dcBtn} ${s.dcBtnGhost}`}
          href={BOOKING_URL}
          external
          event="booking_click"
          eventProps={{ surface: 'home_nav' }}
        >
          Talk to the Team <span className={s.dcArr}>→</span>
        </TrackedLink>
      </nav>

      {/* ===== HERO ===== */}
      <section className={s.dcHero}>
        <h1 className={s.dcH1}>
          Map your business problem
          <br />
          <span className={s.dcMintEmph}>into an agent team.</span>
        </h1>
        <p className={s.dcLede}>
          We take the one thing choking your business, decompose it into capabilities, and
          design a small team of agents to handle the parts a person doesn&apos;t need to.
          What stays human, what becomes hybrid, what an agent can run end&#8209;to&#8209;end,
          colour&#8209;coded, in a single map.
        </p>

        <div className={s.dcEquation}>
          <div className={`${s.dcEqCard} ${s.dcEqCardGold}`}>
            <div className={s.dcEqNum}>1</div>
            <div className={s.dcEqMeta}>
              <div className={s.dcEqLabel}>Human</div>
              <div className={s.dcEqSub}>You, accountable.</div>
            </div>
          </div>
          <div className={s.dcEqPlus}>+</div>
          <div className={`${s.dcEqCard} ${s.dcEqCardMint}`}>
            <div className={s.dcEqNum}>4</div>
            <div className={s.dcEqMeta}>
              <div className={s.dcEqLabel}>Agents</div>
              <div className={s.dcEqSub}>One team. Yours.</div>
            </div>
          </div>
          <div className={s.dcEqPlus}>=</div>
          <div className={`${s.dcEqCard} ${s.dcEqCardOut}`}>
            <div className={s.dcEqNum}>5×</div>
            <div className={s.dcEqMeta}>
              <div className={s.dcEqLabel}>Throughput</div>
              <div className={s.dcEqSub}>Same headcount.</div>
            </div>
          </div>
        </div>

        <div className={s.dcCtaRow}>
          <TrackedLink
            className={`${s.dcBtn} ${s.dcBtnPrimary}`}
            href="/agents"
            event="cta_click"
            eventProps={{ surface: 'home_hero', label: 'map_your_bottleneck' }}
          >
            Map Your Bottleneck <span className={s.dcArr}>→</span>
          </TrackedLink>
          <TrackedLink
            className={`${s.dcBtn} ${s.dcBtnSecondary}`}
            href={BOOKING_URL}
            external
            event="booking_click"
            eventProps={{ surface: 'home_hero' }}
          >
            Talk to the Team
          </TrackedLink>
        </div>
      </section>

      {/* ===== CAPABILITY MAP HERO ===== */}
      <section className={s.dcMapHero}>
        <div className={s.dcSectionHead}>
          <div className={s.dcSectionEyebrow}>The capability map</div>
          <h2 className={s.dcH2}>
            See your bottleneck,
            <br />
            <span className={s.dcMintEmph}>colour&#8209;coded.</span>
          </h2>
          <p className={s.dcSectionLede}>
            Every row is a real capability inside the work that&apos;s choking you. Coral stays
            human. Amber becomes hybrid. Mint becomes fully agent&#8209;executable. One map. No
            ambiguity about who does what.
          </p>
        </div>

        <CapabilityMapPreview />

        <div className={s.dcMidCta}>
          <div>
            <div className={s.dcMidCtaTitle}>Get your capability map.</div>
            <div className={s.dcMidCtaSub}>
              A capability map of your real bottleneck, in days, not weeks.
            </div>
          </div>
          <TrackedLink
            className={`${s.dcBtn} ${s.dcBtnPrimary}`}
            href="/agents"
            event="cta_click"
            eventProps={{ surface: 'home_mid_cta', label: 'map_your_bottleneck' }}
          >
            Map Your Bottleneck <span className={s.dcArr}>→</span>
          </TrackedLink>
        </div>
      </section>

      {/* ===== HIRING COMPARISON ===== */}
      <section className={s.dcSection}>
        <div className={s.dcSectionHead}>
          <div className={s.dcSectionEyebrow}>The cost difference</div>
          <h2 className={s.dcH2}>
            Two analysts, or
            <br />
            <span className={s.dcMintEmph}>a team you own.</span>
          </h2>
          <p className={s.dcSectionLede}>
            Solving the bottleneck above with traditional hiring means roughly two FTE. Or you can
            stand up the agent team for the build cost of one quarter&apos;s salary, and run it for
            less than a single junior monthly.
          </p>
        </div>

        <div className={s.dcHiring}>
          <div className={s.dcHiringCards}>
            <div className={`${s.dcHiringCard} ${s.dcHiringCardOld}`}>
              <span className={`${s.dcHiringTag} ${s.dcHiringTagOld}`}>Traditional hiring</span>
              <div className={s.dcHiringHeadline}>Hire an analyst + a coordinator</div>
              <div className={`${s.dcHiringPrice} ${s.dcHiringPriceStrike}`}>
                $130,000<span className={s.dcHiringPriceUnit}> AUD / year</span>
              </div>
              <ul className={s.dcHiringList}>
                <li>3 to 6 months to find, hire, ramp</li>
                <li>Salary, oncosts, leave, equipment</li>
                <li>Management overhead and review loops</li>
                <li>You stay the constraint on every decision</li>
              </ul>
            </div>

            <div className={s.dcHiringArrowWrap}>
              <div className={s.dcHiringArrowTrack} />
              <div className={s.dcHiringArrowHead}>→</div>
            </div>

            <div className={`${s.dcHiringCard} ${s.dcHiringCardNew}`}>
              <span className={`${s.dcHiringTag} ${s.dcHiringTagNew}`}>Polynize agent team</span>
              <div className={s.dcHiringHeadline}>Map, Transform, Operate</div>
              <div className={s.dcHiringPrice}>
                <span className={s.dcHiringPriceBuildSub}>BUILD</span>
                <span className={s.dcHiringPriceBuild}>$15,000</span>
                <span className={s.dcHiringPriceDivider}>·</span>
                <span className={s.dcHiringPriceMrr}>$999</span>
                <span className={s.dcHiringPriceUnit}>/mo</span>
              </div>
              <ul className={s.dcHiringList}>
                <li>Capability map of your bottleneck in days</li>
                <li>4 agents designed, built, trained in your voice</li>
                <li>Tuned monthly, you stay the human at the centre</li>
                <li>No recruiting, no onboarding, no leave cover</li>
              </ul>
            </div>
          </div>

          <div className={s.dcHiringCta}>
            <div>
              <div className={s.dcHiringCtaEyebrow}>Ready to compare for your business?</div>
              <div className={s.dcHiringCtaTitle}>
                Map your bottleneck, see the real numbers for your team.
              </div>
            </div>
            <TrackedLink
              className={`${s.dcBtn} ${s.dcBtnPrimary}`}
              href="/agents"
              event="cta_click"
              eventProps={{ surface: 'home_hiring_cta', label: 'map_your_bottleneck' }}
            >
              Map Your Bottleneck <span className={s.dcArr}>→</span>
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* ===== RESULTS / QUOTE ===== */}
      <section className={s.dcSection}>
        <div className={s.dcSectionHead}>
          <div className={s.dcSectionEyebrow}>What clients say</div>
          <h2 className={s.dcH2}>
            The kind of result that makes
            <br />
            you build the rest of the team.
          </h2>
        </div>

        <div className={s.dcQuoteCard}>
          <div className={s.dcQuoteStrip} />
          <div className={s.dcQuoteMark}>&ldquo;</div>
          <p className={s.dcQuoteText}>
            The Polynize team built me an investment analyst agent. On the first day I used it,
            it was the best day of work I&apos;d had in nine months. After that, I knew I needed
            the whole team.
          </p>
          <div className={s.dcQuoteAttr}>
            <div className={s.dcQuoteAv} aria-label="AJ Milne">
              AJ
            </div>
            <div>
              <div className={s.dcQuoteName}>AJ Milne</div>
              <div className={s.dcQuoteRole}>Partner, Optio Capital</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW WE WORK ===== */}
      <section className={s.dcSection}>
        <div className={s.dcSectionHead}>
          <div className={s.dcSectionEyebrow}>How we work</div>
          <h2 className={s.dcH2}>
            From a problem you can name
            <br />
            to a team that solves it.
          </h2>
        </div>

        <div className={`${s.dcHowGrid} ${s.dcHowGrid3}`}>
          <HowCard
            n="01"
            t="Map"
            d="We sit with you and decompose your bottleneck into the capabilities inside it. Every one gets allocated: human, hybrid, or agent."
            icon="map"
            priceK="from"
            priceV="$5,000"
            priceSub="AUD · capability map + team design"
          />
          <HowCard
            n="02"
            t="Transform"
            d="We design and engineer the agent team. Connectors, handoffs, human touchpoints. First agent live in 48 hours, on average."
            icon="build"
            priceK="from"
            priceV="$10,000"
            priceSub="AUD · build, train, deploy"
          />
          <HowCard
            n="03"
            t="Operate"
            d="We run the team alongside you and tune it as the work shifts. You stay the accountable human at the centre. We carry the rest."
            icon="operate"
            priceK="from"
            priceV="$999"
            priceSub="AUD / month · ongoing operation"
          />
        </div>
      </section>

      {/* ===== PODCAST ===== */}
      <section className={s.dcSection}>
        <div className={s.dcSectionHead}>
          <div className={s.dcSectionEyebrow}>From the founders</div>
          <h2 className={s.dcH2}>
            Think Better.
            <br />
            <span className={s.dcText3}>Marrs Coiro &amp; Shourov Bhattacharya, weekly.</span>
          </h2>
        </div>

        <div className={s.dcPodGrid}>
          <TrackedLink
            className={s.dcPodFeat}
            href={YOUTUBE_CHANNEL}
            external
            event="cta_click"
            eventProps={{ surface: 'home_podcast', label: 'youtube_channel' }}
            aria-label="Watch Think Better Podcast on YouTube"
          >
            <div className={s.dcPodThumb}>
              <div className={s.dcPodWave} aria-hidden>
                {Array.from({ length: 36 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      height: `${22 + Math.sin(i * 0.55) * 38 + (i % 4) * 9}%`,
                      background: i < 12 ? 'var(--mint)' : 'rgba(244,236,228,0.16)',
                    }}
                  />
                ))}
              </div>
              <div className={s.dcPodPlay} aria-hidden>
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              </div>
              <div className={s.dcPodRuntime}>42:15</div>
            </div>
            <div className={s.dcPodMeta}>
              <div className={s.dcPodTag}>Latest · Episode 14</div>
              <div className={s.dcPodTitle}>The end of the employee as the unit of work</div>
              <div className={s.dcPodDesc}>
                Marrs and Shourov on why the hiring loop is finished, and what replaces it. Two
                live capability maps, read on air.
              </div>
            </div>
          </TrackedLink>

          <div className={s.dcPodSide}>
            <PodMini ep="13" run="31:08" t="Capability maps vs. org charts, a rehearsal" />
            <PodMini ep="12" run="38:44" t="Why agents hate your kanban board" />
            <PodMini ep="11" run="29:52" t="The cognitive work unit, a working definition" />
            <TrackedLink
              className={s.dcPodAll}
              href={YOUTUBE_CHANNEL}
              external
              event="cta_click"
              eventProps={{ surface: 'home_podcast', label: 'youtube_all_episodes' }}
            >
              All episodes <span className={s.dcArr}>→</span>
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className={s.dcFinal}>
        <div className={s.dcFinalCard}>
          <div className={s.dcFinalStrip} />
          <div className={s.dcSectionEyebrow}>Ready when you are</div>
          <h2 className={s.dcFinalTitle}>
            Your bottleneck
            <br />
            won&apos;t map itself.
          </h2>
          <p className={s.dcFinalLede}>
            Forty minutes with us. A capability map of the one thing slowing you down. A team you
            could actually run.
          </p>
          <div className={s.dcCtaRow} style={{ justifyContent: 'center' }}>
            <TrackedLink
              className={`${s.dcBtn} ${s.dcBtnPrimary}`}
              href="/agents"
              event="cta_click"
              eventProps={{ surface: 'home_final_cta', label: 'map_your_bottleneck' }}
            >
              Map Your Bottleneck <span className={s.dcArr}>→</span>
            </TrackedLink>
            <TrackedLink
              className={`${s.dcBtn} ${s.dcBtnSecondary}`}
              href={BOOKING_URL}
              external
              event="booking_click"
              eventProps={{ surface: 'home_final_cta' }}
            >
              Talk to the Team
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className={s.dcFooter}>
        <div className={s.dcFooterTop}>
          <div>
            <Link className={s.dcWordmark} href="/" style={{ marginBottom: 16 }}>
              <span className={s.dcMark} aria-hidden />
              <span>
                polynize<span style={{ color: 'var(--text-3)' }}>.ai</span>
              </span>
            </Link>
            <p className={s.dcFooterBlurb}>
              The agentic arm of polynize. We map the bottleneck choking your business and design
              the agent team to solve it.
            </p>
          </div>
          <div className={s.dcFooterCols}>
            <FootCol
              title="Polynize"
              links={[
                ['polynize.io', POLYNIZE_IO, true],
                ['Brand', '/brand', false],
                ['Console', '/console', false],
              ]}
            />
            <FootCol
              title="Social"
              links={[
                ['YouTube', YOUTUBE_CHANNEL, true],
                ['LinkedIn', 'https://www.linkedin.com/company/polynize', true],
              ]}
            />
            <FootCol
              title="Contact"
              links={[
                ['hello@polynize.ai', 'mailto:hello@polynize.ai', true],
                ['Book a call ↗', BOOKING_URL, true],
              ]}
            />
          </div>
        </div>
        <div className={s.dcFooterBase}>
          <span>© 2026 Polynize Pty Ltd</span>
          <span className={s.dcText3}>Built in Sydney</span>
        </div>
      </footer>
    </div>
  );
}

function HowCard({
  n,
  t,
  d,
  priceK,
  priceV,
  priceSub,
}: {
  n: string;
  t: string;
  d: string;
  icon: 'map' | 'build' | 'operate';
  priceK: string;
  priceV: string;
  priceSub: string;
}) {
  return (
    <div className={s.dcHowCard}>
      <div className={s.dcHowNum}>{n}</div>
      <div className={s.dcHowTitle}>{t}</div>
      <div className={s.dcHowDesc}>{d}</div>
      <div className={s.dcHowPrice}>
        <div className={s.dcHowPriceK}>{priceK}</div>
        <div className={s.dcHowPriceV}>
          {priceV} <small>{priceSub}</small>
        </div>
      </div>
    </div>
  );
}

function PodMini({ ep, run, t }: { ep: string; run: string; t: string }) {
  return (
    <a className={s.dcPodMini} href={YOUTUBE_CHANNEL} target="_blank" rel="noopener noreferrer">
      <div className={s.dcPodMiniMeta}>
        Ep {ep} · {run}
      </div>
      <div className={s.dcPodMiniTitle}>{t}</div>
    </a>
  );
}

function FootCol({
  title,
  links,
}: {
  title: string;
  links: [string, string, boolean][];
}) {
  return (
    <div>
      <div className={s.dcFootH}>{title}</div>
      {links.map(([label, href, external]) =>
        external ? (
          <a key={label} className={s.dcFootL} href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ) : (
          <Link key={label} className={s.dcFootL} href={href}>
            {label}
          </Link>
        )
      )}
    </div>
  );
}
