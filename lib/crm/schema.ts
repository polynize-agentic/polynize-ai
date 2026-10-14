/**
 * THE COMPANY-FIRST CRM: WHAT IS RECORDED (D120).
 *
 * AJ's structure (October 2026), taken as the spec on Marrs's word: companies, contacts, deals and
 * actions, plus meeting links on a company. Every field AJ listed exists; only the ESSENTIAL ones are
 * asked for when a record is created, the rest sit under "More detail" on the record. That split is
 * the answer to AJ's own warning: "genuinely useful for managing relationships and winning new
 * business, rather than creating another administrative task for the team."
 *
 * Pure and client-safe: the forms, the server store and the tests all read these lists, so a field
 * added here appears on the form and is accepted by the server in one edit.
 */

/* ------------------------------------------------------------------ who */

/**
 * WHO USES THE CRM, AND WHO CAN OWN AN ACCOUNT. Marrs, 14 October: owner is "from a dropdown menu of
 * myself, Kristin, Shourov, Logen, and AJ. Julian doesn't need access to the CRM." One list answers
 * both questions. Shourov's second address is the one Fireflies records him under.
 */
export const CRM_TEAM: readonly { email: string; name: string; aliases?: readonly string[] }[] = [
  { email: 'marrs@polynize.io', name: 'Marrs' },
  { email: 'kristin@polynize.io', name: 'Kristin' },
  { email: 'shourov@polynize.io', name: 'Shourov', aliases: ['shourov@polynize.com'] },
  { email: 'logen@polynize.io', name: 'Logen' },
  { email: 'aj@polynize.io', name: 'AJ' },
];

