import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaterangeComponent } from './daterange.component';

describe('DaterangeComponent', () => {
  let component: DaterangeComponent;
  let fixture: ComponentFixture<DaterangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaterangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DaterangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
