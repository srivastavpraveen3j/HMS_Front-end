import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargesummaryreportComponent } from './dischargesummaryreport.component';

describe('DischargesummaryreportComponent', () => {
  let component: DischargesummaryreportComponent;
  let fixture: ComponentFixture<DischargesummaryreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DischargesummaryreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DischargesummaryreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
