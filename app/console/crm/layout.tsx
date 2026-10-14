import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/console-auth';
import { canUseCrm } from '@/lib/crm/schema';
import { CrmNav } from './_ui/CrmNav';
import s from './crm.module.css';

export const dynamic = 'force-dynamic';

/**
 * THE CRM (D120): company first, AJ's structure in the console's style. Team only, and only the CRM
 * team (Marrs, Kristin, Shourov, Logan, AJ); anyone else is sent to the console home. Partners never
 * have access.
 */
export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.scope.type === 'client') redirect(`/console/${user.scope.slug}/blueprint`);
  if (!canUseCrm(user.email)) redirect('/console');
  return (
    <div className={s.wrap}>
      <div className={s.top}>
        <Link href="/console/crm" className={s.brand}>
          Polynize<span>/</span>CRM
        </Link>
        <CrmNav />
      </div>
      {children}
    </div>
  );
}
