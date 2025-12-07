import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestForQuotationComponentComponent } from './request-for-quotation-component.component';

describe('RequestForQuotationComponentComponent', () => {
  let component: RequestForQuotationComponentComponent;
  let fixture: ComponentFixture<RequestForQuotationComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestForQuotationComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestForQuotationComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
