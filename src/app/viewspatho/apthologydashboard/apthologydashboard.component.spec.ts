import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApthologydashboardComponent } from './apthologydashboard.component';

describe('ApthologydashboardComponent', () => {
  let component: ApthologydashboardComponent;
  let fixture: ComponentFixture<ApthologydashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApthologydashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApthologydashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
