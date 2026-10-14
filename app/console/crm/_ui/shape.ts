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

export function companyCards(d: CrmData): CompanyCard[] {
  return d.companies.map((c) => ({
    id: c.id,
    name: c.name,
    region: String(c.regions ?? c.headquarters ?? ''),
    openDeals: d.deals.filter((x) => x.company_id === c.id && isOpenStage(x.stage)).length,
    status: optionLabel(COMPANY_STATUSES, c.status),
    tier: optionLabel(TIERS, c.tier),
    owner: ownerName(c.owner),
  }));
}
