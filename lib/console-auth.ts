import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export const COOKIE_NAME = 'polynize_console_auth';
export const COOKIE_MAX_AGE_DAYS = 30;

const MAGIC_LINK_TTL = '15m';
const SESSION_TTL = '30d';

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

export function isEmailAllowed(email: string): boolean {
  return getAllowedEmails().includes(email.trim().toLowerCase());
}

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

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase(), type: 'session' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== 'session' || typeof payload.email !== 'string') {
      return null;
    }
    return payload.email;
  } catch {
    return null;
  }
}

export async function getCurrentUserEmail(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
