import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceVerificationlistComponent } from './invoice-verificationlist.component';

describe('InvoiceVerificationlistComponent', () => {
  let component: InvoiceVerificationlistComponent;
  let fixture: ComponentFixture<InvoiceVerificationlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceVerificationlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceVerificationlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
