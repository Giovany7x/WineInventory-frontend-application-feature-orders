import { inject, Injectable } from '@angular/core';
import { forkJoin, throwError, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CreateTaskCommand } from '../dto/create-task-command.dto';
import { TASK_REPOSITORY, CREW_REPOSITORY, AGENT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { Task } from '../../domain/models/task.model';

@Injectable({ providedIn: 'root' })
export class CreateTaskUseCase {
  private readonly taskRepository = inject(TASK_REPOSITORY);
  private readonly crewRepository = inject(CREW_REPOSITORY);
  private readonly agentRepository = inject(AGENT_REPOSITORY);

  execute(command: CreateTaskCommand): Observable<Task> {
    const registeredAt = new Date().toISOString();

    return forkJoin({
      agent: this.agentRepository.getAgentById(command.agentId),
      crew: this.crewRepository.getCrewById(command.crewId),
      tasks: this.taskRepository.getTasks()
    }).pipe(
      switchMap(({ agent, crew, tasks }) => {
        if (!agent) {
          return throwError(() => new Error('Agent not found'));
        }
        if (!crew) {
          return throwError(() => new Error('Crew not found'));
        }
        if (crew.status !== 'ACTIVE') {
          return throwError(() => new Error('Crew is not active'));
        }
        if (command.estimatedTokens > agent.maxTokensPerTask) {
          return throwError(() => new Error('Estimated tokens exceed agent limit'));
        }

        const sameDayTaskExists = tasks.some(task => {
          if (task.agentId !== command.agentId) {
            return false;
          }
          const existingDate = new Date(task.registeredAt);
          const currentDate = new Date(registeredAt);
          return existingDate.getFullYear() === currentDate.getFullYear() &&
            existingDate.getMonth() === currentDate.getMonth() &&
            existingDate.getDate() === currentDate.getDate();
        });

        if (sameDayTaskExists) {
          return throwError(() => new Error('Agent already has a task registered for today'));
        }

        const taskPayload: Omit<Task, 'id'> = {
          agentId: command.agentId,
          crewId: command.crewId,
          description: command.description,
          estimatedTokens: command.estimatedTokens,
          actualTokensUsed: null,
          status: 'PENDING',
          registeredAt,
          finishedAt: null
        };

        return this.taskRepository.createTask(taskPayload);
      })
    );
  }
}
