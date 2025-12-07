import { Component, Input, Output, EventEmitter, signal, computed, effect, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BillingDiscountBoxComponent } from '../../../../component/discountModule/BillingDiscountBoxComponent/discount.component';
import { DiscountRequestPayload, DiscountService } from '../../../../core/services/discount.service';
import getAuthUserId from '../../../../helper/authGetter';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { extractUrlSegments } from '../../../../helper/urlHelper';
import { SimpleChanges } from '@angular/core';
import { DiscountPercentageComponent } from "../../../../component/discountModule/discount-percentage/discount-percentage.component";

export interface PaymentEntry {
  cashAmount: number;
  upiAmount: number;
  cardAmount: number;
  transactionId?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  paymentDate: Date;
}
@Component({
  selector: 'app-payment-details',
  standalone: true,
  imports: [BillingDiscountBoxComponent, ReactiveFormsModule, CommonModule, DiscountPercentageComponent],
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.css']
})
export class PaymentDetailsComponent {
  // --- Inputs / Outputs ---
  @Input() billId: string = '';
  @Input() parentForm!: FormGroup;
  @Output() requestDiscountEvent = new EventEmitter<void>();

  // --- Services ---
  private discountService = inject(DiscountService);

  // --- Signals ---
  amountReceived = signal(0);
  discount = signal(0);
  discountRequestPayload = signal<DiscountRequestPayload | null>(null);

  payment: PaymentEntry = {
    cashAmount: 0,
    upiAmount: 0,
    cardAmount: 0,
    transactionId: '',
    status: 'PENDING',
    paymentDate: new Date()
  };

  // --- Computed signal for remainder ---
  remainder = computed(() => {
    const total = Number(this.parentForm.get('totalAmount')?.value) || 0;
    return total - this.amountReceived() - this.discount();
  });


  get totalAmount() {
    return this.parentForm.get('totalAmount')?.value || 0;
  }

  get totalReceivedAmount(): number {
    return (this.payment.cashAmount || 0) + (this.payment.upiAmount || 0) + (this.payment.cardAmount || 0);
  }

  updateAmountReceived(): void {
    const cash = this.parentForm.get('cash')?.value || 0;
    const upi = this.parentForm.get('upi')?.value || 0;
    const card = this.parentForm.get('card')?.value || 0;

    // Update class properties
    this.payment.cashAmount = cash;
    this.payment.upiAmount = upi;
    this.payment.cardAmount = card;

    const total = cash + upi + card;

    // Update parent form
    this.parentForm.patchValue({ amountreceived: total }, { emitEvent: false });
    this.parentForm.patchValue({ paymen: this.payment }, { emitEvent: false });
    // ✅ Log and alert
    // console.log('Cash Amount:', this.cashAmount);
    // alert(`Cash Amount: ${this.cashAmount}`);
  }

  onDiscountUpdate(event: { percent: number; amount: number }) {
    // Validate and sanitize input
    const validPercent = isNaN(event.percent) ? 0 : Math.max(0, Math.min(event.percent, 100));
    const validAmount = isNaN(event.amount) ? 0 : Math.max(0, event.amount);

    // Optional: warn if something seems off
    if (event.percent > 100 || event.percent < 0) {
      console.warn('Invalid discount percent detected. Clamped to range 0–100.');
    }

    // Update form values safely
    this.parentForm.patchValue({
      discountPercent: validPercent,
      discount: validAmount
    });

    // Update signal immediately
    this.discount.set(validAmount);

    // ✅ If you want to enforce consistent value in the form:
    const discountControl = this.parentForm.get('discount');
    if (discountControl && discountControl.value !== validAmount) {
      discountControl.setValue(validAmount, { emitEvent: false });
    }
  }



  ngOnInit(): void {
    // Initialize signals from form
    this.amountReceived.set(0);
    this.discount.set(0);

    // Keep signals synced with form changes
    this.parentForm.get('amountreceived')?.valueChanges.subscribe(v => this.amountReceived.set(v || 0));
    this.parentForm.get('discount')?.valueChanges.subscribe(v => this.discount.set(v || 0));

    // Keep the 'remainder' field in sync
    effect(() => {
      const value = this.remainder();
      this.parentForm.patchValue({ remainder: value }, { emitEvent: false });
    });
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   alert("demo")
  //   if (changes['billId'] && !changes['billId'].firstChange) {
  //     // Reset the form whenever a new bill is loaded
  //     this.parentForm.reset();
  //     this.amountReceived.set(0);
  //     this.discount.set(0);
  //   }
  // }

  onDiscountDataChange(data: any) {
    // Update grandparent form automatically if needed
    console.log('Grandparent sees updated form with discount:', data);
  }


  // --- Core discount request logic ---
  async requestDiscount() {
    const discountAmount = Number(this.parentForm.get('discount')?.value || 0);
    // alert(this.parentForm.get('uhid')?.value)
    const payload: DiscountRequestPayload = {
      OutpatientBillID: extractUrlSegments()[0] ?? '',
      uhid: this.parentForm.get('uhid')?.value ?? '',
      discount: discountAmount,
      reason: this.parentForm.get('discountReason')?.value ?? '',
      discountStatus: 'pending',
      isDiscountRequested: true,
      requestedBy: getAuthUserId(),
    };

    // ✅ Update reactive signal
    this.discountRequestPayload.set(payload);

    // ✅ Guard against null
    const currentPayload = this.discountRequestPayload();
    if (!currentPayload) return;

    // ✅ Send API request (promise-style)
    await firstValueFrom(this.discountService.requestDiscount(currentPayload));
  }

  // --- Event emitter for parent communication ---
  // onDiscountClick(event: MouseEvent): void {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   this.requestDiscountEvent.emit();
  // }
}
