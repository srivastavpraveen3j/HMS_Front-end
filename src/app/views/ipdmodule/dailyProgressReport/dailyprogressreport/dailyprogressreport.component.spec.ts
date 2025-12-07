import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyprogressreportComponent } from './dailyprogressreport.component';

describe('DailyprogressreportComponent', () => {
  let component: DailyprogressreportComponent;
  let fixture: ComponentFixture<DailyprogressreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyprogressreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyprogressreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
