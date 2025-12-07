import { TestBed } from '@angular/core/testing';

import { CompanymasterService } from './companymaster.service';

describe('CompanymasterService', () => {
  let service: CompanymasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanymasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
