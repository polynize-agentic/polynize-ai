/**
 * The copy of the "Getting there" and "Good to know" sections of /christmas26 (D128), from
 * Evelyn's brief of 24 November 2026. Do not paraphrase: Marrs owns the wording.
 *
 * `pending` marks a fact the brief says is not confirmed yet. The page shows it as a small amber
 * tag, so nobody mistakes the draft for the final page. Before launch, confirm each one with
 * Evelyn and The Commons, then fill in `text` and delete `pending`.
 */

import { QUESTIONS_EMAIL } from '@/lib/christmas26/event';

export type InfoRow = {
  label: string;
  text?: string;
  pending?: string;
  /** Shown as "Email <address>." with a mailto link. */
  email?: string;
};

export const GETTING_THERE: InfoRow[] = [
  { label: 'Train', text: 'Parliament Station (City Loop) is a short walk away.' },
  { label: 'Tram', text: 'Stop 8 on Collins Street. Routes 31, 109 and 112.' },
  {
    label: 'Car',
    text: 'Paid parking under Collins Place. Entry at 28 Flinders Lane (First Parking), open 24 hours.',
    pending: 'To confirm',
  },
  {
    label: 'When you arrive',
    text: 'Go to Level 1, 55 Collins Street. Someone from Polynize meets you at the door.',
    pending: 'Entry route after 6pm to confirm',
  },
  { label: 'Lift access', pending: 'To confirm' },
];

export const GOOD_TO_KNOW: InfoRow[] = [
  { label: 'Dress code', pending: 'To confirm' },
  { label: 'Food', text: 'Canapés from 6pm. Tell us about allergies when you RSVP.' },
  { label: 'Drinks', text: 'Drinks are on us, with non-alcoholic options too.', pending: 'Wording to confirm' },
  { label: 'Partners', text: 'Welcome. Tell us their name when you RSVP.' },
  { label: 'Finish', text: '9pm.' },
  { label: 'Questions', email: QUESTIONS_EMAIL },
];
