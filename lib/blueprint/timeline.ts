import type { MultiTeamHeatMap, HeatMapAgent } from '../types';

export type TimelineMessage =
  | { from: 'human'; text: string }
  | { from: 'agent'; agent: HeatMapAgent; teamName: string; text: string };

export type TimelineBlock = {
  time: string;
  label: string;
  items: TimelineMessage[];
};

/**
 * Day-in-the-life timeline for Blueprint Page 4. Picks the 2-3 most impactful
 * scenarios across all teams in the unit, weaving in named agents from
 * different teams so the visitor sees the whole unit acting in concert.
 */
export function buildMultiTeamTimeline(
  data: MultiTeamHeatMap,
  firstName: string
): TimelineBlock[] {
  const teams = data.teams;
  if (teams.length === 0) return [];

  // Pick a representative agent from each team in order so the timeline
  // showcases all teams without exceeding 4 blocks.
  const pick = (teamIdx: number, agentIdx = 0) => {
    const team = teams[teamIdx % teams.length];
    return { agent: team.agents[agentIdx % team.agents.length], teamName: team.name };
  };

  const morning = pick(0);
  const midmorning = pick(1 % teams.length, teams.length > 1 ? 0 : 1);
  const afternoon = pick(Math.min(2, teams.length - 1));
  const close = pick(0, teams[0].agents.length > 1 ? 1 : 0);

  return [
    {
      time: '08:00',
      label: 'before you open your laptop',
      items: [
        {
          from: 'agent',
          agent: morning.agent,
          teamName: morning.teamName,
          text: `Morning ${firstName}. Here's what's already moving across the unit. Today's priorities sit on the ${morning.teamName} side.`,
        },
        {
          from: 'agent',
          agent: midmorning.agent,
          teamName: midmorning.teamName,
          text: `From ${midmorning.teamName}: your 10:30 has a brief ready, two-page summary plus the answer I'd lead with.`,
        },
      ],
    },
    {
      time: '10:30',
      label: 'you walk into the call prepared',
      items: [
        {
          from: 'human',
          text: 'Call ran long. We need pricing by Friday and a check-in scheduled with the delivery lead.',
        },
        {
          from: 'agent',
          agent: afternoon.agent,
          teamName: afternoon.teamName,
          text: `On it. ${afternoon.teamName} is drafting; I'll have a first pass in your review folder by 2pm. Tagging you on one decision I want your call on.`,
        },
      ],
    },
    {
      time: '13:30',
      label: 'lunch, actually',
      items: [
        {
          from: 'agent',
          agent: midmorning.agent,
          teamName: midmorning.teamName,
          text: `While you were eating: a soft-touch follow-up went out across two stalled threads. Drafted in your voice, held the third for your eyes.`,
        },
      ],
    },
    {
      time: '16:00',
      label: 'end of day',
      items: [
        { from: 'human', text: 'Review and sign-off sweep.' },
        {
          from: 'agent',
          agent: close.agent,
          teamName: close.teamName,
          text: `Ready for your eyes. Two flagged items. Everything else has been dispatched.`,
        },
        {
          from: 'agent',
          agent: morning.agent,
          teamName: morning.teamName,
          text: `Tomorrow's shortlist brewing across the unit. Nothing's on fire.`,
        },
      ],
    },
  ];
}
