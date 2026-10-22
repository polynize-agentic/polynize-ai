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
type Sort = 'deals' | 'recent' | 'name';

const SORTS: { id: Sort; label: string }[] = [
  { id: 'deals', label: 'Most active deals' },
  { id: 'recent', label: 'Recent activity' },
  { id: 'name', label: 'Name, A to Z' },
];

function sorted(cards: CompanyCard[], sort: Sort): CompanyCard[] {
  const byName = (a: CompanyCard, b: CompanyCard) => a.name.localeCompare(b.name);
  if (sort === 'recent') return [...cards].sort((a, b) => b.lastActive - a.lastActive || byName(a, b));
  if (sort === 'name') return [...cards].sort(byName);
  return [...cards].sort((a, b) => b.openDeals - a.openDeals || byName(a, b));
}

export function CompanyGrid({ cards }: { cards: CompanyCard[] }) {
  const [q, setQ] = useState('');
  const [view, setView] = useState<View>('tiles');
  const [sort, setSort] = useState<Sort>('deals');
  const needle = q.trim().toLowerCase();
  const shown = sorted(needle ? cards.filter((c) => `${c.name} ${c.region} ${c.owner}`.toLowerCase().includes(needle)) : cards, sort);
  return (
    <>
      <div className={s.bar}>
        <input className={s.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies: BDO, PwC, KPMG…" aria-label="Search companies" />
        <select className={s.select} value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort companies">
          {SORTS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        {(['tiles', 'list'] as const).map((v) => (
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
                  <th>Company</th>
                  <th>Region</th>
                  <th>Status</th>
                  <th>Active deals</th>
                  <th>Contacts</th>
                  <th>Owner</th>
                  <th>Last activity</th>
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
