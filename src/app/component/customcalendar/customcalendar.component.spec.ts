import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomcalendarComponent } from './customcalendar.component';

describe('CustomcalendarComponent', () => {
  let component: CustomcalendarComponent;
  let fixture: ComponentFixture<CustomcalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomcalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomcalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
