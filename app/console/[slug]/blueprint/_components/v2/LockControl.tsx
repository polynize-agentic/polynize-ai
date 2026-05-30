'use client';

/**
 * Lock / unlock control (L14). Team-scope only (rendered only when
 * canEdit). Shows the current lock state and the action:
 *  - unlocked → "Lock engagement" (confirm) → POST /lock
 *  - locked → lock indicator + "Unlock (CR)" → confirmation dialog with a
 *    required reason → POST /unlock
 *
 * Unlock is a commercial event; the dialog spells that out. The server
 * additionally bars agents from unlocking.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from './v2-sections.module.css';

export function LockControl({
  slug,
  locked,
  lockVersion,
  actorEmail,
}: {
  slug: string;
  locked: boolean;
  lockVersion: number;
  actorEmail: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function lock() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/console/${slug}/lock`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lockedBy: actorEmail ?? 'team' }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(b.error ?? `Lock failed (${res.status})`);
        setBusy(false);
        return;
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lock failed');
      setBusy(false);
    }
  }

  async function unlock() {
    if (busy || reason.trim().length < 3) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/console/${slug}/unlock`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          unlockedBy: actorEmail ?? 'team',
          unlockReason: reason.trim(),
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(b.error ?? `Unlock failed (${res.status})`);
        setBusy(false);
        return;
      }
      setDialog(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unlock failed');
      setBusy(false);
    }
  }

  if (!locked) {
    return (
      <span className={s.lockControlWrap}>
        <button
          type="button"
          className={s.lockBtn}
          onClick={lock}
          disabled={busy}
          title="Lock the engagement section (Modelling sign-off)"
        >
          {busy ? 'Locking…' : 'Lock engagement'}
        </button>
        {error && <span className={s.lockError}>{error}</span>}
      </span>
    );
  }

  return (
    <span className={s.lockControlWrap}>
      <span className={s.lockBadge} title={`Locked, version ${lockVersion}`}>
        <span aria-hidden>🔒</span> Locked v{lockVersion}
      </span>
      <button
        type="button"
        className={s.unlockBtn}
        onClick={() => setDialog(true)}
        disabled={busy}
      >
        Unlock (CR)
      </button>

      {dialog && (
        <div
          className={s.lockDialogBackdrop}
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDialog(false);
          }}
        >
          <div className={s.lockDialog}>
            <h3 className={s.lockDialogTitle}>Unlock engagement</h3>
            <p className={s.lockDialogBody}>
              Unlocking changes the agreed scope. This requires a Change
              Request. Continue?
            </p>
            <label className={s.editLabel} htmlFor="unlock-reason">
              Change request reason
            </label>
            <textarea
              id="unlock-reason"
              className={s.editorTextarea}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this scope changing?"
              autoFocus
            />
            {error && <span className={s.editorErrorInline}>{error}</span>}
            <div className={s.editorInlineActions}>
              <button
                type="button"
                className={s.btnGhostSm}
                onClick={() => setDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={s.btnPrimarySm}
                onClick={unlock}
                disabled={busy || reason.trim().length < 3}
              >
                {busy ? 'Unlocking…' : 'Confirm unlock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
