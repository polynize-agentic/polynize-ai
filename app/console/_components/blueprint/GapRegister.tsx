'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type {
  GapRegisterParsed,
  GapRegisterRow,
} from '@/app/console/_lib/parse-blueprint';
import s from './blueprint-sections.module.css';

type Props = { data: GapRegisterParsed; slug: string };

type StatusOption = 'open' | 'answered' | 'closed';
const STATUS_OPTIONS: StatusOption[] = ['open', 'answered', 'closed'];

function statusClass(status: string): string {
  const norm = status.trim().toLowerCase();
  if (norm === 'answered') return s.statusAnswered;
  if (norm === 'closed') return s.statusClosed;
  return s.statusOpen;
}

export function GapRegister({ data, slug }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [rows, setRows] = useState<GapRegisterRow[]>(data.rows);
  const [statusOpenFor, setStatusOpenFor] = useState<string | null>(null);
  const [notesEditingFor, setNotesEditingFor] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorByGap, setErrorByGap] = useState<Record<string, string>>({});

  // Sync local rows with the server prop on every parent re-render.
  // This is what makes the Refresh button (and any out-of-band edits made
  // by Mike, curl, or another tab) show up on the page. Without this,
  // useState initializes once from data.rows and never re-syncs.
  // Optimistic updates aren't clobbered because they happen synchronously
  // before any parent re-render, so data.rows reference is unchanged
  // during the optimistic window.
  useEffect(() => {
    setRows(data.rows);
  }, [data.rows]);

  const openCount = rows.filter((r) => r.status.toLowerCase() === 'open').length;
  const blockingCount = data.blockingCount;

  async function updateGap(
    gapId: string,
    partial: { status?: StatusOption; notes?: string }
  ) {
    const previous = rows.find((r) => r.id === gapId);
    if (!previous) return;

    setSavingId(gapId);
    setErrorByGap((prev) => ({ ...prev, [gapId]: '' }));

    // Optimistic update
    setRows((prev) =>
      prev.map((r) =>
        r.id === gapId
          ? {
              ...r,
              ...(partial.status ? { status: partial.status } : {}),
              ...(partial.notes !== undefined ? { notes: partial.notes } : {}),
            }
          : r
      )
    );

    try {
      const response = await fetch(`/api/console/${slug}/blueprint/gaps/${gapId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setRows((prev) => prev.map((r) => (r.id === gapId ? previous : r)));
      setErrorByGap((prev) => ({
        ...prev,
        [gapId]: err instanceof Error ? err.message : 'Save failed',
      }));
    } finally {
      setSavingId(null);
    }
  }

  function openNotesEditor(row: GapRegisterRow) {
    setNotesEditingFor(row.id);
    setNotesDraft(row.notes ?? '');
  }

  function commitNotes(row: GapRegisterRow) {
    setNotesEditingFor(null);
    const trimmed = notesDraft.trim();
    if (trimmed !== (row.notes ?? '').trim()) {
      updateGap(row.id, { notes: trimmed });
    }
  }

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

        {rows.map((row) => (
          <div key={row.id} className={s.gapRowGroup}>
            <div className={s.gapRow}>
              <div className={s.gapId}>{row.id}</div>
              <div className={s.gapQuestion}>{row.question}</div>
              <div className={s.gapOwner}>{row.owner}</div>
              <div className={s.gapBlocks}>{row.blocks}</div>
              <div className={s.gapStatus}>
                <button
                  type="button"
                  className={`${s.statusPill} ${statusClass(row.status)} ${s.statusPillButton}`}
                  onClick={() =>
                    setStatusOpenFor((prev) => (prev === row.id ? null : row.id))
                  }
                  disabled={savingId === row.id}
                  aria-haspopup="menu"
                  aria-expanded={statusOpenFor === row.id}
                >
                  {row.status || 'open'}
                </button>
                {statusOpenFor === row.id && (
                  <div className={s.statusDropdown} role="menu">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        role="menuitem"
                        className={`${s.statusOption} ${statusClass(opt)} ${
                          opt === row.status ? s.statusOptionCurrent : ''
                        }`}
                        onClick={() => {
                          setStatusOpenFor(null);
                          if (opt !== row.status) updateGap(row.id, { status: opt });
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={s.gapNotesRow}>
              {notesEditingFor === row.id ? (
                <div className={s.notesEditor}>
                  <textarea
                    className={s.notesTextarea}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    rows={2}
                    placeholder="e.g., Confirmed on call 20 May."
                    autoFocus
                  />
                  <div className={s.notesActions}>
                    <button
                      type="button"
                      className={s.notesSaveBtn}
                      onClick={() => commitNotes(row)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className={s.notesCancelBtn}
                      onClick={() => setNotesEditingFor(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : row.notes ? (
                <button
                  type="button"
                  className={s.notesDisplay}
                  onClick={() => openNotesEditor(row)}
                >
                  <span className={s.notesLabel}>Note</span>
                  <span className={s.notesText}>{row.notes}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className={s.notesAddLink}
                  onClick={() => openNotesEditor(row)}
                >
                  + Add note
                </button>
              )}
              {errorByGap[row.id] && (
                <div className={s.notesError} role="alert">
                  {errorByGap[row.id]}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={s.gapFooter}>
        <strong>{openCount}</strong> gap{openCount === 1 ? '' : 's'} open
        {' · '}
        <strong>{blockingCount}</strong> blocking sign-off
      </div>
    </div>
  );
}
