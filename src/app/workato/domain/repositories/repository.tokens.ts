import { InjectionToken } from '@angular/core';
import { AgentRepository } from './agent.repository';
import { CrewRepository } from './crew.repository';
import { TaskRepository } from './task.repository';

export const AGENT_REPOSITORY = new InjectionToken<AgentRepository>('AGENT_REPOSITORY');
export const CREW_REPOSITORY = new InjectionToken<CrewRepository>('CREW_REPOSITORY');
export const TASK_REPOSITORY = new InjectionToken<TaskRepository>('TASK_REPOSITORY');
