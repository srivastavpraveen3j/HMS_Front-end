import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadaitiontestparameterlistComponent } from './radaitiontestparameterlist.component';

describe('RadaitiontestparameterlistComponent', () => {
  let component: RadaitiontestparameterlistComponent;
  let fixture: ComponentFixture<RadaitiontestparameterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadaitiontestparameterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadaitiontestparameterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
