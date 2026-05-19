import type { ActivityItem, Task } from './types';
import { AGENT_BY_ID, PROJECT_BY_ID } from './seed';
import { PROPOSE_POOL } from './constants';

const MAX_ACTIVITY = 40;

export type SimulationResult = {
  tasks: Task[];
  activity: ActivityItem[];
};

/**
 * One simulation tick. Called every 12 seconds by ConsoleApp.
 * - 45%: advance a "doing" task to "done"; optionally promote a "todo" to "doing"
 * - 25%: propose a new task from PROPOSE_POOL
 * - 30%: nothing
 * Can also be manually triggered via the Tweaks panel button.
 */
export function simulationTick(
  prevTasks: Task[],
  prevActivity: ActivityItem[],
  force?: 'propose' | 'complete'
): SimulationResult {
  const roll = force ? (force === 'propose' ? 0.7 : 0.1) : Math.random();

  if (roll < 0.45) {
    return maybeCompleteDoing(prevTasks, prevActivity);
  }
  if (roll < 0.7) {
    return maybeProposeNew(prevTasks, prevActivity);
  }
  return { tasks: prevTasks, activity: prevActivity };
}

function maybeCompleteDoing(prevTasks: Task[], prevActivity: ActivityItem[]): SimulationResult {
  const doing = prevTasks.filter((t) => t.status === 'doing');
  if (doing.length === 0) return maybeProposeNew(prevTasks, prevActivity);

  const target = doing[Math.floor(Math.random() * doing.length)];
  const agent = AGENT_BY_ID[target.agent];
  const actor = agent?.name ?? 'Agent';

  let nextTasks = prevTasks.map((t) => (t.id === target.id ? { ...t, status: 'done' as const, evidence: undefined } : t));
  const doneActivity: ActivityItem = {
    kind: 'done',
    actor,
    text: `completed ${target.title}`,
    project: target.project,
    ago: 'now',
    isNew: true,
  };
  let newActivity = [doneActivity, ...prevActivity].slice(0, MAX_ACTIVITY);

  // If this agent has a todo on the same project, promote it to doing
  const promote = nextTasks.find(
    (t) => t.agent === target.agent && t.project === target.project && t.status === 'todo'
  );
  if (promote) {
    nextTasks = nextTasks.map((t) =>
      t.id === promote.id ? { ...t, status: 'doing' as const, evidence: 'Just started' } : t
    );
    const doingActivity: ActivityItem = {
      kind: 'doing',
      actor,
      text: `started ${promote.title}`,
      project: promote.project,
      ago: 'now',
      isNew: true,
    };
    newActivity = [doingActivity, ...newActivity].slice(0, MAX_ACTIVITY);
  }

  return { tasks: nextTasks, activity: newActivity };
}

function maybeProposeNew(prevTasks: Task[], prevActivity: ActivityItem[]): SimulationResult {
  const pick = PROPOSE_POOL[Math.floor(Math.random() * PROPOSE_POOL.length)];
  const id = `t_sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const task: Task = {
    id,
    project: pick.project,
    agent: pick.agent,
    title: pick.title,
    status: 'proposed',
    urgency: pick.urgency,
    proposed_by: 'agent',
    created: 'just now',
  };
  const agent = AGENT_BY_ID[pick.agent];
  const project = PROJECT_BY_ID[pick.project];
  const activity: ActivityItem = {
    kind: 'proposed',
    actor: agent?.name ?? 'Agent',
    text: `proposed ${pick.title} for ${project?.name ?? 'a project'}`,
    project: pick.project,
    ago: 'now',
    isNew: true,
  };
  return {
    tasks: [task, ...prevTasks],
    activity: [activity, ...prevActivity].slice(0, MAX_ACTIVITY),
  };
}
