import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySessionToken } from '@/lib/console-auth';
import { verifyAgentApiKey } from '@/lib/agent-auth';

type AuthResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export async function requireConsoleAuth(request: Request): Promise<AuthResult> {
  // Human session cookie path.
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (token) {
      const email = await verifySessionToken(token);
      if (email) {
        return { ok: true };
      }
    }
  } catch {
    // cookies() can throw in unusual contexts; fall through to agent path.
  }

  // Agent bearer-token path.
  if (verifyAgentApiKey(request)) {
    return { ok: true };
  }

  // Don't leak which auth method failed.
  return { ok: false, status: 401, error: 'Unauthorized' };
}
