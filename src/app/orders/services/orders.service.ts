import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';

import { NewOrderInput, Order, OrderStatus } from '../models/order.entity';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly ordersSubject = new BehaviorSubject<Order[]>([]);
  private readonly ordersEndpoint = `${environment.apiUrl}/orders`;
  private readonly pendingOrderLoads = new Set<string>();

  private static readonly TAX_RATE = 0.19;
  private static readonly DEFAULT_DELIVERY_OFFSET_DAYS = 4;

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
    let payload: Order;

    try {
      payload = this.buildOrderPayload(input, this.catalogService.getCatalogSnapshot());
    } catch (error) {
      console.error('No se pudo preparar la orden para guardarla.', error);
      return throwError(() => (error instanceof Error ? error : new Error('No se pudo preparar la orden.')));
    }

    return this.http.post<Order>(this.ordersEndpoint, payload).pipe(
      map(order => ({ ...payload, ...order })),
      tap({
        next: order => this.upsertOrderInCache(order),
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

  private buildOrderPayload(input: NewOrderInput, catalog: CatalogItem[]): Order {
    if (!input || typeof input !== 'object') {
      throw new Error('El contenido de la orden no es válido.');
    }

    if (!Array.isArray(catalog) || catalog.length === 0) {
      throw new Error('El catálogo de productos no está disponible.');
    }

    const customerName = (input.customerName || '').trim();
    if (!customerName) {
      throw new Error('El nombre del cliente es obligatorio.');
    }

    const createdAt = this.normalizeDate(input.createdAt);
    const expectedDelivery = input.expectedDelivery
      ? this.normalizeDate(input.expectedDelivery)
      : this.computeExpectedDelivery(createdAt);

    this.ensureDeliveryAfterCreation(createdAt, expectedDelivery);

    const orders = this.ordersSubject.getValue();
    const id = this.generateOrderId(orders);
    const code = this.generateOrderCode(orders, createdAt);
    const status = this.normalizeStatus(input.status);
    const items = this.buildOrderItems(id, input.items, catalog);
    const totals = this.calculateTotals(items);

    const order: Order = {
      id,
      code,
      customerName,
      status,
      createdAt,
      expectedDelivery,
      items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total
    };

    const email = (input.customerEmail || '').trim();
    if (email) {
      order.customerEmail = email;
    }

    const notes = (input.notes || '').trim();
    if (notes) {
      order.notes = notes;
    }

    return order;
  }

  private buildOrderItems(orderId: string, rawItems: NewOrderInput['items'], catalog: CatalogItem[]): OrderItem[] {
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new Error('La orden debe incluir al menos un producto.');
    }

    return rawItems.map((rawItem, index) => {
      const catalogItem = catalog.find(item => item.id === rawItem.catalogItemId);
      if (!catalogItem) {
        throw new Error(`El producto seleccionado no existe en el catálogo (${rawItem.catalogItemId}).`);
      }

      const quantity = this.normalizeQuantity(rawItem.quantity);
      const unitPrice = Number(catalogItem.price ?? 0);
      const lineTotal = this.roundTwo(unitPrice * quantity);

      return {
        id: `${orderId}-item-${index + 1}`,
        catalogItem,
        quantity,
        unitPrice,
        lineTotal
      };
    });
  }

  private normalizeQuantity(value: number | undefined): number {
    const quantity = Number(value ?? 0);
    if (!Number.isFinite(quantity) || quantity < 1) {
      return 1;
    }

    return Math.floor(quantity);
  }

  private calculateTotals(items: OrderItem[]) {
    const subtotal = this.roundTwo(items.reduce((acc, item) => acc + item.lineTotal, 0));
    const tax = this.roundTwo(subtotal * OrdersService.TAX_RATE);
    const total = this.roundTwo(subtotal + tax);

    return { subtotal, tax, total };
  }

  private roundTwo(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private normalizeDate(value: string | undefined): string {
    const target = value ? new Date(value) : new Date();
    if (Number.isNaN(target.getTime())) {
      throw new Error('La fecha proporcionada no es válida.');
    }

    return target.toISOString();
  }

  private computeExpectedDelivery(createdAt: string): string {
    const delivery = new Date(createdAt);
    delivery.setDate(delivery.getDate() + OrdersService.DEFAULT_DELIVERY_OFFSET_DAYS);
    return delivery.toISOString();
  }

  private ensureDeliveryAfterCreation(createdAt: string, expectedDelivery: string): void {
    const created = new Date(createdAt);
    const delivery = new Date(expectedDelivery);

    if (delivery.getTime() < created.getTime()) {
      throw new Error('La fecha de entrega no puede ser anterior a la fecha de creación.');
    }
  }

  private normalizeStatus(status: OrderStatus | undefined): OrderStatus {
    const allowedStatuses: OrderStatus[] = ['pending', 'processing', 'completed', 'cancelled'];
    if (!status) {
      return 'pending';
    }

    return allowedStatuses.includes(status) ? status : 'pending';
  }

  private generateOrderId(orders: Order[]): string {
    const prefix = 'ord-';
    const sequential = orders
      .map(order => order.id)
      .map(id => (typeof id === 'string' && id.startsWith(prefix) ? Number(id.slice(prefix.length)) : Number(id)))
      .filter(value => Number.isFinite(value)) as number[];

    const next = sequential.length > 0 ? Math.max(...sequential) + 1 : 1;
    return `${prefix}${next.toString().padStart(4, '0')}`;
  }

  private generateOrderCode(orders: Order[], createdAt: string): string {
    const createdDate = new Date(createdAt);
    const year = createdDate.getFullYear();

    const lastSequential = orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getFullYear() === year;
      })
      .map(order => this.extractSequential(order.code))
      .filter(value => Number.isFinite(value)) as number[];

    const nextSequential = (lastSequential.length > 0 ? Math.max(...lastSequential) + 1 : 1).toString().padStart(3, '0');
    return `WI-${year}-${nextSequential}`;
  }

  private extractSequential(code: string | undefined): number {
    if (typeof code !== 'string') {
      return NaN;
    }

    const parts = code.split('-');
    const rawValue = parts[parts.length - 1];
    const numeric = Number(rawValue);
    return Number.isFinite(numeric) ? numeric : NaN;
  }
}
