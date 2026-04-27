import Link from 'next/link';
import s from './_home/home.module.css';
import { CapabilityMapPreview } from './_home/CapabilityMapPreview';
import { TrackedLink } from './_components/TrackedLink';

const BOOKING_URL = 'https://calendly.com/marrscoiro/meeting30';
const POLYNIZE_IO = 'https://polynize.io';
const YOUTUBE_CHANNEL = 'https://www.youtube.com/@polynize.agentic';
const SPOTIFY_URL = 'https://open.spotify.com/show/polynize';
const APPLE_PODCASTS_URL = 'https://podcasts.apple.com/au/podcast/polynize';
const RSS_URL = '/podcast.rss';
const LINKEDIN_URL = 'https://www.linkedin.com/company/polynize';
const INSTAGRAM_URL = 'https://www.instagram.com/polynize.ai';

export const metadata = {
  title: 'polynize.ai · map your bottleneck',
  description:
    "We take the one thing choking your business, decompose it into capabilities, and design a small team of agents to handle the parts a person doesn't need to.",
};

/**
 * Homepage — Direction C, ported verbatim from
 * design_handoff/designs/Homepage_v2.html. Section order, copy, classnames,
 * and DOM structure follow the design's DirC component tree exactly. Only
 * non-design additions: the TrackedLink wrapper around every CTA so analytics
 * keep firing, and resolved hrefs in place of the design's `#` placeholders.
 */
export default function HomePage() {
  return (
    <div className={s.dirC}>
      <DirCNav />
      <DirCHero />
      <DirCMapHero />
      <DirCResults />
      <DirCHow />
      <DirCPodcast />
      <DirCFinal />
      <DirCFooter />
    </div>
  );
}

/* ---------- Nav ---------- */

function DirCNav() {
  return (
    <nav className={s.dcNav}>
      <Link className={s.dcWordmark} href="/">
        <span className={s.dcMark} aria-hidden>
          {/* Drop /public/assets/polynize-mark.gif to upgrade to the
              animated mark; .png is the static fallback shipped today. */}
          <img src="/assets/polynize-mark.png" alt="" />
        </span>
        <span>
          polynize<span style={{ color: 'var(--text-3)' }}>.ai</span>
        </span>
      </Link>
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
  );
}

/* ---------- Hero ---------- */

function DirCHero() {
  return (
    <section className={s.dcHero}>
      <h1 className={s.dcH1}>
        Map your business problem
        <br />
        <span className={s.dcMintEmph}>into an agent team.</span>
      </h1>
      <p className={s.dcLede}>
        We take the one thing choking your business, decompose it into capabilities, and design a
        small team of agents to handle the parts a person doesn&apos;t need to. What stays human,
        what becomes hybrid, what an agent can run end&#8209;to&#8209;end, colour&#8209;coded, in
        a single map.
      </p>

      <div className={`${s.dcEquation} ${s.reveal}`}>
        <div className={`${s.dcEqCard} ${s.dcEqCardGold}`}>
          <div className={s.dcEqNum}>1</div>
          <div className={s.dcEqMeta}>
            <div className={s.dcEqLabel}>Human</div>
          </div>
        </div>
        <div className={s.dcEqPlus}>+</div>
        <div className={`${s.dcEqCard} ${s.dcEqCardMint}`}>
          <div className={s.dcEqNum}>4</div>
          <div className={s.dcEqMeta}>
            <div className={s.dcEqLabel}>Agents</div>
          </div>
        </div>
        <div className={s.dcEqPlus}>=</div>
        <div className={`${s.dcEqCard} ${s.dcEqCardOut}`}>
          <div className={s.dcEqNum}>5×</div>
          <div className={s.dcEqMeta}>
            <div className={s.dcEqLabel}>Throughput</div>
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
  );
}

/* ---------- Capability map hero ---------- */

function DirCMapHero() {
  return (
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
        <div className={s.dcMidCtaText}>
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
  );
}

/* ---------- Results / quote ---------- */

