import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlansItemComponent } from './plans-item.component';

describe('PlansItemComponent', () => {
  let component: PlansItemComponent;
  let fixture: ComponentFixture<PlansItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlansItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlansItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
