import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/console-auth';
import { isOperator } from '@/lib/marketing/streams';
import { canUseCrm } from '@/lib/crm/schema';

export const dynamic = 'force-dynamic';

/**
 * THE MARKETING ENGINE IS MARRS'S ALONE (D121). The middleware already turns everyone else away; this
 * is the same rule at the page, so the screens hold even if the middleware's session check is skipped.
 */
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user && user.scope.type === 'team' && !isOperator(user.email)) {
    redirect(canUseCrm(user.email) ? '/console/crm' : '/console');
  }
  return <>{children}</>;
}
