import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientOpdmedicineRequestComponent } from './patient-opdmedicine-request.component';

describe('PatientOpdmedicineRequestComponent', () => {
  let component: PatientOpdmedicineRequestComponent;
  let fixture: ComponentFixture<PatientOpdmedicineRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientOpdmedicineRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientOpdmedicineRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
