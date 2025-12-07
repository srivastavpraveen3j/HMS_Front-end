import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderGenerationComponent } from './purchase-order-generation.component';

describe('PurchaseOrderGenerationComponent', () => {
  let component: PurchaseOrderGenerationComponent;
  let fixture: ComponentFixture<PurchaseOrderGenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderGenerationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
