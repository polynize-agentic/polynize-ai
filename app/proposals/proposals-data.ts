/**
 * Source of truth for the /proposals index.
 *
 * Each entry maps to a self-contained HTML file at
 * /public/proposals/<slug>.html, served at /proposals/<slug> via
 * the rewrite in next.config.mjs.
 *
 * Order: newest first. The page renders the array as-is.
 */

export type ProposalType = 'proposal' | 'deck' | 'handover';

export type ProposalEntry = {
  slug: string;
  client: string;
  title: string;
  blurb: string;
  type: ProposalType;
  /** YYYY-MM, displayed as the small monogram on the card. */
  date: string;
};

export const PROPOSALS: ProposalEntry[] = [
  // ── May 2026 ──
  {
    slug: 'newmind-proposal',
    client: 'Newkind',
    title: 'A Marketing & Ops Unit for Newkind 2026',
    blurb:
      'Five-month conference build for Erfan Daliri. An accountable, AI-enabled team running marketing, content, and inquiry work — targeting 400+ tickets while Erfan stays in the room with the community.',
    type: 'proposal',
    date: '2026-05',
  },
  {
    slug: 'newmind-deck',
    client: 'Newkind',
    title: 'Newkind 2026 Pitch Deck',
    blurb:
      'Walkthrough deck of the Newkind marketing & ops capability add. Frames the conference problem, the team that solves it, and the staged commercial structure.',
    type: 'deck',
    date: '2026-05',
  },

  // ── April 2026 ──
  {
    slug: 'roxburys-proposal',
    client: "Roxbury's",
    title: 'An Auction Comms Unit for Scott Waterman',
    blurb:
      'Five agents, one human lead. Tuned to the auction cycle — designed to cut the signal-to-noise problem across consignment inquiries and member comms.',
    type: 'proposal',
    date: '2026-04',
  },
  {
    slug: 'roxy-mapping-01',
    client: "Roxbury's",
    title: 'Phase 01 Build Handover',
    blurb:
      "Running build document for Jaden Young. What Polynize is setting up on our side, what we need from Roxbury's, and Roxy's first job — triaging consignment email into Slack.",
    type: 'handover',
    date: '2026-04',
  },
  {
    slug: 'naomi-proposal',
    client: 'reMYnd',
    title: 'AI-enabling reMYnd for Naomi Ferstera',
    blurb:
      "Operating layer for the Healthy Ageing Project: 12k-member community management, multi-inbox triage, and cohort comms — so Naomi gets back the time only she can spend.",
    type: 'proposal',
    date: '2026-04',
  },
  {
    slug: 'naomi-deck',
    client: 'reMYnd',
    title: 'reMYnd Pitch Deck',
    blurb:
      'Pitch walkthrough for Naomi. Names the two time-eaters — the 12k Facebook group and the 8-account email funnel — and lays out the Polynize approach for each.',
    type: 'deck',
    date: '2026-04',
  },
  {
    slug: 'everstock-proposal',
    client: 'EverStock × Optio',
    title: 'Market Validation Agent Team',
    blurb:
      'Phase 1 of a three-phase build for the Optio Capital team. Agents that find the audience, test the messaging, and collect signal before a dollar goes to inventory.',
    type: 'proposal',
    date: '2026-04',
  },
  {
    slug: 'everstock-deck',
    client: 'EverStock × Optio',
    title: 'EverStock Pitch Deck',
    blurb:
      '10-slide walkthrough of the EverStock market-validation team — what it builds, who runs it, and how the broader system unfolds across phases 2 and 3.',
    type: 'deck',
    date: '2026-04',
  },
  {
    slug: 'supernova',
    client: 'Supernova',
    title: 'Due Diligence Agent Team Pre-Proposal',
    blurb:
      'A focused first implementation: specialist agents that adapt their review by stage and vertical, run analysis in parallel, and hand the investment lead a decision-ready output.',
    type: 'proposal',
    date: '2026-04',
  },

  // ── March 2026 ──
  {
    slug: 'ss-proposal',
    client: 'Social Studio',
    title: 'Agent Team Blueprint',
    blurb:
      'Validate the market before you build the product. The agent team that runs landing pages, email sequences, and inbound qualification on the Social Studio app as its first project.',
    type: 'proposal',
    date: '2026-03',
  },
  {
    slug: 'ss-deck',
    client: 'Social Studio',
    title: 'Social Studio Pitch Deck',
    blurb:
      '12-slide walkthrough framing Polynize as the marketing capability the Social Studio founders are missing — Map · Transform · Operate, staged commercials.',
    type: 'deck',
    date: '2026-03',
  },
];
