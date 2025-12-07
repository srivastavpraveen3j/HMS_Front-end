import { TestBed } from '@angular/core/testing';

import { MaterialrequestService } from './materialrequest.service';

describe('MaterialrequestService', () => {
  let service: MaterialrequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialrequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
