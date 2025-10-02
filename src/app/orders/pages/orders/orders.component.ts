import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderListComponent } from '../../components/order-list/order-list.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, OrderListComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {}
