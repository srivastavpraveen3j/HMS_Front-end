import { TestBed } from '@angular/core/testing';

import { UhidService } from './uhid.service';

describe('UhidService', () => {
  let service: UhidService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UhidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
