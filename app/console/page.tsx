import { getCurrentUserEmail } from '@/lib/console-auth';
import { signOutAction } from './_actions';
import s from './_components/sign-in-gate.module.css';

export default async function ConsolePage() {
  const email = await getCurrentUserEmail();

  return (
    <div className={s.placeholder}>
      <h1 className={s.placeholderTitle}>Welcome to PAM Console</h1>
      <p className={s.placeholderEmail}>
        Signed in as <strong>{email}</strong>
      </p>
      <p className={s.placeholderNote}>
        Coming soon: master client index, per-client Blueprint dashboards.
      </p>
      <form action={signOutAction}>
        <button type="submit" className={s.gateButton}>
          Sign out <span className={s.btnArr}>→</span>
        </button>
      </form>
    </div>
  );
}
