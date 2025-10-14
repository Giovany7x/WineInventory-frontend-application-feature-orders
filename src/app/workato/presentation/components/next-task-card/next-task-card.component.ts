import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DatePipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface NextTaskViewModel {
  title: string;
  description: string;
  crewName: string;
  agentName: string;
  estimatedTokens: number;
  registeredAt: string;
}

@Component({
  selector: 'app-workato-next-task-card',
  standalone: true,
  imports: [MatCardModule, NgIf, DatePipe, TranslateModule],
  templateUrl: './next-task-card.component.html',
  styleUrl: './next-task-card.component.css'
})
export class NextTaskCardComponent {
  @Input() task: NextTaskViewModel | null = null;
}
