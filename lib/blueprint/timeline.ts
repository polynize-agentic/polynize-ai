import type { CapabilityMapData, CapabilityAgent } from '../types';

export type TimelineMessage =
  | { from: 'human'; text: string }
  | { from: 'agent'; agent: CapabilityAgent; text: string };

export type TimelineBlock = {
  time: string;
  label: string;
  items: TimelineMessage[];
};

/**
 * Day-in-the-life timeline for Blueprint Page 4. Builds 3-4 scenarios that
 * walk the human through what a Tuesday looks like with the team in place,
 * grounded in the specific bottleneck the user described.
 */
export function buildCapabilityTimeline(
  data: CapabilityMapData,
  firstName: string
): TimelineBlock[] {
  const agents = data.team.agents;
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
          text: `Morning ${firstName}. Overnight intake handled. Three items flagged for your judgment, queued at the top of your inbox. The rest is moving through the pipeline as expected.`,
        },
        {
          from: 'agent',
          agent: a(1 % agents.length),
          text: `Your 10:30 has a brief ready. Two-page summary, the three things to flag, and the answer I'd lead with.`,
        },
      ],
    },
    {
      time: '11:00',
      label: 'after the call',
      items: [
        {
          from: 'human',
          text: 'Quick decision needed on the priority item. Approving the recommended path.',
        },
        {
          from: 'agent',
          agent: a(2 % agents.length),
          text: `Picked up. Pipeline updated, downstream tasks queued, and the consignor / client got the status email automatically. You don't need to touch this again unless it changes.`,
        },
      ],
    },
    {
      time: '14:00',
      label: 'lunch, actually',
      items: [
        {
          from: 'agent',
          agent: a(0),
          text: `While you were eating: routine items processed, status emails sent, two anomalies flagged for your review when you're back. Nothing on fire.`,
        },
      ],
    },
    {
      time: '17:00',
      label: 'end of day',
      items: [
        { from: 'human', text: 'Sign-off sweep.' },
        {
          from: 'agent',
          agent: a(agents.length - 1),
          text: `Day's work cleared. Two items needed your judgment, both in your queue with full context. Tomorrow's pipeline preview is ready when you want to look.`,
        },
      ],
    },
  ];
}
