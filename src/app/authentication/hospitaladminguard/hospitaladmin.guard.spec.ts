import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { hospitaladminGuard } from './hospitaladmin.guard';

describe('hospitaladminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => hospitaladminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
