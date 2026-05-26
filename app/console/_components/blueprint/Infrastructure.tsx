import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type {
  InfrastructureParsed,
  InfrastructureSubsection,
} from '../../_lib/parse-blueprint';
import s from './blueprint-sections.module.css';

/**
 * Step 7A.2 — Infrastructure section renderer.
 *
 * Two side-by-side cards (stacked on mobile): mint-accented Polynize
 * Infrastructure (what we own) and coral-accented Client Infrastructure
 * (what the client owns / provides). Each card carries an italic
 * description below the heading and the markdown body (typically a
 * table) below that.
 *
 * If only one subsection is populated, that card renders full-width.
 * If neither subsection is structured (legacy format), the parser
 * returns `legacy` and the page falls through to MarkdownPanel — this
 * component is not invoked in that case.
 */

type Variant = 'polynize' | 'client';

function SubsectionCard({
  variant,
  heading,
  subsection,
}: {
  variant: Variant;
  heading: string;
  subsection: InfrastructureSubsection;
}) {
  const cls =
    variant === 'polynize'
      ? `${s.infraCard} ${s.infraCard_polynize}`
      : `${s.infraCard} ${s.infraCard_client}`;
  return (
    <div className={cls}>
      <div className={s.infraCardHead}>
        <span className={s.infraDot} aria-hidden />
        <h3 className={s.infraHeading}>{heading}</h3>
      </div>
      {subsection.description && (
        <p className={s.infraDescription}>{subsection.description}</p>
      )}
      {subsection.content && (
        <div className={s.infraBody}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {subsection.content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export function Infrastructure({ data }: { data: InfrastructureParsed }) {
  const hasPolynize = !!data.polynize;
  const hasClient = !!data.client;
  const bothPresent = hasPolynize && hasClient;

  const gridCls = bothPresent ? s.infraGrid : `${s.infraGrid} ${s.infraGrid_solo}`;

  return (
    <div className={gridCls}>
      {hasPolynize && data.polynize && (
        <SubsectionCard
          variant="polynize"
          heading="Polynize Infrastructure"
          subsection={data.polynize}
        />
      )}
      {hasClient && data.client && (
        <SubsectionCard
          variant="client"
          heading="Client Infrastructure"
          subsection={data.client}
        />
      )}
    </div>
  );
}
