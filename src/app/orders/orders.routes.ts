import { Routes } from '@angular/router';

const OrdersPage = () => import('./pages/orders/orders.component').then(m => m.OrdersComponent);
const NewOrderPage = () => import('./pages/new-order/new-order.component').then(m => m.NewOrderComponent);
const OrderDetailPage = () => import('./pages/order-detail/order-detail.component').then(m => m.OrderDetailComponent);

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: OrdersPage,
    data: { title: 'WineInventory | Pedidos' }
  },
  {
    path: 'new',
    loadComponent: NewOrderPage,
    data: { title: 'WineInventory | Nuevo pedido' }
  },
  {
    path: ':orderId',
    loadComponent: OrderDetailPage,
    data: { title: 'WineInventory | Detalle del pedido' }
  }
];
