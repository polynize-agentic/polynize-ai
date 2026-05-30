/**
 * POST /api/console/[slug]/seed — create a Lead Blueprint from a v0.5 envelope.
 *
 * Spec: stage2-data-model.md §8.4 (Tier 2). The Discovery-call flow:
 *   Ben proposes seed in Slack → human confirms slug → Ben calls this
 *   endpoint with `approvedBy: <human-email>`.
 *
 * What this endpoint does:
 *   1. Verify auth + team scope (or bearer agent with team scope).
 *   2. Validate body. Require approvedBy.
 *   3. If the body includes the envelope inline, use that. Otherwise,
 *      call our own /api/blueprints/lookup with email+firstName.
 *   4. Validate the v0.5 envelope.
 *   5. If the target repo doesn't exist yet, attempt to create it under
 *      the polynize-agentic org. If creation fails (app lacks permission,
 *      etc.), return a clean 422 so the human can create the repo manually
 *      and retry.
 *   6. Write three files via the GitHub App, attributed to the seed commit:
 *      - .polynize/client-config.yaml  (engagement_status: lead,
 *        engagement_phase: mapping, blueprint_schema_version: 2.0)
 *      - modelling/capability-map.json (the v0.5 envelope, exactly)
 *      - modelling/blueprint.md (minimal narrative stub seeded from
 *        envelope.interpretation)
 *
 * Notes:
 * - The static CONSOLE_CLIENTS allowlist is NOT enforced for this endpoint.
 *   The endpoint can seed any slug under the polynize-agentic org. The
 *   slug appears in the dashboard once L12 ships discovery; until then,
 *   the slug must be added to CONSOLE_CLIENTS for the dashboard to see it.
 *   This is intentional — seeding new repos is the only Console operation
 *   that touches slugs outside the static allowlist.
 *
 * [ASSUMPTION] GitHub App may or may not have repo-creation permission.
 *   If it doesn't, the human will see a 422 and can create the repo via
 *   `gh repo create polynize-agentic/<slug> --private --gitignore Node`,
 *   then call seed again. This is documented in the response.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import YAML from 'yaml';
import {
  getInstallationOctokit,
  writeClientFile,
} from '@/lib/github-client';
import {
  requireConsoleAuth,
  requireTeamScope,
} from '@/lib/console-api-auth';
import { CapabilityMapV05EnvelopeSchema } from '@/lib/blueprint/schema-v2';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ORG = 'polynize-agentic';

const SeedBodySchema = z.object({
  prospectBlueprintId: z.string().uuid().optional(),
  prospectEmail: z.string().email().optional(),
  prospectFirstName: z.string().optional(),
  displayName: z.string().min(1),
  approvedBy: z.string().email(),
  // Optional: callers may inline the envelope to skip the lookup hop.
  envelope: z.unknown().optional(),
});

type SnapshotShape = { v05Envelope?: unknown; answers?: Record<string, unknown> };

async function repoExists(slug: string): Promise<boolean> {
  const octokit = await getInstallationOctokit();
  try {
    await octokit.rest.repos.get({ owner: ORG, repo: slug });
    return true;
  } catch (err) {
    if (
      err &&
      typeof err === 'object' &&
      'status' in err &&
      (err as { status: number }).status === 404
    ) {
      return false;
    }
    throw err;
  }
}

async function createRepo(slug: string, description: string): Promise<void> {
  const octokit = await getInstallationOctokit();
  await octokit.rest.repos.createInOrg({
    org: ORG,
    name: slug,
    private: true,
    auto_init: true,
    description,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Auth: team scope (or bearer agent which auto-grants team scope).
  const auth = await requireConsoleAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const teamGate = requireTeamScope(auth);
  if (!teamGate.ok) {
    return NextResponse.json(
      { error: teamGate.error },
      { status: teamGate.status }
    );
  }
  // No authorizeClientAccess check here: the team gate above already
  // guarantees scope.type === 'team', and team users can seed any slug
  // (seeding is the one operation that touches slugs outside the static
  // CONSOLE_CLIENTS allowlist).

  const { slug } = await params;
  // Sanitise slug: lowercase, alphanumeric + hyphens only.
  if (!/^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/.test(slug)) {
    return NextResponse.json(
      {
        error:
          'Invalid slug. Use lowercase alphanumeric + hyphens (2-40 chars).',
      },
      { status: 400 }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = SeedBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', detail: parsed.error.message },
      { status: 400 }
    );
  }
  const body = parsed.data;

  // Resolve the envelope.
  let envelope: unknown = body.envelope;
  if (!envelope) {
    if (!body.prospectEmail) {
      return NextResponse.json(
        {
          error:
            'Either `envelope` must be inline or `prospectEmail` must be provided so the lookup can fetch it.',
        },
        { status: 400 }
      );
    }
    const lookupKey = process.env.POLYNIZE_LOOKUP_KEY;
    if (!lookupKey) {
      return NextResponse.json(
        { error: 'POLYNIZE_LOOKUP_KEY must be set for lookup-based seeds' },
        { status: 503 }
      );
    }
    const lookupUrl = new URL(
      '/api/blueprints/lookup',
      request.nextUrl.origin
    );
    lookupUrl.searchParams.set('email', body.prospectEmail);
    if (body.prospectFirstName) {
      lookupUrl.searchParams.set('firstName', body.prospectFirstName);
    }
    let lookupRes: Response;
    try {
      lookupRes = await fetch(lookupUrl.toString(), {
        headers: { authorization: `Bearer ${lookupKey}` },
        cache: 'no-store',
      });
    } catch (err) {
      return NextResponse.json(
        {
          error: 'Lookup call failed',
          detail: err instanceof Error ? err.message : 'unknown',
        },
        { status: 502 }
      );
    }
    if (!lookupRes.ok) {
      return NextResponse.json(
        { error: 'Lookup did not return a blueprint', status: lookupRes.status },
        { status: lookupRes.status === 404 ? 404 : 502 }
      );
    }
    const lookupBody = (await lookupRes.json()) as SnapshotShape;
    envelope = lookupBody.v05Envelope;
  }

  // Validate envelope against the canonical v0.5 schema.
  const envelopeParsed = CapabilityMapV05EnvelopeSchema.safeParse(envelope);
  if (!envelopeParsed.success) {
    return NextResponse.json(
      {
        error: 'Envelope failed v0.5 validation',
        detail: envelopeParsed.error.issues.slice(0, 3),
      },
      { status: 422 }
    );
  }
  const validEnvelope = envelopeParsed.data;

  // Ensure the repo exists (try to create if not).
  let repoCreated = false;
  try {
    const exists = await repoExists(slug);
    if (!exists) {
      try {
        await createRepo(
          slug,
          `${body.displayName} — Polynize Lead Blueprint`
        );
        repoCreated = true;
      } catch (err) {
        return NextResponse.json(
          {
            error:
              'Repo does not exist and the GitHub App could not create it. Create it manually: `gh repo create polynize-agentic/' +
              slug +
              ' --private --add-readme` then retry seed.',
            detail: err instanceof Error ? err.message : 'unknown',
          },
          { status: 422 }
        );
      }
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Failed to check repo existence',
        detail: err instanceof Error ? err.message : 'unknown',
      },
      { status: 502 }
    );
  }

  // Build the three seed files.
  const now = new Date().toISOString();
  const config = {
    client: {
      slug,
      name: body.displayName,
      display_name: body.displayName,
    },
    engagement: {
      phase: 'mapping',
    },
    engagement_status: 'lead',
    engagement_phase: 'mapping',
    blueprint_schema_version: '2.0',
    prospect_blueprint_id: body.prospectBlueprintId ?? null,
    prospect_email: body.prospectEmail ?? null,
    prospect_first_name: body.prospectFirstName ?? null,
    lock: {
      locked: false,
      locked_at: null,
      locked_by: null,
      lock_version: 0,
      unlock_reason: null,
    },
    work_plan_registry: [],
    status: {
      rag: 'green',
      rag_set_at: now,
      rag_set_by: body.approvedBy,
    },
    integrations: [],
    infrastructure: {
      lightsail: 'not_provisioned',
      s3: 'not_provisioned',
      secrets_manager: 'not_provisioned',
    },
  };

  const configYaml = YAML.stringify(config);
  const capabilityMapJson = JSON.stringify(validEnvelope, null, 2) + '\n';

  const interpretation = validEnvelope.capability_map.interpretation;
  const scopeName = validEnvelope.capability_map.scope_brief.name;
  const blueprintMd = [
    `# ${body.displayName} · Blueprint`,
    '',
    `> Seeded as a Lead from polynize.ai capability map on ${now}.`,
    '> Schema version 2.0 (two-layer Engagement + Work Plan).',
    '',
    '## 01 · Engagement summary',
    '',
    `**Scope:** ${scopeName}`,
    '',
    interpretation,
    '',
    '## 02 · Team',
    '',
    'See `modelling/capability-map.json` for the seeded team.',
    '',
    '## 03 · Infrastructure',
    '',
    'Not yet provisioned.',
    '',
    '## 04 · Capability map',
    '',
    'See `modelling/capability-map.json`. Rendered in the Console via the Stage 2 renderer.',
    '',
    '## 05 · Gap register',
    '',
    'Derived from capability-map.json gaps_to_close + map_reflection.',
    '',
  ].join('\n');

  const commitMsg =
    `Seed ${slug} Lead Blueprint from polynize.ai capability map\n\n` +
    `ApprovedBy: ${body.approvedBy}\n` +
    `Actor: ${auth.actor.id}\nSource: ${auth.actor.source}`;

  try {
    const cfgCommit = await writeClientFile(
      slug,
      '.polynize/client-config.yaml',
      configYaml,
      commitMsg
    );
    const mapCommit = await writeClientFile(
      slug,
      'modelling/capability-map.json',
      capabilityMapJson,
      commitMsg
    );
    const mdCommit = await writeClientFile(
      slug,
      'modelling/blueprint.md',
      blueprintMd,
      commitMsg
    );

    return NextResponse.json({
      ok: true,
      slug,
      repoCreated,
      commits: {
        config: cfgCommit,
        capabilityMap: mapCommit,
        blueprint: mdCommit,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Failed to write seed files',
        detail: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 }
    );
  }
}
