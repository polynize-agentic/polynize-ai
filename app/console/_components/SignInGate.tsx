import { cookies } from 'next/headers';
import { requestMagicLinkAction, resetSignInAction } from '../_actions';
import s from './sign-in-gate.module.css';

export async function SignInGate() {
  const jar = await cookies();
  const submitted = jar.get('console_signin_submitted')?.value === '1';
  const submittedEmail = jar.get('console_signin_email')?.value;
  const error = jar.get('console_signin_error')?.value;

  // Confirmation state: form was successfully submitted with a valid-format
  // email. Replace the form entirely with a "Check your inbox" card so the
  // user gets unambiguous feedback. Echoes the submitted email back, which
  // covers the "did I type my address right?" UX worry without leaking
  // allowlist membership (we don't say "sent" vs "would have sent" — we
  // just confirm the submission).
  if (submitted && submittedEmail) {
    return (
      <main className={s.gateRoot}>
        <div className={s.gateCard}>
          <div className={s.eyebrow}>§ polynize agentic management console</div>
          <h1 className={s.gateTitle}>
            Check your inbox<span className={s.titleAccent}>.</span>
          </h1>
          <p className={s.gateLede}>
            Sign-in link sent to{' '}
            <span className={s.confirmEmail}>{submittedEmail}</span>.
          </p>
          <p className={s.gateMeta}>The link will expire in 15 minutes.</p>
          <form action={resetSignInAction} className={s.resetForm}>
            <button type="submit" className={s.linkLikeBtn}>
              Use a different email
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className={s.gateRoot}>
      <form action={requestMagicLinkAction} className={s.gateCard}>
        <div className={s.eyebrow}>§ polynize agentic management console</div>
        <h1 className={s.gateTitle}>
          Polynize Agentic Management Console (PAM)
          <span className={s.titleAccent}>.</span>
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
          aria-invalid={
            error === 'invalid_link' || error === 'invalid_email'
              ? 'true'
              : undefined
          }
          placeholder="you@polynize.io"
          className={s.gateInput}
        />
        {error === 'invalid_link' && (
          <div className={s.gateError} role="alert">
            That sign-in link is invalid or has expired. Please request a new
            one.
          </div>
        )}
        {error === 'invalid_email' && (
          <div className={s.gateError} role="alert">
            That doesn&apos;t look like a valid email address. Please check
            and try again.
          </div>
        )}
        {error === 'send_failed' && (
          <div className={s.gateError} role="alert">
            Couldn&apos;t send sign-in link. Please try again or contact
            support.
          </div>
        )}
        <button type="submit" className={s.gateButton}>
          Send sign-in link <span className={s.btnArr}>→</span>
        </button>
      </form>
    </main>
  );
}
