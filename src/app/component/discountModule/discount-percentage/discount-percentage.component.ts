import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-discount-percentage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './discount-percentage.component.html',
  styleUrls: ['./discount-percentage.component.css']
})
export class DiscountPercentageComponent implements OnInit {
  @Input() totalAmount: number = 0;                 // total before discount
  @Input() existingDiscount: number = 0;            // in percentage if any
  @Output() discountChanged = new EventEmitter<{ percent: number, amount: number }>();

  discountForm!: FormGroup;
  finalAmount = signal(0);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.discountForm = this.fb.group({
      discountPercent: [this.existingDiscount, [Validators.min(0), Validators.max(100)]]
    });

    this.finalAmount.set(this.calculateFinalAmount());

    // Reactively update when value changes
    this.discountForm.get('discountPercent')?.valueChanges.subscribe(() => {
      this.updateFinalAmount();
    });
  }

  private calculateFinalAmount(): number {
    const percent = this.discountForm.get('discountPercent')?.value || 0;
    const discountValue = (percent / 100) * this.totalAmount;
    return discountValue;
  }

  updateFinalAmount(): void {
    const final = this.calculateFinalAmount();
    this.finalAmount.set(final);

    const percent = this.discountForm.get('discountPercent')?.value || 0;
    const discountAmount = (percent / 100) * this.totalAmount;

    this.discountChanged.emit({ percent, amount: discountAmount });
  }
}
