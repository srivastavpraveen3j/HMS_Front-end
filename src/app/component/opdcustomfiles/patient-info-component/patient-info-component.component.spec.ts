import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientInfoComponentComponent } from './patient-info-component.component';

describe('PatientInfoComponentComponent', () => {
  let component: PatientInfoComponentComponent;
  let fixture: ComponentFixture<PatientInfoComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientInfoComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientInfoComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
