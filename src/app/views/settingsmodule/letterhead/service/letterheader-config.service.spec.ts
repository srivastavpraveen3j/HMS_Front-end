import { TestBed } from '@angular/core/testing';

import { LetterheaderConfigService } from './letterheader-config.service';

describe('LetterheaderConfigService', () => {
  let service: LetterheaderConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LetterheaderConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
