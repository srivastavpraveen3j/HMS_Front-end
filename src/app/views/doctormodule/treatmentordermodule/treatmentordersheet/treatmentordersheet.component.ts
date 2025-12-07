import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { CustomtimepickerComponent } from '../../../../component/customtimepicker/customtimepicker.component';
import { MedicinetimeslotComponent } from '../../../../component/medicinetimeslot/medicinetimeslot.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CustomappointmenttimepickerComponent } from '../../../../component/customappointmenttimepicker/customappointmenttimepicker.component';
import { debounceTime, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { IpdService } from '../../../ipdmodule/ipdservice/ipd.service';
import { DoctorService } from '../../doctorservice/doctor.service';
// import Swal from 'sweetalert2';
@Component({
  selector: 'app-treatmentordersheet',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './treatmentordersheet.component.html',
  styleUrl: './treatmentordersheet.component.css',
})
export class TreatmentordersheetComponent {
  treatmentordersheet: FormGroup;

  manuallySelected = false;
  filteredPatients: any[] = [];
  inpatientcase: any[] = [];
  inpatientbills: any[] = [];
  pharmaceuticalinward: any[] = [];
  patient: any = {};

  inpatientBillsTotal = 0;
  medicaltestTotal = 0;
  pharmaTotal = 0;

  showSuggestions = false;

  consultingDoctor: string = '';

  activeFilter: 'today' | 'dateRange' = 'today';
  dropdownOpen = false;
  uhidTodayRecords: any[] = [];
  ipdId: string = '';

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  constructor(
    private fb: FormBuilder,
    private ipdservice: IpdService,
    private doctorservice: DoctorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.treatmentordersheet = fb.group({
      date: [''],
      patient_name: [''],
      bedno: [''],
      age: [''],
      patient_type: [''],
      tpa: [''],
      admit_date: [''],
      cnsdoc: [''],
      refdr: [''],
      uhid: [''],
      patientName: [''],
      area: [''],
      cons_doc: [''],
      ref_doc: [''],
      total_billing: [''],
      total_deposit: [''],
      due_amount: [''],
      servicecharge: [''],
      admitdoc: [''],
      gender: [''],
      mobile_no: [''],
      pincode: [''],

      inpatientCaseId: [''],
      uniqueHealthIdentificationId: [],
      medicalId: [],
      medicalTest: [],
      doctorId: [],
    });
  }

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'treatmentHistorySheet'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    this.route.queryParams.subscribe((params) => {
      const ipdid = params['id'];
      if (ipdid) {
        this.patientFromcase(ipdid);
      }
    });

    // uhid
    this.loadTodaysUHID();

    // patient name

    this.treatmentordersheet
      .get('patient_name')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((patient_name: string) => {
          if (this.manuallySelected) return of({ intermBill: [] });
          return patient_name && patient_name.length > 2
            ? this.ipdservice.getPatientIntermByName(patient_name)
            : of({ intermBill: [] });
        })
      )
      .subscribe((response: any) => {
        if (this.manuallySelected) return;

        const bill = response?.intermBill?.[0] || {};
        this.filteredPatients = response?.intermBill || [];
        this.inpatientbills = bill?.inpatientBills || [];
        this.inpatientcase = bill?.inpatientCase || [];
        this.pharmaceuticalinward = bill?.pharmaceuticalInward || [];

        // room & bed info from first case
        const firstCase = this.inpatientcase[0];
        this.showSuggestions = this.filteredPatients.length > 0;
        console.log('🚀 Inpatient Case:', this.inpatientcase);
        console.log('🚀 Inpatient Bills:', this.inpatientbills);
        console.log('🚀 Pharma Inward:', this.pharmaceuticalinward);
      });

    // by uhid number

    this.treatmentordersheet
      .get('uhid')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((uhid: string) => {
          if (this.manuallySelected) return of({ intermBill: [] });
          return uhid && uhid.length > 2
            ? this.ipdservice.getPatientIntermByUhid(uhid)
            : of({ intermBill: [] });
        })
      )
      .subscribe((response: any) => {
        if (this.manuallySelected) return;
        this.filteredBills(response);
      });
    // by uhid number
  }

  filteredBills(response: any) {
    const bill = response?.intermBill?.[0] || {};
    this.filteredPatients = response?.intermBill || [];
    this.inpatientbills = bill?.inpatientBills || [];
    this.inpatientcase = bill?.inpatientCase || [];
    this.pharmaceuticalinward = bill?.pharmaceuticalInward || [];

    // Only show suggestions if patient was **not manually selected**
    if (!this.manuallySelected) {
      this.showSuggestions = this.filteredPatients.length > 0;
    }

    // room & bed info from first case
    const firstCase = this.inpatientcase[0];

    console.log('🚀 Inpatient Case:', this.inpatientcase);
    console.log('🚀 Inpatient Bills:', this.inpatientbills);
    console.log('🚀 Pharma Inward:', this.pharmaceuticalinward);
  }

  patientFromcase(id: string) {
    this.ipdservice.getIPDcaseById(id).subscribe({
      next: (res) => {
        console.log('ipd case treatment response', res);
        const patient = res.data || res;

        const uhid = patient.uniqueHealthIdentificationId?.uhid;
        this.ipdservice.getPatientIntermByUhid(uhid).subscribe((response) => {
          this.filteredBills(response);
        });

        this.manuallySelected = true;
        this.showSuggestions = false;

        this.treatmentordersheet.patchValue({
          uhid: patient.uniqueHealthIdentificationId?.uhid || '',
          patient_name:
            patient.uniqueHealthIdentificationId?.patient_name || '',
          patient_type: patient.patient_type,
          age: patient.uniqueHealthIdentificationId?.age || '',
          gender: patient.uniqueHealthIdentificationId?.gender || '',
          area: patient.uniqueHealthIdentificationId?.area || '',
          mobile_no: patient.uniqueHealthIdentificationId?.mobile_no || '',
          pincode: patient.uniqueHealthIdentificationId?.pincode || '',
          dor: patient.uniqueHealthIdentificationId?.dor || '',
          dot: patient.uniqueHealthIdentificationId?.dot || '',
          dob: patient.uniqueHealthIdentificationId?.dob || '',
          admittingDoctor: patient.admittingDoctorId,
          doctorId: patient.admittingDoctorId?._id,
          cons_doc: patient?.admittingDoctorId?.name || '',

          inpatientCaseId: patient._id,
          uniqueHealthIdentificationId:
            patient.uniqueHealthIdentificationId?._id,
        });
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  selectPatient(patient: any): void {
    this.manuallySelected = true;

    // Patch basic patient details to the form
    this.treatmentordersheet.patchValue({
      uhid: patient.uhid || '',
      patient_name: patient.patient_name || '',
      patient_type: patient.patient_type,
      age: patient.age || '',
      gender: patient.gender || '',
      area: patient.area || '',
      mobile_no: patient.mobile_no || '',
      pincode: patient.pincode || '',
      dor: patient.dor || '',
      dot: patient.dot || '',
      dob: patient.dob || '',
      admittingDoctor:
        patient.admittingDoctor || patient.inpatientCase[0]?.admittingDoctor,
      doctorId: Array.isArray(patient.inpatientCase)
        ? patient.inpatientCase[0]?.admittingDoctor?._id || ''
        : patient.inpatientCase?.admittingDoctor?._id,

      cons_doc: Array.isArray(patient.inpatientCase)
        ? patient.inpatientCase[0]?.admittingDoctor?.name || ''
        : patient.inpatientCase?.admittingDoctor?.name || '',

      inpatientCaseId: Array.isArray(patient.inpatientCase._id)
        ? patient.inpatientCase._id[0]
        : patient.inpatientCase._id,

      medicalId: patient.pharmaceuticalInward,
      medicalTest: patient.inpatientBills,
      uniqueHealthIdentificationId: patient._id,
    });

    // Extract single case data
    const caseData = Array.isArray(patient.inpatientCase)
      ? patient.inpatientCase[0]
      : patient.inpatientCase || {};

    this.inpatientcase = [caseData];
    this.inpatientbills = patient.inpatientBills || [];
    this.pharmaceuticalinward = patient.pharmaceuticalInward || [];

    this.showSuggestions = false;
    this.filteredPatients = [];

    // Room and bed information
    const room = caseData?.room;
    const bed = caseData?.bed;

    // 🔢 Calculate total days stayed
    const admissionDateStr = caseData?.admissionDate;
    let daysStayed = 0;

    if (admissionDateStr) {
      const admissionDate = new Date(admissionDateStr);
      const today = new Date();
      const diffInTime = today.getTime() - admissionDate.getTime();
      daysStayed = Math.ceil(diffInTime / (1000 * 3600 * 24)); // Ensure at least 1 day
    }

    // Attach to caseData for HTML use
    caseData.daysStayed = daysStayed;

    // 💵 Total from IPD bills
    this.inpatientBillsTotal = this.inpatientbills.reduce((sum, bill) => {
      return sum + (+bill.totalBillAmount || 0);
    }, 0);

    // 💊 Total from pharmaceutical inward
    this.pharmaTotal = this.pharmaceuticalinward.reduce((sum, pharma) => {
      return sum + (+pharma.total || 0);
    }, 0);

    // this.submitForm();
  }

  // uhid fo toadys
  showUHIDDropdown: boolean = false;

  loadTodaysUHID(): void {
    const today = new Date().toISOString().split('T')[0];

    this.ipdservice.getIPDcase(1, 100, '').subscribe(
      (res) => {
        console.log('FULL RESPONSE:', res);

        const allRecords = res.data.inpatientCases || [];

        this.uhidTodayRecords = allRecords.filter((record: any) => {
          // SAFER → compare admissionDate instead of createdAt
          const createdAt = new Date(record.createdAt)
            .toISOString()
            .split('T')[0];
          return createdAt === today;
        });

        console.log("Today's UHID Records:", this.uhidTodayRecords);
      },
      (err) => {
        console.error("Error loading today's UHID:", err);
      }
    );
  }

  selectPatientFromUHID(record: any): void {
    console.log('Selected from UHID dropdown:', record);
    this.selectPatient(record.uniqueHealthIdentificationId);
    this.showUHIDDropdown = false;
  }

  onPatientInput() {
    const searchTerm = this.treatmentordersheet.get('patient_name')?.value;

    // Reset the flag if user starts editing the field again
    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
      this.manuallySelected = false;
    }

    if (!searchTerm || searchTerm.length <= 2) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    // Allow API call again once flag is reset
    this.showSuggestions = true;
    // <-- Add this function to call API
  }
  onUhidInput() {
    const searchTerm = this.treatmentordersheet.get('patient_name')?.value;

    // Reset the flag if user starts editing the field again
    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
      this.manuallySelected = false;
    }

    if (!searchTerm || searchTerm.length <= 2) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    // Allow API call again once flag is reset
    this.showSuggestions = true;
    // <-- Add this function to call API
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.treatmentordersheet.invalid) {
      this.treatmentordersheet.markAllAsTouched();
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

    const formData = this.treatmentordersheet.value;

    // If you need to map formData to a custom payload, do it here
    // Example:
    const payload = {
      ...formData,
    };

    this.doctorservice.posttreatmentHistorySheetapis(payload).subscribe({
      next: (res) => {
        console.log(
          '🚀 ~ TreatmentordersheetComponent ~ this.doctorservice.posttreatmentHistorySheetapis ~ res:',
          res
        );
        Swal.fire({
          icon: 'success',
          title: 'Treatment History Saved',
          text: 'Treatment history has been saved successfully.',
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
        this.treatmentordersheet.reset();
        if (res?.inpatientCaseId) {
          this.router.navigate(['/ipdpatientsummary'], {
            queryParams: { id: res?.inpatientCaseId },
          });
        } else {
          this.router.navigate(['/ipdpatientsummary']);
        }
        // this.router.navigateByUrl('/doctor/treatmentlist');
      },
      error: (err) => {
        console.log(
          '🚀 ~ TreatmentordersheetComponent ~ this.doctorservice.posttreatmentHistorySheetapis ~ err:',
          err
        );
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text:
            err?.error?.message ||
            'Something went wrong while saving the treatment history.',
          customClass: {
            popup: 'hospital-swal-popup',
            title: 'hospital-swal-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-button',
          },
        });
      },
    });

    console.log(
      '🚀 ~ TreatmentordersheetComponent ~ OnSubmit:',
      this.treatmentordersheet.value
    );
  }
}
