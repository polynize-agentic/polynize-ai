// Default demo data for the Blueprint when no /agents state exists
window.BLUEPRINT_DEFAULT = {
  answers: {
    name: 'Sarah',
    q1: 'we help mid-market ops teams roll out internal tooling, specifically replacing legacy ERP workflows with modern platforms',
    q1_company: 'Keel Operations',
    q2_role: 'Founder',
    q2_size: '2-5',
    q3: 'more qualified pipeline without me being in every discovery call',
    q4: ['Sales and pipeline', 'Account and relationship management'],
    q5_volume: 'Medium, 20 to 100 / week',
    q6_tools: ['Gmail / Outlook','Slack','HubSpot','Notion','Calendar'],
    q7_constraint: "I don't have the time",
    q8_metric: 'cut my discovery-call load in half while keeping conversion above 25%',
    q9_urgency: 'Within the month',
    q10_stance: "Build and deploy it for me, I'll review",
    email: 'sarah@keel.ops',
  },
  data: {
    shape: 'Pipeline and Conversion',
    percentages: { human: 38, hybrid: 25, agent: 37 },
    rows: [
      { fn: 'Prospecting and qualification', alloc: 'agent' },
      { fn: 'Meeting prep and intel briefs', alloc: 'agent' },
      { fn: 'Live client conversations',     alloc: 'human' },
      { fn: 'Proposal drafting',              alloc: 'hybrid' },
      { fn: 'Objection handling',             alloc: 'human' },
      { fn: 'Follow-through and pipeline',    alloc: 'agent' },
      { fn: 'Close and commitment',           alloc: 'human' },
      { fn: 'Post-sale handoff',              alloc: 'agent' },
    ],
    team: [
      { name:'Nora',  role:'Targeting & Qualification Specialist' },
      { name:'Arlo',  role:'Meeting Prep & Intelligence Analyst' },
      { name:'Sena',  role:'Proposal Specialist' },
      { name:'Jules', role:'Pipeline Coordinator' },
    ],
  }
};

// Per-agent detail used in Page 2 — keyed by role
window.AGENT_DETAIL = {
  'Targeting & Qualification Specialist': {
    owns: ['Prospecting and qualification'],
    what: "Hunts through your market universe daily, scoring every potential account against your ICP signals, and hands you a ranked short-list of who's worth a call before you open your laptop."
  },
  'Meeting Prep & Intelligence Analyst': {
    owns: ['Meeting prep and intel briefs'],
    what: "Before every call on your calendar, assembles a one-page brief: who they are, who's joining, what they're likely to ask, and the three things you should be ready to say. Waiting in your inbox by 8am."
  },
  'Proposal Specialist': {
    owns: ['Proposal drafting'],
    what: "Turns a 20-minute debrief into a complete first-draft proposal that sounds like you. You steer shape and pricing. They handle structure, language, and the boring bits."
  },
  'Pipeline Coordinator': {
    owns: ['Follow-through and pipeline', 'Post-sale handoff'],
    what: "Watches every deal quietly. Chases the follow-up you forgot, keeps HubSpot honest, and surfaces the three deals most likely to slip if no one does anything this week."
  },
  // fallbacks for other shapes
  'Research & Synthesis Analyst':   { owns: ['Source gathering and triage','Synthesis and pattern surfacing'], what: "Pulls the right sources, not just the loudest ones, and gives you a synthesis with the pattern already surfaced, ready for your judgment." },
  'Briefing & Memo Writer':         { owns: ['Drafting briefs and memos'], what: "Drafts in your voice. You rewrite the sentence that matters and ship it." },
  'Source & Citation Keeper':       { owns: ['Citation and fact-check'], what: "Every claim has a source. Every source has a date. Nothing goes out with a fabricated citation." },
  'Distribution Coordinator':       { owns: ['Distribution and tracking'], what: "Puts the work where it needs to live, tracks who read it, flags who didn't." },
  'Scope & Breakdown Analyst':      { owns: ['Breakdown into work packets'], what: "Turns your scope into work packets the rest of the team can pick up. No more endless Loom-to-Linear translation." },
  'Build Operator':                 { owns: ['Routine build tasks'], what: "Handles the structured build work. You review, they iterate." },
  'QA & Review Specialist':         { owns: ['QA and review'], what: "Runs the checklist before you get the handoff. You only see what's actually ready." },
  'Progress & Status Coordinator':  { owns: ['Progress tracking','Status updates and reporting'], what: "Weekly status, without you writing it. Stakeholders get the truth. You get your hours back." },
  'Chief of Staff Agent':           { owns: ['Inbox triage','Follow-up tracking'], what: "Reads every inbound, triages what's yours, drafts replies for the 80% that don't need your voice." },
  'Inbox & Follow-up Keeper':       { owns: ['Follow-up tracking'], what: "Closes loops. Politely. Forever." },
  'Meeting Brief Writer':           { owns: ['Meeting prep briefs'], what: "Thirty minutes before every meeting, a page lands with the context you need." },
  'Correspondence Drafter':         { owns: ['Written correspondence'], what: "Drafts the hard emails in your voice so you can send them in five minutes instead of fifty." },
  'Client Health Monitor':          { owns: ['Account monitoring','Health signals and alerts'], what: "Spots churn signals before churn happens. Flags which account needs a call this week." },
  'Cadence & Nudge Coordinator':    { owns: ['Check-in and nudge cadence'], what: "Holds the rhythm of touch-points so you don't have to." },
  'CRM & Note Keeper':              { owns: ['Note-taking and CRM updates'], what: "After every call, the CRM is accurate. Without anyone typing." },
  'Expansion Prep Analyst':         { owns: ['Renewal and expansion calls'], what: "Walks into renewal conversations with the numbers, the history, and the three hooks." },
  'Routing & Intake Operator':      { owns: ['Inbound sorting and routing'], what: "Every inbound, classified and routed, in under a minute." },
  'Transaction Processor':          { owns: ['Standard transactions'], what: "Handles the 90% of volume that fits the template." },
  'Exception Handler':              { owns: ['Exception handling'], what: "When the template breaks, figures out the shape of the exception, and either handles it or hands it up with the right context." },
  'SLA & Reporting Agent':          { owns: ['SLA and volume reporting'], what: "SLAs watched in real time. You see the dashboard. Stakeholders see the report." },
  'Reference & Research Agent':     { owns: ['Research and references'], what: "Finds the reference, the precedent, the source, faster than you could open a browser." },
  'Draft & Iteration Specialist':   { owns: ['Drafting and iteration'], what: "Iterates on drafts until they're worth your editing pass." },
  'Editor & Polisher':              { owns: ['Editing and polish'], what: "Last pass before publish. Catches the thing you'd have caught if you'd had another hour." },
  'Publishing Coordinator':         { owns: ['Publishing and distribution'], what: "Puts it live, announces it, tracks what lands." },
  'Knowledge Capture Agent':        { owns: ['Knowledge capture'], what: "Every decision, every why, captured without anyone typing it up." },
  'Documentation Keeper':           { owns: ['Documentation upkeep'], what: "Docs stay true, automatically." },
  'Skill Gap Analyst':              { owns: ['Skill gap analysis'], what: "Spots the capability gaps before they become hiring emergencies." },
  'Onboarding Coordinator':         { owns: ['Onboarding materials'], what: "Every new hire gets a tailored ramp path." },
};
