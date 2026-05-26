import { type NextRequest, NextResponse } from 'next/server';
import { requireConsoleAuth } from '@/lib/console-api-auth';
import { loadClientCardData } from '@/app/console/_lib/load-clients';

export const dynamic = 'force-dynamic';

/**
 * GET /api/console/clients
 *
 * Returns the same client card data the dashboard renders, plus the RAG
 * status block (added Step 7A.1). Response shape:
 *
 *   {
 *     clients: Array<{
 *       slug, name, leadHuman, leadEmail,
 *       phase, subPhase, gateNext, lastUpdated,
 *       status: { rag: 'red'|'amber'|'green', reason?, setAt?, setBy? },
 *       error?
 *     }>
 *   }
 *
 * Auth: cookie (browser session) OR bearer (CONSOLE_AGENT_API_KEY).
 * Scope: team users see all clients; client-scoped users see only their own.
 */
export async function GET(request: NextRequest) {
  const auth = await requireConsoleAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const all = await loadClientCardData();
  // Client-scoped users see only their own card.
  const scope = auth.scope;
  const clients =
    scope.type === 'client'
      ? all.filter((c) => c.slug === scope.slug)
      : all;
  return NextResponse.json({ clients });
}
