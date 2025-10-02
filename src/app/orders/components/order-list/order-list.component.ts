import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { OrdersService } from '../../services/orders.service';
import { Order, OrderStatus } from '../../models/order.entity';

interface StatusFilter {
  value: OrderStatus | 'all';
  label: string;
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, CurrencyPipe],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent {
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);

  private readonly statusFilterSubject = new BehaviorSubject<OrderStatus | 'all'>('all');

  readonly statusFilter$ = this.statusFilterSubject.asObservable();
  readonly orders$ = this.ordersService.getOrders();

  readonly filteredOrders$ = combineLatest([this.orders$, this.statusFilter$]).pipe(
    map(([orders, filter]) => {
      if (filter === 'all') {
        return orders;
      }

      return orders.filter(order => order.status === filter);
    })
  );

  readonly statusFilters: StatusFilter[] = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'processing', label: 'En preparación' },
    { value: 'completed', label: 'Completados' },
    { value: 'cancelled', label: 'Cancelados' }
  ];

  readonly statusBadges: Record<OrderStatus, string> = {
    pending: 'badge--pending',
    processing: 'badge--processing',
    completed: 'badge--completed',
    cancelled: 'badge--cancelled'
  };

  readonly filterLabels: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    processing: 'En preparación',
    completed: 'Completado',
    cancelled: 'Cancelado'
  };

  setFilter(filter: StatusFilter['value']): void {
    this.statusFilterSubject.next(filter);
  }

  trackByOrderId(_: number, order: Order): string {
    return order.id;
  }

  goToOrderDetail(order: Order): void {
    this.router.navigate(['/dashboard', 'sales', order.id]);
  }
}
