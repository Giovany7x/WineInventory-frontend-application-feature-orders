export type AgentRole = 'PLANNER' | 'ANALYST' | 'RESEARCHER' | 'CODER';
export type AgentModel = 'GPT-5' | 'CLAUDE-4.5' | 'LLAMA-4' | 'GEMINI-2.5';
export type AgentStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export interface Agent {
  id: number;
  name: string;
  role: AgentRole;
  modelUsed: AgentModel;
  maxTokensPerTask: number;
  status: AgentStatus;
}
