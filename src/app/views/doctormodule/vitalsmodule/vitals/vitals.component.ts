import { IpdService } from './../../../ipdmodule/ipdservice/ipd.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { CustomtimepickerComponent } from '../../../../component/customtimepicker/customtimepicker.component';
import { DoctorService } from '../../doctorservice/doctor.service';
import { debounceTime, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { UhidService } from '../../../uhid/service/uhid.service';
// import Swal from 'sweetalert2';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { OpdService } from '../../../opdmodule/opdservice/opd.service';
import { RoleService } from '../../../mastermodule/usermaster/service/role.service';
import { BedwardroomService } from '../../../mastermodule/bedmanagement/bedservice/bedwardroom.service';
@Component({
  selector: 'app-vitals',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './vitals.component.html',
  styleUrl: './vitals.component.css',
})
export class VitalsComponent {
  vitals: FormGroup;
  doctors: any = [];
  serviceRows: any[] = [];
  manuallySelected = false;
  filteredPatients: any[] = [];
  showSuggestions = false;
  editmode = false;
  uhidData: any = {};
  user: string = '';
  constructor(
    private fb: FormBuilder,
    private doctorservice: DoctorService,
    private ipdservice: IpdService,
    private router: Router,
    private routes: ActivatedRoute,
    private masterService: MasterService,
    private uhidService: UhidService,
    private route: ActivatedRoute,
    private opdservice: OpdService,
    private role: RoleService,
    private bedservice: BedwardroomService
  ) {
    const now = new Date();

    this.vitals = fb.group({
      uhid: ['', Validators.required],
      patient_name: ['', Validators.required],
      age: ['', Validators.required],
      bed_id: [''],
      admittingDoctorId: [''],
      // doctor: [''],
      uniqueHealthIdentificationId: [''],
      inpatientCaseId: [''],
      outpatientCaseId: [''],

      // table fields
      time: [this.formatTime(now)],
      date: [this.formatDate(now)], // <-- returns 'HH:mm'
      temperature: [''],
      pulseRate: [''],
      systolicBloodPressure: [''],
      diastolicBloodPressure: [''],
      respiratoryRate: [''],
      bloodSugar: [''],
      spo2: [''],
      input: [''],
      output: [''],
      remarks: [''],
      createdBy: [''],

      oralRtf: [''],
      ivStarted: [''],
      ivInfused: [''],
      urine: [''],
      emesisRta: [''],
      drain: [''],
      stool: [''],
      weight: [''],
    });
  }

  formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5); // 'HH:mm'
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10); // 'yyyy-MM-dd'
  }

  activeFilter: 'today' | 'dateRange' = 'today';
  dropdownOpen = false;
  uhidTodayRecords: any[] = [];

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'vitals'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    const userStr = JSON.parse(localStorage.getItem('authUser') || '[]');
    this.user = userStr._id;

    this.route.queryParams.subscribe((params) => {
      const patientId = params['patientId'];
      const ipdId = params['ipdId'];
      console.log('patientid', patientId);
      if (patientId) {
        this.loadVitalByPatient(patientId);
      } else if (ipdId) {
        this.loadVitalByIpd(ipdId);
      }
    });

    // uhid
    this.loadTodaysUHID();
    // on inout of patient_name
    this.vitals
      .get('patient_name')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) => {
          if (this.manuallySelected) return of({ uhids: [] });
          return name && name.length > 2
            ? this.ipdservice.getIPDCaseByPatientName(name)
            : of({ inpatientCases: [] });
        })
      )
      .subscribe((res: any) => {
        if (this.manuallySelected) return;

        // console.log("API response:", res);

        this.filteredPatients = res?.data?.inpatientCases || [];
        // console.log("Filtered Patients:", this.filteredPatients);

        this.showSuggestions = this.filteredPatients.length > 0;
        // console.log("Show Suggestions:", this.showSuggestions);
      });

    // in uhid
    this.vitals
      .get('uhid')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) => {
          if (this.manuallySelected) return of({ uhids: [] });
          return name && name.length > 2
            ? this.ipdservice.getIPDCaseByUhid(name)
            : of({ inpatientCases: [] });
        })
      )
      .subscribe((res: any) => {
        if (this.manuallySelected) return;

        // console.log("API response:", res);

        this.filteredPatients = res?.data?.inpatientCases || [];
        // console.log("Filtered Patients:", this.filteredPatients);

        this.showSuggestions = this.filteredPatients.length > 0;
        // console.log("Show Suggestions:", this.showSuggestions);
      });
    // using uhid

    // fetch doctos
    this.role.getusers().subscribe((res) => {
      this.doctors = res.filter((u: any) => u.role?.name === 'doctor') || [];
    });

    // update vitals
    this.routes.queryParams.subscribe((params) => {
      const vitalid = params['_id'];

      if (vitalid) {
        this.editmode = true;
        this.loadVital(vitalid); // Now doctors already loaded → dropdown will patch correctly
      }
    });
  }

  // uhid fo toadys
  showUHIDDropdown: boolean = false;
  opdcaseid: string = '';

  getUhidbyId(id: any) {
    this.uhidService.getUhidById(id).subscribe({
      next: (opdcase: any) => {
        this.vitals.patchValue({
          age: opdcase?.age ?? '',
          patient_name: opdcase?.patient_name ?? '',
        });
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  isopdcase: boolean = false;
  loadVitalByPatient(patientId: string): void {
    this.isopdcase = true;
    this.opdservice.getOPDcaseById(patientId).subscribe({
      next: (opdcase: any) => {
        this.getUhidbyId(opdcase?.uniqueHealthIdentificationId?._id);
        this.opdcaseid = opdcase?._id ?? '';
        console.log('Patient data:', opdcase);
        this.vitals.patchValue({
          uhid: opdcase?.uniqueHealthIdentificationId?.uhid ?? '',
          outpatientCaseId: this.opdcaseid || '',
          uniqueHealthIdentificationId:
            opdcase?.uniqueHealthIdentificationId?._id || '',
        });
        this.manuallySelected = true; //==> prevent showing error
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  loadVitalByIpd(patientId: string): void {
    this.ipdservice.getIPDcaseById(patientId).subscribe({
      next: (res: any) => {
        console.log("==>",res);
        const ipdCase = res.data || res;
        this.vitals.patchValue({
          uhid: ipdCase?.uniqueHealthIdentificationId?.uhid ?? '',
          patient_name:
            ipdCase?.uniqueHealthIdentificationId?.patient_name ?? '',
          age: ipdCase?.uniqueHealthIdentificationId?.age ?? '',
          inpatientCaseId: ipdCase._id || '',
          uniqueHealthIdentificationId:
            ipdCase?.uniqueHealthIdentificationId?._id || '',
          bed_id: ipdCase?.bed_id?.bed_number,
          weight: ipdCase?.vitals[0]?.weight || '',
        });
        this.manuallySelected = true;
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  loadVital(vitalid: string) {
    this.doctorservice.getVitalsById(vitalid).subscribe({
      next: (res) => {
        console.log(
          '🚀 ~ VitalsComponent ~ this.doctorservice.getVitalsById ~ res:',
          res
        );

        const vital = res;
        const bedId = vital.inpatientCaseId?.bed_id || '';
        this.opdcaseid = vital?.outpatientCaseId || '';
        if (this.opdcaseid) {
          this.isopdcase = true;
        }
        console.log('Vitals', vital);

        this.getUhidbyId(vital?.uniqueHealthIdentificationId?._id);

        this.bedservice.getBedById(bedId).subscribe((res) => {
          // console.log("bed", res);
          const bed = res.data || res;

          this.vitals.patchValue({
            bloodSugar: vital.bloodSugar,
            diastolicBloodPressure: vital.diastolicBloodPressure,
            inpatientCaseId: vital.inpatientCaseId,
            input: vital.input,
            output: vital.output,
            pulseRate: vital.pulseRate,
            remarks: vital.remarks,
            respiratoryRate: vital.respiratoryRate,
            spo2: vital.spo2,
            systolicBloodPressure: vital.systolicBloodPressure,
            temperature: vital.temperature,
            oralRtf: vital.oralRtf,
            ivStarted: vital.ivStarted,
            ivInfused: vital.ivInfused,
            urine: vital.urine,
            emesisRta: vital.emesisRta,
            drain: vital.drain,
            stool: vital.stool,
            uhid: vital.uhid,
            uniqueHealthIdentificationId: vital.uniqueHealthIdentificationId,
            outpatientCaseId: this.opdcaseid || '',
            bed_id: bed.bed_number,
            createdBy: vital.createdBy,
          });
        });
        this.manuallySelected = true;
      },
      error: (err) => {
        console.log(
          '🚀 ~ VitalsComponent ~ this.doctorservice.getVitalsById ~ err:',
          err
        );
      },
    });
  }
  loadTodaysUHID(): void {
    const today = new Date().toISOString().split('T')[0];

    this.ipdservice.getIPDcase(1, 100, '').subscribe(
      (res) => {
        console.log('FULL RESPONSE:', res);

        const allRecords = res.data.inpatientCases || [];

        this.uhidTodayRecords = allRecords.filter((record: any) => {
          // SAFER → compare admissionDate instead of createdAt
          const admissionDate = new Date(record.admissionDate)
            .toISOString()
            .split('T')[0];
          return admissionDate === today;
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
    this.selectPatient(record);
    this.showUHIDDropdown = false;
  }

  selectPatient(patient: any): void {
    // console.log("Selected patient:", patient);
    this.manuallySelected = true;
    const formattedAdmissionDate = patient?.admissionDate
      ? new Date(patient.admissionDate).toISOString().split('T')[0]
      : '';
    this.vitals.patchValue({
      uhid: patient?.uniqueHealthIdentificationId?.uhid || '',
      patient_name: patient?.uniqueHealthIdentificationId?.patient_name || '',
      age: patient?.uniqueHealthIdentificationId?.age || '',
      gender: patient?.uniqueHealthIdentificationId?.gender || '',
      patientUhidId: patient?.uniqueHealthIdentificationId?._id || '',
      admissionDate: formattedAdmissionDate || '',
      bed_id: patient?.bed_id?.bed_number || '',
      admittingDoctorId: patient?.admittingDoctorId?._id || '',
      // doctor: patient?.doctor?._id || '',
      uniqueHealthIdentificationId: patient?.uniqueHealthIdentificationId?._id,
      // UHID : patient?.uniqueHealthIdentificationId?.uhid,
      inpatientCaseId: patient._id || '',
      createdBy: patient.createdBy,
    });

    this.showSuggestions = false;
    this.filteredPatients = [];
  }

  onPatientInput() {
    if (this.editmode) {
      this.filteredPatients = [];
      return;
    }

    const searchTerm = this.vitals.get('patient_name')?.value;

    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
      this.manuallySelected = false;
    }

    if (!searchTerm || searchTerm.length <= 2) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    // Re-enable suggestions visibility if filteredPatients already has data
    if (this.filteredPatients.length > 0) {
      this.showSuggestions = true;
    }
  }
  onUHIDInput() {
    const searchTerm = this.vitals.get('uhid')?.value;

    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
      this.manuallySelected = false;
    }

    if (!searchTerm || searchTerm.length <= 2) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    // Re-enable suggestions visibility if filteredPatients already has data
    if (this.filteredPatients.length > 0) {
      this.showSuggestions = true;
    }
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.vitals.invalid) {
      this.vitals.markAllAsTouched();
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

    const formValue = {
      ...this.vitals.value,
      createdBy: this.user,
      
     }
    const vitalid = this.routes.snapshot.queryParams['_id'];

    const handleSuccess = (res: any, message: string) => {
      Swal.fire({
        icon: 'success',
        title: message,
        text: 'Patient vitals have been saved successfully.',
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

      this.vitals.reset();

      // ✅ Always redirect to patient summary with outpatientCaseId
      if (res?.outpatientCaseId) {
        this.router.navigate(['/patientsummary'], {
          queryParams: { id: res.outpatientCaseId },
        });
      } else if (res?.inpatientCaseId) {
        // fallback if backend didn't send outpatientCaseId
        this.router.navigate(['/ipdpatientsummary'], {
          queryParams: { id: res.inpatientCaseId },
        });
      } else{
        this.router.navigate(['/patientsummary']);
      }
    };

    const handleError = (err: any) => {
      const rawMessage =
        err?.error?.message || 'An unknown error occurred while saving vitals.';
      const formattedMessage = rawMessage.replace(/,\s*/g, ',<br>');

      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        html: `<div style="text-align:left; max-height:300px; overflow:auto;">${formattedMessage}</div>`,
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
    };

    if (vitalid) {
      this.doctorservice.updateVitals(vitalid, formValue).subscribe({
        next: (res) => handleSuccess(res, 'Vitals Updated'),
        error: handleError,
      });
    } else {
      this.doctorservice.postVitals(formValue).subscribe({
        next: (res) => handleSuccess(res, 'Vitals Saved'),
        error: handleError,
      });
    }
  }
}
