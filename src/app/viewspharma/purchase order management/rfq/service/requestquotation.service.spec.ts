import { TestBed } from '@angular/core/testing';

import { RequestquotationService } from './requestquotation.service';

describe('RequestquotationService', () => {
  let service: RequestquotationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestquotationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
