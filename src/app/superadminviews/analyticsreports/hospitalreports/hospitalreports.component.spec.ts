import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalreportsComponent } from './hospitalreports.component';

describe('HospitalreportsComponent', () => {
  let component: HospitalreportsComponent;
  let fixture: ComponentFixture<HospitalreportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalreportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
