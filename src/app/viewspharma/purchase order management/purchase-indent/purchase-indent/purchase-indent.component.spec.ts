import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseIndentComponent } from './purchase-indent.component';

describe('PurchaseIndentComponent', () => {
  let component: PurchaseIndentComponent;
  let fixture: ComponentFixture<PurchaseIndentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseIndentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseIndentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
