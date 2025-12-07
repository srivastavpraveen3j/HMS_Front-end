import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdappointmentComponent } from './opdappointment.component';

describe('OpdappointmentComponent', () => {
  let component: OpdappointmentComponent;
  let fixture: ComponentFixture<OpdappointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdappointmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdappointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
