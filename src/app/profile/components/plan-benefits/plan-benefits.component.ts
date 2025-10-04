import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-plan-benefits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan-benefits.component.html',
  styleUrl: './plan-benefits.component.css',
  host: {
    class: 'card benefits-card'
  }
})
export class PlanBenefitsComponent {
  @Input() benefits: string[] = [];
}
