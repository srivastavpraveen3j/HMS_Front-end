import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestQuotationDetailComponent } from './request-quotation-detail.component';

describe('RequestQuotationDetailComponent', () => {
  let component: RequestQuotationDetailComponent;
  let fixture: ComponentFixture<RequestQuotationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestQuotationDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestQuotationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
