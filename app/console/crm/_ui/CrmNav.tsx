'use client';

/** The CRM's top bar (D120): Companies, Contacts, Deals, Actions, Dashboard. A company's own pages count as Companies. */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import s from '../crm.module.css';

const ITEMS = [
  { href: '/console/crm', label: 'Companies', match: (p: string) => p === '/console/crm' || p.startsWith('/console/crm/company') },
  { href: '/console/crm/contacts', label: 'Contacts', match: (p: string) => p.startsWith('/console/crm/contact') },
  { href: '/console/crm/deals', label: 'Deals', match: (p: string) => p.startsWith('/console/crm/deal') },
  { href: '/console/crm/actions', label: 'Actions', match: (p: string) => p.startsWith('/console/crm/actions') },
  { href: '/console/crm/dashboard', label: 'Dashboard', match: (p: string) => p.startsWith('/console/crm/dashboard') },
];

export function CrmNav() {
  const raw = usePathname() ?? '';
  // On pam.polynize.ai the browser shows /crm/...; the routes are the same.
  const path = raw.startsWith('/console') ? raw : `/console${raw}`;
  return (
    <nav className={s.nav} aria-label="CRM">
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href} className={`${s.navLink} ${i.match(path) ? s.navOn : ''}`}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
