import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { CatalogService } from '../../services/catalog.service';
import { OrdersService } from '../../services/orders.service';
import { CatalogItem } from '../../models/catalog-item.entity';
import { NewOrderInput, OrderStatus } from '../../models/order.entity';

interface OrderFormItemValue {
  catalogItemId: string | null;
  quantity: number | null;
}

interface OrderFormValue {
  customerName: string | null;
  customerEmail: string | null;
  notes: string | null;
  status: OrderStatus | null;
  createdAt: string | null;
  expectedDelivery: string | null;
  items: OrderFormItemValue[] | null;
}

@Component({
  selector: 'app-new-order',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CurrencyPipe],

  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css']
})
export class NewOrderComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalogService = inject(CatalogService);
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);

  readonly catalogItems$ = this.catalogService.getCatalog();

  readonly statusLabels: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    processing: 'En preparación',
    completed: 'Completado',
    cancelled: 'Cancelado'
  };

  readonly statusOptions: OrderStatus[] = ['pending', 'processing', 'completed', 'cancelled'];

  private readonly deliveryAfterCreationValidator: ValidatorFn = control => {
    const createdAt = control.get('createdAt')?.value;
    const expectedDelivery = control.get('expectedDelivery')?.value;

    if (!createdAt || !expectedDelivery) {
      return null;
    }

    const createdDate = new Date(createdAt);
    const deliveryDate = new Date(expectedDelivery);

    if (Number.isNaN(createdDate.getTime()) || Number.isNaN(deliveryDate.getTime())) {
      return null;
    }

    return deliveryDate.getTime() >= createdDate.getTime() ? null : { deliveryBeforeCreation: true };
  };

  readonly orderForm: FormGroup = this.fb.group(
    {
      customerName: ['', Validators.required],
      customerEmail: ['', Validators.email],
      notes: [''],
      status: ['pending', Validators.required],
      createdAt: [this.toDateTimeLocalInput(new Date()), Validators.required],
      expectedDelivery: [this.toDateTimeLocalInput(this.addDays(new Date(), 4)), Validators.required],
      items: this.fb.array([])
    },
    { validators: this.deliveryAfterCreationValidator }
  );

  readonly orderPreview$ = combineLatest([
    this.catalogItems$,
    this.orderForm.valueChanges.pipe(startWith(this.orderForm.value))
  ]).pipe(
    map(([catalog, formValue]) => this.buildPreview(catalog, formValue as OrderFormValue))
  );

  ngOnInit(): void {
    this.addItem();
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(
      this.fb.group({
        catalogItemId: [null, Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]]
      })
    );
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  submit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const formValue = this.orderForm.value as OrderFormValue;
    const rawItems = (formValue.items ?? []) as OrderFormItemValue[];
    const payload: NewOrderInput = {
      customerName: formValue.customerName!,
      customerEmail: formValue.customerEmail ?? undefined,
      notes: formValue.notes ?? undefined,
      status: formValue.status!,
      createdAt: this.toIsoString(formValue.createdAt!),
      expectedDelivery: this.toIsoString(formValue.expectedDelivery!),
      items: rawItems.map(item => ({
        catalogItemId: item?.catalogItemId!,
        quantity: Number(item?.quantity ?? 1)
      }))
    };

    this.ordersService.createOrder(payload).subscribe({
      next: () => this.router.navigate(['/dashboard', 'sales']),
      error: error => console.error('No se pudo crear la orden.', error)
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  private buildPreview(catalog: CatalogItem[], formValue: OrderFormValue) {
    const rawItems = (formValue.items ?? []) as OrderFormItemValue[];
    const items = rawItems.map(item => {
      const catalogItem = catalog.find(c => c.id === item?.catalogItemId);
      const quantity = Number(item?.quantity ?? 0);
      const unitPrice = catalogItem?.price ?? 0;
      return {
        id: item?.catalogItemId,
        name: catalogItem?.name ?? 'Sin seleccionar',
        quantity,
        unitPrice,
        total: quantity * unitPrice
      };
    });

    const subtotal = items.reduce((acc: number, item: any) => acc + item.total, 0);
    const tax = Math.round(subtotal * 0.19 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    return {
      items,
      subtotal,
      tax,
      total
    };
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private toDateTimeLocalInput(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private toIsoString(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error('La fecha proporcionada no es válida.');
    }
    return date.toISOString();
  }
}
