import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * ONE-OFF DIAGNOSTIC — created 2026-05-28 to resolve the "Carl's row not in
 * v2 Supabase" audit (the rendered /blueprints/<id> page shows real Carl
 * Schiara content, but the v2 Supabase project the team thought we were
 * using shows no writes since May 15).
 *
 * Returns safe-to-expose metadata about which Supabase project this
 * deployment is wired to:
 *  - Project REF (the subdomain before .supabase.co) — returned in full.
 *    This is an identifier, not a credential.
 *  - Service-role + anon keys — returned only as "set / not set" booleans.
 *    No key material is exposed.
 *
 * Also surfaces Vercel deployment markers so we know which env scope is
 * answering (production vs preview), useful if multiple env scopes point
 * to different Supabase projects.
 *
 * DELETE THIS FILE after the audit is complete and the env cutover (Path B
 * in the conversation flow) has been verified.
 */
export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL ?? '';
  const projectRef =
    supabaseUrl.match(/^https?:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null;

  return NextResponse.json(
    {
      supabase: {
        url_set: Boolean(supabaseUrl),
        project_ref: projectRef,
        service_role_key_set: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        anon_key_set: Boolean(process.env.SUPABASE_ANON_KEY),
      },
      vercel: {
        env: process.env.VERCEL_ENV ?? null,
        region: process.env.VERCEL_REGION ?? null,
        git_commit_sha:
          process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? null,
      },
      note: 'One-off diagnostic. Delete app/api/diagnostics/env/route.ts after audit.',
    },
    {
      // Prevent caching — env-derived response.
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
