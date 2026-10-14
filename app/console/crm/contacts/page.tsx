import { getCurrentUser } from '@/lib/console-auth';
import { tryLoadCrm } from '@/lib/crm/records';
import { NotReady } from '../_ui/NotReady';
import { AddRecord } from '../_ui/RecordForm';
import { ContactTable } from '../_ui/ContactTable';
import { contactLines, lookupsFrom } from '../_ui/shape';
import s from '../crm.module.css';

export const dynamic = 'force-dynamic';

/** EVERY CONTACT ACROSS EVERY COMPANY (D120), searchable. */
export default async function ContactsPage() {
  const user = await getCurrentUser();
  const data = await tryLoadCrm();
  if (!data) return <NotReady />;
  const lines = contactLines(data).sort((a, b) => a.company.localeCompare(b.company) || a.name.localeCompare(b.name));
  return (
    <>
      <div className={s.head}>
        <div>
          <h1 className={s.h1}>Contacts</h1>
          <p className={s.sub}>Everyone we know, at every company.</p>
        </div>
      </div>
      <div className={s.bar}>
        {data.companies.length ? (
          <AddRecord kind="contact" label="+ Add contact" title="Add a contact" lookups={lookupsFrom(data)} me={user?.email} />
        ) : (
          <p className={s.empty}>Add a company first; every contact belongs to one.</p>
        )}
      </div>
      <section className={s.panel}>
        <ContactTable contacts={lines} showCompany />
      </section>
    </>
  );
}
