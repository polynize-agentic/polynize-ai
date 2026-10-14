import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/console-auth';
import { tryLoadCrm } from '@/lib/crm/records';
import { COMPANY_FIELDS, COMPANY_STATUSES, TIERS, isOpenStage, optionLabel, ownerName, refFor, type Field } from '@/lib/crm/schema';
import { formatMoney, num, todayInSydney, type Money } from '@/lib/crm/metrics';
import { NotReady } from '../../_ui/NotReady';
import { AddRecord, DeleteRecord, EditRecord } from '../../_ui/RecordForm';
import { MeetingLinks } from '../../_ui/MeetingLinks';
import { DealBoard } from '../../_ui/DealBoard';
import { ActionTable } from '../../_ui/ActionTable';
import { ContactTable } from '../../_ui/ContactTable';
import { actionLines, boardDeals, contactLines, lookupsFrom } from '../../_ui/shape';
import { History } from '../../_ui/History';
import { buildTimeline } from '@/lib/crm/history';
import s from '../../crm.module.css';

export const dynamic = 'force-dynamic';

const TABS = ['profile', 'contacts', 'deals', 'actions', 'history'] as const;
type Tab = (typeof TABS)[number];

/** The facts on the profile, in AJ's order, each with its value or a quiet dash. */
function Fact({ f, v }: { f: Field; v: unknown }) {
  const shown = v === null || v === undefined || v === '' ? null : f.options ? optionLabel(f.options, v) : f.kind === 'owner' ? ownerName(String(v)) : String(v);
  return (
    <div className={f.kind === 'textarea' ? s.wide : undefined}>
      <div className={s.factLabel}>{f.label}</div>
      <div className={`${s.factValue} ${shown ? '' : s.factEmpty}`}>
        {shown && f.kind === 'url' ? (
          <a href={shown} target="_blank" rel="noopener noreferrer">
            {shown}
          </a>
        ) : (
          (shown ?? 'Not set')
        )}
      </div>
    </div>
  );
}

/**
 * ONE COMPANY'S WORKSPACE (D120): the strip with name, tier, status and ID, then AJ's four tabs.
 * The tab is in the address (?tab=deals) so a link can open straight onto it.
 */
