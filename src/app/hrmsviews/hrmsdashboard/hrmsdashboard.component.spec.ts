import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrmsdashboardComponent } from './hrmsdashboard.component';

describe('HrmsdashboardComponent', () => {
  let component: HrmsdashboardComponent;
  let fixture: ComponentFixture<HrmsdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrmsdashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrmsdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
