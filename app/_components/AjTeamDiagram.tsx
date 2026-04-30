import s from './aj-team-diagram.module.css';

/**
 * Static org-chart-style diagram of AJ Milne's agent team at Optio Capital.
 *
 * Used on:
 *   - Homepage "AJ's team at Optio Capital" section (act 3 of the story)
 *   - Console dashboard hero ("Your team")
 *
 * Cards are dossier-style: agent image at the top, then name (bold), role
 * title, and a 1-2 sentence description. The human owner card (AJ) carries
 * the coral accent so it reads as the human at the centre, agents carry the
 * mint accent. Vertical and horizontal connectors only — no diagonals.
 *
 * The connector between the Team Leader and the three specialists is a
 * single inline SVG with `preserveAspectRatio="none"` + `vector-effect:
 * non-scaling-stroke` so the legs always land at the centre of each agent
 * card below, at any container width.
 */

type AgentNode = {
  src: string;
  alt: string;
  name: string;
  role: string;
  description: string;
};

const TEAM_LEADER: AgentNode = {
  src: '/assets/agents/team-leader.png',
  alt: 'Duke, team leader',
  name: 'Duke',
  role: 'Team Leader',
  description:
    'Coordinates the deal pipeline, holds quality across the workstreams, and surfaces what needs partner judgment.',
};

const SPECIALISTS: AgentNode[] = [
  {
    src: '/assets/agents/investment-analyst.png',
    alt: 'Duke, investment analyst',
    name: 'Duke',
    role: 'Investment Analyst',
    description:
      'Builds first-pass financial models and pulls comparable transactions, ready for partner review.',
  },
  {
    src: '/assets/agents/research-analyst.png',
    alt: 'Sieve, research analyst',
    name: 'Sieve',
    role: 'Research Analyst',
    description:
      'Maps market sizing, competitive landscape, and trend signals end-to-end, in a single voice.',
  },
  {
    src: '/assets/agents/legal-compliance.png',
    alt: 'Verity, legal and compliance',
    name: 'Verity',
    role: 'Legal & Compliance',
    description:
      'Reads data rooms, flags risk and clauses, and runs regulatory checks before signoff.',
  },
];

export function AjTeamDiagram({ caption = "AJ's team at Optio Capital" }: { caption?: string }) {
  return (
    <div className={s.ajTeam} aria-label={`${caption} — agent team diagram`}>
      <div className={s.ajTeamCaption}>{caption}</div>

      {/* Level 1 — AJ Milne, the human at the centre (coral accent) */}
      <div className={s.ajTeamHumanRow}>
        <HumanCard
          src="/assets/aj-milne.jpg"
          alt="AJ Milne"
          name="AJ Milne"
          role="Partner, Optio Capital"
          description="Investment thesis, valuation, client relationships, and final calls."
        />
      </div>

      <div className={s.ajVerticalConnector} aria-hidden />

      {/* Level 2 — Team Leader (mint accent) */}
      <div className={s.ajTeamLeaderRow}>
        <AgentCard {...TEAM_LEADER} />
      </div>

      {/* Branch from Team Leader to the 3 specialist columns. */}
      <BranchSvg />

      {/* Level 3 — three specialists */}
      <div className={s.ajTeamRow}>
        {SPECIALISTS.map((agent) => (
          <AgentCard key={`${agent.name}-${agent.role}`} {...agent} />
        ))}
      </div>
    </div>
  );
}

function HumanCard({
  src,
  alt,
  name,
  role,
  description,
}: {
  src: string;
  alt: string;
  name: string;
  role: string;
  description: string;
}) {
  return (
    <article className={`${s.ajCard} ${s.ajCardHuman}`}>
      <div className={`${s.ajAvatar} ${s.ajAvatarHuman}`}>
        <img src={src} alt={alt} />
      </div>
      <div className={s.ajCardName}>{name}</div>
      <div className={s.ajCardRole}>{role}</div>
      <p className={s.ajCardDesc}>{description}</p>
    </article>
  );
}

function AgentCard({
  src,
  alt,
  name,
  role,
  description,
}: {
  src: string;
  alt: string;
  name: string;
  role: string;
  description: string;
}) {
  return (
    <article className={s.ajCard}>
      <div className={s.ajAvatar}>
        <img src={src} alt={alt} />
      </div>
      <div className={s.ajCardName}>{name}</div>
      <div className={s.ajCardRole}>{role}</div>
      <p className={s.ajCardDesc}>{description}</p>
    </article>
  );
}

/**
 * Branch connector. The SVG viewBox is 100 wide, so the leg X coordinates
 * (16.67, 50, 83.33) line up with the centres of the 1fr/1fr/1fr columns
 * in `.ajTeamRow` below. preserveAspectRatio="none" stretches the SVG to
 * fill the container; vector-effect="non-scaling-stroke" keeps strokes at
 * 1.5px regardless of stretch.
 */
function BranchSvg() {
  return (
    <svg
      className={s.ajBranch}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      role="presentation"
    >
      {/* Trunk — short vertical from top centre */}
      <line
        x1="50"
        y1="0"
        x2="50"
        y2="12"
        stroke="currentColor"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
      {/* Horizontal span from left specialist to right specialist */}
      <line
        x1="16.67"
        y1="12"
        x2="83.33"
        y2="12"
        stroke="currentColor"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
      {/* Three legs dropping to each specialist column centre */}
      <line
        x1="16.67"
        y1="12"
        x2="16.67"
        y2="100"
        stroke="currentColor"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="12"
        x2="50"
        y2="100"
        stroke="currentColor"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
      <line
        x1="83.33"
        y1="12"
        x2="83.33"
        y2="100"
        stroke="currentColor"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}
