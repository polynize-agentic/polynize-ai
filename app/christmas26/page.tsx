/**
 * /christmas26: the invite page for the Polynize Christmas Party, 17 December 2026 (D128).
 *
 * Built from Evelyn's brief of 24 November 2026. About 30 guests open it on a phone from a
 * personal message. It is private: kept on polynize.ai by middleware.ts (D127 sends every other
 * page to polynize.io), `noindex, nofollow` here and site-wide, and linked from nowhere.
 *
 * The look copies polynize.io (black, Inter, mint, the amber-to-mint cohort curve under a dashed
 * gold benchmark), because that is the public site guests know. The tree is that curve.
 *
 * `?n=Stuart` greets Stuart and fills in his name. `?test=1` marks replies as tests.
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import s from './christmas26.module.css';
import { CurveTree } from './CurveTree';
import { CalendarButtons } from './CalendarButtons';
import { RsvpClosed, RsvpForm } from './RsvpForm';
import { GETTING_THERE, GOOD_TO_KNOW, type InfoRow } from './content';
import { EVENT, OG_IMAGE_URL, PAGE_URL, isRsvpOpen, linkNameFrom } from '@/lib/christmas26/event';

/** polynize.io sets its headings in Inter 700 and its buttons in 600; the root layout loads 400 and 500 only. */
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' });

const OG_DESCRIPTION = 'Thursday 17 December, 6pm to 9pm, Commons Bar, Melbourne. From Shourov and Marrs.';

export const metadata: Metadata = {
  title: { absolute: EVENT.title },
  description: OG_DESCRIPTION,
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'Polynize',
    title: EVENT.title,
    description: OG_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Polynize Christmas Party: a Christmas tree drawn as a performance curve.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: EVENT.title,
    description: OG_DESCRIPTION,
    images: [OG_IMAGE_URL],
  },
};

/** The page reads `?n=` and the clock (replies close after 27 November), so it renders per request. */
export const dynamic = 'force-dynamic';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function Rows({ rows }: { rows: InfoRow[] }) {
  return (
    <dl className={s.card}>
      {rows.map((row) => (
        <div key={row.label} className={s.row}>
          <dt className={s.rowLabel}>{row.label}</dt>
          <dd className={s.rowValue}>
            {row.text}
            {row.email && (
              <>
                Email <a href={`mailto:${row.email}`}>{row.email}</a>.
              </>
            )}
            {row.pending && <span className={s.pending}>{row.pending}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function Christmas26Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const linkName = linkNameFrom(params.n);
  const test = params.test === '1';
  const open = isRsvpOpen();

  const details: InfoRow[] = [
    { label: 'Date', text: EVENT.dateLabel },
    { label: 'Time', text: EVENT.timeLabel },
    { label: 'Place', text: EVENT.placeLabel },
    { label: "What's on", text: EVENT.whatsOn },
  ];

  return (
    <div className={`${inter.className} ${s.page}`}>
      {test && (
        <p className={s.testBanner}>Test mode. Replies sent from this page have &quot;TEST&quot; at the start of the email subject.</p>
      )}

      <header className={s.header}>
        <Image
          src="/assets/logo-text-white.png"
          alt="Polynize"
          width={4373}
          height={1196}
          className={s.logo}
          sizes="120px"
          priority
        />
        <a href="#rsvp" className={s.headerLink}>
          RSVP
        </a>
      </header>

      <main>
        <section className={s.hero}>
          <div className={s.heroText}>
            {linkName && <p className={s.greeting}>Dear {linkName},</p>}
            <h1 className={s.title}>
              <span className={s.titleLead}>Polynize</span> <span className={s.titleAccent}>Christmas Party</span>
            </h1>
            <p className={s.lede}>
              Shourov and Marrs invite you to a night to thank the people who have been pivotal in getting Polynize
              where it is today.
            </p>
          </div>
          <figure className={s.treeFigure}>
            <CurveTree />
            <figcaption className={s.tieIn}>
              Every performance curve has people behind it. Thank you for being part of ours.
            </figcaption>
          </figure>
        </section>

        <section className={s.section} aria-labelledby="xmas-details">
          <h2 id="xmas-details" className={s.h2}>
            The <strong>details</strong>
          </h2>
          <div className={s.rule} aria-hidden="true" />
          <Rows rows={details} />
          <CalendarButtons directions />
        </section>

        <section className={s.section} aria-labelledby="xmas-getting-there">
          <h2 id="xmas-getting-there" className={s.h2}>
            Getting <strong>there</strong>
          </h2>
          <div className={s.rule} aria-hidden="true" />
          <Rows rows={GETTING_THERE} />
        </section>

        <section className={s.section} aria-labelledby="xmas-good-to-know">
          <h2 id="xmas-good-to-know" className={s.h2}>
            Good to <strong>know</strong>
          </h2>
          <div className={s.rule} aria-hidden="true" />
          <Rows rows={GOOD_TO_KNOW} />
        </section>

        <section id="rsvp" className={s.section} aria-labelledby="xmas-rsvp">
          <h2 id="xmas-rsvp" className={s.h2}>
            Will you <strong>join us?</strong>
          </h2>
          <div className={s.rule} aria-hidden="true" />
          {open ? (
            <>
              <p className={s.rsvpSub}>Please reply by Friday 27 November.</p>
              <RsvpForm linkName={linkName} test={test} />
            </>
          ) : (
            <RsvpClosed />
          )}
        </section>
      </main>

      <footer className={s.footer}>
        <p className={s.thanks}>With thanks, Shourov Bhattacharya and Marrs Coiro, co-founders of Polynize.</p>
        <Image
          src="/assets/logo-text-white.png"
          alt="Polynize"
          width={4373}
          height={1196}
          className={s.footerLogo}
          sizes="140px"
        />
      </footer>
    </div>
  );
}
