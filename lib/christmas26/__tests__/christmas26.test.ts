/**
 * THE CHRISTMAS INVITE (D128): the reply rules, the email format Evelyn reads, the calendar file
 * and the tree. Run with `npm run test:christmas26`.
 */

import assert from 'node:assert/strict';
import {
  ERRORS,
  RSVP_CLOSES_AT,
  RSVP_PURGE_FROM,
  cleanText,
  googleCalendarUrl,
  icsFile,
  isRsvpOpen,
  linkNameFrom,
  melbourneTime,
  rsvpEmail,
  validateRsvp,
  type CleanRsvp,
} from '../event';
import { treeSvg } from '../tree';

let n = 0;
const ok = (c: unknown, msg: string) => {
  n += 1;
  assert.ok(c, msg);
};
const eq = <T>(a: T, b: T, msg: string) => {
  n += 1;
  assert.deepEqual(a, b, msg);
};

/* ---------------------------------------------------------------- personal links */

eq(linkNameFrom('Stuart'), 'Stuart', 'a plain name passes');
eq(linkNameFrom(undefined), null, 'no ?n= means no greeting');
eq(linkNameFrom('   '), null, 'a blank ?n= means no greeting');
eq(linkNameFrom(['Ann', 'Bob']), 'Ann', 'a repeated ?n= uses the first');
eq(linkNameFrom('x'.repeat(60))?.length, 40, 'kept to 40 characters');
eq(linkNameFrom('<b>Stuart</b>'), '<b>Stuart</b>', 'HTML stays text: React escapes it, nothing renders it');
eq(linkNameFrom('Stu\nart\u0000'), 'Stu art', 'line breaks and control characters cannot reach an email line');
eq(cleanText('😀'.repeat(50), 40).length, 80, 'an emoji is never cut in half (40 emoji, 80 code units)');

/* ---------------------------------------------------------------- validation */

const base = { name: 'Stuart', coming: 'yes', partner: 'alone', partnerName: '', allergies: '', note: '' };

{
  const r = validateRsvp({ ...base, name: '  ' });
  ok(!r.ok && r.errors.name === ERRORS.name, 'a blank name is refused with the brief message');
}
{
  const r = validateRsvp({ ...base, coming: '' });
  ok(!r.ok && r.errors.coming === ERRORS.coming, 'coming is required');
}
{
  const r = validateRsvp({ ...base, partner: '' });
  ok(!r.ok && r.errors.partner === ERRORS.partner, 'a yes must say if the partner comes');
}
{
  const r = validateRsvp({ ...base, partner: 'partner', partnerName: '' });
  ok(!r.ok && r.errors.partnerName === ERRORS.partnerName, 'with a partner, the partner name is required');
}
{
  const r = validateRsvp({ ...base, coming: 'no', partner: 'partner', partnerName: 'Jo', allergies: 'nuts' });
  ok(r.ok, 'a no needs no partner answer');
  if (r.ok) {
    eq(r.value.withPartner, false, 'a no never brings a partner');
    eq(r.value.partnerName, null, 'a no drops a stale partner name');
    eq(r.value.allergies, null, 'a no drops allergies: nobody needs them');
  }
}
{
  const r = validateRsvp({ ...base, partner: 'partner', partnerName: 'Jo', allergies: 'Nuts\n(Jo)', note: '' });
  ok(r.ok, 'a full yes passes');
  if (r.ok) {
    eq(r.value.allergies, 'Nuts (Jo)', 'allergies are one line');
    eq(r.value.note, null, 'an empty note is null');
  }
}
{
  const r = validateRsvp({ ...base, coming: 'maybe' });
  ok(!r.ok && r.errors.coming === ERRORS.coming, 'only yes or no is a valid answer');
}

/* ---------------------------------------------------------------- the email (brief, section 4) */

const at = new Date('2026-11-25T08:42:00Z');
eq(melbourneTime(at), 'Wed 25 Nov 2026, 7:42pm AEDT', 'sent time is on Melbourne clock');

