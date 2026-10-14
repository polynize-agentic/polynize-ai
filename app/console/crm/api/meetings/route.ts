/**
 * POST /console/crm/api/meetings: link a meeting to a company (D120). Optionally adds the external
 * attendees as contacts in the same step. DELETE ?id= removes a link.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { crmUser } from '@/lib/crm/guard';
import { addMeeting, deleteMeeting, createRecord, addNote } from '@/lib/crm/records';
import { fetchMeetingSummary } from '@/lib/crm/fireflies';
import { meetingNoteBody } from '@/lib/crm/history';
import { nameFromEmail } from '@/lib/crm/schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const user = await crmUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const b = (await req.json().catch(() => null)) as {
    company_id?: string;
    title?: string;
    url?: string;
    met_at?: string;
    fireflies_id?: string;
    attendees?: string[];
  } | null;
  if (!b?.company_id) return NextResponse.json({ error: 'which company?' }, { status: 400 });
  const r = await addMeeting(b.company_id, { title: b.title ?? '', url: b.url ?? '', met_at: b.met_at, fireflies_id: b.fireflies_id }, user.email);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status });
  /**
   * THE MEETING'S SUMMARY INTO HISTORY (D121), dated on the meeting day, when it came from Fireflies.
   * Best effort: a summary Fireflies will not give costs the summary, never the link.
   */
  let summarised = false;
  if (b.fireflies_id) {
    const body = meetingNoteBody(await fetchMeetingSummary(b.fireflies_id).catch(() => null));
    if (body) {
      const n = await addNote(
        { company_id: b.company_id, meeting_id: r.id, kind: 'meeting', title: b.title, body, occurred_at: b.met_at, source: 'fireflies' },
        user.email
      );
      summarised = n.ok;
    }
  }
  let added = 0;
  for (const email of (b.attendees ?? []).slice(0, 30)) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) continue;
    const c = await createRecord(
      'contact',
      { ...nameFromEmail(email), email, company_id: b.company_id, last_contact_at: b.met_at ?? '' },
      user.email
    );
    if (c.ok) added += 1;
  }
  return NextResponse.json({ id: r.id, contacts_added: added, summarised });
}

export async function DELETE(req: NextRequest) {
  const user = await crmUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'bad id' }, { status: 400 });
  const r = await deleteMeeting(id);
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: r.status });
}
