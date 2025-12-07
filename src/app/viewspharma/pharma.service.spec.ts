import { TestBed } from '@angular/core/testing';

import { PharmaService } from './pharma.service';

describe('PharmaService', () => {
  let service: PharmaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PharmaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
