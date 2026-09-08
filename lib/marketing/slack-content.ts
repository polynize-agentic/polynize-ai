/**
 * THE #CONTENT PING (D108). Marrs: "I'm also interested in setting up a channel in our Slack that pings
 * everyone when something goes live... Whenever a Polynize piece gets published or something on
 * Polynize or one of our LinkedIn channels gets published, it gets published there for people to share
 * and interact with. That's pretty much just for LinkedIn and YouTube."
 *
 * WHEN. A post is "live" the moment the url join reads its public url back from Metricool (D98), which
 * is the platform confirming it exists. That is when this fires, once per entry, with the link people
 * can open and share.
 *
 * WHICH. Polynize content: anything on the Polynize brand, and anything on LinkedIn or YouTube on any
 * stream (the team's LinkedIn profiles carry Polynize content; his own LinkedIn is the Polynize anchor).
 * Marrs Attacks posts on Instagram and TikTok are not team-share material and are left out.
 *
 * HOW. A Slack incoming webhook for the #content channel, its url in the console's environment as
 * SLACK_CONTENT_WEBHOOK. Created by Marrs in Slack (Apps, Incoming Webhooks, choose #content) and put
 * into Vercel by him; never pasted in chat. No webhook, no ping, and the join carries on regardless.
 *
 * Best effort by contract: a failed ping is logged and never costs the join.
 */

import type { CalendarEntry } from './calendar-store';
import { channelLabel } from './channels';
import { streamLabel } from './streams';

export function isSlackContentConfigured(): boolean {
  return Boolean(process.env.SLACK_CONTENT_WEBHOOK?.trim());
}

/** Pure: does this post belong in #content? */
export function shouldAnnounce(entry: Pick<CalendarEntry, 'stream' | 'channel'>): boolean {
  return entry.stream === 'polynize' || entry.channel === 'linkedin' || entry.channel === 'youtube';
}

/** Pure: the message, so the tests can read it. */
export function announcementText(entry: Pick<CalendarEntry, 'title' | 'stream' | 'channel' | 'public_url'>): string {
  const who = streamLabel(entry.stream);
  const where = channelLabel(entry.channel);
  const title = entry.title?.trim() || 'A new post';
  return `*${title}* is live on ${where} (${who}). Share it, like it, comment on it:\n${entry.public_url ?? ''}`.trim();
}

export async function announcePublished(entry: CalendarEntry): Promise<boolean> {
  const url = process.env.SLACK_CONTENT_WEBHOOK?.trim();
  if (!url || !entry.public_url || !shouldAnnounce(entry)) return false;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: announcementText(entry) }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[slack-content] webhook returned ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[slack-content] ping failed:', err);
    return false;
  }
}
