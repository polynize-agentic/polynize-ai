import { type NextRequest, NextResponse } from 'next/server';
import YAML from 'yaml';
import { CONSOLE_CLIENTS } from '@/app/console/_config/clients';
import { readClientFile } from '@/lib/github-client';
import {
  parseBlueprint,
  parseCapabilityMapUnit,
  parseCapabilityMapAgent,
  parseGapRegister,
  parseTeamOrg,
  computeReadiness,
  identifyTeamRoles,
  extractBlueprintVersion,
} from '@/app/console/_lib/parse-blueprint';
import { authorizeClientAccess, requireConsoleAuth } from '@/lib/console-api-auth';

export const dynamic = 'force-dynamic';

type ClientConfig = {
  client?: {
    name?: string;
    slug?: string;
    lead_human?: string;
    lead_email?: string;
  };
  engagement?: { phase?: string; sub_phase?: string; gate_next?: string };
  console?: { blueprint_path?: string; render?: string };
  integrations?: unknown[];
  infrastructure?: Record<string, unknown>;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireConsoleAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { slug } = await params;
  if (!(CONSOLE_CLIENTS as readonly string[]).includes(slug)) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  if (!authorizeClientAccess(auth.scope, slug)) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const url = new URL(request.url);
  const fullContent = url.searchParams.get('fullContent') === 'true';

  try {
    const [configYaml, blueprintMd] = await Promise.all([
      readClientFile(slug, '.polynize/client-config.yaml'),
      readClientFile(slug, 'modelling/blueprint.md'),
    ]);

    const config = (YAML.parse(configYaml) as ClientConfig) ?? {};
    const blueprint = parseBlueprint(blueprintMd);

    const findSection = (id: string) =>
      blueprint.sections.find((s) => s.id === id);

    const sectionData = {
      capabilityMapUnit: parseCapabilityMapUnit(
        findSection('capability-map-unit')?.content ?? ''
      ),
      capabilityMapAgent: parseCapabilityMapAgent(
        findSection('capability-map-agent')?.content ?? ''
      ),
      team: parseTeamOrg(findSection('team')?.content ?? ''),
      gapRegister: parseGapRegister(findSection('gap-register')?.content ?? ''),
    };

    // Gap counts: use the parser's footer-derived values for consistency with
    // the HTML page's readiness math. parseGapRegister returns the structured
    // object { rows, openCount, blockingCount }; openCount and blockingCount
    // come from the "**Status:** N gaps open · M blocking sign-off" footer line.
    const gapsTotal = sectionData.gapRegister?.rows.length ?? 0;
    const gapsOpen = sectionData.gapRegister?.openCount ?? 0;
    const gapsBlocking = sectionData.gapRegister?.blockingCount ?? 0;

    const readiness = computeReadiness({
      blueprint,
      phase: config.engagement?.phase ?? '',
      subPhase: config.engagement?.sub_phase ?? '',
      blockingGapsCount: gapsBlocking,
    });

    const teamRoles = sectionData.team
      ? identifyTeamRoles(sectionData.team)
      : null;

    return NextResponse.json({
      slug,
      config,
      blueprint: {
        preamble: blueprint.preamble,
        version: extractBlueprintVersion(blueprint.preamble.intro),
        sections: blueprint.sections.map((s) => ({
          id: s.id,
          title: s.title,
          contentLength: s.content.length,
          ...(fullContent ? { content: s.content } : {}),
        })),
        readiness,
        gapsTotal,
        gapsOpen,
        gapsBlocking,
      },
      sectionData,
      teamRoles,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load Blueprint',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
