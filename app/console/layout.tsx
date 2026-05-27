import type { Metadata } from 'next';
import { getCurrentUserEmail } from '@/lib/console-auth';
import { SignInGate } from './_components/SignInGate';
import { signOutAction } from './_actions';
import s from './_components/sign-in-gate.module.css';

export const metadata: Metadata = {
  title: 'Polynize Agentic Management Console',
  robots: { index: false, follow: false },
};

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await getCurrentUserEmail();

  if (!email) {
    return <SignInGate />;
  }

  return (
    <div className={s.shell}>
      <nav className={s.topNav}>
        <div className={s.eyebrow}>§ polynize agentic management console</div>
        <div className={s.userBlock}>
          <span className={s.userEmail}>{email}</span>
          <form action={signOutAction}>
            <button type="submit" className={s.signOutBtn}>
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <main className={s.main}>{children}</main>
    </div>
  );
}
