import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/console-auth';
import { tryLoadCrm } from '@/lib/crm/records';
import { CONTACT_FIELDS, optionLabel, ownerName, refFor, stageLabel } from '@/lib/crm/schema';
import { formatAmount, num, todayInSydney } from '@/lib/crm/metrics';
import { NotReady } from '../../_ui/NotReady';
import { AddRecord, DeleteRecord, EditRecord } from '../../_ui/RecordForm';
import { ActionTable } from '../../_ui/ActionTable';
import { actionLines, fullName, lookupsFrom } from '../../_ui/shape';
import s from '../../crm.module.css';

export const dynamic = 'force-dynamic';

/** ONE PERSON (D120): who they are, how to reach them, the deals they are on and the actions with them. */
export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const all = await tryLoadCrm();
  if (!all) return <NotReady />;
  const c = all.contacts.find((x) => x.id === id);
  if (!c) notFound();
  const company = all.companies.find((x) => x.id === c.company_id);
  const name = fullName(c);
  const initials = name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const deals = all.deals.filter((d) => d.contact_id === id);
  const mine = { ...all, actions: all.actions.filter((a) => a.contact_id === id) };
  return (
    <>
      <Link href={company ? `/console/crm/company/${company.id}?tab=contacts` : '/console/crm/contacts'} className={s.crumb}>
        ← {company?.name ?? 'Contacts'}
      </Link>
      <div className={s.grid2} style={{ marginTop: 12 }}>
        <section className={s.panel}>
          <div className={s.person}>
            <span className={s.avatar}>{initials}</span>
            <div>
              <div className={s.stripName}>{name}</div>
              <div className={s.sub} style={{ marginTop: 2 }}>
                {[c.title, company?.name].filter(Boolean).join(' · ')}
              </div>
            </div>
            <span className={s.stripRef}>{refFor('contact', c.num)}</span>
          </div>
          <div className={s.facts}>
            {CONTACT_FIELDS.filter((f) => !['first_name', 'last_name', 'company_id', 'title'].includes(f.key)).map((f) => {
              const v = c[f.key];
              const shown = v === null || v === undefined || v === '' ? null : f.options ? optionLabel(f.options, v) : f.kind === 'owner' ? ownerName(String(v)) : String(v);
              return (
                <div key={f.key} className={f.kind === 'textarea' ? s.wide : undefined}>
                  <div className={s.factLabel}>{f.label}</div>
                  <div className={`${s.factValue} ${shown ? '' : s.factEmpty}`}>
                    {shown && f.kind === 'email' ? <a href={`mailto:${shown}`}>{shown}</a> : shown && f.kind === 'url' ? <a href={shown} target="_blank" rel="noopener noreferrer">{shown}</a> : (shown ?? 'Not set')}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className={s.panel}>
          <h2 className={s.panelTitle}>Deals with {c.first_name}</h2>
          {deals.length === 0 ? (
            <p className={s.empty}>Not the primary contact on any deal.</p>
          ) : (
            <div className={s.list}>
              {deals.map((d) => (
                <div key={d.id} className={s.listRow}>
                  <div className={s.listMain}>
                    <Link className={s.listTitle} href={`/console/crm/deal/${d.id}`}>
                      {d.name}
                    </Link>
                    <div className={s.listMeta}>
                      {stageLabel(d.stage)} · {formatAmount(num(d.value), d.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <section className={s.panel}>
        <h2 className={s.panelTitle}>Actions with {c.first_name}</h2>
        <div className={s.bar}>
          <AddRecord
            kind="action"
            label="+ Add action"
            title={`Add a next step with ${name}`}
            fixed={{ company_id: c.company_id, contact_id: c.id }}
            lookups={lookupsFrom(all)}
            me={user?.email}
          />
        </div>
        <ActionTable actions={actionLines(mine, todayInSydney())} me={user?.email ?? ''} showCompany={false} />
      </section>
      <div className={s.bar} style={{ marginTop: 18 }}>
        <EditRecord kind="contact" id={c.id} initial={c} lookups={lookupsFrom(all)} title={`Edit ${name}`} />
        <DeleteRecord kind="contact" id={c.id} goTo={company ? `/console/crm/company/${company.id}?tab=contacts` : '/console/crm/contacts'} what={`Delete ${name}? Deals and actions that name them stay, without the link.`} />
      </div>
    </>
  );
}
