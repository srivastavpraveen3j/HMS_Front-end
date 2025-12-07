import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseIndentlistComponent } from './purchase-indentlist.component';

describe('PurchaseIndentlistComponent', () => {
  let component: PurchaseIndentlistComponent;
  let fixture: ComponentFixture<PurchaseIndentlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseIndentlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseIndentlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
