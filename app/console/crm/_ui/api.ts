/** One way to call the CRM's routes from the browser, with the error the route gave. */
export async function crmCall(path: string, method: string, body?: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const res = await fetch(`/console/crm/api/${path}`, {
      method,
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = ((await res.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { error: 'Could not reach the console.' } };
  }
}

export type Pick = { id: string; name: string; company_id?: string };
export type Lookups = { companies: Pick[]; contacts: Pick[]; deals: Pick[] };
