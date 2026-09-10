/**
 * The marketing streams (owner buckets) — one source of truth so the dashboard
 * cards, the per-stream view, the intake selector, and the finalize validator
 * never drift. A stream is who the content is FOR (brand or a person); `owner`
 * (the signed-in email) is separate and drives storage partitioning.
 *
 * Order here is the display order on the dashboard.
 */
export const STREAMS = [
  { id: 'polynize', label: 'Polynize', kind: 'company' },
  { id: 'marrs', label: 'Marrs', kind: 'person' },
  /**
   * HIS OWN ACCOUNT, APART FROM HIS CO-FOUNDER SELF (D114). Marrs, 10 September: "I need to build my
   * own brand separately from Polynize... two profiles for Marrs in the console: the current one,
   * where we consider Marrs a co-founder; another one, which is just me." Marrs Attacks is Instagram,
   * TikTok and YouTube, the split-screen formula and the yap, no Polynize use case, and nobody else
   * sees the board (PRIVATE_STREAMS below). The marrs stream above is the co-founder: his LinkedIn,
   * Polynize content, the ordinary kit.
   */
  { id: 'marrsattacks', label: 'Marrs Attacks', kind: 'person' },
  { id: 'shourov', label: 'Shourov', kind: 'person' },
  { id: 'kristin', label: 'Kristin', kind: 'person' },
  { id: 'julian', label: 'Julian', kind: 'person' },
] as const;

/**
 * COMPANY OR PERSON, and it is load-bearing rather than decorative (D45).
 *
 * It decides which post frames a narrative gets by default. A first-person post with real
 * stakes ("hard moment") is available to a person and not to a brand; a "field report" across
 * client work is the brand's version of the same job and needs nobody's sign off. And the
 * measured gap is not small: a personal profile takes 63% higher engagement than a company page
 * at similar impressions (Metricool 2026), which is a structural reason the two kinds must
 * never be judged by one number.
 *
 * The kit reads this rather than naming streams, so adding a person adds no branches.
 */
export type StreamKind = (typeof STREAMS)[number]['kind'];

export function streamKind(id: string): StreamKind {
  return STREAMS.find((s) => s.id === id)?.kind ?? 'person';
}

/**
 * A PRIVATE BOARD (D114): a stream only these signed-in addresses can see. Everyone else's front
 * page simply has no card for it, its board redirects home, and its routes refuse. Marrs: "It's
 * only visible to me, no one else." Not a permission system, one list, because the console has
 * five people in it and exactly one board that is one person's own.
 */
export const PRIVATE_STREAMS: Record<string, readonly string[]> = {
  marrsattacks: ['marrs@polynize.io'],
};

export function isPrivateStream(id: string): boolean {
  return id in PRIVATE_STREAMS;
}

/** True unless the stream is private to someone else. A missing email sees only the public boards. */
export function canSeeStream(email: string | null | undefined, id: string): boolean {
  const only = PRIVATE_STREAMS[id];
  if (!only) return true;
  const e = (email ?? '').trim().toLowerCase();
  return e !== '' && only.includes(e);
}

/** The streams this person's screens should list, in display order. */
export function visibleStreams(email: string | null | undefined): (typeof STREAMS)[number][] {
  return STREAMS.filter((s) => canSeeStream(email, s.id));
}

/**
 * THE STUDIO IS ONE PERSON'S ROOM (D114). Marrs: "the Studio tab should only be visible to me
 * because no one else is using the Studio and the video flows. It's just me." The link is not
 * drawn for anyone else and the page sends them home.
 */
export const STUDIO_EMAILS: readonly string[] = ['marrs@polynize.io'];

export function canUseStudio(email: string | null | undefined): boolean {
  const e = (email ?? '').trim().toLowerCase();
  return e !== '' && STUDIO_EMAILS.includes(e);
}

/**
 * WHICH BOARDS MAKE VIDEO (D114). Marrs: "split screens... they're really only for me, so they'll
 * only ever be on Marrs Attacks, Marrs, and the Polynize account. The other users wouldn't do
 * split screens." Video is shot in the Studio by him, so a kit on any other board offers no video
 * rows: the rows stay in the list, greyed, saying why (kit.ts laneBlocked).
 */
export const VIDEO_STREAMS: readonly string[] = ['polynize', 'marrs', 'marrsattacks'];

export function makesVideo(id: string): boolean {
  return VIDEO_STREAMS.includes(id);
}

