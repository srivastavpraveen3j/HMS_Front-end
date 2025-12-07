import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentmanagementComponent } from './appointmentmanagement.component';

describe('AppointmentmanagementComponent', () => {
  let component: AppointmentmanagementComponent;
  let fixture: ComponentFixture<AppointmentmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentmanagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
