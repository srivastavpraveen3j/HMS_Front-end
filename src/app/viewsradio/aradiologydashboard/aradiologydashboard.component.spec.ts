import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AradiologydashboardComponent } from './aradiologydashboard.component';

describe('AradiologydashboardComponent', () => {
  let component: AradiologydashboardComponent;
  let fixture: ComponentFixture<AradiologydashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AradiologydashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AradiologydashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
