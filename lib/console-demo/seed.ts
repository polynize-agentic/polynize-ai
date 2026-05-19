/**
 * Seed data for the Agent Team Console demo (Harrow & West LLP).
 * Ported verbatim from the reference prototype's data.js. Do not edit
 * copy unless explicitly instructed — this is a live marketing demo.
 */

import type {
  Agent,
  ActivityItem,
  AutonomyLevelMeta,
  Human,
  Project,
  Task,
} from './types';

export const AGENTS: Agent[] = [
  {
    id: 'a_paralegal',
    name: 'Odessa',
    role: 'Senior Paralegal',
    description:
      'Drafts, reviews, and organises legal documents. Indexes case files and produces first-pass memos.',
    avatarColor: 'mint',
    initials: 'OD',
    portrait: '/console-assets/agents/odessa.png',
    status: 'working',
    tools: ['Document drafting', 'Case law search', 'Citation check', 'Gmail', 'Dropbox', 'Clio'],
    completed: 147,
  },
  {
    id: 'a_intake',
    name: 'Silas',
    role: 'Client Intake',
    description:
      'Fields new enquiries, qualifies leads, gathers intake docs, and books consultations.',
    avatarColor: 'blue',
    initials: 'SL',
    portrait: '/console-assets/agents/silas.png',
    status: 'working',
    tools: ['Calendly', 'Intake forms', 'Gmail', 'Twilio SMS', 'CRM'],
    completed: 92,
  },
  {
    id: 'a_compliance',
    name: 'Mira',
    role: 'Legal & Compliance',
    description:
      'Monitors regulatory changes, flags conflicts, runs KYC/AML checks, and maintains the compliance log.',
    avatarColor: 'gold',
    initials: 'MI',
    portrait: '/console-assets/agents/mira.png',
    status: 'idle',
    tools: ['Westlaw alerts', 'OFAC screening', 'Conflicts DB', 'Compliance log'],
    completed: 63,
  },
  {
    id: 'a_research',
    name: 'Theo',
    role: 'Legal Research',
    description:
      'Runs deep precedent research, summarises opinions, and produces citation-ready memoranda.',
    avatarColor: 'mint',
    initials: 'TH',
    portrait: '/console-assets/agents/theo.png',
    status: 'working',
    tools: ['Westlaw', 'Lexis', 'CourtListener', 'Memo drafting'],
    completed: 78,
  },
];

export const HUMANS: Human[] = [
  { id: 'h_1', name: 'Evelyn Harrow', email: 'evelyn@harrowwest.com', role: 'admin', avatar: 'EH', projects: ['p_1', 'p_2', 'p_3', 'p_4'] },
  { id: 'h_2', name: 'Marcus West', email: 'marcus@harrowwest.com', role: 'admin', avatar: 'MW', projects: ['p_1', 'p_3'] },
  { id: 'h_3', name: 'Priya Okafor', email: 'priya@harrowwest.com', role: 'member', avatar: 'PO', projects: ['p_1', 'p_2'] },
  { id: 'h_4', name: 'Daniel Koenig', email: 'daniel@harrowwest.com', role: 'member', avatar: 'DK', projects: ['p_3', 'p_4'] },
  { id: 'h_5', name: 'Ana Castellanos', email: 'ana@harrowwest.com', role: 'viewer', avatar: 'AC', projects: ['p_4'] },
];

