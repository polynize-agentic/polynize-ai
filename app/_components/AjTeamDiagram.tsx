import s from './aj-team-diagram.module.css';

/**
 * Static org-chart-style diagram of AJ Milne's agent team at Optio Capital.
 * Used on the homepage testimonial section and on the console dashboard.
 *
 * The connector between the Team Leader and the three specialists is a
 * single inline SVG with `preserveAspectRatio="none"` + `vector-effect:
 * non-scaling-stroke` so the legs always land at the centre of each agent
 * icon below, at any container width. Lines are pure vertical or horizontal
 * — no diagonals.
 */
export function AjTeamDiagram({ caption = "AJ's team at Optio Capital" }: { caption?: string }) {
  return (
    <div className={s.ajTeam} aria-label={`${caption} — agent team diagram`}>
      <div className={s.ajTeamCaption}>{caption}</div>

      {/* Level 1 — AJ */}
      <div className={s.ajTeamHuman}>
        <TeamNode src="/assets/aj-milne.jpg" alt="AJ Milne" label="AJ Milne" sub="Partner" lead />
      </div>

      <div className={s.ajVerticalConnector} aria-hidden />

      {/* Level 2 — Team Leader */}
      <div className={s.ajTeamLeader}>
        <TeamNode
          src="/assets/agents/team-leader.png"
          alt="Cassia, team leader"
          label="Cassia"
          sub="Team Leader"
        />
      </div>

      {/* Branch from Team Leader to the 3 specialist columns. */}
      <BranchSvg />

      {/* Level 3 — three specialists */}
      <div className={s.ajTeamRow}>
        <TeamNode
          src="/assets/agents/investment-analyst.png"
          alt="Beck, investment analyst"
          label="Beck"
          sub="Investment Analyst"
        />
        <TeamNode
          src="/assets/agents/research-analyst.png"
          alt="Sieve, research analyst"
          label="Sieve"
          sub="Research Analyst"
        />
        <TeamNode
          src="/assets/agents/legal-compliance.png"
          alt="Verity, legal and compliance"
          label="Verity"
          sub="Legal & Compliance"
        />
      </div>
    </div>
  );
}

function TeamNode({
  src,
  alt,
  label,
  sub,
  lead,
}: {
  src: string;
  alt: string;
  label: string;
  sub: string;
  lead?: boolean;
}) {
  return (
    <div className={s.ajNode}>
      <div className={`${s.ajAvatar} ${lead ? s.ajAvatarLead : ''}`}>
        <img src={src} alt={alt} />
      </div>
      <div className={s.ajNodeLabel}>{label}</div>
      <div className={s.ajNodeSub}>{sub}</div>
    </div>
  );
}

/**
 * Branch connector. The SVG viewBox is 100 wide, so the leg X coordinates
 * (16.67, 50, 83.33) line up with the centres of the 1fr/1fr/1fr columns
 * in `.ajTeamRow` below. preserveAspectRatio="none" stretches the SVG to
 * fill the container; vector-effect="non-scaling-stroke" keeps strokes at
 * 1.5px. The legs run from y=12 (just below the trunk) down to y=100
 * (the bottom of the SVG, which sits at the top of the agent avatars).
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
