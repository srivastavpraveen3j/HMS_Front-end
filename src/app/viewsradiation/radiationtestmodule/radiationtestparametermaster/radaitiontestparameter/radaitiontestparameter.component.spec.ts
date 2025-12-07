import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadaitiontestparameterComponent } from './radaitiontestparameter.component';

describe('RadaitiontestparameterComponent', () => {
  let component: RadaitiontestparameterComponent;
  let fixture: ComponentFixture<RadaitiontestparameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadaitiontestparameterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadaitiontestparameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
