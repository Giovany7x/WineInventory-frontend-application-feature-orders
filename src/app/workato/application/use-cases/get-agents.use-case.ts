import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Agent } from '../../domain/models/agent.model';
import { AGENT_REPOSITORY } from '../../domain/repositories/repository.tokens';

@Injectable({ providedIn: 'root' })
export class GetAgentsUseCase {
  private readonly agentRepository = inject(AGENT_REPOSITORY);

  execute(): Observable<Agent[]> {
    return this.agentRepository.getAgents();
  }
}
