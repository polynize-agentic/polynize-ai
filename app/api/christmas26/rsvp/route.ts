/**
 * POST /api/christmas26/rsvp: one reply to the Christmas Party invite (D128).
 *
 * Uses only what the site already has: Supabase to store the reply (so Marrs can export a CSV)
 * and Resend to email it to marrs@polynize.io in the exact format Evelyn reads. No new vendor.
 *
 * EITHER IS ENOUGH. The store and the email run side by side, and the guest sees "thank you" if
 * at least one of them worked: a reply that reaches the inbox but not the table (or the other
 * way round) is still a reply nobody has to chase. Only when both fail does the guest see an error
 * and the line to email Marrs instead.
 *
 * PRIVACY. Allergies are health information. The table has RLS on and no policies, so only this
 * server can read it; the logs never carry what a guest typed; and the purge job deletes every
 * row after the event (app/api/cron/christmas26-purge).
 *
 * SPAM. A hidden `website` field: a person never fills it in, so a reply that has it is dropped
 * with a normal "ok", which tells the bot nothing. No CAPTCHA unless spam shows up (the brief).
 */

import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { sendEmail } from '@/lib/resend-client';
import {
  ERRORS,
  RSVP_TO,
  isRsvpOpen,
  linkNameFrom,
  rsvpEmail,
  validateRsvp,
  type CleanRsvp,
} from '@/lib/christmas26/event';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** A full reply is well under 3 KB. Anything far bigger is not a guest. */
const MAX_BODY_BYTES = 10_000;

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function store(reply: CleanRsvp, linkName: string | null, test: boolean): Promise<boolean> {
  try {
    const { error } = await supabaseService().from('christmas26_rsvps').insert({
      name: reply.name,
      coming: reply.coming,
      with_partner: reply.withPartner,
      partner_name: reply.partnerName,
      allergies: reply.allergies,
      note: reply.note,
      link_name: linkName,
      is_test: test,
    });
    if (error) {
      console.error('[christmas26] store failed:', error.code, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[christmas26] store threw:', e instanceof Error ? e.message : 'unknown');
    return false;
  }
}

async function email(reply: CleanRsvp, linkName: string | null, test: boolean): Promise<boolean> {
  try {
    const { subject, text } = rsvpEmail(reply, linkName, new Date(), test);
    const html = `<div style="font-family:ui-monospace,Menlo,monospace;font-size:14px;line-height:1.6">${text
      .split('\n')
      .map(escapeHtml)
      .join('<br>')}</div>`;
    const result = await sendEmail({ to: RSVP_TO, subject, text, html });
    if (result.status !== 'sent') {
      console.warn('[christmas26] email not sent:', result.reason);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[christmas26] email threw:', e instanceof Error ? e.message : 'unknown');
    return false;
  }
}

export async function POST(req: Request) {
  if (!isRsvpOpen()) {
    return NextResponse.json({ error: 'closed', message: ERRORS.closed }, { status: 410 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const result = validateRsvp(body);
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const linkName = linkNameFrom(typeof body.linkName === 'string' ? body.linkName : undefined);
  const test = body.test === true;

  const [stored, emailed] = await Promise.all([
    store(result.value, linkName, test),
    email(result.value, linkName, test),
  ]);

  if (!stored && !emailed) {
    return NextResponse.json({ error: 'failed', message: ERRORS.failed }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
