import YAML from 'yaml';
import { readClientFile, readClientFileLastCommit } from '@/lib/github-client';
import { CONSOLE_CLIENTS } from '../_config/clients';

export type ClientCardData = {
  slug: string;
  name: string;
  leadHuman: string;
  leadEmail: string;
  phase: string;
  subPhase: string;
  gateNext: string;
  lastUpdated: Date | null;
  error?: string;
};

type ParsedConfig = {
  client?: { name?: string; lead_human?: string; lead_email?: string };
  engagement?: { phase?: string; sub_phase?: string; gate_next?: string };
};

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
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function loadClientCardData(): Promise<ClientCardData[]> {
  return Promise.all(CONSOLE_CLIENTS.map(loadOneClient));
}
