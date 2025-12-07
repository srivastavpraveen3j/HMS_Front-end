import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryLowstockComponent } from './inventory-lowstock.component';

describe('InventoryLowstockComponent', () => {
  let component: InventoryLowstockComponent;
  let fixture: ComponentFixture<InventoryLowstockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryLowstockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryLowstockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
