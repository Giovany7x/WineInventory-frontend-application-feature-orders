import { Observable } from 'rxjs';
import { Agent } from '../models/agent.model';

export interface AgentRepository {
  getAgents(): Observable<Agent[]>;
  getAgentById(id: number): Observable<Agent | undefined>;
}
