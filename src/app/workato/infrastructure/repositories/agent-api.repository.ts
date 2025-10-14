import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AgentRepository } from '../../domain/repositories/agent.repository';
import { Agent } from '../../domain/models/agent.model';
import { WORKATO_API_URL } from '../http/workato-api.tokens';

@Injectable()
export class AgentApiRepository implements AgentRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(WORKATO_API_URL);

  getAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(`${this.apiUrl}/agents`);
  }

  getAgentById(id: number): Observable<Agent | undefined> {
    return this.http.get<Agent>(`${this.apiUrl}/agents/${id}`).pipe(
      catchError(() => of(undefined))
    );
  }
}
