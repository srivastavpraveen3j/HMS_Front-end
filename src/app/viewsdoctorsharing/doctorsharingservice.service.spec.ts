import { TestBed } from '@angular/core/testing';

import { DoctorsharingserviceService } from './doctorsharingservice.service';

describe('DoctorsharingserviceService', () => {
  let service: DoctorsharingserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DoctorsharingserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
