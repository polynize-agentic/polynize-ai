/**
 * Turning the CRM's rows into what the screens show (D120). Pure, shared by every page, so a company's
 * name or a person's full name is worked out one way everywhere.
 */
import type { CrmData } from '@/lib/crm/records';
import { dealsWithoutNextStep, isOverdue, num, type ActionRow, type ContactRow, type DealRow } from '@/lib/crm/metrics';
import { CONTACT_ROLES, COMPANY_STATUSES, TIERS, optionLabel, ownerName, isOpenStage } from '@/lib/crm/schema';
import type { Lookups } from './api';
import type { BoardDeal } from './DealBoard';
import type { ActionLine } from './ActionTable';
import type { ContactLine } from './ContactTable';
import type { CompanyCard } from './CompanyGrid';

export function fullName(c: Pick<ContactRow, 'first_name' | 'last_name'>): string {
  return [c.first_name, c.last_name].filter(Boolean).join(' ');
}

export function lookupsFrom(d: Pick<CrmData, 'companies' | 'contacts' | 'deals'>): Lookups {
  return {
    companies: d.companies.map((c) => ({ id: c.id, name: c.name })),
    contacts: d.contacts.map((c) => ({ id: c.id, name: fullName(c), company_id: c.company_id })),
    deals: d.deals.map((x) => ({ id: x.id, name: x.name, company_id: x.company_id })),
  };
}

function names(d: CrmData) {
  return {
    company: new Map(d.companies.map((c) => [c.id, c.name])),
    deal: new Map(d.deals.map((x) => [x.id, x.name])),
  };
}

export function boardDeals(d: CrmData): BoardDeal[] {
  const n = names(d);
  const bare = dealsWithoutNextStep(d.deals, d.actions);
  return d.deals.map((x: DealRow) => ({
    id: x.id,
    name: x.name,
    company: n.company.get(x.company_id) ?? '',
    stage: x.stage,
    value: num(x.value),
    currency: x.currency || 'AUD',
    probability: x.probability ?? null,
    close_date: x.close_date ?? null,
    owner: x.owner ?? null,
    noNextStep: bare.has(x.id),
  }));
}

export function actionLines(d: CrmData, today: string): ActionLine[] {
  const n = names(d);
  return [...d.actions]
    .sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999'))
    .map((a: ActionRow) => ({
      id: a.id,
      task: a.task,
      company_id: a.company_id,
      company: n.company.get(a.company_id) ?? '',
      deal_id: a.deal_id ?? null,
      deal: a.deal_id ? (n.deal.get(a.deal_id) ?? '') : '',
      owner: a.owner ?? null,
      due: a.due ?? null,
      status: a.status,
      overdue: isOverdue(a, today),
    }));
}

export function contactLines(d: CrmData): ContactLine[] {
  const n = names(d);
  return d.contacts.map((c) => ({
    id: c.id,
    name: fullName(c),
    title: String(c.title ?? ''),
    company_id: c.company_id,
    company: n.company.get(c.company_id) ?? '',
    location: String(c.location ?? ''),
    role: optionLabel(CONTACT_ROLES, c.role),
    owner: c.owner ? ownerName(String(c.owner)) : '',
    email: String(c.email ?? ''),
  }));
}

/**
 * WHEN EACH COMPANY LAST SAW ANY WORK (morning build, 22 October 2026). Marrs, on the suggestions board:
 * "a sort feature by recent actions". The latest moment anything about the company was added or
 * changed: the company itself, its people, deals, actions, meetings, notes and stage moves.
 */
function lastActivity(d: CrmData): Map<string, number> {
  const latest = new Map<string, number>();
  const touch = (companyId: string | undefined, ...when: unknown[]) => {
    if (!companyId) return;
    for (const w of when) {
      const t = typeof w === 'string' ? Date.parse(w) : NaN;
      if (!Number.isNaN(t) && t > (latest.get(companyId) ?? 0)) latest.set(companyId, t);
    }
  };
  const dealCompany = new Map(d.deals.map((x) => [x.id, x.company_id]));
  for (const c of d.companies) touch(c.id, c.created_at, c.updated_at);
  for (const c of d.contacts) touch(c.company_id, c.created_at, c.updated_at);
  for (const x of d.deals) touch(x.company_id, x.created_at, x.updated_at);
  for (const a of d.actions) touch(a.company_id, a.created_at, a.updated_at, a.completed_at);
  for (const m of d.meetings) touch(m.company_id, m.created_at, m.met_at);
  for (const n of d.notes) touch(n.company_id, n.created_at, n.occurred_at);
  for (const e of d.events) touch(dealCompany.get(e.deal_id), e.at);
  return latest;
}

function shortDate(t: number): string {
  return new Date(t).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Australia/Sydney' });
}

export function companyCards(d: CrmData): CompanyCard[] {
  const latest = lastActivity(d);
  return d.companies.map((c) => ({
    id: c.id,
    name: c.name,
    region: String(c.regions ?? c.headquarters ?? ''),
    openDeals: d.deals.filter((x) => x.company_id === c.id && isOpenStage(x.stage)).length,
    // AJ's suggestion, approved by Marrs (D122): how many people we know there, on the card.
    contacts: d.contacts.filter((x) => x.company_id === c.id).length,
    status: optionLabel(COMPANY_STATUSES, c.status),
    tier: optionLabel(TIERS, c.tier),
    owner: ownerName(c.owner),
    lastActive: latest.get(c.id) ?? 0,
    lastActiveLabel: latest.has(c.id) ? shortDate(latest.get(c.id) as number) : '',
  }));
}
