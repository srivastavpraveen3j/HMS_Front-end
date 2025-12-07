import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorquotationComponent } from './vendorquotation.component';

describe('VendorquotationComponent', () => {
  let component: VendorquotationComponent;
  let fixture: ComponentFixture<VendorquotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorquotationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorquotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
