import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CrewRepository } from '../../domain/repositories/crew.repository';
import { Crew } from '../../domain/models/crew.model';
import { WORKATO_API_URL } from '../http/workato-api.tokens';

@Injectable()
export class CrewApiRepository implements CrewRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(WORKATO_API_URL);

  getCrews(): Observable<Crew[]> {
    return this.http.get<Crew[]>(`${this.apiUrl}/crews-members`);
  }

  getCrewById(id: number): Observable<Crew | undefined> {
    return this.http.get<Crew>(`${this.apiUrl}/crews-members/${id}`).pipe(
      catchError(() => of(undefined))
    );
  }
}
