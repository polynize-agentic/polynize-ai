import { useState } from 'react';
import type { Project, Task } from '@/lib/console/types';
import { AGENT_BY_ID } from '@/lib/console/seed';
import { AgentAvatar } from './Avatar';
import { PlusIcon } from './Icons';
import s from '../console.module.css';
import d from './dashboard.module.css';
import p from './projects.module.css';

type Filter = 'all' | 'active' | 'paused';

type Props = {
  projects: Project[];
  tasks: Task[];
  onOpenProject: (id: string) => void;
  onNewProject: () => void;
};

export function ProjectsList({ projects, tasks, onOpenProject, onNewProject }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const filtered = projects.filter((proj) => filter === 'all' || proj.status === filter);

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Projects</h1>
          <p className={s.pageSub}>{filtered.length} {filter === 'all' ? 'total' : filter}</p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={onNewProject}>
          <PlusIcon width={16} height={16} />
          New Project
        </button>
      </div>

      <div className={p.filterRow}>
        {(['all', 'active', 'paused'] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            className={`${p.filterChip} ${filter === f ? p.filterChipOn : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className={p.projectsGrid}>
        {filtered.map((proj) => (
          <ProjectCard key={proj.id} project={proj} tasks={tasks} onOpen={() => onOpenProject(proj.id)} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  tasks,
  onOpen,
}: {
  project: Project;
  tasks: Task[];
  onOpen: () => void;
}) {
  const lead = AGENT_BY_ID[project.leadAgent];
  const projectTasks = tasks.filter((t) => t.project === project.id);
  const proposed = projectTasks.filter((t) => t.status === 'proposed').length;
  const doing = projectTasks.filter((t) => t.status === 'doing').length;
  const done = projectTasks.filter((t) => t.status === 'done').length;
  const cardStyle = { ['--project-color' as string]: project.color } as React.CSSProperties;

  return (
    <button type="button" className={d.projectCard} onClick={onOpen} style={cardStyle}>
      <span className={d.projectRail} />
      <h3 className={d.projectName}>{project.name}</h3>
      <p className={d.projectPurpose}>{project.purpose}</p>
      <div className={d.projectMeta}>
        <div className={d.projectStats}>
          {proposed > 0 && (
            <span className={d.projectStat}>
              <span className={d.projectStatNum}>{proposed}</span> proposed
            </span>
          )}
          <span className={d.projectStat}>
            <span className={d.projectStatNum}>{doing}</span> doing
          </span>
          <span className={d.projectStat}>
            <span className={d.projectStatNum}>{done}</span> done
          </span>
        </div>
        {lead && <AgentAvatar agent={lead} size="sm" />}
      </div>
    </button>
  );
}
