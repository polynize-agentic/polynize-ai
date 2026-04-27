import type { Project, Task } from '@/lib/console/types';
import { AGENT_BY_ID, HUMAN_BY_ID } from '@/lib/console/seed';
import { AgentAvatar } from './Avatar';
import { AutonomyDial } from './AutonomyDial';
import p from './projects.module.css';

type Props = {
  project: Project;
  tasks: Task[];
  onAutonomyChange: (next: 0 | 1 | 2 | 3) => void;
};

export function SidePanel({ project, tasks, onAutonomyChange }: Props) {
  const lead = AGENT_BY_ID[project.leadAgent];
  const teamSize = Object.values(HUMAN_BY_ID).filter((h) => h.projects.includes(project.id)).length;

  return (
    <aside className={p.sidePanel}>
      <div className={p.sideBlock}>
        <div className={p.sideEyebrow}>Autonomy</div>
        <AutonomyDial value={project.autonomy} onChange={onAutonomyChange} />
      </div>

      {lead && (
        <div className={p.sideBlock}>
          <div className={p.sideEyebrow}>Lead agent</div>
          <div className={p.sideLeadRow}>
            <AgentAvatar agent={lead} size="lg" />
            <div>
              <div className={p.sideLeadName}>{lead.name}</div>
              <div className={p.sideLeadRole}>{lead.role}</div>
            </div>
          </div>
        </div>
      )}

      <div className={p.sideBlock}>
        <div className={p.sideEyebrow}>Team</div>
        <div className={p.sideMeta}>{teamSize} people on this project</div>
      </div>

      <div className={p.sideBlock}>
        <div className={p.sideEyebrow}>Priority</div>
        <div className={p.sidePips}>
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className={`${p.sidePip} ${i < project.priority ? p.sidePipOn : ''}`} />
          ))}
        </div>
        <div className={p.sideMeta}>{project.priority} of 10</div>
      </div>

      <div className={p.sideBlock}>
        <div className={p.sideEyebrow}>Created</div>
        <div className={p.sideMeta}>{project.createdDaysAgo} days ago</div>
      </div>

      <div className={p.sideBlock}>
        <div className={p.sideEyebrow}>Tasks</div>
        <div className={p.sideMeta}>
          {tasks.filter((t) => t.project === project.id).length} total
        </div>
      </div>
    </aside>
  );
}
