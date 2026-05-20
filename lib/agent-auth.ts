import { timingSafeEqual } from 'node:crypto';

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function verifyAgentApiKey(request: Request): boolean {
  const expected = process.env.CONSOLE_AGENT_API_KEY;
  if (!expected) return false;

  const header = request.headers.get('authorization');
  if (!header) return false;

  const separator = header.indexOf(' ');
  if (separator === -1) return false;

  const scheme = header.slice(0, separator);
  const key = header.slice(separator + 1).trim();
  if (scheme.toLowerCase() !== 'bearer' || !key) return false;

  return constantTimeEqual(key, expected);
}
