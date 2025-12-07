import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientdeatailsComponent } from './patientdeatails.component';

describe('PatientdeatailsComponent', () => {
  let component: PatientdeatailsComponent;
  let fixture: ComponentFixture<PatientdeatailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientdeatailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientdeatailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
