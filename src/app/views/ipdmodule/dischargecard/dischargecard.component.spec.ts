import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargecardComponent } from './dischargecard.component';

describe('DischargecardComponent', () => {
  let component: DischargecardComponent;
  let fixture: ComponentFixture<DischargecardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DischargecardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DischargecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
