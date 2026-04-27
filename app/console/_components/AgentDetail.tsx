'use client';

import { useEffect } from 'react';
import type { Agent, Task } from '@/lib/console/types';
import { PROJECT_BY_ID } from '@/lib/console/seed';
import { AgentAvatar } from './Avatar';
import { XIcon } from './Icons';
import a from './agents.module.css';

type Props = {
  agent: Agent;
  tasks: Task[];
  onClose: () => void;
  onOpenTask: (taskId: string, projectId: string) => void;
};

export function AgentDetail({ agent, tasks, onClose, onOpenTask }: Props) {
  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const owned = tasks.filter((t) => t.agent === agent.id);
  const proposed = owned.filter((t) => t.status === 'proposed');
  const todo = owned.filter((t) => t.status === 'todo');
  const doing = owned.filter((t) => t.status === 'doing');
  const blocked = owned.filter((t) => t.status === 'blocked');
  const done = owned.filter((t) => t.status === 'done');

  return (
    <>
      <div className={a.drawerBackdrop} onClick={onClose} />
      <aside className={a.drawer} role="dialog" aria-label={`${agent.name} detail`}>
        <header className={a.drawerHead}>
          <span className={a.drawerTitle}>§ agent / {agent.id}</span>
          <button type="button" className={a.drawerClose} onClick={onClose} aria-label="Close drawer">
            <XIcon width={14} height={14} />
          </button>
        </header>

        <div className={a.drawerBody}>
          <div className={a.drawerHero}>
            <AgentAvatar agent={agent} size="xxl" />
            <div>
              <h2 className={a.drawerName}>{agent.name}</h2>
              <div className={a.drawerRole}>{agent.role}</div>
            </div>
          </div>

          <p className={a.drawerDesc}>{agent.description}</p>

          <section className={a.drawerSection}>
            <div className={a.drawerEyebrow}>§ tools</div>
            <div className={a.toolChips}>
              {agent.tools.map((tool) => (
                <span key={tool} className={a.toolChip}>{tool}</span>
              ))}
            </div>
          </section>

          <section className={a.drawerSection}>
            <div className={a.drawerEyebrow}>§ tasks owned</div>
            {owned.length === 0 && (
              <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No tasks assigned.</div>
            )}
            <TaskGroup label="Doing" tasks={doing} onOpenTask={onOpenTask} />
            <TaskGroup label="Proposed" tasks={proposed} onOpenTask={onOpenTask} />
            <TaskGroup label="Todo" tasks={todo} onOpenTask={onOpenTask} />
            <TaskGroup label="Blocked" tasks={blocked} onOpenTask={onOpenTask} />
            <TaskGroup label="Done" tasks={done} onOpenTask={onOpenTask} />
          </section>

          <section className={a.drawerSection}>
            <div className={a.drawerEyebrow}>§ completed to date</div>
            <div className={a.completedMetric}>
              <span className={a.completedNum}>{agent.completed}</span>
              <span className={a.completedLabel}>tasks delivered</span>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

function TaskGroup({
  label,
  tasks,
  onOpenTask,
}: {
  label: string;
  tasks: Task[];
  onOpenTask: (taskId: string, projectId: string) => void;
}) {
  if (tasks.length === 0) return null;
  return (
    <div className={a.taskGroup}>
      <div className={a.taskGroupLabel}>{label} ({tasks.length})</div>
      {tasks.map((t) => {
        const project = PROJECT_BY_ID[t.project];
        return (
          <button
            key={t.id}
            type="button"
            className={a.taskGroupItem}
            onClick={() => onOpenTask(t.id, t.project)}
          >
            {t.title}
            <div className={a.taskGroupProject} style={{ color: project?.color }}>
              ● {project?.name ?? 'Unknown project'}
            </div>
          </button>
        );
      })}
    </div>
  );
}
