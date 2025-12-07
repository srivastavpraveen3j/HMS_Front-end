import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorreferraldashboardComponent } from './doctorreferraldashboard.component';

describe('DoctorreferraldashboardComponent', () => {
  let component: DoctorreferraldashboardComponent;
  let fixture: ComponentFixture<DoctorreferraldashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorreferraldashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorreferraldashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
