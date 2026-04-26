/**
 * Agent Team Console types. Authoritative contract for seed data + state.
 * See BUILD_PLAN §5.1.
 */

export type AgentId = string;
export type HumanId = string;
export type ProjectId = string;
export type TaskId = string;

export type AgentStatus = 'working' | 'idle';
export type AvatarColor = 'mint' | 'blue' | 'gold';

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  avatarColor: AvatarColor;
  initials: string;
  portrait: string;
  status: AgentStatus;
  tools: string[];
  completed: number;
}

export type HumanRole = 'admin' | 'member' | 'viewer';

export interface Human {
  id: HumanId;
  name: string;
  email: string;
  role: HumanRole;
  avatar: string;
  projects: ProjectId[];
}

export type AutonomyLevel = 0 | 1 | 2 | 3;

export interface ApexPlan {
  objective: string;
  strategy: string;
  constraints: string;
  priorities: string;
}

export type ProjectStatus = 'active' | 'paused' | 'done';

export interface Project {
  id: ProjectId;
  name: string;
  purpose: string;
  leadAgent: AgentId;
  autonomy: AutonomyLevel;
  status: ProjectStatus;
  priority: number;
  color: string;
  createdDaysAgo: number;
  plan: ApexPlan;
}

export type TaskStatus = 'proposed' | 'todo' | 'doing' | 'blocked' | 'done';
export type ProposedBy = 'agent' | 'human';

export interface Task {
  id: TaskId;
  project: ProjectId;
  agent: AgentId;
  title: string;
  status: TaskStatus;
  urgency: number;
  proposed_by: ProposedBy;
  created?: string;
  evidence?: string;
  blockedReason?: string;
}

export type AutonomyKey = 'human_loop' | 'approve_batch' | 'autonomous_reporting' | 'autonomous';

export interface AutonomyLevelMeta {
  key: AutonomyKey;
  name: string;
  short: string;
  description: string;
  useWhen: string;
}

export type ActivityKind = 'proposed' | 'doing' | 'done' | 'approved' | 'plan';

export interface ActivityItem {
  kind: ActivityKind;
  actor: string;
  text: string;
  project: ProjectId;
  ago: string;
  isNew?: boolean;
}

export type Tab = 'dashboard' | 'projects' | 'agents' | 'humans';

export interface Tweaks {
  theme: 'dark' | 'light';
  density: 'comfortable' | 'compact';
  autonomy: AutonomyLevel;
  layout: 'columns' | 'list';
  depth: 'flat' | 'tactile';
}

export interface PersistedState {
  tab: Tab;
  openProjectId: ProjectId | null;
  openAgentId: AgentId | null;
  projects: Project[];
  tasks: Task[];
  activity: ActivityItem[];
  tweaks: Tweaks;
}
