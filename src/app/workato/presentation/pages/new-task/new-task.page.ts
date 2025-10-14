import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { GetCrewsUseCase } from '../../../application/use-cases/get-crews.use-case';
import { GetAgentsUseCase } from '../../../application/use-cases/get-agents.use-case';
import { CreateTaskUseCase } from '../../../application/use-cases/create-task.use-case';
import { Crew } from '../../../domain/models/crew.model';
import { Agent } from '../../../domain/models/agent.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-workato-new-task-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    NgForOf,
    NgIf,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './new-task.page.html',
  styleUrl: './new-task.page.css'
})
export class NewTaskPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly getCrewsUseCase = inject(GetCrewsUseCase);
  private readonly getAgentsUseCase = inject(GetAgentsUseCase);
  private readonly createTaskUseCase = inject(CreateTaskUseCase);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly crews$: Observable<Crew[]> = this.getCrewsUseCase.execute();
  readonly agents$: Observable<Agent[]> = this.getAgentsUseCase.execute();

  readonly isSubmitting = signal(false);

  readonly form = this.fb.group({
    crewId: this.fb.control<number | null>(null, Validators.required),
    agentId: this.fb.control<number | null>(null, Validators.required),
    description: this.fb.control('', [Validators.required, Validators.maxLength(500)]),
    estimatedTokens: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)])
  });

  onSubmit() {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const { crewId, agentId, description, estimatedTokens } = this.form.getRawValue();
    const trimmedDescription = description?.trim();
    if (crewId === null || agentId === null || estimatedTokens === null || !trimmedDescription) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.createTaskUseCase.execute({
      crewId,
      agentId,
      description: trimmedDescription,
      estimatedTokens
    }).pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: () => {
        this.snackBar.open(this.translate.instant('workato.newTask.success'), undefined, { duration: 3000 });
        this.navigateToHome();
      },
      error: (error: Error) => {
        const key = this.mapErrorToTranslationKey(error.message);
        this.snackBar.open(this.translate.instant(key), undefined, { duration: 4000 });
      }
    });
  }

  onCancel() {
    this.navigateToHome();
  }

  private navigateToHome() {
    this.router.navigate(['/home']);
  }

  private mapErrorToTranslationKey(message: string): string {
    switch (message) {
      case 'Crew is not active':
        return 'workato.newTask.errors.crewNotActive';
      case 'Estimated tokens exceed agent limit':
        return 'workato.newTask.errors.tokensExceeded';
      case 'Agent already has a task registered for today':
        return 'workato.newTask.errors.agentLimit';
      case 'Agent not found':
      case 'Crew not found':
        return 'workato.newTask.errors.generic';
      default:
        return 'workato.newTask.errors.generic';
    }
  }
}
