import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientOpdpharmabillComponent } from './patient-opdpharmabill.component';

describe('PatientOpdpharmabillComponent', () => {
  let component: PatientOpdpharmabillComponent;
  let fixture: ComponentFixture<PatientOpdpharmabillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientOpdpharmabillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientOpdpharmabillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
