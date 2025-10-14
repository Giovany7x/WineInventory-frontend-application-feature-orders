export type CrewStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED';

export interface Crew {
  id: number;
  name: string;
  objective: string;
  leadAgentId: number;
  status: CrewStatus;
  startedAt: string;
  finishedAt: string | null;
}
