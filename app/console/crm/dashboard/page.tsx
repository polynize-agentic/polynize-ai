import { tryLoadCrm } from '@/lib/crm/records';
import { buildDashboard, formatMoney, todayInSydney } from '@/lib/crm/metrics';
import { stageLabel } from '@/lib/crm/schema';
import { NotReady } from '../_ui/NotReady';
import s from '../crm.module.css';

export const dynamic = 'force-dynamic';

function monthName(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-AU', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/**
 * THE SALES DASHBOARD (D120), AJ's management view: pipeline, weighted pipeline, follow-ups, stages,
 * the forecast and the quarter. Every money figure is per currency; nothing is converted.
 */
export default async function DashboardPage() {
  const data = await tryLoadCrm();
  if (!data) return <NotReady />;
  const d = buildDashboard({ ...data, today: todayInSydney() });
  const maxStage = Math.max(1, ...d.byStage.map((b) => b.count));
  return (
    <>
      <div className={s.head}>
        <div>
          <h1 className={s.h1}>Sales dashboard</h1>
          <p className={s.sub}>Pipeline, forecast and follow-through across every company. {d.quarter.replace('-', ' ')}.</p>
        </div>
      </div>
      <div className={s.tiles}>
        <div className={s.tile}>
          <div className={s.tileLabel}>Open pipeline</div>
          <div className={`${s.tileValue} ${s.tileValueSmall}`}>{formatMoney(d.openPipeline)}</div>
        </div>
        <div className={s.tile}>
          <div className={s.tileLabel}>Weighted pipeline</div>
          <div className={`${s.tileValue} ${s.tileValueSmall}`}>{formatMoney(d.weightedPipeline)}</div>
        </div>
        <div className={s.tile}>
          <div className={s.tileLabel}>Active deals</div>
          <div className={s.tileValue}>{d.openDeals}</div>
        </div>
        <div className={s.tile}>
          <div className={s.tileLabel}>Follow-ups due this week</div>
          <div className={s.tileValue}>{d.followUpsDue}</div>
        </div>
      </div>

      <div className={s.grid2}>
        <section className={s.panel}>
          <h2 className={s.panelTitle}>Pipeline by stage</h2>
          <div className={s.bars}>
            {d.byStage.map((b) => (
              <div key={b.stage} className={s.barRow}>
                <span>{b.label}</span>
                <span className={s.barTrack}>
                  <span className={s.barFill} style={{ width: `${(b.count / maxStage) * 100}%`, display: 'block' }} />
                </span>
                <span className={s.barNum}>{b.count}</span>
              </div>
            ))}
          </div>
          <p className={s.sub} style={{ fontSize: 13 }}>
            {d.byStage
              .filter((b) => b.count)
              .map((b) => `${b.label}: ${formatMoney(b.value)}`)
              .join(' · ') || 'No open deals yet.'}
          </p>
        </section>
        <section className={s.panel}>
          <h2 className={s.panelTitle}>This quarter</h2>
          <div className={s.kv}>
            <span>Weighted forecast, this quarter</span>
            <strong>{formatMoney(d.forecastByQuarter.find((q) => q.quarter === d.quarter)?.value ?? {})}</strong>
          </div>
          <div className={s.kv}>
            <span>Proposals sent</span>
            <strong>{d.proposalsThisQuarter}</strong>
          </div>
          <div className={s.kv}>
            <span>New companies added</span>
            <strong>{d.newCompaniesThisQuarter}</strong>
          </div>
          <div className={s.kv}>
            <span>Meetings linked</span>
            <strong>{d.meetingsThisQuarter}</strong>
          </div>
          <div className={s.kv}>
            <span>New contacts</span>
            <strong>{d.newContacts}</strong>
          </div>
        </section>
      </div>

      <div className={s.grid2even}>
        <section className={s.panel}>
          <h2 className={s.panelTitle}>Forecast by month</h2>
          {d.forecastByMonth.length === 0 ? (
            <p className={s.empty}>No open deals with an expected close date.</p>
          ) : (
            d.forecastByMonth.map((m) => (
              <div key={m.month} className={s.kv}>
                <span>{monthName(m.month)}</span>
                <strong>{formatMoney(m.value)}</strong>
              </div>
            ))
          )}
          <p className={s.sub} style={{ fontSize: 12 }}>
            Weighted: each deal&rsquo;s value times its close probability, in the month it is expected to close.
          </p>
        </section>
        <section className={s.panel}>
          <h2 className={s.panelTitle}>Results and follow-through</h2>
          <div className={s.kv}>
            <span>Deals won</span>
            <strong>
              {d.won.count}
              {d.won.count ? ` · ${formatMoney(d.won.value)}` : ''}
            </strong>
          </div>
          <div className={s.kv}>
            <span>Deals lost</span>
            <strong>
              {d.lost.count}
              {d.lost.count ? ` · ${formatMoney(d.lost.value)}` : ''}
            </strong>
          </div>
          <div className={s.kv}>
            <span>Overdue actions</span>
            <strong>{d.overdue}</strong>
          </div>
          <div className={s.kv}>
            <span>Open deals with no next step</span>
            <strong>{d.noNextStep}</strong>
          </div>
          <div className={s.kv}>
            <span>Companies · contacts · meetings linked</span>
            <strong>
              {d.targetCompanies} · {d.totalContacts} · {d.meetingsLinked}
            </strong>
          </div>
        </section>
      </div>

      <section className={s.panel}>
        <h2 className={s.panelTitle}>Conversion between stages</h2>
        {d.conversion.map((c) => (
          <div key={c.stage} className={s.kv}>
            <span>{stageLabel(c.stage)} onward</span>
            <strong>{c.rate === undefined ? 'No deals yet' : `${c.rate}% (${c.advanced} of ${c.reached})`}</strong>
          </div>
        ))}
        <p className={s.sub} style={{ fontSize: 12 }}>
          Of the deals that reached each stage, how many went further without being lost.
        </p>
      </section>
    </>
  );
}
