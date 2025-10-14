import { Observable } from 'rxjs';
import { Crew } from '../models/crew.model';

export interface CrewRepository {
  getCrews(): Observable<Crew[]>;
  getCrewById(id: number): Observable<Crew | undefined>;
}
