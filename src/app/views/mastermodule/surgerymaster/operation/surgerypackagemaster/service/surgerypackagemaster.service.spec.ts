import { TestBed } from '@angular/core/testing';

import { SurgerypackagemasterService } from './surgerypackagemaster.service';

describe('SurgerypackagemasterService', () => {
  let service: SurgerypackagemasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SurgerypackagemasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
