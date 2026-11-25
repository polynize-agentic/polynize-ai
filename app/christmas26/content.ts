/**
 * The copy of the "Getting there" and "Good to know" sections of /christmas26 (D128), from
 * Evelyn's brief of 24 November 2026 and Marrs's answers of 25 November. Do not paraphrase: Marrs
 * owns the wording.
 *
 * `{phone}` in a text is replaced with Marrs's mobile as a tap-to-call link (see contactPhone).
 * `pending` marks a fact that is not confirmed yet: the page shows it as a small amber tag.
 */

import { QUESTIONS_EMAIL } from '@/lib/christmas26/event';

export type InfoRow = {
  label: string;
  text?: string;
  pending?: string;
  /** Shown as "Email <address>." with a mailto link. */
  email?: string;
};

export type Phone = { display: string; tel: string };

/**
 * The number guests call for entry after 6pm and for lift directions. It comes from the
 * CHRISTMAS26_PHONE setting in Vercel, so a personal mobile is never in this public repo. With no
 * setting, the page says "call Marrs" without a number: every guest got the invite from Marrs or
 * Shourov, so they have a way to reach him.
 */
export function contactPhone(): Phone | null {
  const display = process.env.CHRISTMAS26_PHONE?.trim();
  if (!display) return null;
  const digits = display.replace(/[^\d+]/g, '');
  const tel = digits.startsWith('0') ? `+61${digits.slice(1)}` : digits;
  return { display, tel };
}

export const GETTING_THERE: InfoRow[] = [
  { label: 'Train', text: 'Parliament Station (City Loop) is a short walk away.' },
  { label: 'Tram', text: 'Stop 8 on Collins Street. Routes 31, 109 and 112.' },
  {
    label: 'Car',
    text: 'The best place to park is the multi-storey car park on Flinders Lane, near the Spring Street end.',
  },
  {
    label: 'When you arrive',
    text: 'Go to Level 1, 55 Collins Street. Someone from Polynize meets you at the door. After 6pm, call Marrs on {phone} to get in.',
  },
  { label: 'Lift access', text: 'From street level. Call Marrs on {phone} for directions.' },
];

export const GOOD_TO_KNOW: InfoRow[] = [
  { label: 'Dress code', text: 'Semi formal. Dress up a little, but come comfortable.' },
  { label: 'Food', text: 'Canapés from 6pm. Tell us about allergies when you RSVP.' },
  { label: 'Drinks', text: 'Drinks provided.' },
  { label: 'Partners', text: 'Welcome. Tell us their name when you RSVP.' },
  { label: 'Finish', text: '9pm.' },
  { label: 'Questions', email: QUESTIONS_EMAIL },
];
