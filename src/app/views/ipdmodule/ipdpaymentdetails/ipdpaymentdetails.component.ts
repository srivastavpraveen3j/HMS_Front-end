import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BillingDiscountBoxComponent } from "../../../component/discountModule/BillingDiscountBoxComponent/discount.component";
import {
  DiscountService,
  DiscountRequest,
} from '../../../core/services/discount.service';
import getAuthUserId from '../../../helper/authGetter';
import { Subscription } from 'rxjs';

import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-ipdpaymentdetails',
  imports: [CommonModule, BillingDiscountBoxComponent, ReactiveFormsModule],
  templateUrl: './ipdpaymentdetails.component.html',
  styleUrl: './ipdpaymentdetails.component.css',
})
export class IpdpaymentdetailsComponent {
  @Input() parentForm!: FormGroup;
  @Output() paymentChange = new EventEmitter<number>();
  private formSubscription?: Subscription;

  constructor(private discountservice: DiscountService) {}

  

  ngOnInit() {
    if (this.parentForm) {
      this.formSubscription = this.parentForm.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(val => {
          this.paymentChange.emit(val);
        });
    }
  }
  

  ngOnDestroy() {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  async onRequestDiscount() {
    const Swal = (await import('sweetalert2')).default;

    if (this.parentForm.invalid) {
      Swal.fire('Invalid Form', 'Please check all required fields.', 'warning');
      return;
    }

    const payload: DiscountRequest = {
      uhid: this.parentForm.get('_id')?.value,
      patientBillingId: this.parentForm.get('_id')?.value,
      discount: this.parentForm.get('discount')?.value,
      reason: this.parentForm.get('discountReason')?.value,
      discountStatus: 'pending',
      requestedBy: getAuthUserId(),
    };

    this.discountservice.requestDiscountIPD(payload).subscribe({
      next: (res: any) => {
        Swal.fire(
          'Requested',
          'Discount request submitted successfully.',
          'success'
        );
      },
      error: (err: any) => {
        console.error('Discount request failed:', err);
        Swal.fire('Error', 'Failed to submit discount request.', 'error');
      },
    });
  }

  get upiShouldShowTransactionId(): boolean {
    return Number(this.parentForm.get('upiAmount')?.value) > 0;
  }

  get totalAmountReceived(): number {
    return (
      Number(this.parentForm.get('cashAmount')?.value) +
      Number(this.parentForm.get('upiAmount')?.value) +
      Number(this.parentForm.get('cardAmount')?.value)
    );
  }
}
