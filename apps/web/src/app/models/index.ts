export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'admin' | 'member' | 'viewer';
  user: User;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  owner?: User;
  members?: TeamMember[];
  memberCount?: number;
  objectiveCount?: number;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export type CycleStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface Cycle {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: CycleStatus;
  teamId?: string;
  team?: Team;
  objectiveCount?: number;
  progress?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ObjectiveType = 'company' | 'team' | 'individual';
export type ObjectiveStatus = 'on_track' | 'at_risk' | 'behind' | 'completed' | 'not_started';

export interface Objective {
  id: string;
  title: string;
  description?: string;
  type: ObjectiveType;
  status: ObjectiveStatus;
  progress: number;
  confidence: number;
  teamId?: string;
  team?: Team;
  ownerId: string;
  owner?: User;
  cycleId: string;
  cycle?: Cycle;
  parentObjectiveId?: string;
  keyResults?: KeyResult[];
  tags?: string[];
  startDate?: string;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type KeyResultStatus = 'on_track' | 'at_risk' | 'behind' | 'completed' | 'not_started';

export interface KeyResult {
  id: string;
  title: string;
  description?: string;
  objectiveId: string;
  objective?: Objective;
  status: KeyResultStatus;
  confidence: number;
  progress: number;
  startValue: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  weight: number;
  ownerId: string;
  owner?: User;
  checkIns?: CheckIn[];
  initiatives?: Initiative[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  keyResultId: string;
  keyResult?: KeyResult;
  userId: string;
  user?: User;
  value: number;
  confidence: number;
  note: string;
  status: KeyResultStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Initiative {
  id: string;
  title: string;
  description?: string;
  keyResultId: string;
  keyResult?: KeyResult;
  ownerId: string;
  owner?: User;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  overallProgress: number;
  kpiCards: KpiCardData[];
  objectives: Objective[];
  recentActivity: ActivityItem[];
  teamProgress: TeamProgress[];
}

export interface KpiCardData {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue?: number;
  icon?: string;
}

export interface ActivityItem {
  id: string;
  type: 'check_in' | 'objective_created' | 'kr_updated' | 'team_joined' | 'cycle_started';
  message: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
}

export interface TeamProgress {
  teamId: string;
  teamName: string;
  progress: number;
  objectiveCount: number;
  completedCount: number;
}
