'use client';

import { useEffect, useRef, useState } from 'react';
import type { ClientStatus, RagLevel } from '../_lib/load-clients';
import s from './client-card.module.css';

type Props = {
  slug: string;
  status: ClientStatus;
  actorEmail: string;
  onClose: () => void;
  onSaved: (next: ClientStatus) => void;
};

/**
 * Inline editor for a client's RAG status. Three colored dots + a reason
 * textarea + Save/Cancel. Mounted as a sibling of the ClientCard's Link
 * (NOT as a child) so clicks on it don't bubble to the Link and navigate.
 *
 * Save flow:
 *  - Save button disabled until something actually changed.
 *  - On click → setSaving(true), POST to /api/console/[slug]/config/status.
 *  - On 2xx: call onSaved with the new ClientStatus; parent closes us.
 *  - On 4xx/5xx: stay open, surface the error message under the textarea.
 *  - Cancel button + Escape key + backdrop click all close without saving.
 */
const RAG_OPTIONS: RagLevel[] = ['green', 'amber', 'red'];

const RAG_LABELS: Record<RagLevel, string> = {
  green: 'Green',
  amber: 'Amber',
  red: 'Red',
};

export function StatusEditor({
  slug,
  status,
  actorEmail,
  onClose,
  onSaved,
}: Props) {
  const [rag, setRag] = useState<RagLevel>(status.rag);
  const [reason, setReason] = useState<string>(status.reason ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Escape key closes the editor. Skipped while saving so an accidental
  // Escape mid-request doesn't desync the UI.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !saving) {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, saving]);

  // Auto-focus the first RAG option on mount so keyboard users land inside
  // the popover, not stranded outside it.
  useEffect(() => {
    firstButtonRef.current?.focus();
  }, []);

  const originalReason = (status.reason ?? '').trim();
  const changed = rag !== status.rag || reason.trim() !== originalReason;
  const canSave = changed && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/console/${slug}/config/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rag,
          reason: reason.trim() || undefined,
          setBy: actorEmail,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        status?: ClientStatus;
        error?: string;
        detail?: string;
      };
      if (!response.ok || !body.ok || !body.status) {
        throw new Error(body.error ?? body.detail ?? `HTTP ${response.status}`);
      }
      onSaved({
        rag: body.status.rag,
        reason: body.status.reason,
        setAt: body.status.setAt,
        setBy: body.status.setBy,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setSaving(false);
    }
    // Note: no setSaving(false) on success — the parent unmounts us via onSaved.
  }

  return (
    <>
      {/* Backdrop catches clicks outside the popover. Transparent — no scrim
          since the popover is small and the rest of the dashboard should
          still be visible. */}
      <button
        type="button"
        aria-label="Close status editor"
        className={s.editorBackdrop}
        onClick={onClose}
      />
      <div
        className={s.editor}
        role="dialog"
        aria-label="Edit client RAG status"
        // Stop clicks inside the popover from bubbling to the backdrop or
        // the underlying Link.
        onClick={(e) => e.stopPropagation()}
      >
        <div className={s.editorHeader}>RAG status</div>

        <div
          className={s.editorOptions}
          role="radiogroup"
          aria-label="RAG level"
        >
          {RAG_OPTIONS.map((level, i) => {
            const isActive = rag === level;
            const cls = `${s.editorOption} ${s[`editorOption_${level}`]} ${
              isActive ? s.editorOptionActive : ''
            }`;
            return (
              <button
                key={level}
                ref={i === 0 ? firstButtonRef : undefined}
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-label={RAG_LABELS[level]}
                className={cls}
                onClick={() => setRag(level)}
                disabled={saving}
              >
                <span className={`${s.editorDot} ${s[`status_${level}`]}`} />
                <span className={s.editorOptionLabel}>{RAG_LABELS[level]}</span>
              </button>
            );
          })}
        </div>

        <label className={s.editorReasonLabel}>
          <span className={s.editorReasonLabelText}>Reason (optional)</span>
          <textarea
            className={s.editorReason}
            placeholder="What changed? Why this status?"
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={saving}
            rows={3}
          />
        </label>

        {error && (
          <div className={s.editorError} role="alert">
            {error}
          </div>
        )}

        <div className={s.editorActions}>
          <button
            type="button"
            className={s.editorButtonCancel}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className={s.editorButtonSave}
            onClick={handleSave}
            disabled={!canSave}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
}
