/**
 * THE SIX USE CASES, AS DATA (D96, step 4 of the plan in analytics-and-scale.md).
 *
 * Marrs, 3 September: the team's word is USE CASE, not lane. In this codebase `lane` already means
 * the stream (whose board a narrative sits on), so the new axis is named `use_case` everywhere and
 * never `lane`, or the two would be confused in a week.
 *
 * WHAT A USE CASE IS. What a post is about and who it is for: hiring managers, sales leaders, the
 * person who owns security. The content strategy v0.2 (section 09) defines six, each with a Kit
 * segment, a lead magnet and a landing page. The lead nurture design (docs/handoff/
 * leo-lead-nurture-design.md) uses the same six segment ids, so the id here IS the Kit segment id
 * and a lead tagged from a link needs no translation.
 *
 * WHY DATA AND NOT PROSE. Three readers need the same list and must never disagree: Gate 1 (the
 * picker), the link builder (utm_campaign), and the site (which use case a lead belongs to). One
 * array, three imports.
 *
 * PURE. No store, no fetch, so the picker can import it in the browser and the tests can assert
 * it without a network.
 */

export type UseCase = {
  /** The Kit segment id from the strategy. Persisted on narratives, pieces, entries and leads. */
  id: string;
  /** What the operator sees. */
  label: string;
  /** One line for April and for the picker's hint. */
  hint: string;
  /**
   * WHERE THE LINK LANDS. A path on polynize.ai, never a full url: the origin is decided once by
   * the link builder so a staging build cannot bake a production host into a stored link.
   *
   * Two use cases have no magnet yet (the strategy says TO_BUILD and undefined), so their links
   * land on the home page. The strategy's own rule is "no magnet, no post"; the console does not
   * enforce that here because a post with a labelled link to the home page still tells us which
   * post earned the click, and refusing to prepare it would hide the gap rather than measure it.
   */
  landing: string;
  /** The magnet's name, for the picker. Absent when there is none yet. */
  magnet?: string;
  /**
   * WORDS THAT SUGGEST THIS USE CASE, lowercase. Used only to pre-select a default at Gate 1 from
   * the idea text, which the operator then confirms or changes. A guess that is shown and editable
   * is a convenience; a guess that is silently stored would be a lie about intent.
   */
  cues: string[];
};

/**
 * THE THREE (Marrs, 8 September 2026): "We're thinking of just focusing on three of the use cases."
 * Confirmed the same day: AI enablement, Talent assessment, Organisational redesign. The ids of the
 * first two are unchanged from the six, because leads, entries and Stories already carry them and a
 * Kit segment may too; only the labels moved. The third is new.
 *
 * Marrs also said "we need to be able to expand and contract depending on those use cases", which is
 * why this is a list and why the retired four are kept below rather than deleted: anything stored
 * with a retired id still reads back with its name, and bringing one back is moving one entry up.
 */
export const USE_CASES: readonly UseCase[] = [
  {
    id: 'ai_capability_lead',
    label: 'AI enablement',
    hint: 'Teams and their L&D leads working out what AI changes in their work',
    landing: '/map-your-team',
    magnet: 'Map your team',
    cues: ['ai', 'agent', 'agents', 'automation', 'llm', 'copilot', 'capability map', 'strip the ai', 'enablement', 'learning', 'l&d', 'training'],
  },
  {
    id: 'hiring_manager',
    label: 'Talent assessment',
    hint: 'Understanding your people: hiring, roles, who is good at what',
    landing: '/job-mapping',
    magnet: 'Map your job against AI',
    cues: ['hiring', 'hire', 'recruit', 'candidate', 'interview', 'job description', 'role', 'headcount', 'talent', 'assessment', 'hr', 'people'],
  },
  {
    id: 'org_design',
    label: 'Organisational redesign',
    hint: 'Process and structure: how the work is organised, not who does it',
    landing: '/map-your-team',
    magnet: 'Map your team',
    cues: ['org', 'organisation', 'organization', 'structure', 'restructure', 'process', 'redesign', 'operating model', 'team design', 'workflow'],
  },
];

