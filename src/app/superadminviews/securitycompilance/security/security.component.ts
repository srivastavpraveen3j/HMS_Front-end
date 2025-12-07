import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-security',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './security.component.html',
  styleUrl: './security.component.css'
})
export class SecurityComponent {

  securityform!: FormGroup;
  uploadedFile: File | null = null;

  constructor(private fb: FormBuilder, private router: Router) {
    this.securityform = this.fb.group({
      user: ['', Validators.required],
      actionType: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      encryptionStatus: ['', Validators.required],
      certificateType: ['', Validators.required]
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.uploadedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.securityform.invalid) {
      this.securityform.markAllAsTouched();
      return;
    }
    console.log("Form Submitted", this.securityform.value, "File:", this.uploadedFile);
    // handle file upload and submission logic here
  }


}
