'use client';

/**
 * THE COMPANY CARDS (D120), AJ's entry point: name, region, how many deals are live, and a filled
 * arrow on the ones with open work. The search narrows the grid as you type.
 *
 * Tiles or a list, and a sort (morning build, 22 October 2026). Marrs, on the suggestions board:
 * "Company list as well as tiles, and then a sort feature by recent actions."
 */
import { useState } from 'react';
import Link from 'next/link';
import s from '../crm.module.css';

export type CompanyCard = {
  id: string;
  name: string;
  region: string;
  openDeals: number;
  contacts: number;
  status: string;
  tier: string;
  owner: string;
  /** The last moment anything about this company was added or changed, 0 if never. */
  lastActive: number;
  lastActiveLabel: string;
};

type View = 'tiles' | 'list';

/**
 * EVERY LIST COLUMN SORTS (D125). Marrs: "make the list view the default, and I want the headings of
 * the columns to be sortable... Companies, region, status, active deals, owner, last activity." Click
 * a heading to sort by it; click it again to turn the order round. The tiles keep the menu, which
 * offers the same keys.
 */
type Key = 'name' | 'region' | 'status' | 'deals' | 'contacts' | 'owner' | 'recent';
type Dir = 'asc' | 'desc';

const COLUMNS: { key: Key; label: string; first: Dir }[] = [
  { key: 'name', label: 'Company', first: 'asc' },
  { key: 'region', label: 'Region', first: 'asc' },
  { key: 'status', label: 'Status', first: 'asc' },
  { key: 'deals', label: 'Active deals', first: 'desc' },
  { key: 'contacts', label: 'Contacts', first: 'desc' },
  { key: 'owner', label: 'Owner', first: 'asc' },
  { key: 'recent', label: 'Last activity', first: 'desc' },
];

const MENU: { id: string; label: string; key: Key; dir: Dir }[] = [
  { id: 'deals', label: 'Most active deals', key: 'deals', dir: 'desc' },
  { id: 'recent', label: 'Recent activity', key: 'recent', dir: 'desc' },
  { id: 'name', label: 'Name, A to Z', key: 'name', dir: 'asc' },
  { id: 'status', label: 'Status', key: 'status', dir: 'asc' },
  { id: 'owner', label: 'Owner', key: 'owner', dir: 'asc' },
  { id: 'region', label: 'Region', key: 'region', dir: 'asc' },
];

/** Status in the order a person reads it: clients first, then engaged, then targets, then inactive. */
const STATUS_ORDER = ['Active client', 'Engaged', 'Target', 'Inactive'];

function sorted(cards: CompanyCard[], key: Key, dir: Dir): CompanyCard[] {
  const byName = (a: CompanyCard, b: CompanyCard) => a.name.localeCompare(b.name);
  // Blanks always sink to the bottom, whichever way round, so "no region" never heads the list.
  const text = (a: string, b: string) => (!a && b ? 1 : a && !b ? -1 : 0) || (dir === 'asc' ? 1 : -1) * a.localeCompare(b);
  const num = (a: number, b: number) => (dir === 'asc' ? a - b : b - a);
  const cmp: Record<Key, (a: CompanyCard, b: CompanyCard) => number> = {
    name: (a, b) => (dir === 'asc' ? 1 : -1) * byName(a, b),
    region: (a, b) => text(a.region, b.region),
    status: (a, b) => {
      const ia = STATUS_ORDER.indexOf(a.status), ib = STATUS_ORDER.indexOf(b.status);
      return num(ia === -1 ? 99 : ia, ib === -1 ? 99 : ib) || a.tier.localeCompare(b.tier);
    },
    deals: (a, b) => num(a.openDeals, b.openDeals),
    contacts: (a, b) => num(a.contacts, b.contacts),
    owner: (a, b) => text(a.owner === 'Unassigned' ? '' : a.owner, b.owner === 'Unassigned' ? '' : b.owner),
    recent: (a, b) => num(a.lastActive, b.lastActive),
  };
  return [...cards].sort((a, b) => cmp[key](a, b) || byName(a, b));
}

export function CompanyGrid({ cards }: { cards: CompanyCard[] }) {
  const [q, setQ] = useState('');
  // THE LIST IS THE DEFAULT (D125); the tiles are one click away.
  const [view, setView] = useState<View>('list');
  const [key, setKey] = useState<Key>('deals');
  const [dir, setDir] = useState<Dir>('desc');
  const needle = q.trim().toLowerCase();
  const shown = sorted(needle ? cards.filter((c) => `${c.name} ${c.region} ${c.owner}`.toLowerCase().includes(needle)) : cards, key, dir);
  const sortBy = (k: Key) => {
    if (k === key) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setKey(k);
      setDir(COLUMNS.find((c) => c.key === k)?.first ?? 'asc');
    }
  };
  const menuValue = MENU.find((m) => m.key === key && m.dir === dir)?.id ?? '';
  return (
    <>
      <div className={s.bar}>
        <input className={s.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies: BDO, PwC, KPMG…" aria-label="Search companies" />
        {view === 'tiles' ? (
          <select
            className={s.select}
            value={menuValue}
            onChange={(e) => {
              const m = MENU.find((x) => x.id === e.target.value);
              if (m) {
                setKey(m.key);
                setDir(m.dir);
              }
            }}
            aria-label="Sort companies"
          >
            {menuValue === '' ? <option value="">Sorted from the list</option> : null}
            {MENU.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        ) : null}
        {(['list', 'tiles'] as const).map((v) => (
          <button key={v} type="button" className={`${s.filter} ${view === v ? s.filterOn : ''}`} onClick={() => setView(v)} aria-pressed={view === v}>
            {v === 'tiles' ? 'Tiles' : 'List'}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className={s.empty}>{cards.length === 0 ? 'No companies yet. Add the first one above.' : 'No company matches that.'}</p>
      ) : view === 'list' ? (
        <section className={s.panel}>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  {COLUMNS.map((c) => (
                    <th key={c.key} aria-sort={key === c.key ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                      <button type="button" className={`${s.sortHead} ${key === c.key ? s.sortHeadOn : ''}`} onClick={() => sortBy(c.key)}>
                        {c.label}
                        <span className={s.sortArrow} aria-hidden>
                          {key === c.key ? (dir === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c.id}>
                    <td className={s.strong}>
                      <Link href={`/console/crm/company/${c.id}`}>{c.name}</Link>
                    </td>
                    <td>{c.region}</td>
                    <td>{[c.tier, c.status].filter(Boolean).join(' · ')}</td>
                    <td>{c.openDeals}</td>
                    <td>{c.contacts}</td>
                    <td>{c.owner}</td>
                    <td>{c.lastActiveLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className={s.cards}>
          {shown.map((c) => (
            <Link key={c.id} href={`/console/crm/company/${c.id}`} className={`${s.card} ${c.openDeals > 0 ? s.cardLive : ''}`}>
              <span className={s.tag}>
                {[c.tier, c.status].filter(Boolean).join(' · ')}
              </span>
              <span className={s.cardName}>{c.name}</span>
              <span className={s.cardRule} />
              <span className={s.cardMeta}>
                <span>{c.region || 'No region yet'}</span>
                <span className={s.sep}>|</span>
                <span>
                  {c.openDeals} active {c.openDeals === 1 ? 'deal' : 'deals'}
                </span>
                <span className={s.sep}>|</span>
                <span>
                  {c.contacts} {c.contacts === 1 ? 'contact' : 'contacts'}
                </span>
                <span className={s.arrow} aria-hidden>
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
