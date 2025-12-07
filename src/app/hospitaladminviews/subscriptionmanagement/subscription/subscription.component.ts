import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import {  FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators,  } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscription',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent {

  branchForm: FormGroup;
  submittedData: any[] = [];
  showBilling = false;
  billingPlan = '1 Year Plan';
  branchRate = 5000; // flat rate per branch for example
  totalBill = 0;

  constructor(private fb: FormBuilder) {
    this.branchForm = this.fb.group({
      branches: this.fb.array([this.createBranchGroup()])
    });
  }

  get branches(): FormArray {
    return this.branchForm.get('branches') as FormArray;
  }

  createBranchGroup(): FormGroup {
    return this.fb.group({
      branchName: ['', Validators.required],
      address: ['', Validators.required],
      opdRooms: [''],
      ipdRooms: [''],
      icuRooms: [''],
      beds: [''],
      doctors: [''],
      staffs: [''],
      adminUsername: ['', Validators.required],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', Validators.required]
    });
  }

  addBranch() {
    this.branches.push(this.createBranchGroup());
  }

  removeBranch(index: number) {
    this.branches.removeAt(index);
  }

  onSubmit() {
    if (this.branchForm.valid) {
      this.submittedData = this.branchForm.value.branches;
      this.totalBill = this.submittedData.length * this.branchRate;
      this.showBilling = true;
    }
  }
}
