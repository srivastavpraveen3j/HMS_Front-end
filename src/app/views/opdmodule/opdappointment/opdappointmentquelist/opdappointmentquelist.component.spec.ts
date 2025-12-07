import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdappointmentquelistComponent } from './opdappointmentquelist.component';

describe('OpdappointmentquelistComponent', () => {
  let component: OpdappointmentquelistComponent;
  let fixture: ComponentFixture<OpdappointmentquelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdappointmentquelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdappointmentquelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
