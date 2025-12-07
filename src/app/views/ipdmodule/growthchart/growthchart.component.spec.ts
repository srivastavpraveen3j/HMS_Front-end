import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrowthchartComponent } from './growthchart.component';

describe('GrowthchartComponent', () => {
  let component: GrowthchartComponent;
  let fixture: ComponentFixture<GrowthchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrowthchartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrowthchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
