import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiodashboardComponent } from './radiodashboard.component';

describe('RadiodashboardComponent', () => {
  let component: RadiodashboardComponent;
  let fixture: ComponentFixture<RadiodashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiodashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiodashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
