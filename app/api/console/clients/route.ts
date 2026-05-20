import { type NextRequest, NextResponse } from 'next/server';
import { requireConsoleAuth } from '@/lib/console-api-auth';
import { loadClientCardData } from '@/app/console/_lib/load-clients';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireConsoleAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const clients = await loadClientCardData();
  return NextResponse.json({ clients });
}
