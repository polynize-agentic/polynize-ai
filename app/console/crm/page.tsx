import { getCurrentUser } from '@/lib/console-auth';
import { tryLoadCrm } from '@/lib/crm/records';
import { buildDashboard, formatMoney, todayInSydney } from '@/lib/crm/metrics';
import { CompanyGrid } from './_ui/CompanyGrid';
import { AddRecord } from './_ui/RecordForm';
import { NotReady } from './_ui/NotReady';
import { companyCards, lookupsFrom } from './_ui/shape';
import s from './crm.module.css';

export const dynamic = 'force-dynamic';

/**
 * COMPANIES, THE LANDING PAGE (D120). AJ: "the landing page displays our target organisations (BDO,
 * PwC, EY, KPMG, etc.) in a grid format." Four numbers on top, then the cards.
 */
export default async function CrmHome() {
  const user = await getCurrentUser();
  const data = await tryLoadCrm();
  if (!data) return <NotReady />;
  const dash = buildDashboard({ ...data, today: todayInSydney() });
  const cards = companyCards(data).sort((a, b) => b.openDeals - a.openDeals || a.name.localeCompare(b.name));
  return (
    <>
      <div className={s.head}>
        <div>
          <h1 className={s.h1}>Target companies</h1>
          <p className={s.sub}>Choose a company to open its profile, people, deals and next actions.</p>
        </div>
      </div>
      <div className={s.tiles}>
        <div className={s.tile}>
          <div className={s.tileLabel}>Target accounts</div>
          <div className={s.tileValue}>{dash.targetCompanies}</div>
        </div>
        <div className={s.tile}>
          <div className={s.tileLabel}>Engaged</div>
          <div className={s.tileValue}>{dash.engaged}</div>
        </div>
        <div className={s.tile}>
          <div className={s.tileLabel}>Open deals</div>
          <div className={s.tileValue}>{dash.openDeals}</div>
        </div>
        <div className={s.tile}>
          <div className={s.tileLabel}>Total pipeline</div>
          <div className={`${s.tileValue} ${s.tileValueSmall}`}>{formatMoney(dash.openPipeline)}</div>
        </div>
      </div>
      <div className={s.bar}>
        <AddRecord kind="company" label="+ Add company" title="Add a company" submitLabel="Add company" lookups={lookupsFrom(data)} goTo="/console/crm/company/{id}" me={user?.email} />
      </div>
      <CompanyGrid cards={cards} />
    </>
  );
}
