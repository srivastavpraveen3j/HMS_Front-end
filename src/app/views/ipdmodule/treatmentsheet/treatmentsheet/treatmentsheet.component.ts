import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { IpdService } from '../../ipdservice/ipd.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-treatmentsheet',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './treatmentsheet.component.html',
  styleUrl: './treatmentsheet.component.css',
})
export class TreatmentsheetComponent {
  treatmentSheetForm!: FormGroup;
  userPermissions: any = {};
  user: string = '';
  ipdCase: any;

  constructor(
    private fb: FormBuilder,
    private ipdservice: IpdService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.treatmentSheetForm = this.fb.group({
      uhid: [''],
      age: [''],
      bed_id: [''],
      patient_name: [''],
      weight: [''],
      uniqueHealthIdentificationId: [''],
      inpatientCaseId: [''],
      drug: [''],
      dose: [''],
      route: [''],
      frequency: [''],
      createdBy: [''],
      updatedBy: [''],
    });
  }

  ngOnInit(): void {
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'treatmentSheet'
    );
    this.userPermissions = uhidModule?.permissions || {};

    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      const sheetid = params['_id'];
      if (id) {
        this.patientFromCase(id);
      } else if (sheetid) {
        this.updateTreatmentSheet(sheetid);
      }
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
        this.treatmentSheetForm.patchValue({
          uhid: patient.uniqueHealthIdentificationId?.uhid,
          age: patient.uniqueHealthIdentificationId?.age,
          bed_id: patient.bed_id?.bed_number,
          weight: patient.vitals[0]?.weight,
          patient_name: patient.uniqueHealthIdentificationId?.patient_name,
          uniqueHealthIdentificationId:
            patient.uniqueHealthIdentificationId?._id,
          inpatientCaseId: patient._id,
          createdBy: this.user,
        });
      },
      error: (err: any) => {
        console.log('Error fetching IPD case:', err);
      },
    });
  }

  sheetId: string = '';
  updateTreatmentSheet(id: string) {
    this.ipdservice.getTreatmentSheetById(id).subscribe({
      next: (res: any) => {
        const sheet = res;
        this.sheetId = sheet?._id;

        console.log('Treatment sheet data by id', res);
        this.treatmentSheetForm.patchValue({
          uhid: sheet.uniqueHealthIdentificationId?.uhid,
          age: sheet.uniqueHealthIdentificationId?.age,
          bed_id: sheet.inpatientCaseId?.bed_id?.bed_number,
          weight: sheet.inpatientCaseId?.vitals[0]?.weight,
          patient_name: sheet.uniqueHealthIdentificationId?.patient_name,
          uniqueHealthIdentificationId: sheet.uniqueHealthIdentificationId?._id,
          inpatientCaseId: sheet.inpatientCaseId?._id,
          drug: sheet.drug,
          dose: sheet.dose,
          route: sheet.route,
          frequency: sheet.frequency,
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

    if (this.treatmentSheetForm.invalid) {
      this.treatmentSheetForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields before submitting.',
      });
      return;
    }

    const formData = this.treatmentSheetForm.value;

    const payload = {
      uniqueHealthIdentificationId: formData.uniqueHealthIdentificationId,
      inpatientCaseId: formData.inpatientCaseId,
      drug: formData.drug,
      dose: formData.dose,
      route: formData.route,
      frequency: formData.frequency,
      createdBy: this.user,
    };

    const updatePayload = {
      ...payload,
      updatedBy: this.user,
    };

    if (this.sheetId) {
      this.ipdservice
        .updateTreatmentsheet(this.sheetId, updatePayload)
        .subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Treatment sheet updated',
              text: 'Treatment sheet updated successfully.',
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
            this.treatmentSheetForm.reset();
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
              err?.error?.message || 'Failed to update treatment sheet',
              'error'
            );
          },
        });
    } else {
      this.ipdservice.postTreatmentsheet(payload).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Treatment sheet submitted',
            text: 'Treatment sheet submitted successfully.',
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
          this.treatmentSheetForm.reset();
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
}
