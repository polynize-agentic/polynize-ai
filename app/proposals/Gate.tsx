import { unlockAction } from './actions';
import s from './proposals.module.css';

export function Gate({ hadError }: { hadError: boolean }) {
  return (
    <main className={s.gateRoot}>
      <form action={unlockAction} className={s.gateCard}>
        <div className={s.eyebrow}>§ polynize · proposals</div>
        <h1 className={s.gateTitle}>
          Locked<span className={s.titleAccent}>.</span>
        </h1>
        <p className={s.gateLede}>
          Enter the access code to view current Polynize proposals, decks, and
          build handovers.
        </p>
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="off"
          spellCheck={false}
          aria-label="Access code"
          aria-invalid={hadError ? 'true' : undefined}
          placeholder="Access code"
          className={s.gateInput}
        />
        {hadError && (
          <div className={s.gateError} role="alert">
            That code didn&apos;t match. Try again.
          </div>
        )}
        <button type="submit" className={s.gateButton}>
          Unlock <span className={s.btnArr}>→</span>
        </button>
      </form>
    </main>
  );
}
