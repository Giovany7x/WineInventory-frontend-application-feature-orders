export type TaskStatus = 'PENDING' | 'RUNNING' | 'FAILED' | 'COMPLETED';

export interface Task {
  id: number;
  crewId: number;
  agentId: number;
  description: string;
  estimatedTokens: number;
  actualTokensUsed: number | null;
  status: TaskStatus;
  registeredAt: string;
  finishedAt: string | null;
}
