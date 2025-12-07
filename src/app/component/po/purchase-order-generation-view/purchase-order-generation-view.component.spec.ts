import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderGenerationViewComponent } from './purchase-order-generation-view.component';

describe('PurchaseOrderGenerationViewComponent', () => {
  let component: PurchaseOrderGenerationViewComponent;
  let fixture: ComponentFixture<PurchaseOrderGenerationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderGenerationViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderGenerationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
