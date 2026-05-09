import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Soft password gate for /proposals.
 *
 * The cookie value is a SHA-256 hash of the configured password (truncated)
 * — that way the cookie can't be forged by a visitor who doesn't know the
 * password, even though it's httpOnly. Server compares using timing-safe
 * equality.
 *
 * Default password is 'Agentic444' so the gate works out-of-the-box on
 * fresh deploys; override via the PROPOSALS_PASSWORD env var to rotate.
 */

export const COOKIE_NAME = 'polynize_proposals_unlocked';
const DEFAULT_PASSWORD = 'Agentic444';

function configuredPassword(): string {
  return process.env.PROPOSALS_PASSWORD?.trim() || DEFAULT_PASSWORD;
}

export function expectedToken(): string {
  return createHash('sha256')
    .update(configuredPassword())
    .digest('hex')
    .slice(0, 32);
}

export function passwordMatches(input: string): boolean {
  const expected = configuredPassword();
  if (input.length === 0 || expected.length === 0) return false;
  // Timing-safe equality requires equal-length buffers; pad if needed.
  const a = Buffer.from(input.padEnd(expected.length, '\0').slice(0, expected.length));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b) && input.length === expected.length;
}

export function tokenMatches(token: string | undefined): boolean {
  if (!token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expectedToken());
  return a.length === b.length && timingSafeEqual(a, b);
}
