import { TestBed } from '@angular/core/testing';

import { InventoryitemService } from './inventoryitem.service';

describe('InventoryitemService', () => {
  let service: InventoryitemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryitemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
