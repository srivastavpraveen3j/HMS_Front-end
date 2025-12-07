import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';

@Component({
  selector: 'app-doctormaster',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './doctormaster.component.html',
  styleUrl: './doctormaster.component.css'
})
export class DoctormasterComponent implements OnInit {

  doctorform: FormGroup;

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // ✅ Only name and mobile number
    this.doctorform = this.fb.group({
      name: ['', Validators.required],
      mobile_no: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    });
  }

  doctorList: any[] = [];

  ngOnInit(): void {
    const doctorId = this.route.snapshot.queryParams['_id'];
    if (doctorId) {
      this.loadDoctorData(doctorId);
    }
    this.loadDoctorList(); // ✅ Load doctor list when component initializes
  }

  loadDoctorList(): void {
    this.masterService.getDoctors().subscribe((response: any) => {
      this.doctorList = Array.isArray(response.data?.data) ? response.data.data : [];
    });
  }

  editDoctor(id: string): void {
    this.router.navigate(['/master/doctormaster'], { queryParams: { _id: id } });
  }

  async deleteDoctor(id: string): Promise<void> {
    const Swal = (await import('sweetalert2')).default;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the doctor record.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.masterService.deleteDoctor(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Doctor record has been deleted.', 'success');
            this.loadDoctorList();
          },
          error: () => Swal.fire('Error', 'Failed to delete doctor.', 'error'),
        });
      }
    });
  }

  loadDoctorData(doctorId: string): void {
    this.masterService.getDoctors().subscribe((response: any) => {
      const doctors = Array.isArray(response.data?.data) ? response.data.data : [];
      const doctor = doctors.find((doc: any) => doc._id === doctorId);
      if (doctor) {
        this.doctorform.patchValue({
          name: doctor.name,
          mobile_no: doctor.mobile_no
        });
      }
    });
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Block non-numeric keys
    }
  }

  async OnSubmit(): Promise<void> {
    const Swal = (await import('sweetalert2')).default;

    if (this.doctorform.invalid) {
      this.doctorform.markAllAsTouched();
      return;
    }

    const formData = this.doctorform.value;
    const doctorId = this.route.snapshot.queryParams['_id'];

    if (doctorId) {
      // 🔄 Update doctor
      this.masterService.updateDoctor(doctorId, formData).subscribe({
        next: () => {
          Swal.fire('Success', 'Doctor updated successfully!', 'success');
          this.router.navigateByUrl('/master/doctorlist');
        },
        error: () => Swal.fire('Error', 'Failed to update doctor.', 'error')
      });
    } else {
      // ➕ Add doctor
      this.masterService.postDoctor(formData).subscribe({
        next: () => {
          Swal.fire('Success', 'Doctor created successfully!', 'success');
          this.doctorform.reset();
          this.router.navigateByUrl('/master/doctorlist');
        },
        error: () => Swal.fire('Error', 'Failed to create doctor.', 'error')
      });
    }
  }
}
