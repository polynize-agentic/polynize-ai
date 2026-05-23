import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export const COOKIE_NAME = 'polynize_console_auth';
export const COOKIE_MAX_AGE_DAYS = 30;

const MAGIC_LINK_TTL = '15m';
const SESSION_TTL = '30d';

// ============================================================
// User scope model
// ============================================================

export type UserScope =
  | { type: 'team' } // Polynize team — sees all clients
  | { type: 'client'; slug: string }; // Single-client access

export type SessionUser = {
  email: string;
  scope: UserScope;
};

// ============================================================
// Secrets + env parsing
// ============================================================

function getSecret(): Uint8Array {
  const secret = process.env.POLYNIZE_AUTH_SECRET;
  if (!secret) {
    throw new Error('POLYNIZE_AUTH_SECRET must be set');
  }
  return new TextEncoder().encode(secret);
}

export function getAllowedEmails(): string[] {
  const raw = process.env.CONSOLE_ALLOWED_EMAILS ?? '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

/**
 * Parse CONSOLE_CLIENT_EMAILS into a Map<email, slug>.
 * Format: "email1:slug1,email2:slug2,..."
 * Whitespace and case ignored. Malformed pairs silently dropped.
 */
export function getClientEmailMap(): Map<string, string> {
  const raw = process.env.CONSOLE_CLIENT_EMAILS ?? '';
  const map = new Map<string, string>();
  for (const pair of raw.split(',')) {
    const [emailPart, slugPart] = pair.split(':');
    if (!emailPart || !slugPart) continue;
    const email = emailPart.trim().toLowerCase();
    const slug = slugPart.trim().toLowerCase();
    if (email && slug) map.set(email, slug);
  }
  return map;
}

/**
 * Resolve a user's scope from their email.
 * - Email in CONSOLE_ALLOWED_EMAILS → team (sees all clients)
 * - Email in CONSOLE_CLIENT_EMAILS → client (sees one slug)
 * - Email in both → team wins
 * - Email in neither → null (not allowed)
 */
export function resolveUserScope(email: string): UserScope | null {
  const norm = email.trim().toLowerCase();
  if (getAllowedEmails().includes(norm)) {
    return { type: 'team' };
  }
  const slug = getClientEmailMap().get(norm);
  if (slug) {
    return { type: 'client', slug };
  }
  return null;
}

export function isEmailAllowed(email: string): boolean {
  return resolveUserScope(email) !== null;
}

// ============================================================
// Magic-link tokens (unchanged — scope resolved at verify time)
// ============================================================

export async function createMagicLinkToken(email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase(), type: 'magic-link' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(MAGIC_LINK_TTL)
    .sign(getSecret());
}

export async function verifyMagicLinkToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== 'magic-link' || typeof payload.email !== 'string') {
      return null;
    }
    return payload.email;
  } catch {
    return null;
  }
}

// ============================================================
// Session tokens — now carry scope
// ============================================================

export async function createSessionToken(user: SessionUser): Promise<string> {
  const claims: Record<string, unknown> = {
    email: user.email.toLowerCase(),
    type: 'session',
    scope: user.scope.type,
  };
  if (user.scope.type === 'client') {
    claims.clientSlug = user.scope.slug;
  }
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret());
}

/**
 * Verify a session token and return the user payload (email + scope).
 * Returns null if the token is invalid, expired, or malformed.
 *
 * Backwards compat: legacy session tokens that don't carry a `scope` claim
 * (pre-5A.10.5) are treated as { scope: 'team' } since the only users who
 * could have been signed in at that point were Polynize team members.
 */
export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== 'session' || typeof payload.email !== 'string') {
      return null;
    }
    const rawScope = payload.scope;
    let scope: UserScope;
    if (rawScope === 'client' && typeof payload.clientSlug === 'string') {
      scope = { type: 'client', slug: payload.clientSlug };
    } else {
      scope = { type: 'team' };
    }
    return { email: payload.email, scope };
  } catch {
    return null;
  }
}

// ============================================================
// Helpers for layouts / pages
// ============================================================

/**
 * Read the current user from the session cookie. Returns null if not signed in.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Backwards-compat helper for layouts that only need to know "is the user
 * signed in" and their email — not their scope.
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.email ?? null;
}

/**
 * Pure helper: does a given user have access to a given client slug?
 * Team users → yes for any slug. Client users → only their assigned slug.
 */
export function userHasClientAccess(user: SessionUser, slug: string): boolean {
  if (user.scope.type === 'team') return true;
  return user.scope.slug === slug;
}
