import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mrd',
  templateUrl: './mrd.component.html',
  imports: [ReactiveFormsModule, FormsModule, RouterModule, CommonModule],
  styleUrls: ['./mrd.component.css']
})
export class MrdComponent implements OnInit {
  mrdForm!: FormGroup; // Definite assignment
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.mrdForm = this.fb.group({
      drType: ['opd', Validators.required],
      caseNo: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)]],
      uhid: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      patientName: ['', [Validators.required, Validators.minLength(3)]],
      file: ['', Validators.required]
    });
  }

  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.mrdForm.patchValue({ file: this.selectedFile });
  }

  onSubmit() {
    if (this.mrdForm.invalid) {
      this.mrdForm.markAllAsTouched();
      return;
    }

    console.log('Form Submitted', this.mrdForm.value);
  }

  onDragOver(event: any) {
    event.preventDefault();
  }

  onDrop(event: any) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    this.selectedFile = file;
    this.mrdForm.patchValue({ file: this.selectedFile });
  }
}
