'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { track, type AnalyticsEvent, type EventProps } from '@/lib/analytics';

type Props = Omit<ComponentProps<typeof Link>, 'children'> & {
  event: AnalyticsEvent;
  eventProps?: EventProps;
  external?: boolean;
  children: ReactNode;
};

/**
 * Drop-in replacement for next/link that fires an analytics event on
 * click. For external links use external=true and pass an absolute href;
 * the component renders an <a> with target=_blank rel=noopener.
 */
export function TrackedLink({
  event,
  eventProps,
  external,
  children,
  onClick,
  ...rest
}: Props) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    track(event, eventProps);
    onClick?.(e as React.MouseEvent<HTMLAnchorElement>);
  };

  if (external) {
    return (
      <a
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={String(rest.href ?? '#')}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link {...rest} onClick={handleClick}>
      {children}
    </Link>
  );
}
