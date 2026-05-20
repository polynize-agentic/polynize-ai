import Link from 'next/link';
import { notFound } from 'next/navigation';
import YAML from 'yaml';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CONSOLE_CLIENTS } from '@/app/console/_config/clients';
import { readClientFile } from '@/lib/github-client';
import { parseBlueprint } from '@/app/console/_lib/parse-blueprint';
import s from './blueprint.module.css';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

function stripSectionPrefix(title: string): string {
  return title.replace(/^\d{2}\s+·\s+/, '');
}

async function loadClientName(slug: string): Promise<string> {
  try {
    const yamlText = await readClientFile(slug, '.polynize/client-config.yaml');
    const parsed = YAML.parse(yamlText) as { client?: { name?: string } } | null;
    return parsed?.client?.name ?? slug;
  } catch {
    return slug;
  }
}

export default async function BlueprintPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;

  if (!(CONSOLE_CLIENTS as readonly string[]).includes(slug)) {
    notFound();
  }

  let markdown: string | null = null;
  try {
    markdown = await readClientFile(slug, 'modelling/blueprint.md');
  } catch {
    // File missing, network error, or auth failure. Render empty state.
  }

  if (markdown === null) {
    const clientName = await loadClientName(slug);
    return (
      <div className={s.container}>
        <header className={s.header}>
          <div className={s.eyebrow}>POLYNIZE PAM CONSOLE · CLIENT BLUEPRINT</div>
          <h1 className={s.title}>{clientName}</h1>
          <Link href="/console" className={s.backLink}>
            ← All clients
          </Link>
        </header>
        <p className={s.emptyState}>
          Blueprint not yet populated. Add content to{' '}
          <code>modelling/blueprint.md</code> in the client repo to populate this
          dashboard.
        </p>
      </div>
    );
  }

  const parsed = parseBlueprint(markdown);

  return (
    <div className={s.container}>
      <header className={s.header}>
        <div className={s.eyebrow}>POLYNIZE PAM CONSOLE · CLIENT BLUEPRINT</div>
        <h1 className={s.title}>{parsed.preamble.title}</h1>
        <Link href="/console" className={s.backLink}>
          ← All clients
        </Link>
      </header>

      {parsed.preamble.intro && (
        <div className={s.intro}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {parsed.preamble.intro}
          </ReactMarkdown>
        </div>
      )}

      {parsed.sections.map((section) => (
        <section key={section.id} id={section.id} className={s.section}>
          <h2 className={s.sectionTitle}>{stripSectionPrefix(section.title)}</h2>
          <div className={s.sectionBody}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {section.content}
            </ReactMarkdown>
          </div>
        </section>
      ))}
    </div>
  );
}
