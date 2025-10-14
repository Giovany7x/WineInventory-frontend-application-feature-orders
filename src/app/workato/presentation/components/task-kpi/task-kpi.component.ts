import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AgentModel } from '../../../domain/models/agent.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-workato-task-kpi',
  standalone: true,
  imports: [MatCardModule, TranslateModule],
  templateUrl: './task-kpi.component.html',
  styleUrl: './task-kpi.component.css'
})
export class TaskKpiComponent {
  @Input({ required: true }) model!: AgentModel;
  @Input({ required: true }) completionRate!: string;
  @Input({ required: true }) tokenEfficiency!: string;
  @Input({ required: true }) openBacklog!: number;
}
