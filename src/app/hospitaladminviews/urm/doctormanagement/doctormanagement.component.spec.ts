import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctormanagementComponent } from './doctormanagement.component';

describe('DoctormanagementComponent', () => {
  let component: DoctormanagementComponent;
  let fixture: ComponentFixture<DoctormanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctormanagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctormanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
