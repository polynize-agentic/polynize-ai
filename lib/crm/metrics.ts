/**
 * THE CRM'S NUMBERS (D120). Pure: the rows go in, the dashboard comes out, and the tests hold it.
 *
 * MONEY IS NEVER CONVERTED. Marrs asked for a currency per deal, so every total is kept per
 * currency and shown side by side ("A$1.2m · US$300k"). A rate picked by the console would be a
 * number nobody chose, sitting in a forecast someone will quote.
 */
import { isOpenStage, OPEN_STAGES, DEAL_STAGES, type DealStage } from './schema';

export type CompanyRow = {
  id: string;
  num?: number | null;
  name: string;
  status: string;
  tier?: string | null;
  owner?: string | null;
  industry?: string | null;
  regions?: string | null;
  created_at: string;
  [k: string]: unknown;
};
export type ContactRow = {
  id: string;
  num?: number | null;
  company_id: string;
  first_name: string;
  last_name?: string | null;
  created_at: string;
  [k: string]: unknown;
};
export type DealRow = {
  id: string;
  num?: number | null;
  company_id: string;
  name: string;
  stage: string;
  value?: number | string | null;
  currency?: string | null;
  probability?: number | null;
  close_date?: string | null;
  closed_at?: string | null;
  owner?: string | null;
  deal_type?: string | null;
  [k: string]: unknown;
};
export type ActionRow = {
  id: string;
  num?: number | null;
  company_id: string;
  deal_id?: string | null;
  task: string;
  owner?: string | null;
  due?: string | null;
  status: string;
  completed_at?: string | null;
  [k: string]: unknown;
};
export type MeetingRow = { id: string; company_id: string; title: string; url: string; met_at?: string | null; created_at: string };
export type StageEvent = { deal_id: string; stage: string; at: string };

export type Money = Record<string, number>;

export function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function add(m: Money, cur: string | null | undefined, v: number) {
  const c = cur || 'AUD';
  m[c] = (m[c] ?? 0) + v;
}

/** A deal's value times its probability. A missing probability counts as nothing, not as certain. */
export function weighted(d: DealRow): number {
  return (num(d.value) * num(d.probability)) / 100;
}

/** Open and past its due date, as of `today` (YYYY-MM-DD). */
export function isOverdue(a: ActionRow, today: string): boolean {
  return a.status !== 'done' && !!a.due && a.due < today;
}

/** "A$1.2m · US$300k". Compact, one entry per currency, largest first. */
export function formatMoney(m: Money): string {
  const parts = Object.entries(m)
    .filter(([, v]) => v !== 0)
    .sort((a, b) => b[1] - a[1])
    .map(([cur, v]) => formatAmount(v, cur));
  return parts.length ? parts.join(' · ') : '0';
}

const SYMBOL: Record<string, string> = { AUD: 'A$', USD: 'US$', NZD: 'NZ$', SGD: 'S$', GBP: '£', EUR: '€' };

/**
 * One amount, short, with an unmistakable currency: A$320k, US$85,000, A$1.18m. AJ's style, with the
 * symbol spelled out because a bare $ means a different currency to each person reading a mixed pipeline.
 */
export function formatAmount(v: number, cur: string | null | undefined): string {
  const sym = SYMBOL[cur || 'AUD'] ?? `${cur} `;
  const a = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  let body: string;
  if (a >= 1_000_000) body = `${(a / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}m`;
  else if (a >= 10_000) body = `${Math.round(a / 1000)}k`;
  else body = Math.round(a).toLocaleString('en-AU');
  return `${sign}${sym}${body}`;
}

/** The quarter a date falls in, as "2026-Q4". */
export function quarterOf(iso: string): string {
  const y = iso.slice(0, 4);
  const m = Number(iso.slice(5, 7));
  return `${y}-Q${Math.ceil(m / 3)}`;
}

/**
 * DEALS WITH NO NEXT STEP. AJ's rule: "Every open deal requires an owner, next step and due date."
 * Flagged, never enforced: an open deal with no open action attached to it.
 */
export function dealsWithoutNextStep(deals: DealRow[], actions: ActionRow[]): Set<string> {
  const covered = new Set(actions.filter((a) => a.status !== 'done' && a.deal_id).map((a) => a.deal_id as string));
  return new Set(deals.filter((d) => isOpenStage(d.stage) && !covered.has(d.id)).map((d) => d.id));
}

/**
 * CONVERSION BETWEEN STAGES, from the stage history. For each open stage: of the deals that ever
 * reached it, how many went on to reach any later stage other than Lost. Undefined where nothing has
 * reached the stage yet, because 0% and "no data" are different claims.
 */
export function conversion(events: StageEvent[]): { stage: DealStage; reached: number; advanced: number; rate?: number }[] {
  const order = new Map<string, number>(DEAL_STAGES.map((s, i) => [s.id, i]));
  const byDeal = new Map<string, Set<string>>();
  for (const e of events) {
    const s = byDeal.get(e.deal_id) ?? new Set<string>();
    s.add(e.stage);
    byDeal.set(e.deal_id, s);
  }
  return OPEN_STAGES.map((stage) => {
    const at = order.get(stage)!;
    let reached = 0;
    let advanced = 0;
    for (const stages of byDeal.values()) {
      if (!stages.has(stage)) continue;
      reached += 1;
      if ([...stages].some((s) => s !== 'lost' && (order.get(s) ?? -1) > at)) advanced += 1;
    }
    return { stage, reached, advanced, ...(reached ? { rate: Math.round((advanced / reached) * 100) } : {}) };
  });
}

