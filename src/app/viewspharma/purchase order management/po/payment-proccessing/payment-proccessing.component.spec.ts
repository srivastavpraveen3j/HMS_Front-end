import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentProccessingComponent } from './payment-proccessing.component';

describe('PaymentProccessingComponent', () => {
  let component: PaymentProccessingComponent;
  let fixture: ComponentFixture<PaymentProccessingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentProccessingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentProccessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
