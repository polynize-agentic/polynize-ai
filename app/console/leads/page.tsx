import { redirect } from 'next/navigation';

/**
 * THE OLD LEADS HOME (D120). The CRM is company first now and lives at /console/crm. This address
 * is in bookmarks and notes, so it forwards rather than failing. The per-person lists under
 * /console/leads/{owner} still answer at their own addresses with their data untouched: website
 * leads keep landing there, and the new-lead emails still point at them.
 */
export default function LeadsHome() {
  redirect('/console/crm');
}
