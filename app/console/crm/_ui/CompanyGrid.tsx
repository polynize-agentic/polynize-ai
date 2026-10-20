'use client';

/**
 * THE COMPANY CARDS (D120), AJ's entry point: name, region, how many deals are live, and a filled
 * arrow on the ones with open work. The search narrows the grid as you type.
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
};

export function CompanyGrid({ cards }: { cards: CompanyCard[] }) {
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();
  const shown = needle ? cards.filter((c) => `${c.name} ${c.region} ${c.owner}`.toLowerCase().includes(needle)) : cards;
  return (
    <>
      <div className={s.bar}>
        <input className={s.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies: BDO, PwC, KPMG…" aria-label="Search companies" />
      </div>
      {shown.length === 0 ? (
        <p className={s.empty}>{cards.length === 0 ? 'No companies yet. Add the first one above.' : 'No company matches that.'}</p>
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
