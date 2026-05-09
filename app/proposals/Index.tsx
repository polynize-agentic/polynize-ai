import Link from 'next/link';
import { lockAction } from './actions';
import { PROPOSALS } from './proposals-data';
import s from './proposals.module.css';

export function Index() {
  return (
    <main className={s.indexRoot}>
      <header className={s.indexHeader}>
        <div>
          <div className={s.eyebrow}>§ polynize · proposals</div>
          <h1 className={s.indexTitle}>
            Current proposals<span className={s.titleAccent}>.</span>
          </h1>
          <p className={s.indexLede}>
            Live links to active client proposals, decks, and build handovers.
            Click any card to open the document.
          </p>
        </div>
        <form action={lockAction} className={s.lockForm}>
          <button type="submit" className={s.lockBtn} aria-label="Lock proposals">
            + lock
          </button>
        </form>
      </header>

      <section className={s.cards}>
        {PROPOSALS.map((p) => (
          <Link
            key={p.slug}
            href={`/proposals/${p.slug}`}
            className={s.card}
            prefetch={false}
          >
            <div className={s.cardTop}>
              <span className={`${s.typeBadge} ${s[`type_${p.type}`]}`}>
                {p.type}
              </span>
              <span className={s.cardDate}>{p.date}</span>
            </div>
            <div className={s.cardClient}>{p.client}</div>
            <h2 className={s.cardTitle}>{p.title}</h2>
            <p className={s.cardBlurb}>{p.blurb}</p>
            <div className={s.cardCta}>
              view document <span className={s.cardArr}>→</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
