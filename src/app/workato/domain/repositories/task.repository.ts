import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

export interface TaskRepository {
  getTasks(): Observable<Task[]>;
  createTask(task: Omit<Task, 'id'>): Observable<Task>;
}
