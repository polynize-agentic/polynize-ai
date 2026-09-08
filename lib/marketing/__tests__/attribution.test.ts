/**
 * THE LABEL ON EVERY POST (D96): the use cases, the link builder, and reading the label back.
 *
 * Run with `npm run test:marketing`, which chains this after gate4.test.ts.
 */

import assert from 'node:assert/strict';
import { USE_CASES, RETIRED_USE_CASES, isUseCaseId, labelForUseCase, landingFor, guessUseCase, usesUseCases, campaignFor } from '../use-case';
import {
  buildTrackingLink,
  linkVariants,
  withMedium,
  readAttribution,
  normalizeAttribution,
} from '../tracking-link';
import { handPostFromEntry } from '../hand-post';
import type { CalendarEntry } from '../calendar-store';

let n = 0;
const ok = (c: unknown, msg: string) => {
  n += 1;
  assert.ok(c, msg);
};
const eq = <T>(a: T, b: T, msg: string) => {
  n += 1;
  assert.deepEqual(a, b, msg);
};

/* ------------------------------------------------------------------ the six use cases */

eq(USE_CASES.length, 3, 'three use cases, as Marrs confirmed on 8 September');
eq(
  USE_CASES.map((u) => u.id),
  ['ai_capability_lead', 'hiring_manager', 'org_design'],
  'the two surviving ids are unchanged so stored data still matches; the third is new'
);
eq(USE_CASES.map((u) => u.label), ['AI enablement', 'Talent assessment', 'Organisational redesign'], 'his three names');
ok(new Set([...USE_CASES, ...RETIRED_USE_CASES].map((u) => u.id)).size === 7, 'active and retired ids are all distinct');
ok(isUseCaseId('sales_lead'), 'a retired id is still recognised, so old Stories and leads read back');
eq(labelForUseCase('security_lead'), 'Cybersecurity (retired)', 'and it says it is retired');
eq(guessUseCase('Why the CISO should care about the breach'), undefined, 'a retired use case is never guessed');
ok(USE_CASES.every((u) => u.landing.startsWith('/')), 'every landing is a path, never a full url');
ok(isUseCaseId('hiring_manager'), 'a known id is accepted');
ok(!isUseCaseId('hiring'), 'a partial id is not');
ok(!isUseCaseId(undefined) && !isUseCaseId(3), 'non-strings are not');
eq(labelForUseCase('hiring_manager'), 'Talent assessment', 'label lookup');
eq(labelForUseCase(undefined), 'No use case', 'absent reads as none, never as an empty string');
eq(landingFor('org_design'), '/map-your-team', 'org design lands on the team map');
eq(landingFor('security_lead'), '/', 'a retired use case with no magnet lands on the home page');
eq(landingFor('nonsense'), '/', 'an unknown id lands on the home page rather than throwing');

/* Polynize only (D101) */
ok(usesUseCases('polynize') && usesUseCases('shourov'), 'Polynize content streams carry use cases');
ok(!usesUseCases('marrs'), 'the marrs stream is Marrs Attacks and carries none');
eq(campaignFor({ stream: 'marrs', use_case: 'ai_capability_lead' }), 'marrs_attacks', 'a marrs link is labelled marrs_attacks whatever the piece says');
eq(campaignFor({ stream: 'kristin', use_case: 'org_design' }), 'org_design', 'a Polynize link carries its use case');
eq(campaignFor({ stream: 'kristin' }), undefined, 'and none when none was set');

/* the guess at Gate 1 */
eq(guessUseCase('Why every hiring manager should map the role before the interview'), 'hiring_manager', 'hiring cues');
eq(guessUseCase('How we restructured the operating model'), 'org_design', 'org design cues');
eq(guessUseCase('Talent assessment for every new hire'), 'hiring_manager', 'talent cues');
eq(guessUseCase('Monday. Coffee. Nothing else.'), undefined, 'no cue, no guess');
eq(guessUseCase('She said it was fine'), undefined, '"ai" inside "said" does not fire');
eq(guessUseCase(''), undefined, 'empty idea, no guess');

/* ------------------------------------------------------------------ the link */

