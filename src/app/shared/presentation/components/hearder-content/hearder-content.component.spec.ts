import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HearderContentComponent } from './hearder-content.component';

describe('HearderContentComponent', () => {
  let component: HearderContentComponent;
  let fixture: ComponentFixture<HearderContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HearderContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HearderContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
