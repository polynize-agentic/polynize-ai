import YAML from 'yaml';
import { readClientFile, readClientFileLastCommit } from '@/lib/github-client';
import { CONSOLE_CLIENTS } from '../_config/clients';

export type RagLevel = 'red' | 'amber' | 'green';

export type ClientStatus = {
  rag: RagLevel;
  reason?: string;
  setAt?: string;
  setBy?: string;
};

export type ClientCardData = {
  slug: string;
  name: string;
  leadHuman: string;
  leadEmail: string;
  phase: string;
  subPhase: string;
  gateNext: string;
  lastUpdated: Date | null;
  status: ClientStatus;
  error?: string;
};

type ParsedConfig = {
  client?: { name?: string; lead_human?: string; lead_email?: string };
  engagement?: { phase?: string; sub_phase?: string; gate_next?: string };
  status?: {
    rag?: string | null;
    rag_reason?: string | null;
    rag_set_at?: string | null;
    rag_set_by?: string | null;
  } | null;
};

const DEFAULT_STATUS: ClientStatus = { rag: 'green' };

/**
 * Coerce free-form YAML input into a typed ClientStatus. Anything missing
 * or malformed falls back to green so a typo in a single field cannot break
 * the dashboard. The valid `rag` values are red/amber/green (case-insensitive);
 * unrecognised strings are treated as green and the field is logged.
 */
function parseStatus(raw: ParsedConfig['status']): ClientStatus {
  if (!raw || typeof raw !== 'object') return DEFAULT_STATUS;

  const ragInput = typeof raw.rag === 'string' ? raw.rag.trim().toLowerCase() : '';
  const rag: RagLevel =
    ragInput === 'red' || ragInput === 'amber' || ragInput === 'green'
      ? ragInput
      : 'green';

  const out: ClientStatus = { rag };

  if (typeof raw.rag_reason === 'string' && raw.rag_reason.trim()) {
    out.reason = raw.rag_reason.trim();
  }
  if (typeof raw.rag_set_at === 'string' && raw.rag_set_at.trim()) {
    out.setAt = raw.rag_set_at.trim();
  }
  if (typeof raw.rag_set_by === 'string' && raw.rag_set_by.trim()) {
    out.setBy = raw.rag_set_by.trim();
  }

  return out;
}

async function loadOneClient(slug: string): Promise<ClientCardData> {
  try {
    const [yamlText, lastUpdated] = await Promise.all([
      readClientFile(slug, '.polynize/client-config.yaml'),
      readClientFileLastCommit(slug, 'modelling/blueprint.md'),
    ]);

    const parsed = (YAML.parse(yamlText) ?? {}) as ParsedConfig;

    return {
      slug,
      name: parsed.client?.name ?? slug,
      leadHuman: parsed.client?.lead_human ?? '',
      leadEmail: parsed.client?.lead_email ?? '',
      phase: parsed.engagement?.phase ?? 'unknown',
      subPhase: parsed.engagement?.sub_phase ?? '',
      gateNext: parsed.engagement?.gate_next ?? '',
      lastUpdated,
      status: parseStatus(parsed.status),
    };
  } catch (err) {
    return {
      slug,
      name: slug,
      leadHuman: '',
      leadEmail: '',
      phase: '',
      subPhase: '',
      gateNext: '',
      lastUpdated: null,
      status: DEFAULT_STATUS,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function loadClientCardData(): Promise<ClientCardData[]> {
  return Promise.all(CONSOLE_CLIENTS.map(loadOneClient));
}
