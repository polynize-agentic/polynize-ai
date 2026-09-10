import type { Metadata } from 'next';
import Link from 'next/link';
import { DraftingGrid } from '@/app/_components/DraftingGrid';
import { listPublishedLearningCards } from '@/lib/marketing/learning-store';
import s from './library.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'library · polynize.ai',
  description: 'The Polynize content library of core learnings: what we learn in real work with teams, written up so you can use it.',
  openGraph: {
    title: 'The Polynize library',
    description: 'What we learn in real work with teams, written up so you can use it.',
    url: 'https://polynize.ai/library',
    siteName: 'polynize.ai',
    type: 'website',
  },
  twitter: { card: 'summary' },
};

/**
 * THE PUBLIC LIBRARY (D115). Every published learning, newest first. Marrs: "the article goes
 * directly to polynize.ai/library... publicly, library sounds a bit better than learnings."
 */
export default async function LibraryPage() {
  const cards = await listPublishedLearningCards().catch(() => []);
  return (
    <>
      <DraftingGrid />
      <main className={s.page}>
        <div className={s.eyebrow}>
          <Link href="/">polynize.ai</Link> · library
        </div>
        <h1 className={s.h1}>Core learnings</h1>
        <p className={s.lede}>
          What we learn in real work with teams, written up so you can use it. One idea per piece.
        </p>
        {cards.length === 0 ? (
          <p className={s.empty}>The first learnings are being written. Come back soon.</p>
        ) : (
          <div className={s.list}>
            {cards.map((c) => (
              <Link key={c.id} href={`/library/${c.slug}`} className={s.card}>
                <h2 className={s.cardTitle}>{c.title}</h2>
                {c.learning ? <p className={s.cardLearning}>{c.learning}</p> : null}
                {c.published_at ? <p className={s.cardMeta}>{c.published_at.slice(0, 10)}</p> : null}
              </Link>
            ))}
          </div>
        )}
        <p className={s.foot}>
          <Link href="/map-your-team">Map your team</Link> · <Link href="/job-mapping">Map a role</Link>
        </p>
      </main>
    </>
  );
}
