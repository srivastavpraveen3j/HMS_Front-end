import { TestBed } from '@angular/core/testing';

import { IpdService } from './ipd.service';

describe('IpdService', () => {
  let service: IpdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
