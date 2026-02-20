export interface HistoryEntry {
  display: string;
  pastedContents: Record<string, unknown>;
  timestamp: number;
  project?: string;
  sessionId?: string;
}

export interface PlanEntry {
  filename: string;
  content: string;
  mtime: number;
}

export interface TodoItem {
  content: string;
  status: string;
  priority: string;
  id: string;
}

export interface TodoFile {
  filename: string;
  items: TodoItem[];
}

export interface TaskItem {
  id: string;
  subject: string;
  description: string;
  activeForm?: string;
  owner?: string;
  status: string;
  blocks: string[];
  blockedBy: string[];
  metadata: Record<string, unknown>;
}

export interface TeamMember {
  agentId: string;
  name: string;
  agentType: string;
  model?: string;
  joinedAt: number;
  cwd?: string;
  prompt?: string;
  color?: string;
  backendType?: string;
}

export interface TeamConfig {
  name: string;
  description: string;
  createdAt: number;
  leadAgentId: string;
  leadSessionId: string;
  members: TeamMember[];
}

export interface DailyActivity {
  date: string;
  messageCount: number;
  sessionCount: number;
  toolCallCount: number;
}

export interface DailyModelTokens {
  date: string;
  tokensByModel: Record<string, number>;
}

export interface ModelUsageEntry {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
  webSearchRequests: number;
  costUSD: number;
}

export interface StatsCache {
  version: number;
  lastComputedDate: string;
  dailyActivity: DailyActivity[];
  dailyModelTokens: DailyModelTokens[];
  modelUsage: Record<string, ModelUsageEntry>;
  totalSessions: number;
  totalMessages: number;
  longestSession?: {
    sessionId: string;
    duration: number;
    messageCount: number;
    timestamp: string;
  };
  firstSessionDate: string;
  hourCounts: Record<string, number>;
}

export interface SessionEntry {
  sessionId: string;
  fullPath: string;
  fileMtime: number;
  firstPrompt: string;
  summary: string;
  messageCount: number;
  created: string;
  modified: string;
  gitBranch?: string;
  projectPath: string;
  isSidechain: boolean;
}

export interface SessionsIndex {
  version: number;
  entries: SessionEntry[];
  originalPath: string;
}

export interface Settings {
  env?: Record<string, string>;
  includeCoAuthoredBy?: boolean;
  enabledPlugins?: Record<string, boolean>;
  teammateMode?: string;
  [key: string]: unknown;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchMatch {
  source: string;
  item: unknown;
  matchContext?: string;
}
