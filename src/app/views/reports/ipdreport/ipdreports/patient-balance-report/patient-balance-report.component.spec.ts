import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientBalanceReportComponent } from './patient-balance-report.component';

describe('PatientBalanceReportComponent', () => {
  let component: PatientBalanceReportComponent;
  let fixture: ComponentFixture<PatientBalanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientBalanceReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientBalanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
