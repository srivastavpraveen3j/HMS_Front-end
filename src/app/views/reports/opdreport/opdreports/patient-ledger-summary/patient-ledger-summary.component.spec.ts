import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientLedgerSummaryComponent } from './patient-ledger-summary.component';

describe('PatientLedgerSummaryComponent', () => {
  let component: PatientLedgerSummaryComponent;
  let fixture: ComponentFixture<PatientLedgerSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientLedgerSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientLedgerSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
