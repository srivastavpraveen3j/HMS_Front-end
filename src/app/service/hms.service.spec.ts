import { TestBed } from '@angular/core/testing';

import { HmsService } from './hms.service';

describe('HmsService', () => {
  let service: HmsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
