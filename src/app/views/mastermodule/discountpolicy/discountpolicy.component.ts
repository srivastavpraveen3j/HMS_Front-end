import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PolicymasterService } from '../../../core/services/policymaster-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-discountpolicy',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule,CommonModule],
  templateUrl: './discountpolicy.component.html',
  styleUrls: ['./discountpolicy.component.css']
})
export class DiscountpolicyComponent {
  discountForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private policyService: PolicymasterService
  ) {
    this.discountForm = this.fb.group({
      name: [''],
      policyType: [''], 
      discountValue: [''],
      isActive: [false]
    });
  }

  // Helper to access policyTypes form array
  get selectedPolicyTypes(): FormArray {
    return this.discountForm.get('policyTypes') as FormArray;
  }

  onCheckboxChange(event: any) {
    const formArray: FormArray = this.selectedPolicyTypes;

    if (event.target.checked) {
      formArray.push(this.fb.control(event.target.value));
    } else {
      const index = formArray.controls.findIndex(x => x.value === event.target.value);
      formArray.removeAt(index);
    }
  }

  onSubmit() {
    if (this.discountForm.valid) {
      this.isSubmitting = true;
      this.policyService.createPolicy(this.discountForm.value).subscribe({
        next: (res) => {
          console.log('✅ Policy Created:', res);
          alert('Policy created successfully!');
          this.discountForm.reset({ isActive: false });
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('❌ Error creating policy:', err);
          alert('Failed to create policy!');
          this.isSubmitting = false;
        }
      });
    } else {
      alert('⚠️ Please fill all required fields!');
    }
  }
}
