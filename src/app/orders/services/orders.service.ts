import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CatalogService } from './catalog.service';
import { CatalogItem } from '../models/catalog-item.entity';
import { NewOrderInput, Order, OrderItem, OrderStatus } from '../models/order.entity';

const TAX_RATE = 0.19;

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly catalogService = inject(CatalogService);
  private readonly ordersSubject = new BehaviorSubject<Order[]>([]);

  constructor() {
    const seededOrders = this.createSeedOrders();
    this.ordersSubject.next(seededOrders);
  }

  getOrders(): Observable<Order[]> {
    return this.ordersSubject.asObservable();
  }

  getOrderById(orderId: string): Observable<Order | undefined> {
    return this.ordersSubject.pipe(map(orders => orders.find(order => order.id === orderId)));
  }

  createOrder(input: NewOrderInput): Order {
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

    this.ordersSubject.next([...this.ordersSubject.getValue(), newOrder]);
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): void {
    const orders = this.ordersSubject.getValue();
    const index = orders.findIndex(order => order.id === orderId);
    if (index === -1) {
      return;
    }

    const updatedOrder: Order = { ...orders[index], status };
    const updatedOrders = [...orders];
    updatedOrders.splice(index, 1, updatedOrder);
    this.ordersSubject.next(updatedOrders);
  }

  private createSeedOrders(): Order[] {
    const catalog = this.catalogService.getCatalogSnapshot();
    const firstOrderItems = [
      this.tryCreateOrderItem('ord-0001', 0, catalog[0], 6),
      this.tryCreateOrderItem('ord-0001', 1, catalog[2], 3)
    ].filter(Boolean) as OrderItem[];

    const secondOrderItems = [
      this.tryCreateOrderItem('ord-0002', 0, catalog[1], 12),
      this.tryCreateOrderItem('ord-0002', 1, catalog[4], 8)
    ].filter(Boolean) as OrderItem[];

    const thirdOrderItems = [
      this.tryCreateOrderItem('ord-0003', 0, catalog[1], 20)
    ].filter(Boolean) as OrderItem[];

    const firstTotals = this.calculateTotals(firstOrderItems);
    const secondTotals = this.calculateTotals(secondOrderItems);
    const thirdTotals = this.calculateTotals(thirdOrderItems);

    return [
      {
        id: 'ord-0001',
        code: 'WI-2025-001',
        customerName: 'Restaurante La Vid',
        customerEmail: 'compras@lavid.com',
        status: 'processing',
        createdAt: this.createPastDate(3),
        expectedDelivery: this.createFutureDate(2),
        notes: 'Entrega en horario matutino.',
        items: firstOrderItems,
        ...firstTotals
      },
      {
        id: 'ord-0002',
        code: 'WI-2025-002',
        customerName: 'Bodega El Roble',
        customerEmail: 'contacto@elroble.ar',
        status: 'completed',
        createdAt: this.createPastDate(10),
        expectedDelivery: this.createPastDate(3),
        notes: 'Pedido recurrente mensual.',
        items: secondOrderItems,
        ...secondTotals
      },
      {
        id: 'ord-0003',
        code: 'WI-2025-003',
        customerName: 'Wine Lovers Club',
        customerEmail: 'compras@wineloversclub.es',
        status: 'pending',
        createdAt: this.createPastDate(1),
        expectedDelivery: this.createFutureDate(5),
        notes: 'Confirmar disponibilidad del Malbec 2019.',
        items: thirdOrderItems,
        ...thirdTotals
      }
    ];
  }

  private tryCreateOrderItem(orderId: string, index: number, catalogItem: CatalogItem | undefined, quantity: number): OrderItem | null {
    if (!catalogItem) {
      return null;
    }

    return this.createOrderItem(orderId, index, catalogItem, quantity);
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

  private createPastDate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  }

  private createFutureDate(daysAhead: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString();
  }
}
