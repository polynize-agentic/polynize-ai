import { getCurrentUser } from '@/lib/console-auth';
import { tryLoadCrm } from '@/lib/crm/records';
import { buildDashboard, formatMoney, todayInSydney } from '@/lib/crm/metrics';
import { NotReady } from '../_ui/NotReady';
import { AddRecord } from '../_ui/RecordForm';
import { DealBoard } from '../_ui/DealBoard';
import { boardDeals, lookupsFrom } from '../_ui/shape';
import s from '../crm.module.css';

export const dynamic = 'force-dynamic';

/** THE WHOLE PIPELINE (D120): every company's deals on one board. */
export default async function DealsPage() {
  const user = await getCurrentUser();
  const data = await tryLoadCrm();
  if (!data) return <NotReady />;
  const dash = buildDashboard({ ...data, today: todayInSydney() });
  return (
    <>
      <div className={s.head}>
        <div>
          <h1 className={s.h1}>Deals</h1>
          <p className={s.sub}>Every opportunity, at every company. Drag a card to move its stage.</p>
        </div>
      </div>
      <div className={s.bar}>
        {data.companies.length ? (
          <AddRecord kind="deal" label="+ Add deal" title="Add a deal" lookups={lookupsFrom(data)} me={user?.email} />
        ) : (
          <p className={s.empty}>Add a company first; every deal belongs to one.</p>
        )}
      </div>
      <DealBoard deals={boardDeals(data)} showCompany />
      <div className={s.totalBar}>
        <span className={s.totalLabel}>Open pipeline</span>
        <span className={s.totalValue}>{formatMoney(dash.openPipeline)}</span>
        <span className={s.totalLabel}>Weighted</span>
        <span className={s.totalValue}>{formatMoney(dash.weightedPipeline)}</span>
      </div>
    </>
  );
}
