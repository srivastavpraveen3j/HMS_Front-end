import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdreportComponent } from './ipdreport.component';

describe('IpdreportComponent', () => {
  let component: IpdreportComponent;
  let fixture: ComponentFixture<IpdreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
