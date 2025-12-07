import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UhidService } from '../service/uhid.service';
// import Swal from 'sweetalert2';

@Component({
  selector: 'app-adduhid',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './adduhid.component.html',
  styleUrl: './adduhid.component.css',
})
export class AdduhidComponent implements OnInit {
  uhidForm: FormGroup;
  submittedData: any = null;
  generatedUhid: string = '';
  uhid: any = {};

  constructor(
    private fb: FormBuilder,
    private uhidservcie: UhidService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const now = new Date();

    this.uhidForm = this.fb.group({
      patient_name: ['', [Validators.required, Validators.minLength(2)]],
      gender: [''],
      dob: ['', Validators.required],
      age: [''],
      dot: [this.formatTime(now)],
      dor: [this.formatDate(now)],
      mobile_no: [
        '',
        [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)],
      ],
      area: [''],
      pincode: ['', [Validators.pattern(/^[1-9][0-9]{5}$/)]],
    });

  }

  formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
  userPermissions: any = {};
  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'uhid'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    this.uhidForm.get('dob')?.valueChanges.subscribe((dobValue) => {
      if (dobValue) {
        const { years, months, days } = this.calculateAge(new Date(dobValue));
        this.uhidForm.get('age')?.setValue(`${years}Y ${months}M ${days}D`);
      }
    });

    this.route.queryParams.subscribe((params) => {
      const uhidId = params['_id'];
      if (uhidId) {
        this.loadUhidData(uhidId);
      } else {
        console.log('UHID not found in query params.');
      }
    });
  }

  loadUhidData(uhidId: string) {
    this.uhidservcie.getUhidById(uhidId).subscribe({
      next: (response: any) => {
        const uhid = response; // THIS IS THE FIX

        console.log(
          '🚀 ~ AdduhidComponent ~ this.uhidservcie.getUhidById ~ uhid:',
          uhid
        );

        if (uhid) {
          this.uhidForm.patchValue({
            patient_name: uhid.patient_name || '',
            mobile_no: uhid.mobile_no || '',
            gender: uhid.gender || '',
            age: uhid.age || '',
            dob: this.formatDateToInput(uhid.dob),
            dor: this.formatDateToInput(uhid.dor),
            dot: this.formatTimeToInput(uhid.dot),
            area: uhid.area || '',
            pincode: uhid.pincode || '',
          });
        } else {
          console.log('UHID not found.');
        }
      },
      error: (err) => {
        console.error('Error loading UHID by ID:', err);
      },
    });
  }

  formatDateToInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  }

  formatTimeToInput(timeStr: string): string {
    if (!timeStr) return '';
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  }

  calculateAge(dob: Date): { years: number; months: number; days: number } {
    const today = new Date();

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    // Adjust days and months if negative
    if (days < 0) {
      months--;
      // Get days in the previous month
      const prevMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      ).getDate();
      days += prevMonth;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  resetForm(): void {
    const now = new Date();

    this.uhidForm.reset({
      dot: this.formatTime(now),
      dor: this.formatDate(now),
      patient_name: '',
      gender: '',
      age: '',
      mobile_no: '',
      area: '',
      pincode: '',
      dob: '',
    });

  }

  async onSubmit() {
    if (this.uhidForm.valid) {
      const formData = this.uhidForm.value;
      const uhidId = this.route.snapshot.queryParams['_id'];

      const Swal = (await import('sweetalert2')).default;

      if (uhidId) {
        const fullRecord = { ...formData };

        this.uhidservcie.updateuhid(uhidId, fullRecord).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'UHID Updated',
              text: 'UHID record updated successfully.',
              position: 'top-end',
              toast: true,
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'hospital-toast-popup',
                title: 'hospital-toast-title',
                htmlContainer: 'hospital-toast-text',
              },
            });
            this.uhidForm.reset();
            this.router.navigateByUrl('/uhid');
          },
          error: (error) => {
            console.error('Error updating uhid:', error);
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text:
                error?.error?.message ||
                'An error occurred while updating the UHID.',
              customClass: {
                popup: 'hospital-swal-popup',
                title: 'hospital-swal-title',
                htmlContainer: 'hospital-swal-text',
                confirmButton: 'hospital-swal-button',
              },
            });
          },
        });
      } else {
        const fullRecord = { ...formData };

        this.uhidservcie.postuhid(fullRecord).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'UHID Created',
              text: 'New UHID has been generated and saved.',
              position: 'top-end',
              toast: true,
              timer: 3500,
              showConfirmButton: false,
              customClass: {
                popup: 'hospital-toast-popup',
                title: 'hospital-toast-title',
                htmlContainer: 'hospital-toast-text',
              },
            });

            this.router.navigate(['/uhid']);
          },
          error: (err) => {
            console.error('Error creating UHID:', err);
            Swal.fire({
              icon: 'error',
              title: 'Creation Failed',
              position: 'top-end',
              toast: true,
              timer: 3500,
              text:
                err?.error?.message ||
                'An error occurred while creating the UHID.',
              customClass: {
                popup: 'hospital-swal-popup',
                title: 'hospital-swal-title',
                htmlContainer: 'hospital-swal-text',
                confirmButton: 'hospital-swal-button',
              },
            });
          },
        });
      }
    } else {
      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields before submitting.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
    }
  }

  // generateUHID(): string {
  //   const date = new Date();
  //   return `UHID-${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}-${Math.floor(Math.random() * 1000000)}`;
  // }
  // private uhidCounter: number = 1;
  //   generateUHID(): string {
  //   // const date = new Date();
  //   // const yyyy = date.getFullYear();
  //   // const mm = String(date.getMonth() + 1).padStart(2, '0');
  //   // const dd = String(date.getDate()).padStart(2, '0');
  //   const serial = String(this.uhidCounter).padStart(4, '0');

  //   this.uhidCounter++; // Increment for next UHID
  //   return `${serial}`;
  // }
}
