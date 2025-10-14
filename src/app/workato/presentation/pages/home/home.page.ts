import { Component, inject } from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest, map, Observable } from 'rxjs';
import { GetAgentsUseCase } from '../../../application/use-cases/get-agents.use-case';
import { GetTasksUseCase } from '../../../application/use-cases/get-tasks.use-case';
import { GetCrewsUseCase } from '../../../application/use-cases/get-crews.use-case';
import { Agent, AgentModel } from '../../../domain/models/agent.model';
import { Task } from '../../../domain/models/task.model';
import { Crew } from '../../../domain/models/crew.model';
import { TaskKpiComponent } from '../../components/task-kpi/task-kpi.component';
import { NextTaskCardComponent, NextTaskViewModel } from '../../components/next-task-card/next-task-card.component';

interface TaskKpiViewModel {
  model: AgentModel;
  completionRate: string;
  tokenEfficiency: string;
  openBacklog: number;
}

interface HomeViewModel {
  analytics: TaskKpiViewModel[];
  nextTask: NextTaskViewModel | null;
}

@Component({
  selector: 'app-workato-home-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    MatGridListModule,
    TranslateModule,
    TaskKpiComponent,
    NextTaskCardComponent
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css'
})
export class HomePageComponent {
  private readonly getAgentsUseCase = inject(GetAgentsUseCase);
  private readonly getTasksUseCase = inject(GetTasksUseCase);
  private readonly getCrewsUseCase = inject(GetCrewsUseCase);

  readonly viewModel$: Observable<HomeViewModel> = combineLatest([
    this.getAgentsUseCase.execute(),
    this.getTasksUseCase.execute(),
    this.getCrewsUseCase.execute()
  ]).pipe(
    map(([agents, tasks, crews]) => this.mapToViewModel(agents, tasks, crews))
  );

  private mapToViewModel(agents: Agent[], tasks: Task[], crews: Crew[]): HomeViewModel {
    const models: AgentModel[] = ['GPT-5', 'CLAUDE-4.5', 'LLAMA-4', 'GEMINI-2.5'];
    const agentById = new Map(agents.map(agent => [agent.id, agent] as const));
    const crewById = new Map(crews.map(crew => [crew.id, crew] as const));

    const analytics: TaskKpiViewModel[] = models.map(model => {
      const tasksForModel = tasks.filter(task => agentById.get(task.agentId)?.modelUsed === model);
      const completedTasks = tasksForModel.filter(task => task.status === 'COMPLETED');
      const failedTasks = tasksForModel.filter(task => task.status === 'FAILED');
      const backlogTasks = tasksForModel.filter(task => task.status === 'PENDING');
      const closedTotal = completedTasks.length + failedTasks.length;
      const completionRate = closedTotal === 0 ? '0.00%' : `${((completedTasks.length / closedTotal) * 100).toFixed(2)}%`;

      const efficiencyValues = completedTasks
        .map(task => task.estimatedTokens > 0 && task.actualTokensUsed !== null
          ? (task.actualTokensUsed ?? 0) / task.estimatedTokens
          : null)
        .filter((value): value is number => value !== null && isFinite(value));

      const tokenEfficiency = efficiencyValues.length === 0
        ? 'N/A'
        : `${(efficiencyValues.reduce((acc, value) => acc + value, 0) / efficiencyValues.length).toFixed(2)}`;

      return {
        model,
        completionRate,
        tokenEfficiency,
        openBacklog: backlogTasks.length
      };
    });

    const nextTask = this.computeNextTask(tasks, agentById, crewById);

    return {
      analytics,
      nextTask
    };
  }

  private computeNextTask(
    tasks: Task[],
    agentById: Map<number, Agent>,
    crewById: Map<number, Crew>
  ): NextTaskViewModel | null {
    const pending = tasks
      .filter(task => task.status === 'PENDING')
      .map(task => ({
        task,
        agent: agentById.get(task.agentId),
        crew: crewById.get(task.crewId)
      }))
      .filter(item => item.agent && item.crew)
      .filter(item => item.task.estimatedTokens <= (item.agent?.maxTokensPerTask ?? 0))
      .sort((a, b) => new Date(a.task.registeredAt).getTime() - new Date(b.task.registeredAt).getTime());

    const next = pending[0];
    if (!next) {
      return null;
    }

    return {
      title: `${next.agent!.name} • ${next.crew!.name}`,
      description: next.task.description,
      crewName: next.crew!.name,
      agentName: next.agent!.name,
      estimatedTokens: next.task.estimatedTokens,
      registeredAt: next.task.registeredAt
    };
  }
}
