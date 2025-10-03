import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';

import { NewOrderInput, Order, OrderStatus } from '../models/order.entity';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly ordersSubject = new BehaviorSubject<Order[]>([]);
  private readonly ordersEndpoint = `${environment.apiUrl}/orders`;
  private readonly pendingOrderLoads = new Set<string>();

  constructor() {
    this.refreshOrders().subscribe();
  }

  getOrders(): Observable<Order[]> {
    return this.ordersSubject.asObservable();
  }

  getOrderById(orderId: string): Observable<Order | undefined> {
    return this.ordersSubject.pipe(
      tap(orders => this.ensureOrderLoaded(orderId, orders)),
      map(orders => orders.find(order => order.id === orderId)),
      distinctUntilChanged()
    );
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
        next: order => {
          this.upsertOrderInCache(order);
          this.requestOrderFromServer(order.id);
        },
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

  private ensureOrderLoaded(orderId: string, orders: Order[]): void {
    const existingOrder = orders.find(order => order.id === orderId);
    if (this.isOrderComplete(existingOrder)) {
      return;
    }

    this.requestOrderFromServer(orderId);
  }

  private requestOrderFromServer(orderId: string): void {
    if (this.pendingOrderLoads.has(orderId)) {
      return;
    }

    this.pendingOrderLoads.add(orderId);

    this.http.get<Order>(`${this.ordersEndpoint}/${orderId}`).subscribe({
      next: order => {
        this.pendingOrderLoads.delete(orderId);
        if (order) {
          this.upsertOrderInCache(order);
        }
      },
      error: error => {
        console.error('No se pudo cargar la orden solicitada.', error);
        this.pendingOrderLoads.delete(orderId);
      }
    });
  }

  private upsertOrderInCache(order: Order): void {
    const orders = this.ordersSubject.getValue();
    const index = orders.findIndex(existing => existing.id === order.id);

    if (index === -1) {
      this.ordersSubject.next([...orders, order]);
      return;
    }

    const nextOrders = [...orders];
    nextOrders.splice(index, 1, { ...orders[index], ...order });
    this.ordersSubject.next(nextOrders);
  }

  private isOrderComplete(order: Order | undefined): order is Order {
    if (!order) {
      return false;
    }

    const hasItems = Array.isArray(order.items) && order.items.length > 0;
    const hasTotals = typeof order.subtotal === 'number' && typeof order.total === 'number';
    const hasCreatedAt = typeof order.createdAt === 'string' && order.createdAt.length > 0;

    return hasItems && hasTotals && hasCreatedAt;
  }
}
