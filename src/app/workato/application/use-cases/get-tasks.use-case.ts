import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../../domain/models/task.model';
import { TASK_REPOSITORY } from '../../domain/repositories/repository.tokens';

@Injectable({ providedIn: 'root' })
export class GetTasksUseCase {
  private readonly taskRepository = inject(TASK_REPOSITORY);

  execute(): Observable<Task[]> {
    return this.taskRepository.getTasks();
  }
}
