import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalchartComponent } from './vitalchart.component';

describe('VitalchartComponent', () => {
  let component: VitalchartComponent;
  let fixture: ComponentFixture<VitalchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VitalchartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VitalchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
