/**
 * Richie webhook client. Fires the "new blueprint, please send the email"
 * payload to a configured external endpoint (Richie's agent), which is
 * responsible for actually composing and sending the email from his
 * polynize.ai address.
 *
 * Two env vars:
 *   RICHIE_WEBHOOK_URL    — endpoint to POST to. Empty/unset = silently skip.
 *   RICHIE_WEBHOOK_SECRET — shared bearer token (optional but recommended).
 *
 * Returns a structured result rather than throwing so the caller can write
 * the outcome to email_log without try/catch noise.
 */

export type RichiePayload = {
  to: string;
  name: string;
  company: string;
  blueprint_url: string;
  bottleneck_one_liner: string;
  agent_count: number;
  leverage_estimate: string;
  generated_at: string;
};

export type RichieResult =
  | { status: 'sent_to_richie'; httpStatus: number }
  | { status: 'richie_unavailable'; reason: string }
  | { status: 'richie_skipped'; reason: 'webhook_url_not_configured' };

const TIMEOUT_MS = 8000;

export async function notifyRichie(payload: RichiePayload): Promise<RichieResult> {
  const url = process.env.RICHIE_WEBHOOK_URL?.trim();
  if (!url) {
    return { status: 'richie_skipped', reason: 'webhook_url_not_configured' };
  }

  const secret = process.env.RICHIE_WEBHOOK_SECRET?.trim();
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
        `[richie-webhook] HTTP ${res.status} from ${url}\n  body: ${body.slice(0, 400)}`
      );
      return { status: 'richie_unavailable', reason: `http_${res.status}` };
    }

    console.log(`[richie-webhook] dispatched OK (HTTP ${res.status})`);
    return { status: 'sent_to_richie', httpStatus: res.status };
  } catch (e) {
    clearTimeout(timer);
    const reason = e instanceof Error ? e.message : String(e);
    console.error(`[richie-webhook] dispatch THREW: ${reason}`);
    return { status: 'richie_unavailable', reason: reason.slice(0, 120) };
  }
}
