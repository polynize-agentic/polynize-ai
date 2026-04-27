/**
 * Client-side persistence helpers. Fire-and-forget — failures are
 * logged but never thrown into the UI; localStorage remains the
 * authoritative client-side cache while the visitor is in-flight.
 *
 * The httpOnly session cookie is attached automatically by fetch.
 */

import type { Answers, MultiTeamHeatMap } from './types';

async function silentPost(path: string, body: unknown): Promise<void> {
  try {
    await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'same-origin',
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`[persist] ${path} failed`, e);
  }
}

export function persistAnswers(answers: Partial<Answers>, completed: boolean): void {
  void silentPost('/api/session/answers', { answers, completed });
}

export function persistHeatMap(data: MultiTeamHeatMap): void {
  void silentPost('/api/session/heat-map', { data });
}

export function persistMessage(
  role: 'user' | 'assistant' | 'system',
  content: string,
  agentPersona?: string
): void {
  void silentPost('/api/session/messages', {
    role,
    content,
    agent_persona: agentPersona,
  });
}

export async function createBlueprint(): Promise<{ id: string } | { error: string }> {
  try {
    const res = await fetch('/api/blueprints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      return { error: body.error ?? `HTTP ${res.status}` };
    }
    const body = (await res.json()) as { id: string };
    return { id: body.id };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