export const PROJECTS: Project[] = [
  {
    id: 'p_1',
    name: 'Morrison v. Cascade Holdings',
    purpose:
      'Build the discovery record and deposition strategy for Morrison (plaintiff) in the Q3 trial window.',
    leadAgent: 'a_paralegal',
    autonomy: 1,
    status: 'active',
    priority: 8,
    color: '#69fccb',
    createdDaysAgo: 14,
    plan: {
      objective:
        'Prepare a deposition-ready discovery record for the Morrison v. Cascade Holdings trial, targeting the July 2026 window. The partner team needs a defensible evidence chain, a ranked witness list, and first-draft deposition outlines by June 15.',
      strategy:
        'Start from the production Cascade delivered on April 2. Index by document type, then cross-reference against our fact narrative from the complaint. Flag contradictions and missing records. Build witness outlines from the indexed record, not from interview notes.',
      constraints:
        'Every factual claim in a deposition outline must cite a bates-stamped document. No reliance on Westlaw secondary sources in outlines. Protective order in place, no redistribution of Cascade production.',
      priorities:
        '1. Index the Cascade production. 2. Cross-reference vs. complaint. 3. Rank witnesses. 4. Draft deposition outlines for top 4 witnesses.',
    },
  },
  {
    id: 'p_2',
    name: 'Q2 New-Client Intake',
    purpose: 'Qualify and route all inbound enquiries, with a 4-hour first-response target.',
    leadAgent: 'a_intake',
    autonomy: 2,
    status: 'active',
    priority: 6,
    color: '#a5c1ec',
    createdDaysAgo: 42,
    plan: {
      objective:
        'Maintain a 4-hour first-response SLA on all inbound enquiries during Q2. Route qualified leads to the correct practice partner with a completed intake packet.',
      strategy:
        'Triage by matter type against partner availability. Send the right intake form per practice (family / corporate / litigation). Book consultations only after conflicts clears.',
      constraints:
        'No legal advice in first-touch replies. Always disclose that a consultation fee applies. Bilingual replies (EN/ES) when inbound language is Spanish.',
      priorities: '1. 4-hour SLA. 2. Correct routing. 3. Complete intake packets. 4. Consultation bookings.',
    },
  },
  {
    id: 'p_3',
    name: 'Whitfield Estate Restructure',
    purpose:
      'Restructure the Whitfield family trust across three jurisdictions before the FY26 tax deadline.',
    leadAgent: 'a_research',
    autonomy: 0,
    status: 'active',
    priority: 9,
    color: '#f0e1b6',
    createdDaysAgo: 6,
    plan: {
      objective:
        'Produce a trust restructure plan that is tax-optimal across DE, NY, and Jersey (Channel Islands), and ready for partner review by May 20. All draft instruments must be partner-signed before client circulation.',
      strategy:
        'Research precedent restructures with cross-jurisdictional GST considerations. Produce three structural options with trade-off memos. Draft the preferred instrument after partner selection.',
      constraints:
        'Human-in-the-loop on every task. No draft leaves the firm without Marcus West signing off. Privilege-protected research only.',
      priorities:
        '1. Cross-jurisdictional tax memo. 2. Three structural options. 3. Selected option draft. 4. Ancillary documents.',
    },
  },
  {
    id: 'p_4',
    name: 'Compliance & Regulatory Watch',
    purpose:
      'Continuous monitoring of regulatory changes affecting our practice areas, with weekly partner briefs.',
    leadAgent: 'a_compliance',
    autonomy: 2,
    status: 'active',
    priority: 5,
    color: '#e8b85c',
    createdDaysAgo: 88,
    plan: {
      objective:
        'Catch every regulatory change that materially affects our active matters or practice areas, and deliver a partner-ready weekly brief each Friday by 4pm ET.',
      strategy:
        'Monitor SEC, FTC, NY DFS, and relevant state bar announcements. Cross-reference each change against our active matter list. Only brief on changes with practical impact.',
      constraints: 'Brief must fit one page. No speculation about future rules. Every claim linked to source.',
      priorities: '1. Active-matter impact. 2. Practice-area impact. 3. Industry context.',
    },
  },
];

export const TASKS: Task[] = [
  { id: 't1', project: 'p_1', agent: 'a_paralegal', title: 'Index Cascade production batch 3 (12,450 docs) by document type', status: 'proposed', urgency: 8, proposed_by: 'agent', created: '2h ago' },
  { id: 't2', project: 'p_1', agent: 'a_paralegal', title: 'Draft privilege log entries for the 284 flagged communications', status: 'proposed', urgency: 7, proposed_by: 'agent', created: '2h ago' },
  { id: 't3', project: 'p_1', agent: 'a_research', title: 'Pull 5 comparable discovery objections from 2nd Circuit, last 3 years', status: 'proposed', urgency: 6, proposed_by: 'agent', created: '1h ago' },
  { id: 't4', project: 'p_1', agent: 'a_paralegal', title: 'Cross-reference Cascade emails (Jan-Mar 2025) against complaint §§ 34-41', status: 'todo', urgency: 8, proposed_by: 'agent' },
  { id: 't5', project: 'p_1', agent: 'a_research', title: 'Second-chair prep: timeline of Cascade board meetings with citations', status: 'todo', urgency: 6, proposed_by: 'human' },
  { id: 't6', project: 'p_1', agent: 'a_paralegal', title: 'Witness ranking memo: top 12 deponents with exposure notes', status: 'doing', urgency: 9, proposed_by: 'agent', evidence: 'Drafting section 3 of 5 · 11 witnesses scored' },
  { id: 't7', project: 'p_1', agent: 'a_paralegal', title: 'Deposition outline: CFO Rachel Okoye', status: 'done', urgency: 8, proposed_by: 'agent' },
  { id: 't8', project: 'p_1', agent: 'a_paralegal', title: 'Summary judgment research: 4 analogous cases in S.D.N.Y.', status: 'done', urgency: 5, proposed_by: 'human' },
  { id: 't9', project: 'p_1', agent: 'a_research', title: 'Cascade SEC filings cross-check (2022-2024)', status: 'done', urgency: 6, proposed_by: 'agent' },

  { id: 't10', project: 'p_2', agent: 'a_intake', title: 'Triage 6 new enquiries received overnight', status: 'doing', urgency: 7, proposed_by: 'agent', evidence: 'On enquiry 4/6 · 2 qualified, 1 conflicts-pending' },
  { id: 't11', project: 'p_2', agent: 'a_intake', title: 'Book consultation: Lee (corporate), with Marcus W.', status: 'todo', urgency: 5, proposed_by: 'agent' },
  { id: 't12', project: 'p_2', agent: 'a_intake', title: 'Send intake packet: Ortega (family)', status: 'todo', urgency: 6, proposed_by: 'agent' },
  { id: 't13', project: 'p_2', agent: 'a_compliance', title: 'Run conflicts check on Vasquez enquiry', status: 'done', urgency: 7, proposed_by: 'agent' },
  { id: 't14', project: 'p_2', agent: 'a_intake', title: 'Spanish-language reply to Delgado enquiry', status: 'done', urgency: 6, proposed_by: 'agent' },

  { id: 't15', project: 'p_3', agent: 'a_research', title: 'GST pass-through analysis across DE / NY / Jersey', status: 'proposed', urgency: 9, proposed_by: 'agent', created: '12m ago' },
  { id: 't16', project: 'p_3', agent: 'a_research', title: 'Three structural options memo with tax trade-offs', status: 'todo', urgency: 9, proposed_by: 'agent' },
  { id: 't17', project: 'p_3', agent: 'a_compliance', title: 'Jersey regulatory compatibility check', status: 'blocked', urgency: 7, proposed_by: 'agent', blockedReason: 'Awaiting clarification from Marcus W.' },
  { id: 't18', project: 'p_3', agent: 'a_research', title: 'Precedent: Mills Family Trust (2023) restructure memo', status: 'done', urgency: 6, proposed_by: 'human' },

  { id: 't19', project: 'p_4', agent: 'a_compliance', title: 'SEC Rule 10b5-1 amendments: client impact scan', status: 'doing', urgency: 6, proposed_by: 'agent', evidence: 'Scanned 23/41 active matters · 2 hits so far' },
  { id: 't20', project: 'p_4', agent: 'a_compliance', title: 'Friday brief: Week 17 regulatory changes', status: 'todo', urgency: 7, proposed_by: 'agent' },
  { id: 't21', project: 'p_4', agent: 'a_compliance', title: 'NY DFS cyber filing deadline check for 3 clients', status: 'done', urgency: 8, proposed_by: 'agent' },
];

