import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdvitalchartComponent } from './ipdvitalchart.component';

describe('IpdvitalchartComponent', () => {
  let component: IpdvitalchartComponent;
  let fixture: ComponentFixture<IpdvitalchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdvitalchartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdvitalchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
