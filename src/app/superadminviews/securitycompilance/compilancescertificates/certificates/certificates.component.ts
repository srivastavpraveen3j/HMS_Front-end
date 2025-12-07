import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css'],
  imports : [ReactiveFormsModule, CommonModule, RouterModule]
})
export class CertificatesComponent {
  certificateForm: FormGroup;
  selectedFile: File | null = null;

  hospitals = [
    { id: 'hospital1', name: 'PP Maniya Hospital' },
    { id: 'hospital2', name: 'CarePlus Hospital' },
    { id: 'hospital3', name: 'Sunshine Healthcare' },
  ];

  certificates: any[] = [];

  constructor(private fb: FormBuilder) {
    this.certificateForm = this.fb.group({
      title: [''],
      type: ['NABH'],
      fromDate: [''],
      toDate: [''],
      assignedTo: ['all'],
      mandatory: [false]
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.certificateForm.patchValue({ file: this.selectedFile });
  }

  OnSubmit() {
    if (this.certificateForm.invalid) {
      this.certificateForm.markAllAsTouched();
      return;
    }

    console.log('Form Submitted', this.certificateForm.value);
  }

  onDragOver(event: any) {
    event.preventDefault();
  }

  onDrop(event: any) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    this.selectedFile = file;
    this.certificateForm.patchValue({ file: this.selectedFile });
  }
  getHospitalName(id: string): string {
    if (id === 'all') return 'All Hospitals';
    const hospital = this.hospitals.find(h => h.id === id);
    return hospital ? hospital.name : 'Unknown';
  }

  viewCertificate(cert: any): void {
    alert(`Viewing certificate file: ${cert.fileName}`);
    // Actual implementation would show/download the file
  }

  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }
}
