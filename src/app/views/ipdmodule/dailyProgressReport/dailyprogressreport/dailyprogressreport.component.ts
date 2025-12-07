import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
  FormArray,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { IpdService } from '../../ipdservice/ipd.service';

@Component({
  selector: 'app-dailyprogressreport',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dailyprogressreport.component.html',
  styleUrl: './dailyprogressreport.component.css',
})
export class DailyprogressreportComponent {
  progressReportForm!: FormGroup;
  userPermissions: any = {};
  ipdCase: any;
  user: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ipdservice: IpdService
  ) {
    this.progressReportForm = this.fb.group({
      uniqueHealthIdentificationId: ['', Validators.required],
      inpatientCaseId: ['', Validators.required],
      bed_id: [''],
      consultingDoctor: [''],
      DoctorName: [''],
      Date: [''],
      Time: [''],
      patient_name: [''],
      uhid: [''],
      age: [''],
      gender: [''],
      weight: [''],
      systolicBloodPressure: [''],
      diastolicBloodPressure: [''],
      bloodGroup: [''],
      temperature: [''],
      pulseRate: [''],
      spo2: [''],
      bloodSugar: [''],
      respiratoryRate: [''],
      diagnosisCase: [''],
      treatment: [''],
      advice: [''],
      createdBy: [''],
    });
  }

  ngOnInit(): void {
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'dailyProgressReport'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // Route parameters
    this.route.queryParams.subscribe((params) => {
      const ipdid = params['id'];
      if (ipdid) {
        this.patientFromCase(ipdid);
      }
    });

    const time = new Date();
    const formattedTime = time.toTimeString().split(' ')[0];
    this.progressReportForm.patchValue({
      Time: formattedTime,
    });

    const user = JSON.parse(localStorage.getItem('authUser') || '[]');
    this.user = user._id;
  }

  patientFromCase(id: string) {
    this.ipdservice.getIPDcaseById(id).subscribe({
      next: (res: any) => {
        const patient = res.data;
        this.ipdCase = patient;
        console.log('patient', patient);
        this.progressReportForm.patchValue({
          uhid: patient.uniqueHealthIdentificationId?.uhid,
          age: patient.uniqueHealthIdentificationId?.age,
          gender: patient.uniqueHealthIdentificationId?.gender,
          bed_id: patient.bed_id?.bed_number,
          consultingDoctor: patient.admittingDoctorId?.name,
          Date: new Date().toISOString().split('T')[0],
          weight: patient.vitals[0]?.weight,
          patient_name: patient.uniqueHealthIdentificationId?.patient_name,
          uniqueHealthIdentificationId:
            patient.uniqueHealthIdentificationId?._id,
          inpatientCaseId: patient._id,
          bloodGroup: patient.vitals[0]?.bloodGroup,
          createdBy: this.user,
        });
      },
      error: (err: any) => {
        console.log('Error fetching IPD case:', err);
      },
    });
  }

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.progressReportForm.invalid) {
      this.progressReportForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields before submitting.',
      });
      return;
    }

    const formData = this.progressReportForm.value;

    const payload = {
      uniqueHealthIdentificationId: formData.uniqueHealthIdentificationId,
      inpatientCaseId: formData.inpatientCaseId,
      diagnosisCase: formData.diagnosisCase,
      treatment: formData.treatment,
      advice: formData.advice,
      DoctorName: formData.DoctorName,
      Date: formData.Date,
      Time: formData.Time,
      createdBy: this.user,
      vitals: {
        systolicBloodPressure: formData.systolicBloodPressure,
        diastolicBloodPressure: formData.diastolicBloodPressure,
        bloodGroup: formData.bloodGroup,
        temperature: formData.temperature,
        weight: formData.weight,
        pulseRate: formData.pulseRate,
        spo2: formData.spo2,
        bloodSugar: formData.bloodSugar,
        respiratoryRate: formData.respiratoryRate,
      },
    };

    this.ipdservice.postProgressReport(payload).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Daily progress submitted',
          text: 'Daily progress submitted successfully.',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false,
          customClass: {
            popup: 'hospital-toast-popup',
            title: 'hospital-toast-title',
            htmlContainer: 'hospital-toast-text',
          },
        });
        this.progressReportForm.reset();
        if (res?.inpatientCaseId) {
          this.router.navigate(['/ipdpatientsummary'], {
            queryParams: { id: res?.inpatientCaseId },
          });
        } else {
          this.router.navigate(['/ipdpatientsummary']);
        }
      },
      error: (err) => {
        Swal.fire(
          'Error',
          err?.error?.message || 'Failed to submit treatment sheet',
          'error'
        );
      },
    });
  }
}
