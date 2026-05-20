import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

const ORG = 'polynize-agentic';

let cached: Octokit | null = null;

function normalizePrivateKey(raw: string): string {
  // PEM keys in env vars often arrive with literal `\n` sequences instead
  // of actual newlines (depending on how they were pasted into Vercel).
  return raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
}

export async function getInstallationOctokit(): Promise<Octokit> {
  if (cached) return cached;

  const appId = process.env.GITHUB_APP_ID;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId) throw new Error('GITHUB_APP_ID must be set');
  if (!installationId) throw new Error('GITHUB_APP_INSTALLATION_ID must be set');
  if (!privateKey) throw new Error('GITHUB_APP_PRIVATE_KEY must be set');

  cached = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: Number(appId),
      privateKey: normalizePrivateKey(privateKey),
      installationId: Number(installationId),
    },
  });

  return cached;
}

export async function readClientFile(slug: string, path: string): Promise<string> {
  const octokit = await getInstallationOctokit();

  const response = await octokit.rest.repos.getContent({
    owner: ORG,
    repo: slug,
    path,
  });

  const data = response.data;

  if (Array.isArray(data)) {
    throw new Error(
      `Path "${path}" in repo "${ORG}/${slug}" is a directory, not a file`
    );
  }

  if (data.type !== 'file') {
    throw new Error(
      `Path "${path}" in repo "${ORG}/${slug}" is not a file (type: ${data.type})`
    );
  }

  if (data.encoding !== 'base64') {
    throw new Error(
      `Unexpected encoding "${data.encoding}" for "${path}" in repo "${ORG}/${slug}"`
    );
  }

  if (!data.content) {
    throw new Error(
      `No content returned for "${path}" in repo "${ORG}/${slug}" (file may exceed 1 MB; blob API needed)`
    );
  }

  return Buffer.from(data.content, 'base64').toString('utf-8');
}