export default async function CompanyPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const { tab: rawTab } = await searchParams;
  const tab: Tab = (TABS as readonly string[]).includes(rawTab ?? '') ? (rawTab as Tab) : 'profile';
  const user = await getCurrentUser();
  // ONE READ (D121): everything, then this company's share of it in memory. The pickers need every
  // company's names anyway, and two reads were two trips to the database on every tab click.
  const everything = await tryLoadCrm();
  if (!everything) return <NotReady />;
  const company = everything.companies.find((c) => c.id === id);
  if (!company) notFound();
  const dealIds = new Set(everything.deals.filter((d) => d.company_id === id).map((d) => d.id));
  const data = {
    companies: [company],
    contacts: everything.contacts.filter((x) => x.company_id === id),
    deals: everything.deals.filter((x) => x.company_id === id),
    actions: everything.actions.filter((x) => x.company_id === id),
    meetings: everything.meetings.filter((x) => x.company_id === id),
    events: everything.events.filter((e) => dealIds.has(e.deal_id)),
    notes: everything.notes.filter((n) => n.company_id === id),
  };
  const timeline = buildTimeline(data);
  const lookups = lookupsFrom(everything);
  const today = todayInSydney();
  const me = user?.email ?? '';

  const openDeals = data.deals.filter((d) => isOpenStage(d.stage));
  const pipeline: Money = {};
  for (const d of openDeals) pipeline[d.currency || 'AUD'] = (pipeline[d.currency || 'AUD'] ?? 0) + num(d.value);
  const openActions = data.actions.filter((a) => a.status !== 'done');

  const counts: Record<Tab, number | undefined> = {
    profile: undefined,
    contacts: data.contacts.length,
    deals: openDeals.length,
    actions: openActions.length,
    history: timeline.filter((e) => e.group !== 'activity').length,
  };
  const label: Record<Tab, string> = { profile: 'Profile', contacts: 'Contacts', deals: 'Deals', actions: 'Actions', history: 'History' };
  const fixed = { company_id: company.id };
  const intelligence = COMPANY_FIELDS.filter((f) => !['name', 'notes', 'status', 'tier', 'owner'].includes(f.key));

  return (
    <>
      <Link href="/console/crm" className={s.crumb}>
        ← All companies
      </Link>
      <div className={s.strip} style={{ marginTop: 12 }}>
        <span className={s.stripName}>{company.name}</span>
        <span className={s.stripMeta}>
          {[optionLabel(TIERS, company.tier), optionLabel(COMPANY_STATUSES, company.status)].filter(Boolean).join(' / ')}
        </span>
        <span className={s.stripMeta}>Lead: {ownerName(company.owner)}</span>
        <span className={s.stripRef}>Company ID: {refFor('company', company.num)}</span>
      </div>

      <div className={s.tabs}>
        {TABS.map((t) => (
          <Link key={t} href={`/console/crm/company/${company.id}${t === 'profile' ? '' : `?tab=${t}`}`} className={`${s.tab} ${t === tab ? s.tabOn : ''}`}>
            {label[t]}
            {counts[t] !== undefined ? <span className={s.count}>{counts[t]}</span> : null}
          </Link>
        ))}
      </div>

      {tab === 'profile' ? (
        <>
          <div className={s.grid2}>
            <section className={s.panel}>
              <div className={s.panelHead}>
                <h2 className={s.panelTitle}>Company intelligence</h2>
              </div>
              <div className={s.facts}>
                {intelligence.map((f) => (
                  <Fact key={f.key} f={f} v={company[f.key]} />
                ))}
              </div>
            </section>
            <section className={s.panel}>
              <h2 className={s.panelTitle}>Meeting links</h2>
              <MeetingLinks
                companyId={company.id}
                meetings={data.meetings.map((m) => ({ id: m.id, title: m.title, url: m.url, met_at: m.met_at ?? null }))}
              />
            </section>
          </div>
          <div className={s.grid2even}>
            <section className={s.panel}>
              <h2 className={s.panelTitle}>Account overview</h2>
              <div className={`${s.factValue} ${company.notes ? '' : s.factEmpty}`}>{String(company.notes ?? 'Nothing written yet.')}</div>
              <p className={s.sub} style={{ fontSize: 13 }}>
                Account lead: {ownerName(company.owner)}
              </p>
            </section>
            <section className={s.panel}>
              <h2 className={s.panelTitle}>At this company</h2>
              <div className={s.list}>
                <div className={s.listRow}>
                  <Link className={s.listTitle} href={`/console/crm/company/${company.id}?tab=contacts`}>
                    Contacts
                  </Link>
                  <span className={s.listMeta}>{data.contacts.length} people</span>
                </div>
                <div className={s.listRow}>
                  <Link className={s.listTitle} href={`/console/crm/company/${company.id}?tab=deals`}>
                    Deals
                  </Link>
                  <span className={s.listMeta}>
                    {openDeals.length} open{openDeals.length ? ` · ${formatMoney(pipeline)}` : ''}
                  </span>
                </div>
                <div className={s.listRow}>
                  <Link className={s.listTitle} href={`/console/crm/company/${company.id}?tab=actions`}>
                    Actions
                  </Link>
                  <span className={s.listMeta}>{openActions.length} open</span>
                </div>
              </div>
            </section>
          </div>
          <div className={s.bar}>
            <EditRecord kind="company" id={company.id} initial={company} lookups={lookups} title={`Edit ${company.name}`} label="Edit profile" />
            <DeleteRecord
              kind="company"
              id={company.id}
              goTo="/console/crm"
              what={`Delete ${company.name}?\n\nIts contacts, deals, actions and meeting links go with it. This cannot be undone.`}
            />
          </div>
        </>
      ) : null}

      {tab === 'contacts' ? (
        <section className={s.panel}>
          <div className={s.panelHead}>
            <h2 className={s.panelTitle}>Everyone at {company.name}</h2>
          </div>
          <div className={s.bar}>
            <AddRecord kind="contact" label="+ Add contact" title={`Add a contact at ${company.name}`} fixed={fixed} lookups={lookups} me={me} />
          </div>
          <ContactTable contacts={contactLines(data)} showCompany={false} />
        </section>
      ) : null}

      {tab === 'deals' ? (
        <>
          <div className={s.bar}>
            <AddRecord kind="deal" label="+ Add deal" title={`Add a deal with ${company.name}`} fixed={fixed} lookups={lookups} me={me} />
          </div>
          <DealBoard deals={boardDeals(data)} showCompany={false} />
          <div className={s.totalBar}>
            <span className={s.totalLabel}>{company.name} total open pipeline</span>
            <span className={s.totalValue}>{formatMoney(pipeline)}</span>
          </div>
        </>
      ) : null}

      {tab === 'history' ? (
        <section className={s.panel}>
          <History
            entries={timeline}
            companyId={company.id}
            deals={lookups.deals.filter((d) => d.company_id === company.id)}
            contacts={lookups.contacts.filter((c) => c.company_id === company.id)}
            today={today}
          />
        </section>
      ) : null}

      {tab === 'actions' ? (
        <section className={s.panel}>
          <div className={s.bar}>
            <AddRecord kind="action" label="+ Add action" title={`Add a next step for ${company.name}`} fixed={fixed} lookups={lookups} me={me} />
          </div>
          <ActionTable actions={actionLines(data, today)} me={me} showCompany={false} />
        </section>
      ) : null}
    </>
  );
}
