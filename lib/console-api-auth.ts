import { cookies } from 'next/headers';
import {
  COOKIE_NAME,
  verifySessionToken,
  type UserScope,
} from '@/lib/console-auth';
import { verifyAgentApiKey } from '@/lib/agent-auth';

export type ActorIdentity = {
  id: string; // email (cookie path) or agent name (bearer path)
  source: 'Console UI' | 'Agent';
};

type AuthResult =
  | { ok: true; actor: ActorIdentity; scope: UserScope }
  | { ok: false; status: number; error: string };

export async function requireConsoleAuth(request: Request): Promise<AuthResult> {
  // Human session cookie path.
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (token) {
      const user = await verifySessionToken(token);
      if (user) {
        return {
          ok: true,
          actor: { id: user.email, source: 'Console UI' },
          scope: user.scope,
        };
      }
    }
  } catch {
    // cookies() can throw in unusual contexts; fall through to agent path.
  }

  // Agent bearer-token path — always granted team scope. Agents are trusted
  // to act on any client. Per-client agent scoping is a future v2 concern.
  if (verifyAgentApiKey(request)) {
    const agentName = request.headers.get('x-agent-name')?.trim();
    return {
      ok: true,
      actor: { id: agentName || 'agent', source: 'Agent' },
      scope: { type: 'team' },
    };
  }

  // Don't leak which auth method failed.
  return { ok: false, status: 401, error: 'Unauthorized' };
}

/**
 * Authorize an authenticated user for a specific client slug.
 * Team scope → always allowed. Client scope → only their assigned slug.
 *
 * Returns true on allow, false on deny. Routes return 404 (not 403) to
 * avoid hinting at the existence of other clients.
 */
export function authorizeClientAccess(
  scope: UserScope,
  slug: string
): boolean {
  if (scope.type === 'team') return true;
  return scope.slug === slug;
}
