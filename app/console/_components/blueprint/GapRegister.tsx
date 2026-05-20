import type { GapRegisterParsed } from '@/app/console/_lib/parse-blueprint';
import s from './blueprint-sections.module.css';

type Props = { data: GapRegisterParsed };

function statusClass(status: string): string {
  const norm = status.trim().toLowerCase();
  if (norm === 'answered') return s.statusAnswered;
  if (norm === 'closed') return s.statusClosed;
  return s.statusOpen;
}

export function GapRegister({ data }: Props) {
  return (
    <div className={s.gapRegister}>
      <div className={s.gapTable}>
        <div className={`${s.gapRow} ${s.gapRowHead}`}>
          <div className={s.gapId}>#</div>
          <div className={s.gapQuestion}>Outstanding question</div>
          <div className={s.gapOwner}>Owner</div>
          <div className={s.gapBlocks}>Blocks</div>
          <div className={s.gapStatus}>Status</div>
        </div>
        {data.rows.map((row) => (
          <div key={row.id} className={s.gapRow}>
            <div className={s.gapId}>{row.id}</div>
            <div className={s.gapQuestion}>{row.question}</div>
            <div className={s.gapOwner}>{row.owner}</div>
            <div className={s.gapBlocks}>{row.blocks}</div>
            <div className={s.gapStatus}>
              <span className={`${s.statusPill} ${statusClass(row.status)}`}>
                {row.status || 'open'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className={s.gapFooter}>
        <strong>{data.openCount}</strong> gap{data.openCount === 1 ? '' : 's'} open
        {' · '}
        <strong>{data.blockingCount}</strong> blocking sign-off
      </div>
    </div>
  );
}
