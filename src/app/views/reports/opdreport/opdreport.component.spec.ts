import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdreportComponent } from './opdreport.component';

describe('OpdreportComponent', () => {
  let component: OpdreportComponent;
  let fixture: ComponentFixture<OpdreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
