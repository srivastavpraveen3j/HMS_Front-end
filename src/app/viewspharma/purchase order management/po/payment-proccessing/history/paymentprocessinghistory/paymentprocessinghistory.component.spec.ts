import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentprocessinghistoryComponent } from './paymentprocessinghistory.component';

describe('PaymentprocessinghistoryComponent', () => {
  let component: PaymentprocessinghistoryComponent;
  let fixture: ComponentFixture<PaymentprocessinghistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentprocessinghistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentprocessinghistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
