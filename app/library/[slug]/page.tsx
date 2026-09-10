import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DraftingGrid } from '@/app/_components/DraftingGrid';
import { getPublishedLearningBySlug, learningTitle, learningBody } from '@/lib/marketing/learning-store';
import { findUseCase } from '@/lib/marketing/use-case';
import s from '../library.module.css';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const l = await getPublishedLearningBySlug(slug);
  if (!l) return { title: 'library · polynize.ai' };
  const title = learningTitle(l.article);
  const description = l.learning || learningBody(l.article).split('\n')[0]?.slice(0, 200) || '';
  return {
    title: `${title} · polynize.ai`,
    description,
    openGraph: {
      title,
      description,
      url: `https://polynize.ai/library/${l.slug}`,
      siteName: 'polynize.ai',
      type: 'article',
      ...(l.hero_url ? { images: [{ url: l.hero_url }] } : {}),
    },
    twitter: { card: l.hero_url ? 'summary_large_image' : 'summary' },
  };
}

/**
 * ONE LEARNING, PUBLIC (D115). The article as written in the console, its image, and one thing to do
 * next: the use case's magnet. This page is where every post cut from the learning links, so the
 * attribution cookie the link sets on the way in is what the magnet's lead is later joined to.
 * `source` and `raw` never render here: they can name a client.
 */
export default async function LearningPublicPage({ params }: Props) {
  const { slug } = await params;
  const l = await getPublishedLearningBySlug(slug);
  if (!l) notFound();
  const title = learningTitle(l.article);
  const paragraphs = learningBody(l.article)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
  const uc = findUseCase(l.use_case);
  const cta = uc
    ? { title: uc.magnet ? `Try ${uc.magnet}` : uc.label, text: uc.hint, href: uc.landing }
    : { title: 'Map your team', text: 'Eight questions about your business, and a picture of where the work really sits.', href: '/map-your-team' };

  return (
    <>
      <DraftingGrid />
      <main className={s.page}>
        <div className={s.eyebrow}>
          <Link href="/">polynize.ai</Link> · <Link href="/library">library</Link>
        </div>
        <h1 className={s.h1}>{title}</h1>
        {l.learning ? <p className={s.lede}>{l.learning}</p> : null}
        {l.published_at ? <p className={s.meta}>{l.published_at.slice(0, 10)} · polynize</p> : null}
        {l.hero_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={l.hero_url} alt="" className={s.hero} />
        ) : null}
        <article className={s.body}>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
        <aside className={s.cta}>
          <h2 className={s.ctaTitle}>{cta.title}</h2>
          <p className={s.ctaText}>{cta.text}</p>
          <Link href={cta.href} className={s.ctaBtn}>
            Start →
          </Link>
        </aside>
        <p className={s.foot}>
          <Link href="/library">← All learnings</Link>
        </p>
      </main>
    </>
  );
}
