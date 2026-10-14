'use client';

/** EVERY CONTACT, searchable (D120): name, role, company, location, influence, owner. */
import { useState } from 'react';
import Link from 'next/link';
import s from '../crm.module.css';

export type ContactLine = {
  id: string;
  name: string;
  title: string;
  company_id: string;
  company: string;
  location: string;
  role: string;
  owner: string;
  email: string;
};

export function ContactTable({ contacts, showCompany }: { contacts: ContactLine[]; showCompany: boolean }) {
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();
  const rows = needle
    ? contacts.filter((c) => `${c.name} ${c.title} ${c.company} ${c.location} ${c.email} ${c.owner}`.toLowerCase().includes(needle))
    : contacts;
  return (
    <>
      {contacts.length > 6 || showCompany ? (
        <div className={s.bar}>
          <input className={s.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people, roles, companies…" aria-label="Search contacts" />
        </div>
      ) : null}
      {rows.length === 0 ? (
        <p className={s.empty}>{contacts.length === 0 ? 'No contacts yet.' : 'Nobody matches that.'}</p>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                {showCompany ? <th>Company</th> : null}
                <th>Location</th>
                <th>Influence</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className={s.strong}>
                    <Link href={`/console/crm/contact/${c.id}`}>{c.name}</Link>
                  </td>
                  <td>{c.title}</td>
                  {showCompany ? (
                    <td>
                      <Link className={s.listLink} href={`/console/crm/company/${c.company_id}?tab=contacts`}>
                        {c.company}
                      </Link>
                    </td>
                  ) : null}
                  <td>{c.location}</td>
                  <td>{c.role}</td>
                  <td>{c.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