/**
 * Stream avatars shown on the dashboard cards (mint-ringed circles). Files live
 * in public/pam/avatars/ and are registered here as they land; streams without
 * an entry render a MINT DOT instead, at half the circle's diameter (see .streamAvatarMark).
 *
 * Patricia, Dhamiri and Avik left the team (Marrs, 2026-07-28) and are gone from
 * STREAMS above, but their avatars are kept registered on purpose: removing a
 * stream only HIDES it, it does not delete anything the stream owns, so restoring
 * one is a single line above rather than a hunt for what else was stripped out.
 */
/**
 * WHOSE MEETINGS BELONG TO WHICH CRM.
 *
 * Marrs: "Shourov's lead list is pulling my meetings not his." Correct, and it was my bug: the
 * Fireflies scan fetched recent meetings and offered the same set to every CRM, so every list
 * showed whoever the API key could see.
 *
 * It does NOT need a second API key. One key already sees the whole team's meetings, which the
 * live data proved: the Polynize Weekly Sync came back with shourov@polynize.com as organiser
 * under Marrs's key. So the fix is to filter by who ATTENDED rather than to authenticate as
 * each person.
 *
 * These addresses are taken from real attendee lists in that data. Polynize is deliberately
 * absent: it is the website-inbound CRM, and a meeting's contacts belong to the person who was
 * in the meeting. A stream with no address here is not offered the meeting pull at all.
 */
/**
 * A LIST PER PERSON, NOT ONE ADDRESS, because the two do not always agree. Marrs confirmed
 * Shourov is `shourov@polynize.io`, but Fireflies recorded him as `shourov@polynize.com` on the
 * Weekly Sync, as both attendee and organiser. Matching only the real address would have left
 * his list empty for a second time; matching only what Fireflies showed would break if the
 * alias stops being used. So both count, and adding an alias later is one entry.
 */
export const STREAM_EMAILS: Record<string, string[]> = {
  marrs: ['marrs@polynize.io'],
  shourov: ['shourov@polynize.io', 'shourov@polynize.com'],
  kristin: ['kristin@polynize.io'],
  julian: ['julian@polynize.io'],
};

/** Every address whose meetings feed this CRM. Empty when the CRM takes no meeting contacts. */
export function streamEmails(id: string): string[] {
  return STREAM_EMAILS[id] ?? [];
}

/** True when this CRM takes contacts from meetings at all. */
export function takesMeetingContacts(id: string): boolean {
  return streamEmails(id).length > 0;
}

export const STREAM_AVATARS: Record<string, string> = {
  /**
   * POLYNIZE HAS NO IMAGE ON PURPOSE. Marrs: "remove the Polynize logos on the console cards
   * and replace with a simple brand mint circle that's about half the diameter of the size of
   * the actual circle." A stream with no entry here now renders that mint dot, so the brand
   * card is a mark rather than a shrunk logo. `/pam/avatars/polynize.png` is still on disk if
   * the logo is ever wanted back.
   */
  /**
   * TWO PHOTOS OF ONE PERSON (D114). Marrs: "we'll keep that same image that's on there at the
   * moment. That's actually the Marrs Attacks image. We'll change the Marrs founder one to a
   * different image, just so those two look different for me." The old file stays with Marrs
   * Attacks; the co-founder card took the photo he sent the same afternoon.
   */
  marrs: '/pam/avatars/marrs-cofounder.jpeg',
  marrsattacks: '/pam/avatars/marrs.jpeg',
  shourov: '/pam/avatars/shourov.jpeg',
  patricia: '/pam/avatars/patricia.png',
  julian: '/pam/avatars/julian.jpeg',
  dhamiri: '/pam/avatars/dhamiri.png',
  avik: '/pam/avatars/avik.jpeg',
  kristin: '/pam/avatars/kristin.jpeg',
};

export type StreamId = (typeof STREAMS)[number]['id'];

/** Tuple form for zod's z.enum(...). */
export const STREAM_IDS = STREAMS.map((s) => s.id) as [StreamId, ...StreamId[]];

export function isStreamId(x: unknown): x is StreamId {
  return typeof x === 'string' && (STREAM_IDS as readonly string[]).includes(x);
}

/** Label for a stream id, falling back to the raw id (e.g. a legacy value). */
export function streamLabel(id: string): string {
  return STREAMS.find((s) => s.id === id)?.label ?? id;
}

/** Default stream when none is chosen. */
export const DEFAULT_STREAM: StreamId = 'polynize';
