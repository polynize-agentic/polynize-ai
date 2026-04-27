import type { Project, Task, TaskStatus, AutonomyLevel, ApexPlan as ApexPlanT } from '@/lib/console/types';
import { ApexPlan } from './ApexPlan';
import { TaskBoard } from './TaskBoard';
import { SidePanel } from './SidePanel';
import { ArrowLeftIcon, PlusIcon } from './Icons';
import s from '../console.module.css';
import p from './projects.module.css';

type Props = {
  project: Project;
  tasks: Task[];
  onBack: () => void;
  onUpdatePlan: (plan: ApexPlanT) => void;
  onUpdateAutonomy: (next: AutonomyLevel) => void;
  onTaskAction: (taskId: string, action: 'approve' | 'reject' | 'move', arg?: TaskStatus) => void;
  onApproveAll: () => void;
};

export function ProjectDetail({
  project,
  tasks,
  onBack,
  onUpdatePlan,
  onUpdateAutonomy,
  onTaskAction,
  onApproveAll,
}: Props) {
  const projectTasks = tasks.filter((t) => t.project === project.id);
  const proposed = projectTasks.filter((t) => t.status === 'proposed').length;
  const headStyle = { ['--project-color' as string]: project.color } as React.CSSProperties;

  return (
    <div>
      <button type="button" className={p.breadcrumb} onClick={onBack}>
        <ArrowLeftIcon width={12} height={12} />
        Projects / {project.name}
      </button>

      <div className={p.detailHead} style={headStyle}>
        <div>
          <div className={p.detailTitleRow}>
            <span className={p.detailDot} />
            <h1 className={p.detailTitle}>{project.name}</h1>
          </div>
          <p className={p.detailPurpose}>{project.purpose}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={p.statusPill}>{project.status}</span>
          <button type="button" className={s.btn}>
            <PlusIcon width={14} height={14} /> Add task
          </button>
        </div>
      </div>

      <div className={p.detailLayout}>
        <div>
          <ApexPlan plan={project.plan} onChange={onUpdatePlan} />

          {proposed > 0 && (
            <div className={p.proposalBanner}>
              <div className={p.proposalBannerText}>
                <strong>{proposed}</strong>{' '}
                {proposed === 1 ? 'task is' : 'tasks are'} awaiting your review
              </div>
              <button type="button" className={s.btnPrimary} onClick={onApproveAll}>
                Approve all
              </button>
            </div>
          )}

          <div className={p.taskBoardHead}>
            <h2 style={{ font: 'inherit', fontFamily: 'var(--font-space-grotesk)', fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: '-0.3px' }}>
              Task board
            </h2>
            <span className={p.taskBoardEyebrow}>{projectTasks.length} total</span>
          </div>
          <TaskBoard tasks={projectTasks} onAction={onTaskAction} />
        </div>

        <SidePanel project={project} tasks={tasks} onAutonomyChange={onUpdateAutonomy} />
      </div>
    </div>
  );
}
