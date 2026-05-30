'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ClientCardData, ClientStatus } from '../_lib/load-clients';
import { StatusEditor } from './StatusEditor';
import s from './client-card.module.css';

type Props = {
  data: ClientCardData;
  /**
   * Email of the signed-in user, used to stamp the YAML's rag_set_by field
   * when this card's status is edited. Pass null for read-only rendering
   * (no editor mounted, dot stays as a plain visual indicator).
   */
  actorEmail: string | null;
  /**
   * Card variant — drives the LEAD tag, opacity, and Convert-to-Client CTA.
   * Defaults to 'client'. Determined by the caller from engagement_status.
   */
  variant?: 'client' | 'lead' | 'archived';
};

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

/**
 * Sits as a sibling of the card's Link (not a child), so clicks on it do
 * NOT bubble to the Link and navigate. preventDefault + stopPropagation are
 * belt + braces in case CSS pointer-events leak through.
 */
function StatusDotButton({
  status,
  editable,
  onClick,
}: {
  status: ClientStatus;
  editable: boolean;
  onClick: () => void;
}) {
  const baseCls = `${s.statusDot} ${s[`status_${status.rag}`]}`;
  const tooltip = statusTooltip(status);

  if (!editable) {
    return (
      <span
        className={baseCls}
        role="img"
        aria-label={tooltip}
        title={tooltip}
      />
    );
  }

  return (
    <button
      type="button"
      className={`${baseCls} ${s.statusDotButton}`}
      aria-label={`Edit RAG status. ${tooltip}`}
      title={tooltip}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    />
  );
}

export function ClientCard({ data, actorEmail, variant = 'client' }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useState<ClientStatus | null>(
    null
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [converting, setConverting] = useState(false);

  const displayStatus = optimisticStatus ?? data.status;
  const href = `/console/${data.slug}/blueprint`;
  const editable = !!actorEmail;
  const isLead = variant === 'lead';

  function handleSaved(next: ClientStatus) {
    setOptimisticStatus(next);
    setEditorOpen(false);
    // Pull fresh data from the server so the canonical state catches up
    // with the optimistic one. The transition wrapper keeps the navigation
    // non-blocking — the user sees their change immediately.
    startTransition(() => router.refresh());
  }

  async function handleConvert(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (converting) return;
    setConverting(true);
    try {
      const res = await fetch(`/api/console/${data.slug}/convert`, {
        method: 'POST',
      });
      if (res.ok) {
        startTransition(() => router.refresh());
      }
    } finally {
      setConverting(false);
    }
  }

  const wrapCls = isLead
    ? `${s.cardWrap} ${s.cardWrapLead}`
    : variant === 'archived'
      ? `${s.cardWrap} ${s.cardWrapArchived}`
      : s.cardWrap;

  if (data.error) {
    return (
      <div className={wrapCls}>
        <Link href={href} className={s.card}>
          <div className={s.cardInner}>
            <h2 className={s.name}>{data.name}</h2>
            <span className={s.errorBadge}>data unavailable</span>
            <p className={s.errorMessage}>{data.error}</p>
          </div>
        </Link>
        <StatusDotButton
          status={displayStatus}
          editable={editable}
          onClick={() => setEditorOpen(true)}
        />
        {editorOpen && actorEmail && (
          <StatusEditor
            slug={data.slug}
            status={displayStatus}
            actorEmail={actorEmail}
            onClose={() => setEditorOpen(false)}
            onSaved={handleSaved}
          />
        )}
      </div>
    );
  }

  // Prefer the Stage 2 engagement_phase when present; fall back to the
  // legacy phase + sub-phase + gate convention.
  const phaseLabel = data.engagementPhase
    ? data.engagementPhase.toUpperCase()
    : data.gateNext && data.subPhase
      ? `${data.phase.toUpperCase()} · ${data.subPhase} → ${data.gateNext}`
      : data.phase.toUpperCase();

  // Active work plan from the registry (in_progress or operate).
  const activeWorkPlan =
    data.workPlanRegistry.find(
      (w) => w.status === 'in_progress' || w.status === 'operate'
    ) ?? null;

  return (
    <div className={wrapCls}>
      {isLead && <span className={s.leadTag}>LEAD</span>}
      <Link href={href} className={s.card}>
        <div className={s.cardInner}>
          <h2 className={s.name}>{data.name}</h2>
          {(data.leadHuman || data.leadEmail) && (
            <p className={s.lead}>
              {data.leadHuman && (
                <span className={s.leadName}>{data.leadHuman}</span>
              )}
              {data.leadHuman && data.leadEmail && (
                <span className={s.leadSep}> · </span>
              )}
              {data.leadEmail && (
                <span className={s.leadEmail}>{data.leadEmail}</span>
              )}
            </p>
          )}
          {activeWorkPlan && (
            <p className={s.activeWp}>
              <span className={s.activeWpDot} aria-hidden />
              {activeWorkPlan.title}
            </p>
          )}
          <div className={s.cardFoot}>
            <span className={s.phaseBadge}>{phaseLabel}</span>
            {data.lastUpdated && (
              <span className={s.updated}>
                Updated {relativeTime(data.lastUpdated)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <StatusDotButton
        status={displayStatus}
        editable={editable}
        onClick={() => setEditorOpen(true)}
      />
      {/* Convert-to-Client: team-scope only, leads only. */}
      {isLead && editable && (
        <button
          type="button"
          className={s.convertCta}
          onClick={handleConvert}
          disabled={converting}
        >
          {converting ? 'Converting…' : 'Convert to Client'}
        </button>
      )}
      {editorOpen && actorEmail && (
        <StatusEditor
          slug={data.slug}
          status={displayStatus}
          actorEmail={actorEmail}
          onClose={() => setEditorOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
