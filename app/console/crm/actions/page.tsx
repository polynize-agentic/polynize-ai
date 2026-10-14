import { getCurrentUser } from '@/lib/console-auth';
import { tryLoadCrm } from '@/lib/crm/records';
import { todayInSydney } from '@/lib/crm/metrics';
import { NotReady } from '../_ui/NotReady';
import { AddRecord } from '../_ui/RecordForm';
import { ActionTable } from '../_ui/ActionTable';
import { actionLines, lookupsFrom } from '../_ui/shape';
import s from '../crm.module.css';

export const dynamic = 'force-dynamic';

/** EVERY NEXT STEP (D120), soonest first, filtered to yours by default. */
export default async function ActionsPage() {
  const user = await getCurrentUser();
  const data = await tryLoadCrm();
  if (!data) return <NotReady />;
  return (
    <>
      <div className={s.head}>
        <div>
          <h1 className={s.h1}>Actions</h1>
          <p className={s.sub}>Next steps, owners and due dates across every company.</p>
        </div>
      </div>
      <div className={s.bar}>
        {data.companies.length ? (
          <AddRecord kind="action" label="+ Add action" title="Add a next step" lookups={lookupsFrom(data)} me={user?.email} />
        ) : (
          <p className={s.empty}>Add a company first; every action belongs to one.</p>
        )}
      </div>
      <section className={s.panel}>
        <ActionTable actions={actionLines(data, todayInSydney())} me={(user?.email ?? '').toLowerCase()} showCompany startMine />
      </section>
    </>
  );
}
