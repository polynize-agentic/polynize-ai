import Link from 'next/link';
import s from './blueprint.module.css';

export default function BlueprintNotFound() {
  return (
    <div className={s.body}>
      <main className={s.final} style={{ paddingTop: 140 }}>
        <h1 className={s.finalTitle}>
          Blueprint not found<span className={s.mint}>.</span>
        </h1>
        <p className={s.finalLede}>
          That link may have expired or been mistyped. Build your own in five minutes — answer
          eleven questions and we will send you the full blueprint.
        </p>
        <div className={s.ctas}>
          <Link className={`${s.cta} ${s.ctaPrimary}`} href="/agents">
            map_my_business →
          </Link>
          <Link className={`${s.cta} ${s.ctaSecondary}`} href="/">
            ← back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
