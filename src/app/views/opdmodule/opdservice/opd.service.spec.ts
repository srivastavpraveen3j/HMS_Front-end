import { TestBed } from '@angular/core/testing';

import { OpdService } from './opd.service';

describe('OpdService', () => {
  let service: OpdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
