import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdappointmentlistComponent } from './opdappointmentlist.component';

describe('OpdappointmentlistComponent', () => {
  let component: OpdappointmentlistComponent;
  let fixture: ComponentFixture<OpdappointmentlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdappointmentlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdappointmentlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
