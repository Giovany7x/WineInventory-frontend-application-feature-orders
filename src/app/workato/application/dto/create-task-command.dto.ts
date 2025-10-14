export interface CreateTaskCommand {
  crewId: number;
  agentId: number;
  description: string;
  estimatedTokens: number;
}
