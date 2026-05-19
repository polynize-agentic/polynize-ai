import { cookies } from 'next/headers';
import { requestMagicLinkAction } from '../_actions';
import s from './sign-in-gate.module.css';

export async function SignInGate() {
  const jar = await cookies();
  const submitted = jar.get('console_signin_submitted')?.value === '1';
  const error = jar.get('console_signin_error')?.value;

  return (
    <main className={s.gateRoot}>
      <form action={requestMagicLinkAction} className={s.gateCard}>
        <div className={s.eyebrow}>§ polynize · pam console</div>
        <h1 className={s.gateTitle}>
          Polynize PAM Console<span className={s.titleAccent}>.</span>
        </h1>
        <p className={s.gateLede}>
          Sign in with your @polynize.io email to continue.
        </p>
        <input
          type="email"
          name="email"
          required
          autoFocus
          autoComplete="email"
          spellCheck={false}
          aria-label="Email address"
          aria-invalid={error === 'invalid_link' ? 'true' : undefined}
          placeholder="you@polynize.io"
          className={s.gateInput}
        />
        {error === 'invalid_link' && (
          <div className={s.gateError} role="alert">
            That sign-in link is invalid or has expired. Please request a new one.
          </div>
        )}
        <button type="submit" className={s.gateButton}>
          Send sign-in link <span className={s.btnArr}>→</span>
        </button>
        {submitted && (
          <div className={s.gateNote} role="status">
            If your email is on the allowlist, a sign-in link has been sent. Check your inbox.
          </div>
        )}
      </form>
    </main>
  );
}
