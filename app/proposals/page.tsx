import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { COOKIE_NAME, tokenMatches } from './_auth';
import { Gate } from './Gate';
import { Index } from './Index';

export const metadata: Metadata = {
  title: 'Proposals',
  description: 'Active Polynize client proposals, decks, and build handovers.',
  robots: { index: false, follow: false },
};

// Always render fresh — the gate state depends on the request cookie.
export const dynamic = 'force-dynamic';

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const c = await cookies();
  const unlocked = tokenMatches(c.get(COOKIE_NAME)?.value);
  return unlocked ? <Index /> : <Gate hadError={Boolean(sp.error)} />;
}