function DirCResults() {
  return (
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
          The Polynize team built me an investment analyst agent. On the first day I used it, it
          was the best day of work I&apos;d had in nine months. After that, I knew I needed the
          whole team.
        </p>
        <div className={s.dcQuoteAttr}>
          <div className={s.dcQuoteAv} aria-label="AJ Milne" />
          <div>
            <div className={s.dcQuoteName}>AJ Milne</div>
            <div className={s.dcQuoteRole}>Partner, Optio Capital</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- How we work ---------- */

const HOW_STEPS = [
  {
    n: '01',
    t: 'Map',
    icon: 'map' as const,
    d: 'We sit with you and decompose your bottleneck into the capabilities inside it. Every one gets allocated: human, hybrid, or agent.',
  },
  {
    n: '02',
    t: 'Transform',
    icon: 'build' as const,
    d: 'We design and engineer the agent team. Connectors, handoffs, human touchpoints. First agent live in 48 hours, on average.',
  },
  {
    n: '03',
    t: 'Operate',
    icon: 'operate' as const,
    d: 'We run the team alongside you and tune it as the work shifts. You stay the accountable human at the centre. We carry the rest.',
  },
];

function DirCHow() {
  return (
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
        {HOW_STEPS.map((step) => (
          <div key={step.n} className={s.dcHowCard}>
            <div className={s.dcHowNum}>{step.n}</div>
            <div className={s.dcHowIcon}>
              <HowIcon kind={step.icon} />
            </div>
            <div className={s.dcHowTitle}>{step.t}</div>
            <div className={s.dcHowDesc}>{step.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowIcon({ kind }: { kind: 'map' | 'build' | 'operate' }) {
  const props = {
    width: 28,
    height: 28,
    viewBox: '0 0 28 28',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (kind === 'map') {
    return (
      <svg {...props}>
        <rect x="3" y="5" width="22" height="18" rx="1" />
        <path d="M3 11h22M3 17h22M11 5v18M19 5v18" />
        <rect x="11" y="11" width="8" height="6" fill="currentColor" opacity=".15" />
      </svg>
    );
  }
  if (kind === 'build') {
    return (
      <svg {...props}>
        <path d="M5 23l6-6" />
        <path d="M11 17l4 4 8-8-4-4z" />
        <path d="M15 13l4 4" />
        <circle cx="6.5" cy="21.5" r="1.5" />
      </svg>
    );
  }
  // operate (clock)
  return (
    <svg {...props}>
      <circle cx="14" cy="14" r="9" />
      <path d="M14 8v6l4 2" />
    </svg>
  );
}

/* ---------- Podcast ---------- */

function DirCPodcast() {
  return (
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
          aria-label="Watch Think Better Podcast Episode 14 on YouTube"
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
              ▶
            </div>
            <div className={s.dcPodRuntime}>42:15</div>
          </div>
          <div className={s.dcPodMeta}>
            <div className={s.dcPodTag}>Latest · Episode 14</div>
            <div className={s.dcPodTitle}>The end of the employee as the unit of work</div>
            <div className={s.dcPodDesc}>
              Marrs and Shourov on why the hiring loop is finished, and what replaces it. Two live
              capability maps, read on air.
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
            eventProps={{ surface: 'home_podcast', label: 'all_episodes' }}
          >
            All episodes <span className={s.dcArr}>→</span>
          </TrackedLink>
        </div>
      </div>

      <div className={s.dcPodPlatforms}>
        <a href={YOUTUBE_CHANNEL} target="_blank" rel="noopener noreferrer">
          YouTube ↗
        </a>
        <a href={SPOTIFY_URL} target="_blank" rel="noopener noreferrer">
          Spotify ↗
        </a>
        <a href={APPLE_PODCASTS_URL} target="_blank" rel="noopener noreferrer">
          Apple Podcasts ↗
        </a>
        <a href={RSS_URL}>RSS ↗</a>
      </div>
    </section>
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

/* ---------- Final CTA ---------- */

function DirCFinal() {
  return (
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
  );
}

/* ---------- Footer ---------- */

function DirCFooter() {
  return (
    <footer className={s.dcFooter}>
      <div className={s.dcFooterTop}>
        <div>
          <Link className={s.dcWordmark} href="/" style={{ marginBottom: 16 }}>
            <span className={s.dcMark} aria-hidden>
              <img src="/assets/polynize-mark.png" alt="" />
            </span>
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
              ['LinkedIn', LINKEDIN_URL, true],
              ['YouTube', YOUTUBE_CHANNEL, true],
              ['Instagram', INSTAGRAM_URL, true],
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
  );
}

function FootCol({ title, links }: { title: string; links: [string, string, boolean][] }) {
  return (
    <div>
      <div className={s.dcFootH}>{title}</div>
      {links.map(([label, href, external]) =>
        external ? (
          <a
            key={label}
            className={s.dcFootL}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
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
