import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { SubscriptionPlan } from '../../models/profile.entity';

@Component({
  selector: 'app-plan-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan-details.component.html',
  styleUrl: './plan-details.component.css',
  host: {
    class: 'card plans-card'
  }
})
export class PlanDetailsComponent {
  @Input() plans: SubscriptionPlan[] = [];
  @Input() selectedPlanId: string | null = null;
  @Input() disabled = false;
  @Output() planSelected = new EventEmitter<string>();

  onSelectPlan(planId: string): void {
    if (this.disabled || this.selectedPlanId === planId) {
      return;
    }

    this.planSelected.emit(planId);
  }
}
