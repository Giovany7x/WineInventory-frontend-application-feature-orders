import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';

import { NewOrderInput, Order, OrderStatus } from '../models/order.entity';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly ordersSubject = new BehaviorSubject<Order[]>([]);
  private readonly ordersEndpoint = `${environment.apiUrl}/orders`;

  constructor() {
    this.refreshOrders().subscribe();
  }

  getOrders(): Observable<Order[]> {
    return this.ordersSubject.asObservable();
  }

  getOrderById(orderId: string): Observable<Order | undefined> {
    return this.ordersSubject.pipe(map(orders => orders.find(order => order.id === orderId)));
  }

  refreshOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.ordersEndpoint).pipe(
      tap({
        next: orders => this.ordersSubject.next(orders),
        error: error => console.error('No se pudieron cargar las órdenes.', error)
      })
    );
  }

  createOrder(input: NewOrderInput): Observable<Order> {
    return this.http.post<Order>(this.ordersEndpoint, input).pipe(
      tap({
        next: order => this.ordersSubject.next([...this.ordersSubject.getValue(), order]),
        error: error => console.error('No se pudo crear la orden.', error)
      })
    );
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order | undefined> {
    const orders = this.ordersSubject.getValue();
    const index = orders.findIndex(order => order.id === orderId);
    if (index === -1) {
      return this.getOrderById(orderId);
    }

    const updatedOrder: Order = { ...orders[index], status };

    return this.http.patch<Order>(`${this.ordersEndpoint}/${orderId}`, { status }).pipe(
      tap({
        next: response => {
          const nextOrders = [...orders];
          nextOrders.splice(index, 1, { ...updatedOrder, ...response });
          this.ordersSubject.next(nextOrders);
        },
        error: error => console.error('No se pudo actualizar el estado de la orden.', error)
      }),
      map(response => ({ ...updatedOrder, ...response }))
    );
  }
}
