'use client';

/**
 * Export context button (Amendment 1 / Landmark 11.5).
 *
 * Fetches GET /api/console/[slug]/export, then triggers a browser
 * download of the returned markdown as complete-context-<slug>-<date>.md.
 * Available to any authenticated viewer (team + client scope) since it's
 * a read operation that exports only what they can already see.
 */

import { useState } from 'react';
import s from './v2-sections.module.css';

export function ExportButton({ slug }: { slug: string }) {
  const [state, setState] = useState<'idle' | 'working' | 'error'>('idle');

  async function onExport() {
    setState('working');
    try {
      const res = await fetch(`/api/console/${slug}/export`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        setState('error');
        setTimeout(() => setState('idle'), 2500);
        return;
      }
      const text = await res.text();
      // Prefer the server-provided filename; fall back to a sensible default.
      const disp = res.headers.get('content-disposition') ?? '';
      const m = disp.match(/filename="([^"]+)"/);
      const filename =
        m?.[1] ??
        `complete-context-${slug}-${new Date().toISOString().slice(0, 10)}.md`;

      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setState('idle');
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2500);
    }
  }

  return (
    <button
      type="button"
      className={s.exportButton}
      onClick={onExport}
      disabled={state === 'working'}
      title="Download a complete markdown context snapshot"
    >
      {state === 'working'
        ? 'Exporting…'
        : state === 'error'
          ? 'Export failed'
          : 'Export context'}
    </button>
  );
}