export type Dashboard = {
  targetCompanies: number;
  engaged: number;
  openDeals: number;
  openPipeline: Money;
  weightedPipeline: Money;
  followUpsDue: number;
  overdue: number;
  totalContacts: number;
  newContacts: number;
  meetingsLinked: number;
  meetingsThisQuarter: number;
  byStage: { stage: DealStage; label: string; count: number; value: Money }[];
  forecastByMonth: { month: string; value: Money }[];
  forecastByQuarter: { quarter: string; value: Money }[];
  won: { count: number; value: Money };
  lost: { count: number; value: Money };
  proposalsThisQuarter: number;
  newCompaniesThisQuarter: number;
  noNextStep: number;
  conversion: ReturnType<typeof conversion>;
  quarter: string;
};

/**
 * Every dashboard number. `today` is YYYY-MM-DD in the viewer's zone, so "this quarter" and
 * "overdue" mean what the person reading it means.
 */
export function buildDashboard(input: {
  companies: CompanyRow[];
  contacts: ContactRow[];
  deals: DealRow[];
  actions: ActionRow[];
  meetings: MeetingRow[];
  events: StageEvent[];
  today: string;
}): Dashboard {
  const { companies, contacts, deals, actions, meetings, events, today } = input;
  const quarter = quarterOf(today);
  const weekOut = addDays(today, 7);

  const open = deals.filter((d) => isOpenStage(d.stage));
  const openPipeline: Money = {};
  const weightedPipeline: Money = {};
  for (const d of open) {
    add(openPipeline, d.currency, num(d.value));
    add(weightedPipeline, d.currency, weighted(d));
  }

  const byStage = DEAL_STAGES.filter((s) => (OPEN_STAGES as readonly string[]).includes(s.id)).map((s) => {
    const value: Money = {};
    const here = open.filter((d) => d.stage === s.id);
    for (const d of here) add(value, d.currency, num(d.value));
    return { stage: s.id as DealStage, label: s.label, count: here.length, value };
  });

  // Forecast: open deals, weighted, by expected close month and quarter, from this month on.
  const monthNow = today.slice(0, 7);
  const months = new Map<string, Money>();
  const quarters = new Map<string, Money>();
  for (const d of open) {
    if (!d.close_date) continue;
    const m = d.close_date.slice(0, 7);
    const mm = months.get(m) ?? {};
    add(mm, d.currency, weighted(d));
    months.set(m, mm);
    const q = quarterOf(d.close_date);
    const qq = quarters.get(q) ?? {};
    add(qq, d.currency, weighted(d));
    quarters.set(q, qq);
  }
  const forecastByMonth = [...months.entries()]
    .filter(([m]) => m >= monthNow)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([month, value]) => ({ month, value }));
  const forecastByQuarter = [...quarters.entries()]
    .filter(([q]) => q >= quarter)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, 4)
    .map(([q, value]) => ({ quarter: q, value }));

  const won = { count: 0, value: {} as Money };
  const lost = { count: 0, value: {} as Money };
  for (const d of deals) {
    if (d.stage === 'won') {
      won.count += 1;
      add(won.value, d.currency, num(d.value));
    } else if (d.stage === 'lost') {
      lost.count += 1;
      add(lost.value, d.currency, num(d.value));
    }
  }

  const openActions = actions.filter((a) => a.status !== 'done');
  return {
    targetCompanies: companies.length,
    engaged: companies.filter((c) => c.status === 'engaged' || c.status === 'active_client').length,
    openDeals: open.length,
    openPipeline,
    weightedPipeline,
    followUpsDue: openActions.filter((a) => !!a.due && a.due <= weekOut).length,
    overdue: openActions.filter((a) => isOverdue(a, today)).length,
    totalContacts: contacts.length,
    newContacts: contacts.filter((c) => quarterOf(c.created_at.slice(0, 10)) === quarter).length,
    meetingsLinked: meetings.length,
    meetingsThisQuarter: meetings.filter((m) => quarterOf((m.met_at ?? m.created_at).slice(0, 10)) === quarter).length,
    byStage,
    forecastByMonth,
    forecastByQuarter,
    won,
    lost,
    proposalsThisQuarter: new Set(
      events.filter((e) => e.stage === 'proposal' && quarterOf(e.at.slice(0, 10)) === quarter).map((e) => e.deal_id)
    ).size,
    newCompaniesThisQuarter: companies.filter((c) => quarterOf(c.created_at.slice(0, 10)) === quarter).length,
    noNextStep: dealsWithoutNextStep(deals, actions).size,
    conversion: conversion(events),
    quarter,
  };
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Today in Sydney, as YYYY-MM-DD: the team's working day, whichever server answers. */
export function todayInSydney(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
