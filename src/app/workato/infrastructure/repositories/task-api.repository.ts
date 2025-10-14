import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { Task } from '../../domain/models/task.model';
import { WORKATO_API_URL } from '../http/workato-api.tokens';

@Injectable()
export class TaskApiRepository implements TaskRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(WORKATO_API_URL);

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`);
  }

  createTask(task: Omit<Task, 'id'>): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, task);
  }
}
