import { CatalogItem } from './catalog-item.entity';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  catalogItem: CatalogItem;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  code: string;
  customerName: string;
  customerEmail?: string;
  status: OrderStatus;
  createdAt: string;
  expectedDelivery?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface NewOrderItemInput {
  catalogItemId: string;
  quantity: number;
}

export interface NewOrderInput {
  customerName: string;
  customerEmail?: string;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  expectedDelivery: string;
  items: NewOrderItemInput[];
}