const base = {
  origin: 'https://polynize.ai',
  path: '/map-your-team',
  network: 'linkedin',
  useCase: 'hiring_manager',
  entryId: '0b2a4c6e-1111-4222-8333-944455556666',
};
const link = buildTrackingLink({ ...base, medium: 'social' });
eq(
  link,
  'https://polynize.ai/map-your-team?utm_source=linkedin&utm_medium=social&utm_campaign=hiring_manager&utm_content=0b2a4c6e-1111-4222-8333-944455556666',
  'the four labels, in a fixed order, on the landing path'
);
eq(buildTrackingLink({ ...base, medium: 'social' }), link, 'deterministic: same input, same string');
eq(
  buildTrackingLink({ ...base, origin: 'https://polynize.ai/', path: 'map-your-team', medium: 'dm' }),
  link.replace('utm_medium=social', 'utm_medium=dm'),
  'a trailing slash on the origin and a missing leading slash on the path are both forgiven'
);
ok(
  buildTrackingLink({ ...base, useCase: undefined, medium: 'social' }).includes('utm_campaign=none'),
  'no use case is written as none, so the label is never blank'
);
ok(
  buildTrackingLink({ ...base, network: 'Linked In!', medium: 'social' }).includes('utm_source=unknown'),
  'a network that is not a plain token becomes unknown rather than being written raw'
);
const v = linkVariants(base);
eq(Object.keys(v).sort(), ['dm', 'reply', 'social'], 'three deliveries');
ok(v.dm.includes('utm_medium=dm') && v.reply.includes('utm_medium=reply'), 'each variant carries its medium');
eq(withMedium(link, 'dm'), v.dm, 'withMedium on a stored link equals the built variant');
eq(withMedium('not a url', 'dm'), 'not a url', 'withMedium never empties a bad input');

/* ------------------------------------------------------------------ reading it back */

const read = readAttribution(new URL(link).search, {
  referrer: 'https://www.linkedin.com/feed/update/urn:li:activity:1',
  landing: '/map-your-team?utm_source=linkedin',
});
eq(
  read,
  {
    source: 'linkedin',
    medium: 'social',
    campaign: 'hiring_manager',
    content: '0b2a4c6e-1111-4222-8333-944455556666',
    referrer: 'www.linkedin.com',
    landing: '/map-your-team',
  },
  'a labelled arrival reads back as the labels, the referrer HOST and the landing PATH only'
);
eq(readAttribution('?ref=abc'), null, 'no utm labels is null, not an empty object');
eq(readAttribution('', { referrer: 'https://google.com' }), null, 'a referrer alone is not an attribution');
eq(
  readAttribution('?utm_source=linkedin&utm_campaign=<script>alert(1)</script>'),
  { source: 'linkedin' },
  'a value that is not a plain token is dropped, the rest survives'
);
eq(
  readAttribution('?utm_source=LinkedIn&utm_content=' + 'a'.repeat(120)),
  { source: 'linkedin' },
  'lowercased, and an over-long value is dropped'
);
eq(
  readAttribution('?utm_source=x&utm_medium=dm&utm_term=someone%40example.com'),
  { source: 'x', medium: 'dm' },
  'an email address cannot ride in on utm_term'
);
eq(
  normalizeAttribution({ source: 'tiktok', campaign: 'sales_lead', referrer: 'https://t.co/x?y=1', extra: 'ignored' }),
  { source: 'tiktok', campaign: 'sales_lead', referrer: 't.co' },
  'a stored attribution is re-read under the same rules and unknown keys are dropped'
);
eq(normalizeAttribution('nope'), null, 'a non-object stored value is null');

/* ------------------------------------------------------------------ the hand-post brief */

const entry: CalendarEntry = {
  entry_id: 'e1',
  owner: 'o',
  stream: 'marrs',
  piece_id: 'p',
  title: 't',
  channel: 'instagram',
  post_copy: 'copy',
  status: 'draft',
  created_at: '2026-09-05T00:00:00Z',
  link,
  use_case: 'hiring_manager',
};
eq(handPostFromEntry(entry).link, link, 'the brief carries the link for a non-LinkedIn post');
eq(handPostFromEntry(entry).firstComment, undefined, 'and no first comment, since Instagram has none');
const li = { ...entry, channel: 'linkedin', first_comment: link };
eq(handPostFromEntry(li).firstComment, link, 'on LinkedIn the link IS the first comment');

console.log(`attribution: ${n} assertions passed`);
