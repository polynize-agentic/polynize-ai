import type { ActivityItem, Agent, ActivityKind, Project, Task } from '@/lib/console/types';
import { AGENT_BY_ID, PROJECT_BY_ID } from '@/lib/console/seed';
import { AgentAvatar, HumanAvatar } from './Avatar';
import { HUMAN_BY_ID } from '@/lib/console/seed';
import { PlusIcon } from './Icons';
import { AjTeamDiagram } from '@/app/_components/AjTeamDiagram';
import s from '../console.module.css';
import d from './dashboard.module.css';

type Props = {
  projects: Project[];
  tasks: Task[];
  activity: ActivityItem[];
  agents: Agent[];
  onOpenProject: (id: string) => void;
  onOpenAgent: (id: string) => void;
  onNewProject: () => void;
};

export function Dashboard({
  projects,
  tasks,
  activity,
  agents,
  onOpenProject,
  onOpenAgent,
  onNewProject,
}: Props) {
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const agentsWorking = agents.filter((a) => a.status === 'working').length;
  const pendingApprovals = tasks.filter((t) => t.status === 'proposed').length;
  const hoursSaved = 12;

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Dashboard</h1>
          <p className={s.pageSub}>
            {pendingApprovals} proposed · {tasks.filter((t) => t.status === 'doing').length} in flight · {activity.length} recent events
          </p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={onNewProject}>
          <PlusIcon width={16} height={16} />
          New Project
        </button>
      </div>

      {/* Hero (your team) + side stats */}
      <div className={d.grid12}>
        <div className={`${d.heroStat} ${d.heroStatTeam}`}>
          <AjTeamDiagram caption="Your team" />
        </div>
        <div className={d.sideStats}>
          <Stat eyebrow="Active" number={activeProjects} label="projects" />
          <Stat eyebrow="Working" number={agentsWorking} label="agents in flight" />
          <Stat eyebrow="Pending" number={pendingApprovals} label="awaiting your approval" />
          <Stat eyebrow="Saved" number={hoursSaved} label="hours this week" />
        </div>
      </div>

      {/* Project strip */}
      <section className={d.section}>
        <div className={d.sectionHead}>
          <h2 className={d.sectionTitle}>Your projects</h2>
          <div className={d.sectionEyebrow}>{projects.length} active</div>
        </div>
        <div className={d.projectGrid}>
          {projects.map((p) => (
            <ProjectStripCard key={p.id} project={p} tasks={tasks} onOpen={() => onOpenProject(p.id)} />
          ))}
        </div>
      </section>

      {/* Activity feed + agents */}
      <div className={d.feedAndAgents}>
        <div className={d.feedCard}>
          <div className={d.sectionHead} style={{ marginBottom: 4 }}>
            <h2 className={d.sectionTitle}>Live activity</h2>
            <div className={d.sectionEyebrow}>last {activity.length}</div>
          </div>
          <div className={d.feed}>
            {activity.map((a, i) => (
              <ActivityRow key={`${a.actor}-${a.text}-${i}`} item={a} />
            ))}
          </div>
        </div>
        <div className={d.agentsStripCard}>
          <div className={d.sectionHead} style={{ marginBottom: 4 }}>
            <h2 className={d.sectionTitle}>Your agents</h2>
            <div className={d.sectionEyebrow}>{agents.length} on team</div>
          </div>
          <div className={d.agentsStrip}>
            {agents.map((a) => (
              <button
                key={a.id}
                type="button"
                className={d.agentRow}
                onClick={() => onOpenAgent(a.id)}
              >
                <AgentAvatar agent={a} size="md" />
                <div>
                  <div className={d.agentRowName}>{a.name}</div>
                  <div className={d.agentRowRole}>{a.role}</div>
                </div>
                <div
                  className={`${d.agentRowStatus} ${
                    a.status === 'working' ? d.agentRowStatusWorking : d.agentRowStatusIdle
                  }`}
                >
                  {a.status === 'working' ? '● working' : '○ idle'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  eyebrow,
  number,
  label,
}: {
  eyebrow: string;
  number: number | string;
  label: string;
}) {
  return (
    <div className={d.statCard}>
      <div className={d.statEyebrow}>{eyebrow}</div>
      <div className={d.statNumber}>{number}</div>
      <div className={d.statLabel}>{label}</div>
    </div>
  );
}

function ProjectStripCard({
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

function ActivityRow({ item }: { item: ActivityItem }) {
  const project = PROJECT_BY_ID[item.project];
  const isHuman = item.actor.includes(' ');
  const human = isHuman ? Object.values(HUMAN_BY_ID).find((h) => h.name === item.actor) : null;
  const agent = !isHuman ? Object.values(AGENT_BY_ID).find((a) => a.name === item.actor) : null;

  return (
    <div className={`${d.feedItem} ${item.isNew ? d.feedItemNew : ''}`}>
      <span className={`${d.feedKindDot} ${kindClass(item.kind)}`} />
      <div className={d.feedText}>
        {agent ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
            <AgentAvatar agent={agent} size="sm" />
          </span>
        ) : human ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
            <HumanAvatar human={human} size="sm" />
          </span>
        ) : null}
        <span className={d.feedActor}>{item.actor}</span>
        {item.text}
        {project && (
          <span style={{ color: project.color, marginLeft: 6, fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 11 }}>
            ●
          </span>
        )}
      </div>
      <span className={d.feedAgo}>{item.ago}</span>
    </div>
  );
}

function kindClass(k: ActivityKind): string {
  switch (k) {
    case 'proposed': return d.feedKindProposed;
    case 'doing': return d.feedKindDoing;
    case 'done': return d.feedKindDone;
    case 'approved': return d.feedKindApproved;
    case 'plan': return d.feedKindPlan;
  }
}
