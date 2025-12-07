import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiationdashboardComponent } from './radiationdashboard.component';

describe('RadiationdashboardComponent', () => {
  let component: RadiationdashboardComponent;
  let fixture: ComponentFixture<RadiationdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiationdashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiationdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
