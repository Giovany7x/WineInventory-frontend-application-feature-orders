import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { AGENT_REPOSITORY, CREW_REPOSITORY, TASK_REPOSITORY } from './domain/repositories/repository.tokens';
import { AgentApiRepository } from './infrastructure/repositories/agent-api.repository';
import { CrewApiRepository } from './infrastructure/repositories/crew-api.repository';
import { TaskApiRepository } from './infrastructure/repositories/task-api.repository';

export const provideWorkatoRepositories = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: AGENT_REPOSITORY, useClass: AgentApiRepository },
    { provide: CREW_REPOSITORY, useClass: CrewApiRepository },
    { provide: TASK_REPOSITORY, useClass: TaskApiRepository }
  ]);