export const AUTONOMY_LEVELS: AutonomyLevelMeta[] = [
  {
    key: 'human_loop',
    name: 'Human-in-the-loop',
    short: 'Approve each',
    description: 'Agent proposes every task. Nothing runs until you approve it individually.',
    useWhen: 'Highest stakes. Every action deliberate.',
  },
  {
    key: 'approve_batch',
    name: 'Approve & go',
    short: 'Approve batches',
    description: 'Agent proposes a batch of tasks. You approve the whole batch, agent executes all.',
    useWhen: 'Trusted workflows. You want weekly or daily check-ins.',
  },
  {
    key: 'autonomous_reporting',
    name: 'Autonomous with reporting',
    short: 'Run + report',
    description: 'Agent creates and executes tasks independently. You see a log of everything that happened.',
    useWhen: 'Proven projects. You read the log, not every task.',
  },
  {
    key: 'autonomous',
    name: 'Fully autonomous',
    short: 'No check-ins',
    description: 'Agent runs without check-ins. Not recommended for v1 but architecturally supported.',
    useWhen: 'Research only. No client-facing actions.',
  },
];

export const SEED_ACTIVITY: ActivityItem[] = [
  { kind: 'proposed', actor: 'Odessa', text: 'proposed 2 tasks for Morrison v. Cascade Holdings', project: 'p_1', ago: '2m' },
  { kind: 'doing', actor: 'Odessa', text: 'started Witness ranking memo: top 12 deponents', project: 'p_1', ago: '14m' },
  { kind: 'doing', actor: 'Silas', text: 'started Triage 6 new enquiries received overnight', project: 'p_2', ago: '31m' },
  { kind: 'done', actor: 'Mira', text: 'completed NY DFS cyber filing deadline check for 3 clients', project: 'p_4', ago: '1h' },
  { kind: 'proposed', actor: 'Theo', text: 'proposed GST pass-through analysis across DE / NY / Jersey', project: 'p_3', ago: '1h' },
  { kind: 'approved', actor: 'Evelyn Harrow', text: 'approved Cross-reference Cascade emails (Jan-Mar 2025)', project: 'p_1', ago: '2h' },
  { kind: 'done', actor: 'Odessa', text: 'completed Deposition outline: CFO Rachel Okoye', project: 'p_1', ago: '3h' },
  { kind: 'plan', actor: 'Marcus West', text: 'updated APEX Plan for Whitfield Estate Restructure', project: 'p_3', ago: '5h' },
  { kind: 'doing', actor: 'Mira', text: 'started SEC Rule 10b5-1 amendments: client impact scan', project: 'p_4', ago: '6h' },
  { kind: 'done', actor: 'Theo', text: 'completed Cascade SEC filings cross-check (2022-2024)', project: 'p_1', ago: '8h' },
];

export const AGENT_BY_ID: Record<string, Agent> = Object.fromEntries(AGENTS.map((a) => [a.id, a]));
export const PROJECT_BY_ID: Record<string, Project> = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
export const HUMAN_BY_ID: Record<string, Human> = Object.fromEntries(HUMANS.map((h) => [h.id, h]));
