import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentProcessinglistComponent } from './payment-processinglist.component';

describe('PaymentProcessinglistComponent', () => {
  let component: PaymentProcessinglistComponent;
  let fixture: ComponentFixture<PaymentProcessinglistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentProcessinglistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentProcessinglistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
