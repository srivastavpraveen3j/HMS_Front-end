import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathodashboardopdComponent } from './pathodashboardopd.component';

describe('PathodashboardopdComponent', () => {
  let component: PathodashboardopdComponent;
  let fixture: ComponentFixture<PathodashboardopdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathodashboardopdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathodashboardopdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
