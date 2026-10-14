/**
 * GET /console/crm/api/fireflies: recent meetings the signed-in person attended, for "Link a
 * meeting" on a company (D120). Titles, dates, links and the external attendees only: no transcript
 * text is read into the CRM.
 */
import { NextResponse } from 'next/server';
import { crmUser } from '@/lib/crm/guard';
import { teamMember } from '@/lib/crm/schema';
import { fetchRecentMeetings, isFirefliesConfigured, isInternal, transcriptUrl } from '@/lib/crm/fireflies';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const user = await crmUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!isFirefliesConfigured()) return NextResponse.json({ error: 'Fireflies is not connected.' }, { status: 503 });
  const me = teamMember(user.email);
  const mine = new Set([user.email, ...(me ? [me.email, ...(me.aliases ?? [])] : [])]);
  try {
    const meetings = await fetchRecentMeetings({ limit: 40 });
    const out = meetings
      .filter((m) => m.attendees.some((a) => mine.has(a.toLowerCase())) || (m.organizerEmail && mine.has(m.organizerEmail.toLowerCase())))
      .map((m) => ({
        id: m.id,
        title: m.title,
        date: m.dateString ? m.dateString.slice(0, 10) : undefined,
        url: transcriptUrl(m.id),
        external: [...new Set(m.attendees.map((a) => a.toLowerCase()).filter((a) => !isInternal(a)))],
      }));
    return NextResponse.json({ meetings: out });
  } catch (err) {
    console.error('[crm.fireflies] list failed:', err);
    return NextResponse.json({ error: 'Fireflies did not answer. Paste the link instead.' }, { status: 502 });
  }
}
