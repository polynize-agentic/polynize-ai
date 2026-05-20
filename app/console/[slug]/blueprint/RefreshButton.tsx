'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import s from './blueprint.module.css';

type Props = { slug: string };

export function RefreshButton({ slug }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await fetch(`/api/console/${slug}/blueprint/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      startTransition(() => router.refresh());
    } catch (err) {
      console.error('[refresh] failed', err);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`${s.refreshButton} ${pending ? s.refreshButtonPending : ''}`}
      aria-label="Refresh Blueprint from GitHub"
      title="Refresh Blueprint from GitHub"
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
      <span>Refresh</span>
    </button>
  );
}
