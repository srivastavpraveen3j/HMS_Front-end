import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomtimepickerComponent } from './customtimepicker.component';

describe('CustomtimepickerComponent', () => {
  let component: CustomtimepickerComponent;
  let fixture: ComponentFixture<CustomtimepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomtimepickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomtimepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
