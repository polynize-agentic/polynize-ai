/** Who may use the CRM (D120): signed in, team scope, and on the CRM team list. Server only. */
import { getCurrentUser } from '@/lib/console-auth';
import { canUseCrm } from './schema';

export async function crmUser(): Promise<{ email: string } | null> {
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team' || !canUseCrm(user.email)) return null;
  return { email: user.email.trim().toLowerCase() };
}
