import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientaccountinfoComponent } from './patientaccountinfo.component';

describe('PatientaccountinfoComponent', () => {
  let component: PatientaccountinfoComponent;
  let fixture: ComponentFixture<PatientaccountinfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientaccountinfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientaccountinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
