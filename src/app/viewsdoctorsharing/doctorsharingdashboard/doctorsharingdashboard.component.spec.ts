import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorsharingdashboardComponent } from './doctorsharingdashboard.component';

describe('DoctorsharingdashboardComponent', () => {
  let component: DoctorsharingdashboardComponent;
  let fixture: ComponentFixture<DoctorsharingdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorsharingdashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorsharingdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
