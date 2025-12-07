import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalmanagementComponent } from './hospitalmanagement.component';

describe('HospitalmanagementComponent', () => {
  let component: HospitalmanagementComponent;
  let fixture: ComponentFixture<HospitalmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalmanagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
