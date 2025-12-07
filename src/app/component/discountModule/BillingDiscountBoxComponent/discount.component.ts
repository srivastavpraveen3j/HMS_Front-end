import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DiscountService } from '../../../core/services/discount.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'billing-discount-box',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.css'],
})
export class BillingDiscountBoxComponent implements OnInit, OnChanges, OnDestroy {
  @Input() parentForm!: FormGroup;
  @Output() requestDiscount = new EventEmitter<void>();

  isDiscountRequested = false;
  DiscountStatus!: string;
  discountArray: any;
  private discountSub?: Subscription;
  private discountService = inject(DiscountService);
  @Output() fullDataChange = new EventEmitter<any>();

  constructor() { }




  ngOnInit() {
    this.discountSub = this.discountService.discountData$.subscribe((data: any) => {
      this.handleDiscountData(data);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['parentForm'] && this.parentForm) {
      this.syncControls();
    }
  }

  private handleDiscountData(data: any) {
    if (!data || Object.keys(data).length === 0) return;

    this.discountArray = data;
    this.isDiscountRequested = !!data.isDiscountRequested;
    this.DiscountStatus = data.discountStatus ?? '';

    this.syncControls();

    this.parentForm.patchValue(
      {
        discount: data.discount || 0,
        discountReason: data.reason || '',
        discountStatus: data.discountStatus || ''
      },
      { emitEvent: true }
    );

    this.fullDataChange.emit({
      ...this.parentForm.value,
      discountRequest: {
        discount: data.discount || 0,
        reason: data.reason || '',
        discountStatus: data.discountStatus || ''
      }
    });
  }

  onDiscountDataChange(data: any) {
    // Update grandparent form automatically if needed
    console.log('Grandparent sees updated form with discount:', data);
  }


  private syncControls() {
    if (!this.parentForm) return;

    const discountControl = this.parentForm.get('discount');
    const reasonControl = this.parentForm.get('discountReason');

    if (this.isDiscountRequested) {
      discountControl?.disable({ emitEvent: false });
      reasonControl?.disable({ emitEvent: false });
    } else {
      discountControl?.enable({ emitEvent: false });
      reasonControl?.enable({ emitEvent: false });
    }
  }

  get isCashPayment() {
    const paymentCtrl = this.parentForm?.get('paymentmethod') || this.parentForm?.get('paymentMode');
    return paymentCtrl?.value === 'cash';
  }

  get discountStatus() {
    return this.DiscountStatus;
  }

  // ✅ Show Swal when request is emitted
  emitRequest() {
    this.requestDiscount.emit();
    Swal.fire({
      icon: 'info',
      title: 'Discount request sent!',
      text: 'Your discount request has been submitted for approval.',
      showConfirmButton: true,
      confirmButtonText: 'OK'
    });
  }

  applyPolicy(selectedPolicy: string) {
    console.log(selectedPolicy);
  }

  ngOnDestroy() {
    this.discountSub?.unsubscribe();
  }
}
