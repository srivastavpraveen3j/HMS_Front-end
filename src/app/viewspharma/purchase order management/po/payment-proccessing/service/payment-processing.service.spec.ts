import { TestBed } from '@angular/core/testing';

import { PaymentProcessingService } from './payment-processing.service';

describe('PaymentProcessingService', () => {
  let service: PaymentProcessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
