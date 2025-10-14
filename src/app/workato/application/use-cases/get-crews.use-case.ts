import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Crew } from '../../domain/models/crew.model';
import { CREW_REPOSITORY } from '../../domain/repositories/repository.tokens';

@Injectable({ providedIn: 'root' })
export class GetCrewsUseCase {
  private readonly crewRepository = inject(CREW_REPOSITORY);

  execute(): Observable<Crew[]> {
    return this.crewRepository.getCrews();
  }
}