const yes: CleanRsvp = {
  name: 'Stuart Smith',
  coming: true,
  withPartner: true,
  partnerName: 'Jo Smith',
  allergies: 'Peanuts',
  note: null,
};
{
  const m = rsvpEmail(yes, 'Stuart', at, false);
  eq(m.subject, 'RSVP Polynize Christmas 2026: Stuart Smith (Yes)', 'subject format');
  eq(
    m.text.split('\n'),
    [
      'Name: Stuart Smith',
      'Coming: Yes',
      'Partner: Yes, Jo Smith',
      'Allergies: Peanuts',
      'Note: None',
      'Link name: Stuart',
      'Sent: Wed 25 Nov 2026, 7:42pm AEDT',
    ],
    'body format, one line each',
  );
}
{
  const no: CleanRsvp = { name: 'Ann', coming: false, withPartner: false, partnerName: null, allergies: null, note: 'Have fun' };
  const m = rsvpEmail(no, null, at, true);
  eq(m.subject, 'TEST RSVP Polynize Christmas 2026: Ann (No)', 'a test subject starts with TEST');
  ok(m.text.includes('Partner: No\n'), 'no partner reads "No"');
  ok(m.text.includes('Allergies: None\n'), 'no allergies reads "None"');
  ok(m.text.includes('Link name: None\n'), 'no personal link reads "None"');
}

/* ---------------------------------------------------------------- dates */

ok(isRsvpOpen(Date.parse('2026-11-27T12:59:59Z')), 'open until 11:59pm Friday 27 November in Melbourne');
ok(!isRsvpOpen(Date.parse('2026-11-27T13:00:00Z')), 'closed from midnight Melbourne');
eq(melbourneTime(new Date(RSVP_CLOSES_AT)), 'Sat 28 Nov 2026, 12:00am AEDT', 'the close time is midnight in Melbourne');
eq(melbourneTime(new Date(RSVP_PURGE_FROM)), 'Mon 21 Dec 2026, 12:00am AEDT', 'the purge starts 21 December in Melbourne');
ok(RSVP_PURGE_FROM < Date.parse('2026-12-31T00:00:00Z'), 'the purge starts before the brief deadline');

/* ---------------------------------------------------------------- calendar */

{
  const ics = icsFile();
  ok(ics.includes('DTSTART:20261217T070000Z\r\n'), 'starts 07:00 UTC (6pm AEDT)');
  ok(ics.includes('DTEND:20261217T100000Z\r\n'), 'ends 10:00 UTC (9pm AEDT)');
  ok(ics.includes('SUMMARY:Polynize Christmas Party\r\n'), 'the brief title');
  ok(ics.includes('LOCATION:Commons Bar\\, Level 1\\, 55 Collins Street\\, Melbourne VIC 3000'), 'commas escaped');
  ok(ics.endsWith('\r\n'), 'ends with CRLF');
  const enc = new TextEncoder();
  ok(
    ics.split('\r\n').every((line) => enc.encode(line).length <= 75),
    'no line over 75 octets (folded)',
  );
  ok(!/[^\r]\n/.test(ics), 'every line break is CRLF');
}
{
  const url = googleCalendarUrl();
  ok(url.includes('dates=20261217T070000Z/20261217T100000Z'), 'Google link has the UTC times');
  ok(url.includes('text=Polynize%20Christmas%20Party'), 'Google link has the title');
}
eq(melbourneTime(new Date('2026-12-17T07:00:00Z')), 'Thu 17 Dec 2026, 6:00pm AEDT', '07:00 UTC is 6pm on the night');

/* ---------------------------------------------------------------- the tree */

{
  const still = treeSvg();
  ok(!still.includes('NaN') && !still.includes('undefined'), 'every coordinate is a number');
  ok(!still.includes('class='), 'the still image carries no animation classes');
  ok(still.includes('translate(320 0) scale(-1 1)'), 'the mirror is an attribute, so the still image is a full tree');
  const animated = treeSvg({
    classes: { std: 'a', label: 'b', draw: 'c', mirror: 'd', fill: 'e', light: 'f', star: 'g' },
  });
  ok(animated.includes('class="d"') && animated.includes('animation-delay'), 'the page version carries the classes');
  ok(!/<g transform="[^"]*" class=/.test(animated), 'CSS never transforms the group that carries the mirror attribute');
}

console.log(`christmas26: ${n} checks passed`);
