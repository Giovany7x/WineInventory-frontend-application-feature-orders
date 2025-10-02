import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';

import { CatalogService } from './catalog.service';
import { CatalogItem } from '../models/catalog-item.entity';
import { NewOrderInput, Order, OrderItem, OrderStatus } from '../models/order.entity';
import { environment } from '../../../environments/environment';

const TAX_RATE = 0.19;

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly catalogService = inject(CatalogService);
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
    const orderId = this.generateOrderId();
    const items = input.items.map((item, index) => this.createOrderItemFromCatalogId(orderId, index, item.catalogItemId, item.quantity));
    const totals = this.calculateTotals(items);
    const newOrder: Order = {
      id: orderId,
      code: this.generateOrderCode(),
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expectedDelivery: this.computeExpectedDeliveryDate(),
      notes: input.notes,
      items,
      ...totals
    };

    return this.http.post<Order>(this.ordersEndpoint, newOrder).pipe(
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

  private createOrderItem(orderId: string, index: number, catalogItem: CatalogItem, quantity: number): OrderItem {
    const safeQuantity = Math.max(1, quantity);
    const unitPrice = catalogItem.price;
    const lineTotal = unitPrice * safeQuantity;

    return {
      id: `${orderId}-item-${index + 1}`,
      catalogItem,
      quantity: safeQuantity,
      unitPrice,
      lineTotal
    };
  }

  private createOrderItemFromCatalogId(orderId: string, index: number, catalogItemId: string, quantity: number): OrderItem {
    const catalogItem = this.catalogService.findById(catalogItemId);
    if (!catalogItem) {
      throw new Error(`El artículo con id ${catalogItemId} no existe en el catálogo.`);
    }

    return this.createOrderItem(orderId, index, catalogItem, quantity);
  }

  private calculateTotals(items: OrderItem[]): Pick<Order, 'subtotal' | 'tax' | 'total'> {
    const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    return { subtotal, tax, total };
  }

  private generateOrderId(): string {
    return `ord-${Math.random().toString(36).slice(2, 8)}`;
  }

  private generateOrderCode(): string {
    const year = new Date().getFullYear();
    const sequential = (this.ordersSubject.getValue().length + 1).toString().padStart(3, '0');
    return `WI-${year}-${sequential}`;
  }

  private computeExpectedDeliveryDate(): string {
    return this.createFutureDate(4);
  }

  private createFutureDate(daysAhead: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString();
  }
}
