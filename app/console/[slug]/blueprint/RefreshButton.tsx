'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import s from './blueprint.module.css';

type Props = { slug: string };

type State = 'idle' | 'pending' | 'success' | 'error';

const SUCCESS_FLASH_MS = 1800;

export function RefreshButton({ slug }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [state, setState] = useState<State>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset the success / error flash back to idle after a short delay.
  useEffect(() => {
    if (state !== 'success' && state !== 'error') return;
    const timer = setTimeout(() => {
      setState('idle');
      setErrorMessage(null);
    }, SUCCESS_FLASH_MS);
    return () => clearTimeout(timer);
  }, [state]);

  async function handleClick() {
    setState('pending');
    setErrorMessage(null);
    try {
      const response = await fetch(
        `/api/console/${slug}/blueprint/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }
      startTransition(() => router.refresh());
      setState('success');
    } catch (err) {
      console.error('[refresh] failed', err);
      setErrorMessage(err instanceof Error ? err.message : 'Refresh failed');
      setState('error');
    }
  }

  const label =
    state === 'pending'
      ? 'Refreshing'
      : state === 'success'
        ? 'Updated'
        : state === 'error'
          ? 'Failed'
          : 'Refresh';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === 'pending'}
      className={`${s.refreshButton} ${
        state === 'pending' ? s.refreshButtonPending : ''
      } ${state === 'success' ? s.refreshButtonSuccess : ''} ${
        state === 'error' ? s.refreshButtonError : ''
      }`}
      aria-label="Refresh Blueprint from GitHub"
      title={errorMessage ?? 'Refresh Blueprint from GitHub'}
    >
      {state === 'success' ? (
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
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
      )}
      <span>{label}</span>
    </button>
  );
}
