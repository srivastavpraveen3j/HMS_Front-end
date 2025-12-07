import { TestBed } from '@angular/core/testing';

import { OtmoduleService } from './otmodule.service';

describe('OtmoduleService', () => {
  let service: OtmoduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtmoduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