/**
 * RETIRED, NOT DELETED. The other three of the original six (and the sales one). A Story, entry or
 * lead stored with one of these ids still shows its name; the pickers do not offer them.
 */
export const RETIRED_USE_CASES: readonly UseCase[] = [
  { id: 'sales_lead', label: 'Sales capability (retired)', hint: '', landing: '/map-your-team', magnet: 'Capability map your team', cues: [] },
  { id: 'ld_lead', label: 'Leadership development (retired)', hint: '', landing: '/map-your-team', magnet: 'Capability map your team', cues: [] },
  { id: 'security_lead', label: 'Cybersecurity (retired)', hint: '', landing: '/', cues: [] },
  { id: 'deal_side', label: 'Acquisition diagnostic (retired)', hint: '', landing: '/', cues: [] },
];

const BY_ID = new Map([...USE_CASES, ...RETIRED_USE_CASES].map((u) => [u.id, u]));

/**
 * THE USE CASES ARE FOR POLYNIZE CONTENT, NOT FOR MARRS ATTACKS. Marrs, 8 September, twice: "the
 * three use cases that we mentioned are for Polynize content, not for Marrs Attacks."
 *
 * The marrs stream carries a different strategy (growth of his own account; the split-screen rules
 * in docs/pam-console/marrs-split-screen-rules.md) whose pieces are labelled by their question's
 * focus anchor and their CTA keyword, never by a Polynize use case. So the pickers do not appear on
 * that board, and a link from that board carries `marrs_attacks` as its campaign rather than a
 * use case. The other people's streams carry Polynize content (the strategy's "personal profiles
 * carry reach"), so they keep the use cases.
 */
export const MARRS_ATTACKS_STREAM = 'marrs';
export const MARRS_ATTACKS_CAMPAIGN = 'marrs_attacks';

export function usesUseCases(stream: string | undefined): boolean {
  return stream !== MARRS_ATTACKS_STREAM;
}

/** What goes in a link's utm_campaign for a post on this stream. */
export function campaignFor(input: { stream: string; use_case?: string }): string | undefined {
  if (input.stream === MARRS_ATTACKS_STREAM) return MARRS_ATTACKS_CAMPAIGN;
  return input.use_case;
}

export function isUseCaseId(x: unknown): x is string {
  return typeof x === 'string' && BY_ID.has(x);
}

export function labelForUseCase(id: string | undefined): string {
  return (id && BY_ID.get(id)?.label) || 'No use case';
}

export function findUseCase(id: string | undefined): UseCase | undefined {
  return id ? BY_ID.get(id) : undefined;
}

/**
 * Where a link for this use case should land, as a path. Unknown or absent falls back to the home
 * page rather than throwing: a link that lands somewhere is worth more than a prepare that fails.
 */
export function landingFor(id: string | undefined): string {
  return findUseCase(id)?.landing ?? '/';
}

/**
 * THE DEFAULT AT GATE 1. The use case whose cues appear most in the idea; undefined when none do,
 * so the picker shows "pick one" rather than a wrong guess dressed as a choice.
 *
 * Word-boundary matching, so "ai" does not fire on "said" and "role" does not fire on "roles"
 * missing is accepted: recall is deliberately low, because the cost of a wrong default that gets
 * confirmed by a tired click is a mislabelled fortnight of posts.
 */
export function guessUseCase(idea: string): string | undefined {
  const text = ` ${idea.toLowerCase().replace(/\s+/g, ' ')} `;
  let best: { id: string; hits: number } | undefined;
  for (const u of USE_CASES) {
    let hits = 0;
    for (const cue of u.cues) {
      const re = new RegExp(`(^|[^a-z0-9])${cue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9])`, 'i');
      if (re.test(text)) hits += 1;
    }
    if (hits > 0 && (!best || hits > best.hits)) best = { id: u.id, hits };
  }
  return best?.id;
}
