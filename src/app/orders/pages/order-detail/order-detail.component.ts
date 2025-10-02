import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { OrdersService } from '../../services/orders.service';
import { Order, OrderStatus } from '../../models/order.entity';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, CurrencyPipe],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ordersService = inject(OrdersService);

  readonly order$: Observable<Order | null> = this.route.paramMap.pipe(
    switchMap(params => {
      const orderId = params.get('orderId') ?? params.get('id');
      if (!orderId) {
        return of(null);
      }
      return this.ordersService.getOrderById(orderId).pipe(map(order => order ?? null));
    })
  );

  readonly statusLabels: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    processing: 'En preparación',
    completed: 'Completado',
    cancelled: 'Cancelado'
  };

  readonly statusOptions: OrderStatus[] = ['pending', 'processing', 'completed', 'cancelled'];

  updateStatus(order: Order, status: string): void {
    if (this.statusOptions.includes(status as OrderStatus)) {
      this.ordersService.updateOrderStatus(order.id, status as OrderStatus).subscribe({
        error: error => console.error('No se pudo actualizar el estado de la orden.', error)
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard', 'sales']);
  }
}
