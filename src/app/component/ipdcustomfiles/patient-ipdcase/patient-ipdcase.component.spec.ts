import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientIpdcaseComponent } from './patient-ipdcase.component';

describe('PatientIpdcaseComponent', () => {
  let component: PatientIpdcaseComponent;
  let fixture: ComponentFixture<PatientIpdcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientIpdcaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientIpdcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
