import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseLedgerComponent } from './purchase-ledger.component';

describe('PurchaseLedgerComponent', () => {
  let component: PurchaseLedgerComponent;
  let fixture: ComponentFixture<PurchaseLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseLedgerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
