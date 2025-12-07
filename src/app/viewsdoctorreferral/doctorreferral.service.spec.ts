import { TestBed } from '@angular/core/testing';

import { DoctorreferralService } from './doctorreferral.service';

describe('DoctorreferralService', () => {
  let service: DoctorreferralService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DoctorreferralService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
