import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile-numbers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mobile-numbers.component.html',
})
export class MobileNumbersComponent {
  // Main form that holds all mobile number fields
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    // ✅ Initialize the form with one mobile number field
    this.form = this.fb.group({
      mobiles: this.fb.array([this.createMobileField()]), // start with one input field
    });
  }

  /**
   * Getter to access 'mobiles' FormArray directly
   * makes it easy to use in HTML with *ngFor
   */
  get mobiles(): FormArray {
    return this.form.get('mobiles') as FormArray;
  }

  /**
   * Creates a new FormGroup for one mobile number input
   * - Includes validation:
   *   - Required
   *   - Must start with 6, 7, 8, or 9
   *   - Must be exactly 10 digits
   */
  createMobileField(): FormGroup {
    return this.fb.group({
      number: [
        '',
        [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)],
      ],
    });
  }

  /**
   * Adds a new mobile number input dynamically
   * - Appends another FormGroup to the FormArray
   */
  addMobile(): void {
    this.mobiles.push(this.createMobileField());
  }

  /**
   * Removes a specific mobile number field
   * @param index - index of the field to remove
   */
  removeMobile(index: number): void {
    this.mobiles.removeAt(index);
  }

  /**
   * Optional helper to return formatted data (comma separated)
   * You can call this when submitting the parent form.
   */
  getFormattedMobileNumbers(): string {
    return this.mobiles.value.map((m: any) => m.number).join(',');
  }
}
