import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-ipdreturn',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './ipdreturn.component.html',
  styleUrl: './ipdreturn.component.css'
})
export class IpdreturnComponent {

  returnForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.returnForm = this.fb.group({
      billNo: ['', Validators.required],
      billAmount: ['', [Validators.required, Validators.min(1)]],
      amountReturn: ['', [Validators.required, Validators.min(1)]],
      receiverName: ['', Validators.required],
      drType: ['cash', Validators.required]
    });
  }

  onSubmit() {
    if (this.returnForm.valid) {
      console.log('Return Form Submitted:', this.returnForm.value);
      this.router.navigate(['/opd/returnlist']);
    } else {
      console.log('Form is invalid');
    }
  }

}
