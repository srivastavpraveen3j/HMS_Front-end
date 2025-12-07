import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceVerificationComponent } from './invoice-verification.component';

describe('InvoiceVerificationComponent', () => {
  let component: InvoiceVerificationComponent;
  let fixture: ComponentFixture<InvoiceVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
