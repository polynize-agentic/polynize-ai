import Link from 'next/link';
import type { ClientCardData, ClientStatus } from '../_lib/load-clients';
import s from './client-card.module.css';

function relativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/**
 * Compose the dot's hover tooltip: rag level, the human reason (if any),
 * and who set it / when (if recorded). Falls back to a bare label like
 * "Status: green" when no reason has been written.
 */
function statusTooltip(status: ClientStatus): string {
  const label = `Status: ${status.rag}`;
  const parts: string[] = [];
  if (status.reason) parts.push(status.reason);
  if (status.setBy || status.setAt) {
    const byPart = status.setBy ? `Set by ${status.setBy}` : 'Set';
    const atPart = status.setAt ? ` at ${status.setAt}` : '';
    parts.push(`${byPart}${atPart}`);
  }
  return parts.length > 0 ? `${label}. ${parts.join(' · ')}` : label;
}

function StatusDot({ status }: { status: ClientStatus }) {
  const cls = `${s.statusDot} ${s[`status_${status.rag}`]}`;
  return (
    <span
      className={cls}
      role="img"
      aria-label={statusTooltip(status)}
      title={statusTooltip(status)}
    />
  );
}

export function ClientCard({ data }: { data: ClientCardData }) {
  const href = `/console/${data.slug}/blueprint`;

  if (data.error) {
    return (
      <Link href={href} className={s.card}>
        <StatusDot status={data.status} />
        <div className={s.cardInner}>
          <h2 className={s.name}>{data.name}</h2>
          <span className={s.errorBadge}>data unavailable</span>
          <p className={s.errorMessage}>{data.error}</p>
        </div>
      </Link>
    );
  }

  const phaseLabel =
    data.gateNext && data.subPhase
      ? `${data.phase.toUpperCase()} · ${data.subPhase} → ${data.gateNext}`
      : data.phase.toUpperCase();

  return (
    <Link href={href} className={s.card}>
      <StatusDot status={data.status} />
      <div className={s.cardInner}>
        <h2 className={s.name}>{data.name}</h2>
        {(data.leadHuman || data.leadEmail) && (
          <p className={s.lead}>
            {data.leadHuman && <span className={s.leadName}>{data.leadHuman}</span>}
            {data.leadHuman && data.leadEmail && <span className={s.leadSep}> · </span>}
            {data.leadEmail && <span className={s.leadEmail}>{data.leadEmail}</span>}
          </p>
        )}
        <div className={s.cardFoot}>
          <span className={s.phaseBadge}>{phaseLabel}</span>
          {data.lastUpdated && (
            <span className={s.updated}>Updated {relativeTime(data.lastUpdated)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
