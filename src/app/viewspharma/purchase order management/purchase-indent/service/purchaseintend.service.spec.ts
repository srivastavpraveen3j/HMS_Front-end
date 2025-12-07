import { TestBed } from '@angular/core/testing';

import { PurchaseintendService } from './purchaseintend.service';

describe('PurchaseintendService', () => {
  let service: PurchaseintendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchaseintendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
