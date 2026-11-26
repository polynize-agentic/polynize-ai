/**
 * THE POLYNIZE CHRISTMAS PARTY 2026 (D128): the event facts, the RSVP rules and the text that
 * every part of /christmas26 shares. One file, so the page, the .ics file, the RSVP email and the
 * tests can never disagree on a time, an address or an error message.
 *
 * Plain data and pure functions only. The RSVP form is a client component and imports this file,
 * so nothing server-only may come in here.
 */

/**
 * www, because Vercel sends polynize.ai to www.polynize.ai (307). The link preview must point at
 * the final address: a crawler that does not follow the redirect shows no image.
 */
export const PAGE_URL = 'https://www.polynize.ai/christmas26';
export const OG_IMAGE_URL = 'https://www.polynize.ai/christmas26/og.png';
export const ICS_PATH = '/christmas26/polynize-christmas-party.ics';
export const RSVP_API_PATH = '/api/christmas26/rsvp';
/** Every reply is emailed here. Evelyn reads these emails and updates the guest list. */
export const RSVP_TO = 'marrs@polynize.io';
export const QUESTIONS_EMAIL = 'marrs@polynize.io';

export const EVENT = {
  title: 'Polynize Christmas Party',
  dateLabel: 'Thursday 17 December 2026',
  shortDateLabel: 'Thursday 17 December',
  timeLabel: '6pm to 9pm',
  placeLabel: 'Commons Bar, Level 1, 55 Collins Street, Melbourne',
  whatsOn: 'Drinks and canapés from 6pm. Partners are welcome.',
  /** 6pm to 9pm Melbourne time. Melbourne is on AEDT (UTC+11) in December. */
  startUtc: '20261217T070000Z',
  endUtc: '20261217T100000Z',
  calendarLocation: 'Commons Bar, Level 1, 55 Collins Street, Melbourne VIC 3000',
  mapsQuery: 'Commons Bar, 55 Collins Street, Melbourne',
} as const;

/**
 * Replies close at the end of Friday 4 December, Melbourne time: midnight AEDT is 13:00 UTC.
 * Marrs, 24 November: the form closes after the reply date. 26 November: the reply date moves from
 * Friday 27 November to the Friday after. The page itself stays up, because guests still need the
 * details and directions until the night. RSVP_BY_LABEL is the same date, for the page.
 */
export const RSVP_CLOSES_AT = Date.parse('2026-12-04T13:00:00Z');
export const RSVP_BY_LABEL = 'Friday 4 December';

/**
 * Replies are deleted from Monday 21 December, Melbourne time (00:00 AEDT). The brief's limit is
 * 31 December; starting ten days early gives the daily purge job ten chances to run.
 */
export const RSVP_PURGE_FROM = Date.parse('2026-12-20T13:00:00Z');

export function isRsvpOpen(now: number = Date.now()): boolean {
  return now < RSVP_CLOSES_AT;
}

/* ------------------------------------------------------------------ text cleaning */

export const LIMITS = { linkName: 40, name: 80, partnerName: 80, allergies: 500, note: 1000 } as const;

/**
 * A value a visitor typed, made safe to show and to put on one line of an email: control
 * characters and line breaks become spaces, runs of space become one, the ends are trimmed, and
 * it is cut to `max` characters (whole characters, so an emoji is never cut in half). It is plain
 * text from here on: React and the email builder escape it, nothing ever renders it as HTML.
 */
export function cleanText(raw: unknown, max: number): string {
  if (typeof raw !== 'string') return '';
  const flat = raw
    .replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return Array.from(flat).slice(0, max).join('').trim();
}

/** The `?n=` value of a personal link: plain text, at most 40 characters, or null. */
export function linkNameFrom(raw: string | string[] | undefined): string | null {
  const first = Array.isArray(raw) ? raw[0] : raw;
  const name = cleanText(first, LIMITS.linkName);
  return name || null;
}

/* ------------------------------------------------------------------ the reply */

export type Coming = 'yes' | 'no';
export type PartnerChoice = 'alone' | 'partner';

/** What the form holds. Empty strings mean "not answered". */
export type RsvpFields = {
  name: string;
  coming: Coming | '';
  partner: PartnerChoice | '';
  partnerName: string;
  allergies: string;
  note: string;
};

export type RsvpFieldErrors = Partial<Record<'name' | 'coming' | 'partner' | 'partnerName', string>>;

/** A reply that passed validation. Partner and allergy answers only exist for a "yes". */
export type CleanRsvp = {
  name: string;
  coming: boolean;
  withPartner: boolean;
  partnerName: string | null;
  allergies: string | null;
  note: string | null;
};

export const ERRORS = {
  name: 'Add your name so we know who is replying.',
  coming: 'Tell us if you can make it.',
  partner: 'Tell us if your partner is coming.',
  partnerName: "Add your partner's name.",
  closed: 'Replies are now closed.',
  failed: `Your reply did not send. Try again, or email ${QUESTIONS_EMAIL}.`,
} as const;

