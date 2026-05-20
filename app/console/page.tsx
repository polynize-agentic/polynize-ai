import { loadClientCardData } from './_lib/load-clients';
import { ClientCard } from './_components/ClientCard';
import s from './_components/client-card.module.css';

export const dynamic = 'force-dynamic';

export default async function ConsolePage() {
  const clients = await loadClientCardData();
  const allFailed = clients.length > 0 && clients.every((c) => c.error);
  const empty = clients.length === 0 || allFailed;

  return (
    <div className={s.dashboard}>
      <div className={s.header}>
        <div className={s.eyebrow}>polynize pam console</div>
        <h1 className={s.title}>Client Blueprints</h1>
        <p className={s.lede}>
          Active engagements across all phases. Click through to view each client&apos;s Blueprint.
        </p>
      </div>
      {empty ? (
        <p className={s.emptyState}>
          No clients configured. Add a slug to{' '}
          <code>app/console/_config/clients.ts</code> to get started.
        </p>
      ) : (
        <div className={s.grid}>
          {clients.map((c) => (
            <ClientCard key={c.slug} data={c} />
          ))}
        </div>
      )}
    </div>
  );
}
