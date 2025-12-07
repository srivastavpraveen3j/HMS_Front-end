import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderGenerationlistComponent } from './purchase-order-generationlist.component';

describe('PurchaseOrderGenerationlistComponent', () => {
  let component: PurchaseOrderGenerationlistComponent;
  let fixture: ComponentFixture<PurchaseOrderGenerationlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderGenerationlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderGenerationlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
