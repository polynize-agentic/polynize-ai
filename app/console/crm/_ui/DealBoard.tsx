'use client';

/**
 * THE DEAL BOARD (D120): open deals in stage columns, as AJ drew them. Drag a card to another column
 * to move it, or use the stage picker on the card (a phone cannot drag). Every move is recorded in the
 * stage history. Won and Lost sit under the board as counts with their values, so closed work does not
 * crowd the live columns.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEAL_STAGES, OPEN_STAGES, ownerName } from '@/lib/crm/schema';
import { formatAmount, formatMoney, num, type Money } from '@/lib/crm/metrics';
import { crmCall } from './api';
import s from '../crm.module.css';

export type BoardDeal = {
  id: string;
  name: string;
  company: string;
  stage: string;
  value: number;
  currency: string;
  probability: number | null;
  close_date: string | null;
  owner: string | null;
  noNextStep: boolean;
};

export function DealBoard({ deals, showCompany }: { deals: BoardDeal[]; showCompany: boolean }) {
  const router = useRouter();
  const [local, setLocal] = useState(deals);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  // A refresh from the server replaces the local copy once a move has landed.
  useEffect(() => setLocal(deals), [deals]);

  const move = async (id: string, stage: string) => {
    const d = local.find((x) => x.id === id);
    if (!d || d.stage === stage) return;
    setLocal((xs) => xs.map((x) => (x.id === id ? { ...x, stage } : x)));
    const r = await crmCall(`deal/${id}`, 'PATCH', { stage });
    if (!r.ok) {
      window.alert(String(r.data.error ?? 'Could not move that deal.'));
      setLocal((xs) => xs.map((x) => (x.id === id ? { ...x, stage: d.stage } : x)));
      return;
    }
    router.refresh();
  };

  const closed = (stage: 'won' | 'lost') => {
    const xs = local.filter((d) => d.stage === stage);
    const m: Money = {};
    for (const d of xs) m[d.currency] = (m[d.currency] ?? 0) + num(d.value);
    return { count: xs.length, value: formatMoney(m) };
  };
  const won = closed('won');
  const lost = closed('lost');

  return (
    <>
      <div className={s.board}>
        {OPEN_STAGES.map((stage) => {
          const here = local.filter((d) => d.stage === stage);
          const total: Money = {};
          for (const d of here) total[d.currency] = (total[d.currency] ?? 0) + num(d.value);
          return (
            <div
              key={stage}
              className={`${s.col} ${over === stage ? s.colOver : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(stage);
              }}
              onDragLeave={() => setOver((o) => (o === stage ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const id = e.dataTransfer.getData('text/plain');
                if (id) void move(id, stage);
                setDragId(null);
              }}
            >
              <div className={s.colHead}>
                <span className={s.colName}>{DEAL_STAGES.find((x) => x.id === stage)?.label}</span>
                <span className={s.colTotal}>
                  {here.length}
                  {here.length ? ` · ${formatMoney(total)}` : ''}
                </span>
              </div>
              {here.map((d) => (
                <div
                  key={d.id}
                  className={`${s.deal} ${dragId === d.id ? s.dealDragging : ''}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', d.id);
                    setDragId(d.id);
                  }}
                  onDragEnd={() => setDragId(null)}
                >
                  <Link href={`/console/crm/deal/${d.id}`} className={s.dealName}>
                    {d.name}
                  </Link>
                  {showCompany ? <span className={s.dealCompany}>{d.company}</span> : null}
                  <span className={s.dealValue}>{formatAmount(d.value, d.currency)}</span>
                  <span className={s.dealMeta}>
                    {d.probability !== null ? `${d.probability}% likely` : 'No probability'}
                    {d.close_date ? ` · closes ${d.close_date}` : ''}
                  </span>
                  <span className={s.dealMeta}>{ownerName(d.owner)}</span>
                  {d.noNextStep ? <span className={s.flag}>No next step</span> : null}
                  <select
                    className={s.select}
                    value={d.stage}
                    aria-label={`Stage of ${d.name}`}
                    onChange={(e) => void move(d.id, e.target.value)}
                  >
                    {DEAL_STAGES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div className={s.closedRow}>
        <span>
          Won: {won.count}
          {won.count ? ` · ${won.value}` : ''}
        </span>
        <span>
          Lost: {lost.count}
          {lost.count ? ` · ${lost.value}` : ''}
        </span>
      </div>
    </>
  );
}
