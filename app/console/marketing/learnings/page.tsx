import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/console-auth';
import { listLearningCards, type LearningCard } from '@/lib/marketing/learning-store';
import { labelForUseCase } from '@/lib/marketing/use-case';
import { BackLink } from '@/app/console/marketing/_components/BackLink';
import s from '../../_components/client-card.module.css';
import m from './learnings.module.css';

export const dynamic = 'force-dynamic';

/**
 * THE LEARNINGS LIBRARY (D115). Every core learning the company has collected, newest first, with
 * whether it is live on polynize.ai/library and how many Stories were made from it. Marrs: "When you
 * click 'Learnings Library' in the dashboard, it takes you to that page, and it shows you all the
 * different learnings. You can click on it, read it, and create content from that."
 *
 * Company-wide, not per board: a learning is Polynize's the moment it is written.
 */
export default async function LearningsLibraryPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.scope.type === 'client') redirect(`/console/${user.scope.slug}/blueprint`);

  let cards: LearningCard[] = [];
  try {
    cards = await listLearningCards();
  } catch (err) {
    console.error('[learnings] list failed:', err);
  }
  const live = cards.filter((c) => c.published_at).length;

  return (
    <>
      <div className={s.bgPattern} aria-hidden />
      <div className={s.dashboard}>
        <div className={s.header}>
          <BackLink fallbackHref="/console/marketing" className={s.marketingBack} />
          <div className={s.eyebrow}>polynize content library</div>
          <h1 className={s.title}>Core learnings</h1>
        </div>

        <section className={`${s.dashSection} ${s.panel}`}>
          <div className={s.dashSectionHead}>
            <h2 className={s.dashSectionTitle}>Learnings</h2>
            <span className={s.dashSectionCount}>{cards.length}</span>
          </div>
          <div className={s.sectionCtas}>
            <Link href="/console/marketing/learnings/new" className={s.startConceptCta}>
              + Add a learning
            </Link>
            {live > 0 ? (
              <a href="/library" target="_blank" rel="noreferrer" className={m.publicLink}>
                {live} live on polynize.ai/library →
              </a>
            ) : null}
          </div>
          {cards.length === 0 ? (
            <p className={s.dashSectionEmpty}>
              Nothing collected yet. Add the first learning: say it, or paste the notes, and April
              writes the first pass.
            </p>
          ) : (
            <div className={m.list}>
              {cards.map((c) => (
                <Link key={c.id} href={`/console/marketing/learnings/${c.id}`} className={m.row}>
                  <span className={m.rowTop}>
                    <span className={m.rowTitle}>{c.title}</span>
                    <span className={c.published_at ? m.live : m.draft}>
                      {c.published_at ? 'live' : 'draft'}
                    </span>
                  </span>
                  {c.learning ? <p className={m.rowLearning}>{c.learning}</p> : null}
                  <p className={m.rowMeta}>
                    {[
                      c.use_case ? labelForUseCase(c.use_case) : null,
                      c.added_by ? `from ${c.added_by.split('@')[0]}` : null,
                      c.stories > 0 ? `${c.stories} ${c.stories === 1 ? 'story' : 'stories'}` : 'no stories yet',
                      c.updated_at ? c.updated_at.slice(0, 10) : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
