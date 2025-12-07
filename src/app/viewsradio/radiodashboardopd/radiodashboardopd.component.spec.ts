import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiodashboardopdComponent } from './radiodashboardopd.component';

describe('RadiodashboardopdComponent', () => {
  let component: RadiodashboardopdComponent;
  let fixture: ComponentFixture<RadiodashboardopdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiodashboardopdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiodashboardopdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
