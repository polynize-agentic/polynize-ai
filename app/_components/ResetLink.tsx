'use client';

import { useCallback, type ReactNode } from 'react';
import { track, type EventProps } from '@/lib/analytics';

type Props = {
  className?: string;
  children: ReactNode;
  /** Where to send the user after clearing local state. Defaults to /agents. */
  href?: string;
  event?: 'cta_click';
  eventProps?: EventProps;
};

export const AGENTS_STORAGE_KEY = 'polynize_agents_state_v3';

/**
 * Clears the /agents flow's local cache and sends the visitor onward
 * (default /agents). Hard navigation so any in-memory React state is dropped.
 */
export function ResetLink({
  className,
  children,
  href = '/agents',
  event = 'cta_click',
  eventProps,
}: Props) {
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      try {
        window.localStorage.removeItem(AGENTS_STORAGE_KEY);
        // Cookie is fine to keep (the next visit will reuse the session row);
        // we're only resetting the client-side flow cache.
      } catch {
        /* private mode etc. */
      }
      track(event, eventProps);
      window.location.href = href;
    },
    [href, event, eventProps]
  );

  return (
    <a className={className} href={href} onClick={onClick}>
      {children}
    </a>
  );
}
