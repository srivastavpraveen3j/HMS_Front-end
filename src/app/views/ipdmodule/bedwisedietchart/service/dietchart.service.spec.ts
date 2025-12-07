import { TestBed } from '@angular/core/testing';

import { DietchartService } from './dietchart.service';

describe('DietchartService', () => {
  let service: DietchartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DietchartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