function norm(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

/** The team member for an address, under their main address or an alias. */
export function teamMember(email: string | null | undefined) {
  const e = norm(email);
  if (!e) return undefined;
  return CRM_TEAM.find((m) => m.email === e || (m.aliases ?? []).includes(e));
}

export function canUseCrm(email: string | null | undefined): boolean {
  return teamMember(email) !== undefined;
}

/** The name to show for an owner address; an address that is not on the team shows as itself. */
export function ownerName(email: string | null | undefined): string {
  if (!email) return 'Unassigned';
  return teamMember(email)?.name ?? email;
}

/* ------------------------------------------------------------------ the choices */

export type Option = { id: string; label: string };

/**
 * THE STAGES, confirmed by Marrs: Contacted, Discovery, Demo or pilot, Proposal, Negotiation, then
 * Won and Lost. Each carries the close probability a deal takes on entering it, which a person can
 * overwrite on the deal.
 */
export const DEAL_STAGES = [
  { id: 'contacted', label: 'Contacted', probability: 5 },
  { id: 'discovery', label: 'Discovery', probability: 10 },
  { id: 'demo', label: 'Demo or pilot', probability: 30 },
  { id: 'proposal', label: 'Proposal', probability: 50 },
  { id: 'negotiation', label: 'Negotiation', probability: 75 },
  { id: 'won', label: 'Won', probability: 100 },
  { id: 'lost', label: 'Lost', probability: 0 },
] as const;
export type DealStage = (typeof DEAL_STAGES)[number]['id'];
export const OPEN_STAGES: readonly DealStage[] = ['contacted', 'discovery', 'demo', 'proposal', 'negotiation'];
export const CLOSED_STAGES: readonly DealStage[] = ['won', 'lost'];

export function isDealStage(x: unknown): x is DealStage {
  return typeof x === 'string' && DEAL_STAGES.some((s) => s.id === x);
}
export function isOpenStage(x: string | null | undefined): boolean {
  return !!x && (OPEN_STAGES as readonly string[]).includes(x);
}
export function stageLabel(id: string | null | undefined): string {
  return DEAL_STAGES.find((s) => s.id === id)?.label ?? id ?? '';
}
export function stageProbability(id: string | null | undefined): number | undefined {
  return DEAL_STAGES.find((s) => s.id === id)?.probability;
}

/**
 * PARTNERSHIP IS A DEAL TYPE (Marrs, 14 October), so partner deals and client deals can be reported
 * apart. The partnership console that is coming next will have needs of its own; this is only the label.
 */
export const DEAL_TYPES: readonly Option[] = [
  { id: 'new_business', label: 'New business' },
  { id: 'expansion', label: 'Expansion' },
  { id: 'renewal', label: 'Renewal' },
  { id: 'partnership', label: 'Partnership' },
];

/** A CURRENCY PER DEAL (Marrs, 14 October). Totals are kept per currency, never converted. */
export const CURRENCIES: readonly Option[] = [
  { id: 'AUD', label: 'AUD' },
  { id: 'USD', label: 'USD' },
  { id: 'SGD', label: 'SGD' },
  { id: 'NZD', label: 'NZD' },
  { id: 'GBP', label: 'GBP' },
  { id: 'EUR', label: 'EUR' },
];
export const DEFAULT_CURRENCY = 'AUD';

export const COMPANY_STATUSES: readonly Option[] = [
  { id: 'target', label: 'Target' },
  { id: 'engaged', label: 'Engaged' },
  { id: 'active_client', label: 'Active client' },
  { id: 'inactive', label: 'Inactive' },
];
export const TIERS: readonly Option[] = [
  { id: '1', label: 'Tier 1' },
  { id: '2', label: 'Tier 2' },
  { id: '3', label: 'Tier 3' },
];
const HML: readonly Option[] = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];
const LEAD_SOURCES: readonly Option[] = [
  { id: 'referral', label: 'Referral' },
  { id: 'outbound', label: 'Outbound' },
  { id: 'partner', label: 'Partner' },
  { id: 'inbound', label: 'Inbound' },
];
const YES_NO: readonly Option[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
];
export const CONTACT_ROLES: readonly Option[] = [
  { id: 'decision_maker', label: 'Decision maker' },
  { id: 'influencer', label: 'Influencer' },
  { id: 'champion', label: 'Champion' },
  { id: 'user', label: 'User' },
];
const SENIORITY: readonly Option[] = [
  { id: 'c_suite', label: 'C-suite' },
  { id: 'partner', label: 'Partner' },
  { id: 'director', label: 'Director' },
  { id: 'manager', label: 'Manager' },
  { id: 'other', label: 'Other' },
];
const STRENGTH: readonly Option[] = [
  { id: 'strong', label: 'Strong' },
  { id: 'developing', label: 'Developing' },
  { id: 'new', label: 'New' },
];
const CONTACT_STATUS: readonly Option[] = [
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'left', label: 'Left company' },
];
const PREFERRED: readonly Option[] = [
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'linkedin', label: 'LinkedIn' },
];
export const ACTION_STATUSES: readonly Option[] = [
  { id: 'todo', label: 'To do' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
];
const ACTION_SOURCES: readonly Option[] = [
  { id: 'manual', label: 'Manual' },
  { id: 'fireflies', label: 'Fireflies' },
  { id: 'email', label: 'Email' },
];
const PARTIES: readonly Option[] = [
  { id: 'polynize', label: 'Polynize' },
  { id: 'customer', label: 'Customer' },
];
const PROCUREMENT: readonly Option[] = [
  { id: 'not_started', label: 'Not started' },
  { id: 'in_review', label: 'In review' },
  { id: 'approved', label: 'Approved' },
  { id: 'blocked', label: 'Blocked' },
];

export function optionLabel(options: readonly Option[] | undefined, id: unknown): string {
  if (id === null || id === undefined || id === '') return '';
  return options?.find((o) => o.id === String(id))?.label ?? String(id);
}

/* ------------------------------------------------------------------ the fields */

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'select'
  | 'number'
  | 'money'
  | 'percent'
  | 'date'
  | 'url'
  | 'email'
  | 'owner'
  | 'company'
  | 'contact'
  | 'deal';

export type Field = {
  key: string;
  label: string;
  kind: FieldKind;
  options?: readonly Option[];
  /** Asked for on the create form. Everything else is under "More detail". */
  essential?: boolean;
  /** Refused when empty, on create. */
  required?: boolean;
  placeholder?: string;
};

export type RecordKind = 'company' | 'contact' | 'deal' | 'action';

export const COMPANY_FIELDS: readonly Field[] = [
  { key: 'name', label: 'Company name', kind: 'text', essential: true, required: true, placeholder: 'e.g. BDO' },
  { key: 'status', label: 'Status', kind: 'select', options: COMPANY_STATUSES, essential: true },
  { key: 'tier', label: 'Priority', kind: 'select', options: TIERS, essential: true },
  { key: 'owner', label: 'Account lead', kind: 'owner', essential: true },
  { key: 'industry', label: 'Industry or sector', kind: 'text', placeholder: 'Professional services' },
  { key: 'headquarters', label: 'Headquarters', kind: 'text', placeholder: 'City, country' },
  { key: 'regions', label: 'Operating regions', kind: 'text', placeholder: 'Australia, APAC, global' },
  { key: 'website', label: 'Website', kind: 'url' },
  { key: 'linkedin', label: 'Company LinkedIn', kind: 'url' },
  { key: 'size', label: 'Company size (employees)', kind: 'number' },
  { key: 'est_users', label: 'Estimated Polynize users', kind: 'number' },
  { key: 'use_case', label: 'Business use case', kind: 'textarea', placeholder: 'How they could use Polynize' },
  { key: 'problem', label: 'Business problem or pain points', kind: 'textarea' },
  { key: 'existing_tech', label: 'Existing technology or platform', kind: 'text' },
  { key: 'strategic_fit', label: 'Strategic fit', kind: 'select', options: HML },
  { key: 'lead_source', label: 'Lead source', kind: 'select', options: LEAD_SOURCES },
  { key: 'partner_potential', label: 'Partner potential', kind: 'select', options: YES_NO },
  { key: 'expansion', label: 'Expansion potential', kind: 'textarea', placeholder: 'Other departments or geographies' },
  { key: 'notes', label: 'Account overview and notes', kind: 'textarea' },
];

export const CONTACT_FIELDS: readonly Field[] = [
  { key: 'first_name', label: 'First name', kind: 'text', essential: true, required: true },
  { key: 'last_name', label: 'Last name', kind: 'text', essential: true },
  { key: 'company_id', label: 'Company', kind: 'company', essential: true, required: true },
  { key: 'title', label: 'Job title', kind: 'text', essential: true },
  { key: 'email', label: 'Email', kind: 'email', essential: true },
  { key: 'role', label: 'Contact role', kind: 'select', options: CONTACT_ROLES, essential: true },
  { key: 'department', label: 'Department or function', kind: 'text', placeholder: 'L&D, HR, IT' },
  { key: 'seniority', label: 'Seniority', kind: 'select', options: SENIORITY },
  { key: 'location', label: 'Location', kind: 'text', placeholder: 'City, country' },
  { key: 'phone', label: 'Mobile or phone', kind: 'text' },
  { key: 'linkedin', label: 'LinkedIn', kind: 'url' },
  { key: 'strength', label: 'Relationship strength', kind: 'select', options: STRENGTH },
  { key: 'status', label: 'Contact status', kind: 'select', options: CONTACT_STATUS },
  { key: 'preferred', label: 'Preferred contact method', kind: 'select', options: PREFERRED },
  { key: 'last_contact_at', label: 'Last contact', kind: 'date' },
  { key: 'next_contact_at', label: 'Next contact', kind: 'date' },
  { key: 'owner', label: 'Contact owner', kind: 'owner' },
  { key: 'notes', label: 'Relationship notes', kind: 'textarea' },
];

export const DEAL_FIELDS: readonly Field[] = [
  { key: 'name', label: 'Deal name', kind: 'text', essential: true, required: true, placeholder: 'e.g. BDO Australia pilot' },
  { key: 'company_id', label: 'Company', kind: 'company', essential: true, required: true },
  { key: 'stage', label: 'Stage', kind: 'select', options: DEAL_STAGES.map((s) => ({ id: s.id, label: s.label })), essential: true },
  { key: 'deal_type', label: 'Deal type', kind: 'select', options: DEAL_TYPES, essential: true },
  { key: 'value', label: 'Value', kind: 'money', essential: true },
  { key: 'currency', label: 'Currency', kind: 'select', options: CURRENCIES, essential: true },
  { key: 'probability', label: 'Close probability (%)', kind: 'percent', essential: true },
  { key: 'close_date', label: 'Expected close', kind: 'date', essential: true },
  { key: 'owner', label: 'Deal owner', kind: 'owner', essential: true },
  { key: 'contact_id', label: 'Primary contact', kind: 'contact' },
  { key: 'offering', label: 'Solution or offering', kind: 'text' },
  { key: 'arr', label: 'Expected ARR', kind: 'money' },
  { key: 'term', label: 'Contract term', kind: 'text', placeholder: '12 months' },
  { key: 'proposal_url', label: 'Proposal link', kind: 'url' },
  { key: 'procurement', label: 'Procurement status', kind: 'select', options: PROCUREMENT },
  { key: 'blockers', label: 'Deal blockers', kind: 'textarea' },
  { key: 'outcome_reason', label: 'Won or lost reason', kind: 'textarea' },
];

export const ACTION_FIELDS: readonly Field[] = [
  { key: 'task', label: 'What needs to happen', kind: 'text', essential: true, required: true },
  { key: 'company_id', label: 'Company', kind: 'company', essential: true, required: true },
  { key: 'owner', label: 'Owner', kind: 'owner', essential: true },
  { key: 'due', label: 'Due', kind: 'date', essential: true },
  { key: 'deal_id', label: 'Deal', kind: 'deal', essential: true },
  { key: 'contact_id', label: 'Contact', kind: 'contact' },
  { key: 'priority', label: 'Priority', kind: 'select', options: HML },
  { key: 'status', label: 'Status', kind: 'select', options: ACTION_STATUSES },
  { key: 'party', label: 'Whose move', kind: 'select', options: PARTIES },
  { key: 'source', label: 'Source', kind: 'select', options: ACTION_SOURCES },
  { key: 'meeting_url', label: 'Meeting link', kind: 'url' },
  { key: 'notes', label: 'Follow-up notes', kind: 'textarea' },
];

export const FIELDS: Record<RecordKind, readonly Field[]> = {
  company: COMPANY_FIELDS,
  contact: CONTACT_FIELDS,
  deal: DEAL_FIELDS,
  action: ACTION_FIELDS,
};

export const TABLES: Record<RecordKind, string> = {
  company: 'crm_companies',
  contact: 'crm_contacts',
  deal: 'crm_deals',
  action: 'crm_actions',
};

export function isRecordKind(x: unknown): x is RecordKind {
  return x === 'company' || x === 'contact' || x === 'deal' || x === 'action';
}

/** The IDs AJ drew (COM-001), from the row's running number. */
const PREFIX: Record<RecordKind, string> = { company: 'COM', contact: 'CON', deal: 'DEA', action: 'ACT' };
export function refFor(kind: RecordKind, num: number | null | undefined): string {
  if (num === null || num === undefined) return '';
  return `${PREFIX[kind]}-${String(num).padStart(3, '0')}`;
}

/* ------------------------------------------------------------------ cleaning what the forms send */

export type CleanResult = { values: Record<string, string | number | null>; missing: string[] };

/**
 * Keep only the fields this record has, turn every value into what its column holds, and name any
 * required field left empty. An empty string becomes null so "cleared" is stored as nothing, never as
 * a blank. On an edit (`partial`), a field that was not sent is left alone and required is not checked.
 */
export function cleanValues(kind: RecordKind, input: Record<string, unknown>, partial: boolean): CleanResult {
  const values: Record<string, string | number | null> = {};
  const missing: string[] = [];
  for (const f of FIELDS[kind]) {
    if (!(f.key in input)) {
      if (!partial && f.required) missing.push(f.label);
      continue;
    }
    const raw = input[f.key];
    const s = raw === null || raw === undefined ? '' : String(raw).trim();
    if (s === '') {
      if (!partial && f.required) missing.push(f.label);
      if (f.required && partial) {
        missing.push(f.label);
        continue;
      }
      values[f.key] = null;
      continue;
    }
    switch (f.kind) {
      case 'number':
      case 'money':
      case 'percent': {
        const n = Number(s.replace(/[,$\s]/g, ''));
        if (!Number.isFinite(n)) {
          values[f.key] = null;
          break;
        }
        values[f.key] = f.kind === 'percent' ? Math.max(0, Math.min(100, Math.round(n))) : f.kind === 'number' ? Math.round(n) : n;
        break;
      }
      case 'date':
        values[f.key] = /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
        break;
      case 'select':
        values[f.key] = f.options?.some((o) => o.id === s) ? s : null;
        break;
      case 'owner':
        values[f.key] = teamMember(s)?.email ?? null;
        break;
      case 'company':
      case 'contact':
      case 'deal':
        values[f.key] = /^[0-9a-f-]{36}$/i.test(s) ? s : null;
        if (values[f.key] === null && f.required) missing.push(f.label);
        break;
      default:
        values[f.key] = s.slice(0, f.kind === 'textarea' ? 8000 : 500);
    }
  }
  return { values, missing };
}

/** "jordan.lee@bdo.com" becomes Jordan Lee: a starting name, editable on the contact. */
export function nameFromEmail(email: string): { first_name: string; last_name?: string } {
  const local = email.split('@')[0] ?? email;
  const parts = local.split(/[._-]+/).filter(Boolean).map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  return parts.length > 1 ? { first_name: parts[0], last_name: parts.slice(1).join(' ') } : { first_name: parts[0] || email };
}
