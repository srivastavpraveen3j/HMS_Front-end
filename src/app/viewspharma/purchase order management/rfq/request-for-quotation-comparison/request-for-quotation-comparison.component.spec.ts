import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestForQuotationComparisonComponent } from './request-for-quotation-comparison.component';

describe('RequestForQuotationComparisonComponent', () => {
  let component: RequestForQuotationComparisonComponent;
  let fixture: ComponentFixture<RequestForQuotationComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestForQuotationComparisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestForQuotationComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
