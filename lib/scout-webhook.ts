/**
 * Scout webhook client. Fires the "new blueprint, please send the email"
 * payload to a configured external endpoint (Scout's agent), which is
 * responsible for actually composing and sending the email from his
 * polynize.ai address.
 *
 * Two env vars:
 *   SCOUT_WEBHOOK_URL    — endpoint to POST to. Empty/unset = silently skip.
 *   SCOUT_WEBHOOK_SECRET — shared bearer token (optional but recommended).
 *
 * Returns a structured result rather than throwing so the caller can write
 * the outcome to email_log without try/catch noise.
 */

export type ScoutPayload = {
  to: string;
  name: string;
  company: string;
  blueprint_url: string;
  bottleneck_one_liner: string;
  agent_count: number;
  leverage_estimate: string;
  generated_at: string;
};

export type ScoutResult =
  | { status: 'sent_to_scout'; httpStatus: number }
  | { status: 'scout_unavailable'; reason: string }
  | { status: 'scout_skipped'; reason: 'webhook_url_not_configured' };

const TIMEOUT_MS = 8000;

export async function notifyScout(payload: ScoutPayload): Promise<ScoutResult> {
  const url = process.env.SCOUT_WEBHOOK_URL?.trim();
  if (!url) {
    return { status: 'scout_skipped', reason: 'webhook_url_not_configured' };
  }

  const secret = process.env.SCOUT_WEBHOOK_SECRET?.trim();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (secret) headers.Authorization = `Bearer ${secret}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(
        `[scout-webhook] HTTP ${res.status} from ${url}\n  body: ${body.slice(0, 400)}`
      );
      return { status: 'scout_unavailable', reason: `http_${res.status}` };
    }

    console.log(`[scout-webhook] dispatched OK (HTTP ${res.status})`);
    return { status: 'sent_to_scout', httpStatus: res.status };
  } catch (e) {
    clearTimeout(timer);
    const reason = e instanceof Error ? e.message : String(e);
    console.error(`[scout-webhook] dispatch THREW: ${reason}`);
    return { status: 'scout_unavailable', reason: reason.slice(0, 120) };
  }
}
