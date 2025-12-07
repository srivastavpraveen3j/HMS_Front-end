import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomappointmenttimepickerComponent } from './customappointmenttimepicker.component';

describe('CustomappointmenttimepickerComponent', () => {
  let component: CustomappointmenttimepickerComponent;
  let fixture: ComponentFixture<CustomappointmenttimepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomappointmenttimepickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomappointmenttimepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