/**
 * The one validator, run by the form before it sends and by the API before it stores. The same
 * rules and the same messages on both sides, so the server can never refuse a reply the form
 * said was fine.
 */
export function validateRsvp(
  input: Partial<Record<keyof RsvpFields, unknown>>,
): { ok: true; value: CleanRsvp } | { ok: false; errors: RsvpFieldErrors } {
  const name = cleanText(input.name, LIMITS.name);
  const coming = input.coming === 'yes' || input.coming === 'no' ? input.coming : '';
  const partner = input.partner === 'alone' || input.partner === 'partner' ? input.partner : '';
  const partnerName = cleanText(input.partnerName, LIMITS.partnerName);
  const allergies = cleanText(input.allergies, LIMITS.allergies);
  const note = cleanText(input.note, LIMITS.note);

  const errors: RsvpFieldErrors = {};
  if (!name) errors.name = ERRORS.name;
  if (!coming) errors.coming = ERRORS.coming;
  if (coming === 'yes' && !partner) errors.partner = ERRORS.partner;
  if (coming === 'yes' && partner === 'partner' && !partnerName) errors.partnerName = ERRORS.partnerName;
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const yes = coming === 'yes';
  const withPartner = yes && partner === 'partner';
  return {
    ok: true,
    value: {
      name,
      coming: yes,
      withPartner,
      partnerName: withPartner ? partnerName : null,
      allergies: yes && allergies ? allergies : null,
      note: note || null,
    },
  };
}

/* ------------------------------------------------------------------ the email */

/** "Wed 25 Nov 2026, 7:42pm AEDT": the time a reply was sent, on Melbourne's clock. */
export function melbourneTime(at: Date): string {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).formatToParts(at);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  const period = get('dayPeriod').toLowerCase().replace(/\./g, '');
  return `${get('weekday')} ${get('day')} ${get('month')} ${get('year')}, ${get('hour')}:${get('minute')}${period} ${get('timeZoneName')}`;
}

/**
 * The email Evelyn reads, in the exact format of the brief (section 4). A test reply (sent from
 * the page with `?test=1`) has a subject that starts with "TEST", so it is easy to find and delete.
 */
export function rsvpEmail(
  reply: CleanRsvp,
  linkName: string | null,
  sentAt: Date,
  test: boolean,
): { subject: string; text: string } {
  const coming = reply.coming ? 'Yes' : 'No';
  const subject = `${test ? 'TEST ' : ''}RSVP Polynize Christmas 2026: ${reply.name} (${coming})`;
  const lines = [
    `Name: ${reply.name}`,
    `Coming: ${coming}`,
    `Partner: ${reply.withPartner ? `Yes, ${reply.partnerName}` : 'No'}`,
    `Allergies: ${reply.allergies ?? 'None'}`,
    `Note: ${reply.note ?? 'None'}`,
    `Link name: ${linkName ?? 'None'}`,
    `Sent: ${melbourneTime(sentAt)}`,
  ];
  return { subject, text: lines.join('\n') };
}

/* ------------------------------------------------------------------ calendar and map links */

export function googleCalendarUrl(): string {
  const q = [
    'action=TEMPLATE',
    `text=${encodeURIComponent(EVENT.title)}`,
    `dates=${EVENT.startUtc}/${EVENT.endUtc}`,
    `location=${encodeURIComponent(EVENT.calendarLocation)}`,
    `details=${encodeURIComponent(`${EVENT.whatsOn}\n${PAGE_URL}`)}`,
    'ctz=Australia%2FMelbourne',
  ];
  return `https://calendar.google.com/calendar/render?${q.join('&')}`;
}

export function directionsUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT.mapsQuery)}`;
}

/** RFC 5545 text escaping: backslash, semicolon, comma and line breaks. */
function icsEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** RFC 5545 folds lines longer than 75 octets. Never splits a multi-byte character. */
function icsFold(line: string): string {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = '';
  let curBytes = 0;
  for (const ch of Array.from(line)) {
    const b = enc.encode(ch).length;
    const limit = out.length === 0 ? 75 : 74; // continuation lines start with a space
    if (curBytes + b > limit) {
      out.push(cur);
      cur = '';
      curBytes = 0;
    }
    cur += ch;
    curBytes += b;
  }
  out.push(cur);
  return out.join('\r\n ');
}

/** The .ics file behind "Add to calendar". Times are UTC, so every calendar app shows 6pm in Melbourne. */
export function icsFile(): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Polynize//Christmas Party 2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:christmas26-party@polynize.ai',
    'DTSTAMP:20261124T000000Z',
    `DTSTART:${EVENT.startUtc}`,
    `DTEND:${EVENT.endUtc}`,
    `SUMMARY:${icsEscape(EVENT.title)}`,
    `LOCATION:${icsEscape(EVENT.calendarLocation)}`,
    `DESCRIPTION:${icsEscape(`${EVENT.whatsOn}\n${PAGE_URL}`)}`,
    `URL:${PAGE_URL}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(icsFold).join('\r\n') + '\r\n';
}
