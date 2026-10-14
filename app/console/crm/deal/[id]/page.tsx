import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/console-auth';
import { tryLoadCrm } from '@/lib/crm/records';
import { DEAL_FIELDS, optionLabel, ownerName, refFor, stageLabel } from '@/lib/crm/schema';
import { formatAmount, num, todayInSydney } from '@/lib/crm/metrics';
import { NotReady } from '../../_ui/NotReady';
import { AddRecord, DeleteRecord, EditRecord } from '../../_ui/RecordForm';
import { ActionTable } from '../../_ui/ActionTable';
import { actionLines, fullName, lookupsFrom } from '../../_ui/shape';
import { History } from '../../_ui/History';
import { buildTimeline, forDeal as entriesForDeal } from '@/lib/crm/history';
import s from '../../crm.module.css';

export const dynamic = 'force-dynamic';

/** ONE DEAL (D120): its economics, its next steps, and every stage it has been through. */
export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const all = await tryLoadCrm();
  if (!all) return <NotReady />;
  const d = all.deals.find((x) => x.id === id);
  if (!d) notFound();
  const company = all.companies.find((x) => x.id === d.company_id);
  const contact = all.contacts.find((x) => x.id === d.contact_id);
  const history = all.events.filter((e) => e.deal_id === id);
  const forDeal = { ...all, actions: all.actions.filter((a) => a.deal_id === id) };
  const openNext = forDeal.actions.filter((a) => a.status !== 'done').length;
  return (
    <>
      <Link href={company ? `/console/crm/company/${company.id}?tab=deals` : '/console/crm/deals'} className={s.crumb}>
        ← {company?.name ?? 'Deals'}
      </Link>
      <div className={s.strip} style={{ marginTop: 12 }}>
        <span className={s.stripName}>{d.name}</span>
        <span className={s.stripMeta}>{stageLabel(d.stage)}</span>
        <span className={s.stripMeta}>{formatAmount(num(d.value), d.currency)}</span>
        {d.probability !== null && d.probability !== undefined ? <span className={s.stripMeta}>{d.probability}% likely</span> : null}
        <span className={s.stripRef}>{refFor('deal', d.num)}</span>
      </div>
      {openNext === 0 && !['won', 'lost'].includes(d.stage) ? (
        <p className={s.note} style={{ margin: '0 0 18px' }}>
          This deal has no next step. Every open deal should have an owner, a next step and a due date.
        </p>
      ) : null}
      <div className={s.grid2}>
        <section className={s.panel}>
          <h2 className={s.panelTitle}>The deal</h2>
          <div className={s.facts}>
            <div>
              <div className={s.factLabel}>Company</div>
              <div className={s.factValue}>{company ? <Link href={`/console/crm/company/${company.id}`}>{company.name}</Link> : 'Not set'}</div>
            </div>
            <div>
              <div className={s.factLabel}>Primary contact</div>
              <div className={`${s.factValue} ${contact ? '' : s.factEmpty}`}>
                {contact ? <Link href={`/console/crm/contact/${contact.id}`}>{fullName(contact)}</Link> : 'Not set'}
              </div>
            </div>
            {DEAL_FIELDS.filter((f) => !['name', 'company_id', 'contact_id'].includes(f.key)).map((f) => {
              const v = d[f.key];
              const shown =
                v === null || v === undefined || v === ''
                  ? null
                  : f.options
                    ? optionLabel(f.options, v)
                    : f.kind === 'owner'
                      ? ownerName(String(v))
                      : f.kind === 'money'
                        ? formatAmount(num(v), d.currency)
                        : f.kind === 'percent'
                          ? `${v}%`
                          : String(v);
              return (
                <div key={f.key} className={f.kind === 'textarea' ? s.wide : undefined}>
                  <div className={s.factLabel}>{f.label}</div>
                  <div className={`${s.factValue} ${shown ? '' : s.factEmpty}`}>
                    {shown && f.kind === 'url' ? <a href={shown} target="_blank" rel="noopener noreferrer">{shown}</a> : (shown ?? 'Not set')}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className={s.panel}>
          <h2 className={s.panelTitle}>Stage history</h2>
          {history.length === 0 ? (
            <p className={s.empty}>No moves recorded.</p>
          ) : (
            <div className={s.list}>
              {history.map((e, i) => (
                <div key={i} className={s.listRow}>
                  <div className={s.listMain}>
                    <div className={s.listTitle}>{stageLabel(e.stage)}</div>
                  </div>
                  <span className={s.listMeta}>{e.at.slice(0, 10)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <section className={s.panel}>
        <h2 className={s.panelTitle}>Next steps</h2>
        <div className={s.bar}>
          <AddRecord
            kind="action"
            label="+ Add next step"
            title={`Add a next step on ${d.name}`}
            fixed={{ company_id: d.company_id, deal_id: d.id }}
            lookups={lookupsFrom(all)}
            me={user?.email}
          />
        </div>
        <ActionTable actions={actionLines(forDeal, todayInSydney())} me={user?.email ?? ''} showCompany={false} />
      </section>
      {/* THE DEAL'S OWN HISTORY (D121): its notes, its meetings' notes, its stage moves and its actions done. */}
      <section className={s.panel} style={{ marginTop: 18 }}>
        <h2 className={s.panelTitle}>History</h2>
        <History
          entries={entriesForDeal(
            buildTimeline({
              notes: all.notes.filter((n) => n.company_id === d.company_id),
              meetings: all.meetings.filter((m) => m.company_id === d.company_id),
              events: all.events,
              actions: all.actions.filter((a) => a.company_id === d.company_id),
              contacts: [],
              deals: all.deals,
            }),
            d.id
          )}
          companyId={d.company_id}
          deals={[{ id: d.id, name: d.name, company_id: d.company_id }]}
          contacts={lookupsFrom(all).contacts.filter((c) => c.company_id === d.company_id)}
          fixedDealId={d.id}
          today={todayInSydney()}
        />
      </section>

      <div className={s.bar} style={{ marginTop: 18 }}>
        <EditRecord kind="deal" id={d.id} initial={d} lookups={lookupsFrom(all)} title={`Edit ${d.name}`} />
        <DeleteRecord kind="deal" id={d.id} goTo={company ? `/console/crm/company/${company.id}?tab=deals` : '/console/crm/deals'} what={`Delete ${d.name}? Its stage history goes with it; its actions stay, without the link.`} />
      </div>
    </>
  );
}
