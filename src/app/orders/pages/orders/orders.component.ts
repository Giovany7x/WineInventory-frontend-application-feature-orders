import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { map } from 'rxjs/operators';

import { OrdersService } from '../../services/orders.service';
import { OrderStatus } from '../../models/order.entity';
import { OrderListComponent } from '../../components/order-list/order-list.component';

interface OrdersSummary {
  totalOrders: number;
  totalRevenue: number;
  byStatus: Record<OrderStatus, number>;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, OrderListComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {
  private readonly ordersService = inject(OrdersService);

  readonly summary$ = this.ordersService.getOrders().pipe(
    map(orders => {
      const byStatus = orders.reduce<OrdersSummary['byStatus']>((acc, order) => {
        acc[order.status] = (acc[order.status] ?? 0) + 1;
        return acc;
      }, { pending: 0, processing: 0, completed: 0, cancelled: 0 });

      const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

      return {
        totalOrders: orders.length,
        totalRevenue,
        byStatus
      } satisfies OrdersSummary;
    })
  );

  readonly statusLabels: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    processing: 'En preparación',
    completed: 'Completado',
    cancelled: 'Cancelado'
  };

  readonly summaryStatuses: OrderStatus[] = ['pending', 'processing', 'completed', 'cancelled'];
}
