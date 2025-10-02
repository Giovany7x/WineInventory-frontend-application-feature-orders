import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentConfirmedComponent } from './payment-confirmed.component';

describe('PaymentConfirmedComponent', () => {
  let component: PaymentConfirmedComponent;
  let fixture: ComponentFixture<PaymentConfirmedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentConfirmedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentConfirmedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
