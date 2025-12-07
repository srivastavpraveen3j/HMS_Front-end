import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { CustomtimepickerComponent } from '../../../../component/customtimepicker/customtimepicker.component';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { IpdService } from '../../ipdservice/ipd.service';
import { BedwardroomService } from '../../../mastermodule/bedmanagement/bedservice/bedwardroom.service';
// import Swal from 'sweetalert2';
import { debounceTime, switchMap, of } from 'rxjs';
import { OpdService } from '../../../opdmodule/opdservice/opd.service';

@Component({
  selector: 'app-ipddischarge',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './ipddischarge.component.html',
  styleUrl: './ipddischarge.component.css',
})
export class IpddischargeComponent {
  ipddischargeform: FormGroup;
  manuallySelected = false;
  filteredPatients: any[] = [];
  showSuggestions = false;
  inpatientcase: any;
  inpatientbills: any[] = [];
  pharmaceuticalinward: any[] = [];
  medicaltestinward: any[] = [];
  inpatientdeposit: any[] = [];
  otbills: any[] = [];
  intermbill: any[] = [];

  bedcharge: string = '';
  bedNumber: string = '';
  roomcharge: string = '';
  roomNumber: string = '';
  roomTotal = 0;
  patient: any = {};

  inpatientBillsTotal = 0;
  medicaltestTotal = 0;
  pharmaTotal = 0;
  otTotal = 0;
  grandTotal = 0;

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private ipdservice: IpdService,
    private opdservice: OpdService,
    private router: Router,
    private route: ActivatedRoute,
    private bedwardroomservice: BedwardroomService
  ) {
    this.ipddischargeform = this.fb.group({
      uhid: ['', Validators.required],
      date: [''],
      time: [''],
      patient_name: ['', Validators.required],
      age: ['', Validators.required],
      roomno: [''],
      bedno: [''],
      hospitalbill: ['', Validators.required],
      pharmacybill: ['', Validators.required],
      discharge_date: [''],
      discharge_time: [''],
      // status: [''],
      notes: [''],
      remainder: [''],
      cons_doc: [''],
      uniqueHealthIdentificationId: [''],
      inpatientCaseId: [''],
      interimBillingId: [''],
      // treatmentOnDischarge: [''],
      // conditionOnDischarge: [''],
      // adviceOnDischarge: [''],
      // dietAdvice: [''],
      medicalCaseComplete: [false],
    });
  }

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'discharge'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    this.route.queryParams.subscribe((params) => {
      const ipdid = params['id'];
      if (ipdid) {
        this.patientFromCase(ipdid);
      }
    });

    this.ipddischargeform
      .get('patient_name')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) => {
          if (this.manuallySelected) return of({ intermBill: [] });
          return name && name.length > 2
            ? this.ipdservice.getPatientIntermByName(name)
            : of({ intermBill: [] });
        })
      )
      .subscribe((response: any) => {
        if (this.manuallySelected) return;

        const intermBillList = response?.intermBill || [];
        const uniquePatientsMap = new Map();

        intermBillList.forEach((entry: any) => {
          const uhidKey =
            typeof entry.uhid === 'object' ? entry.uhid?._id : entry.uhid;
          const currentDate = new Date(entry.date || 0).getTime();
          const existing = uniquePatientsMap.get(uhidKey);
          const existingDate = existing
            ? new Date(existing.date || 0).getTime()
            : 0;

          if (!existing || currentDate > existingDate) {
            uniquePatientsMap.set(uhidKey, entry);
          }
        });

        this.filteredPatients = Array.from(uniquePatientsMap.values());

        const bill = this.filteredPatients[0] || {};
        this.inpatientbills = bill?.inpatientBills || [];
        this.inpatientcase = bill?.inpatientCase || [];
        this.pharmaceuticalinward = bill?.pharmaceuticalInward || [];
        this.medicaltestinward = bill?.inpatientCase?.inwards || [];
        this.inpatientdeposit = bill?.inpatientCase?.inpatientDeposits || [];
        this.otbills = bill?.operationtheatresheet || [];

        const firstCase = this.inpatientcase[0];
        this.roomcharge = firstCase?.room?.roomType?.price_per_day || '';
        this.roomNumber = firstCase?.room?.roomNumber || '';
        this.bedcharge = firstCase?.bed?.bedType?.price_per_day || '';
        this.bedNumber = firstCase?.bed?.bed_number || '';

        this.showSuggestions = this.filteredPatients.length > 0;
      });

    // by uhid
    this.ipddischargeform
      .get('uhid')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) => {
          if (this.manuallySelected) return of({ intermBill: [] });
          return name && name.length > 2
            ? this.ipdservice.getPatientIntermByUhid(name)
            : of({ intermBill: [] });
        })
      )
      .subscribe((response: any) => {
        if (this.manuallySelected) return;
        this.filteringIntermBill(response);
      });

    this.ipdservice.getinpatientIntermBillhistory().subscribe((res) => {
      this.intermbill = res;
    });
  }

  filteringIntermBill(response: any) {
    const intermBillList = response?.data || [];
    const uniquePatientsMap = new Map();

    intermBillList.forEach((entry: any) => {
      console.log("ENTRY", entry);
      const uhidKey =
        typeof entry.patient.uhid === 'object' ? entry.uhid?._id : entry.patient.uhid;
      const currentDate = new Date(entry.date || 0).getTime();
      const existing = uniquePatientsMap.get(uhidKey);
      const existingDate = existing
        ? new Date(existing.date || 0).getTime()
        : 0;

      if (!existing || currentDate > existingDate) {
        uniquePatientsMap.set(uhidKey, entry);
      }
    });

    this.filteredPatients = Array.from(uniquePatientsMap.values());

    const bill = this.filteredPatients[0] || {};
    this.inpatientbills = bill?.inpatientBills || [];
    this.inpatientcase = bill?.inpatientCase || [];
    this.pharmaceuticalinward = bill?.pharmaceuticalInward || [];
    this.medicaltestinward = bill?.inpatientCase?.inwards || [];
    this.inpatientdeposit = bill?.inpatientCase?.inpatientDeposits || [];
    this.otbills = bill?.operationtheatresheet || [];

    const firstCase = this.inpatientcase[0];
    this.roomcharge = firstCase?.room?.roomType?.price_per_day || '';
    this.roomNumber = firstCase?.room?.roomNumber || '';
    this.bedcharge = firstCase?.bed?.bedType?.price_per_day || '';
    this.bedNumber = firstCase?.bed?.bed_number || '';

    console.log("filtered patient", this.filteredPatients);
    this.showSuggestions = this.filteredPatients.length > 0;
  }

  medicalCase: string = '';
  patientFromCase(id: string) {
    this.ipdservice.getIPDcaseById(id).subscribe((res) => {
      console.log("patient from case", res);
      const patient = res.data || res;
      
      const medicoCase = patient.isMedicoLegalCase;
      // Mark as manually selected to stop triggering valueChanges
      this.manuallySelected = true;
      this.showSuggestions = false; // hide suggestions immediately

      this.medicalCase = medicoCase;
      console.log("medical case", this.medicalCase);
      this.ipdservice.getPatientIntermByCaseId(id).subscribe((response) => {
        this.filteringIntermBill(response);
      });

      // Patch all values properly
      this.ipddischargeform.patchValue({
        uhid: patient.uniqueHealthIdentificationId?.uhid || '',
        patient_name: patient.uniqueHealthIdentificationId?.patient_name || '',
        age: patient.uniqueHealthIdentificationId?.age || '',
        cons_doc:
          patient?.admittingDoctorId?.name ||
          patient?.admittingDoctorId?.name ||
          '',
        inpatientCaseId: patient._id || '',
        uniqueHealthIdentificationId:
          patient.uniqueHealthIdentificationId?._id || '',
        interimBillingId: patient._id,
      });
    });
  }

  selectPatient(patient: any): void {
    // console.log('patient selected', patient);
    this.manuallySelected = true;
    this.showSuggestions = false;

    const caseData = Array.isArray(patient)
      ? patient
      : patient || {};

    // Preserve doctor name if missing
    const doctorName =
      caseData?.admittingDoctor?.name ||
      patient?.admittingDoctor?.name ||
      this.ipddischargeform.get('cons_doc')?.value;

    // Calculate totals here
    const admissionDate = caseData?.admissionDate
      ? new Date(caseData.admissionDate)
      : null;
    const daysStayed = admissionDate
      ? Math.ceil((Date.now() - admissionDate.getTime()) / (1000 * 3600 * 24))
      : 0;

    const roomCharge = caseData?.roomType?.price_per_day || 0;
    const bedCharge = caseData?.bedType?.price_per_day || 0;
    const roomTotal = daysStayed * (roomCharge + bedCharge);

    this.inpatientbills = patient.inpatientBills || [];
    this.pharmaceuticalinward = patient.pharmaceuticalInward || [];
    this.medicaltestinward = Array.isArray(caseData.inwards)
      ? caseData.inwards
      : [];
    this.otbills = patient.operationtheatresheet || [];

    const inpatientBillsTotal = this.inpatientbills.reduce(
      (sum, b) => sum + (+b.totalBillAmount || 0),
      0
    );
    const pharmaTotal = this.pharmaceuticalinward.reduce(
      (sum, p) => sum + (+p.total || 0),
      0
    );
    const otTotal = this.otbills.reduce(
      (sum, o) => sum + (+o.netAmount || 0),
      0
    );
    const grandTotal = roomTotal + inpatientBillsTotal + pharmaTotal + otTotal;

    // Patch values
    this.ipddischargeform.patchValue({
      uhid: patient.patient.uhid || '',
      patient_name: patient.patient.patient_name || '',
      age: patient.patient.age || '',
      cons_doc: doctorName, // ✅ preserved doctor name
      hospitalbill: grandTotal,
      pharmacybill: pharmaTotal,
      inpatientCaseId: caseData?._id || '',
      uniqueHealthIdentificationId: patient.patient._id || '',
      interimBillingId: patient.patient._id,
    });
  }

  onPatientInput() {
    const searchTerm = this.ipddischargeform.get('patient_name')?.value;
    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
      this.manuallySelected = false;
    }
    if (!searchTerm || searchTerm.length <= 2) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }
    this.showSuggestions = true;
  }
  onUhidInput() {
    const searchTerm = this.ipddischargeform.get('uhid')?.value;
    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
      this.manuallySelected = false;
    }
    if (!searchTerm || searchTerm.length <= 2) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }
    this.showSuggestions = true;
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => (this.showSuggestions = false), 200);
  }

  resetForm() {
    this.ipddischargeform.reset({
      uhid: '',
      date: [''],
      time: [''],
      patient_name: '',
      age: '',
      roomno: [''],
      bedno: [''],
      hospitalbill: '',
      pharmacybill: '',
      discharge_date: '',
      discharge_time: '',
      // status: [''],
      notes: [''],
      remainder: [''],
      cons_doc: [''],
      uniqueHealthIdentificationId: [''],
      inpatientCaseId: [''],
      interimBillingId: [''],
      // treatmentOnDischarge: [''],
      // conditionOnDischarge: [''],
      // adviceOnDischarge: [''],
      // dietAdvice: [''],
    });
  }

  async onSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.ipddischargeform.invalid) {
      this.ipddischargeform.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields before submitting.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
      return;
    }

    const formData = this.ipddischargeform.value;
    const inpatientCaseId = formData.inpatientCaseId;
    const bedId = this.inpatientcase?.bed?._id;

    if (this.medicalCase && !formData.medicalCaseComplete) {
      this.ipddischargeform.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please complete medical case before submitting.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
      return;
    }

    this.ipdservice.postipddischargeurl(formData).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Discharge Submitted',
          text: 'Discharge details saved successfully.',
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

        this.ipdservice
          .updateIPDcase(inpatientCaseId, { isDischarge: true })
          .subscribe({
            next: () => {
              if (bedId) {
                this.bedwardroomservice
                  .updatebed(bedId, { is_occupied: false })
                  .subscribe({
                    next: () => {
                      Swal.fire({
                        icon: 'success',
                        title: 'Bed Freed',
                        text: 'Bed marked as unoccupied.',
                        toast: true,
                        timer: 2500,
                        position: 'top-end',
                        showConfirmButton: false,
                        customClass: {
                          popup: 'hospital-toast-popup',
                          title: 'hospital-toast-title',
                          htmlContainer: 'hospital-toast-text',
                        },
                      });
                    },
                    error: (bedErr) => {
                      Swal.fire({
                        icon: 'error',
                        title: 'Bed Update Failed',
                        text:
                          bedErr?.error?.message ||
                          'Failed to update bed status.',
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

              this.ipddischargeform.reset();
              this.router.navigateByUrl('/ipd/ipddischargelist');
            },
            error: (err) => {
              Swal.fire({
                icon: 'error',
                title: 'IPD Case Update Failed',
                text: err?.error?.message || 'Failed to update IPD case.',
                customClass: {
                  popup: 'hospital-swal-popup',
                  title: 'hospital-swal-title',
                  htmlContainer: 'hospital-swal-text',
                  confirmButton: 'hospital-swal-button',
                },
              });
            },
          });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: err?.error?.message || 'Failed to submit discharge form.',
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
}
