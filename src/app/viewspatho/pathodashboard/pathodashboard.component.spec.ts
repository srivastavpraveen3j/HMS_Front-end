import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathodashboardComponent } from './pathodashboard.component';

describe('PathodashboardComponent', () => {
  let component: PathodashboardComponent;
  let fixture: ComponentFixture<PathodashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathodashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathodashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
