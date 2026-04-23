import type { TeamMember } from '../types';

/**
 * Day-in-the-life timeline for Blueprint Page 4. Ported verbatim from
 * design_handoff/designs/blueprints/bp-04-day.jsx. The narrative is shaped
 * around the Pipeline shape (the demo). For other shapes, the prototype
 * recycles the same script with different agent names.
 *
 * CC-TODO: shape-specific timelines (or LLM generation) in Phase 2.
 */

export type TimelineMessage =
  | { from: 'human'; text: string }
  | { from: 'agent'; agent: TeamMember; text: string };

export type TimelineBlock = {
  time: string;
  label: string;
  items: TimelineMessage[];
};

export function buildPipelineTimeline(
  agents: TeamMember[],
  firstName: string
): TimelineBlock[] {
  if (agents.length === 0) return [];
  const a = (i: number) => agents[i % agents.length];

  return [
    {
      time: '08:00',
      label: 'before you open your laptop',
      items: [
        {
          from: 'agent',
          agent: a(0),
          text: `Morning ${firstName}. Today's ranked pipeline is in your inbox. 4 accounts are worth a call this week, 1 is likely to slip without a nudge. Top of the list: Merrick Holdings.`,
        },
        {
          from: 'agent',
          agent: a(1),
          text: `Your 10:30 with Merrick has a briefing doc ready. Two-page summary, three questions I'd expect, and the answer I'd lead with.`,
        },
      ],
    },
    {
      time: '10:30',
      label: 'you walk into the call prepared',
      items: [
        {
          from: 'human',
          text: 'Merrick call ran 12 minutes over. They want to see pricing by Friday.',
        },
        {
          from: 'agent',
          agent: a(2),
          text: `On it. Draft proposal in your review folder by 2pm today. I've used the structure you approved for the Westfield deal and adjusted for their scope. Tagging you on one price call I'm not sure about.`,
        },
      ],
    },
    {
      time: '13:00',
      label: 'lunch, actually',
      items: [
        {
          from: 'agent',
          agent: a(3),
          text: `While you were eating: Tollworth hasn't replied in 11 days. Drafted a warm nudge in your voice. Waiting for your yes before it goes out.`,
        },
      ],
    },
    {
      time: '16:00',
      label: 'end of day',
      items: [
        { from: 'human', text: 'Review + sign-off sweep.' },
        { from: 'agent', agent: a(2), text: `Proposal ready for your eyes. One flagged section.` },
        {
          from: 'agent',
          agent: a(3),
          text: `Pipeline clean. HubSpot matches reality. 3 nudges sent, 1 held for your review.`,
        },
        {
          from: 'agent',
          agent: a(0),
          text: `Tomorrow's shortlist brewing. Nothing's on fire.`,
        },
      ],
    },
  ];
}
