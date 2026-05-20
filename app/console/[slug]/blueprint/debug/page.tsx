import { notFound } from 'next/navigation';
import { CONSOLE_CLIENTS } from '@/app/console/_config/clients';
import { readClientFile } from '@/lib/github-client';
import { parseBlueprint } from '@/app/console/_lib/parse-blueprint';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export default async function BlueprintDebugPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;

  if (!(CONSOLE_CLIENTS as readonly string[]).includes(slug)) {
    notFound();
  }

  let summary: unknown = null;
  let error: string | null = null;

  try {
    const md = await readClientFile(slug, 'modelling/blueprint.md');
    const parsed = parseBlueprint(md);

    summary = {
      preamble: {
        title: parsed.preamble.title,
        introLength: parsed.preamble.intro.length,
      },
      sectionCount: parsed.sections.length,
      sections: parsed.sections.map((s) => ({
        id: s.id,
        title: s.title,
        contentLength: s.content.length,
      })),
    };
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <h1
        style={{
          fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif',
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          margin: '0 0 8px',
        }}
      >
        Blueprint parser debug
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
          fontSize: 12,
          letterSpacing: '0.02em',
          color: 'var(--text-3)',
          margin: '0 0 28px',
        }}
      >
        Parsed <code>polynize-agentic/{slug}/modelling/blueprint.md</code>
      </p>
      {error !== null && (
        <div
          role="alert"
          style={{
            background: 'rgba(255, 122, 107, 0.08)',
            border: '1px solid rgba(255, 122, 107, 0.3)',
            padding: '16px 18px',
            borderRadius: 10,
            color: 'var(--coral)',
            fontFamily:
              'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            fontSize: 13,
          }}
        >
          <strong>Parser or fetch failed</strong>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: '8px 0 0' }}>
            {error}
          </pre>
        </div>
      )}
      {summary !== null && (
        <pre
          style={{
            background: 'var(--tac-inset)',
            boxShadow: 'var(--tac-shadow-inset)',
            padding: '20px 22px',
            borderRadius: 12,
            fontFamily:
              'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            fontSize: 13,
            lineHeight: 1.65,
            color: 'var(--text)',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {JSON.stringify(summary, null, 2)}
        </pre>
      )}
    </div>
  );
}
