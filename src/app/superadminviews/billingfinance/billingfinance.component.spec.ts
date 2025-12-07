import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingfinanceComponent } from './billingfinance.component';

describe('BillingfinanceComponent', () => {
  let component: BillingfinanceComponent;
  let fixture: ComponentFixture<BillingfinanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingfinanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingfinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
