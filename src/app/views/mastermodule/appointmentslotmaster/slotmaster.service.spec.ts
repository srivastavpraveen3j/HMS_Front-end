import { TestBed } from '@angular/core/testing';

import { SlotmasterService } from './slotmaster.service';

describe('SlotmasterService', () => {
  let service: SlotmasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlotmasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
