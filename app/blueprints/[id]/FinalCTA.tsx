import type { BlueprintPayload } from '@/lib/blueprint/load';
import s from './blueprint.module.css';
import { BOOKING_URL, firstNameOf } from './util';
import { TrackedLink } from '@/app/_components/TrackedLink';

export function FinalCTA({ payload }: { payload: BlueprintPayload }) {
  const firstName = firstNameOf(payload.answers.name);
  return (
    <section className={s.final}>
      <h2 className={s.finalTitle}>
        Ready to build this, {firstName}<span className={s.mint}>?</span>
      </h2>
      <p className={s.finalLede}>
        A 30-minute call to walk the blueprint, sharpen the shape, and lock in your first Map
        engagement.
      </p>
      <div className={s.ctas}>
        <TrackedLink
          className={`${s.cta} ${s.ctaPrimary}`}
          href={BOOKING_URL}
          external
          event="booking_click"
          eventProps={{ surface: 'blueprint_final_cta' }}
        >
          book the call →
        </TrackedLink>
        <TrackedLink
          className={`${s.cta} ${s.ctaSecondary}`}
          href="/agents"
          event="cta_click"
          eventProps={{ surface: 'blueprint_final_cta', label: 'edit_my_answers' }}
        >
          ← edit my answers
        </TrackedLink>
      </div>
    </section>
  );
}
