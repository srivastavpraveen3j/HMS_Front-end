import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdappointmentfollowupComponent } from './opdappointmentfollowup.component';

describe('OpdappointmentfollowupComponent', () => {
  let component: OpdappointmentfollowupComponent;
  let fixture: ComponentFixture<OpdappointmentfollowupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdappointmentfollowupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdappointmentfollowupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
