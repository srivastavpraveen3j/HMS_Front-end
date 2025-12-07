import { TestBed } from '@angular/core/testing';

import { InvoiceverificationService } from './invoiceverification.service';

describe('InvoiceverificationService', () => {
  let service: InvoiceverificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceverificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
