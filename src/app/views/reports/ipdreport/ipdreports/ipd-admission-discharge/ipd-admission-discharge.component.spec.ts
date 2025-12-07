import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdAdmissionDischargeComponent } from './ipd-admission-discharge.component';

describe('IpdAdmissionDischargeComponent', () => {
  let component: IpdAdmissionDischargeComponent;
  let fixture: ComponentFixture<IpdAdmissionDischargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdAdmissionDischargeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdAdmissionDischargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
