import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestForQuotationlistComponent } from './request-for-quotationlist.component';

describe('RequestForQuotationlistComponent', () => {
  let component: RequestForQuotationlistComponent;
  let fixture: ComponentFixture<RequestForQuotationlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestForQuotationlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestForQuotationlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
