import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentqueueaddedComponent } from './appointmentqueueadded.component';

describe('AppointmentqueueaddedComponent', () => {
  let component: AppointmentqueueaddedComponent;
  let fixture: ComponentFixture<AppointmentqueueaddedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentqueueaddedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentqueueaddedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
