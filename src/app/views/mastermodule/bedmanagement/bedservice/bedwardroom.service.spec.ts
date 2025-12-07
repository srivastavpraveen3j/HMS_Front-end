import { TestBed } from '@angular/core/testing';

import { BedwardroomService } from './bedwardroom.service';

describe('BedwardroomService', () => {
  let service: BedwardroomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BedwardroomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
