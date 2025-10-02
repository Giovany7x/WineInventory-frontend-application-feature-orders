import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanBenefitsComponent } from './plan-benefits.component';

describe('PlanBenefitsComponent', () => {
  let component: PlanBenefitsComponent;
  let fixture: ComponentFixture<PlanBenefitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanBenefitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
