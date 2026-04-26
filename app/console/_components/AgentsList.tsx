import type { Agent, Task } from '@/lib/console/types';
import { AgentAvatar } from './Avatar';
import s from '../console.module.css';
import a from './agents.module.css';

type Props = {
  agents: Agent[];
  tasks: Task[];
  onOpen: (id: string) => void;
};

export function AgentsList({ agents, tasks, onOpen }: Props) {
  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Agents</h1>
          <p className={s.pageSub}>{agents.length} on team</p>
        </div>
      </div>

      <div className={a.agentsGrid}>
        {agents.map((ag) => {
          const inFlight = tasks.filter(
            (t) => t.agent === ag.id && (t.status === 'doing' || t.status === 'todo')
          ).length;
          return (
            <button
              key={ag.id}
              type="button"
              className={a.agentCard}
              onClick={() => onOpen(ag.id)}
            >
              <div className={a.agentCardHead}>
                <AgentAvatar agent={ag} size="xl" />
                <div style={{ flex: 1 }}>
                  <h3 className={a.agentName}>{ag.name}</h3>
                  <div className={a.agentRole}>{ag.role}</div>
                </div>
              </div>
              <p className={a.agentDesc}>{ag.description}</p>
              <div className={a.agentStatusRow}>
                <span
                  className={`${a.agentStatPill} ${
                    ag.status === 'working' ? a.agentStatPillWorking : ''
                  }`}
                >
                  {ag.status === 'working' ? '● working' : '○ idle'}
                </span>
                <div className={a.agentMetrics}>
                  <span>
                    <span className={a.agentMetricNum}>{inFlight}</span> in flight
                  </span>
                  <span>
                    <span className={a.agentMetricNum}>{ag.completed}</span> done
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
