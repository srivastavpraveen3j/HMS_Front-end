import { CustomcalendarComponent } from './../../../component/customcalendar/customcalendar.component';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomtimepickerComponent } from '../../../component/customtimepicker/customtimepicker.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IpdService } from '../../ipdmodule/ipdservice/ipd.service';
import { debounceTime, switchMap, distinctUntilChanged } from 'rxjs';
import { of } from 'rxjs';
// import Swal from 'sweetalert2';
import { DoctorService } from '../doctorservice/doctor.service';
// import { debounceTime, distinctUntilChanged } from 'rxjs';

// import jsPDF from 'jspdf'
@Component({
  selector: 'app-doctordischargesummary',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './doctordischargesummary.component.html',
  styleUrl: './doctordischargesummary.component.css',
})
export class DoctordischargesummaryComponent {
  dischargesummary: FormGroup;
  manuallySelected = false;
  filteredPatients: any[] = [];
  inpatientcase: any[] = [];
  inpatientbills: any[] = [];
  pharmaceuticalinward: any[] = [];
  medicaltestinward: any[] = [];
  inpatientdeposit: any[] = [];
  //
  diagnosissheet: any[] = [];
  treatmenthistorysheet: any[] = [];

  //
  otbills: any[] = [];
  inpatientIntermBills: any[] = [];
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
  showSuggestions = false;

  consultingDoctor: string = '';

  constructor(
    private fb: FormBuilder,
    private ipdservice: IpdService,
    private doctorservice: DoctorService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const now = new Date();
    this.dischargesummary = this.fb.group({
      uhid: ['', Validators.required],
      patientName: ['', Validators.required],
      age: [''],
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
      dor: [this.formatDate(now)],
      dot: [this.formatTime(now)],
      dob: [''],
      totalRoomCharges: [],
      totalInpatientCharges: [],
      totalPharmacyCharges: [],
      totalMedicalCharges: [],
      totalOperationTheaterCharges: [],
      grandTotalAmount: [],
      netPayableAmount: [],
      paymentMode: [],
      // summaryDetails: [],
      inpatientCaseId: [''],
      uniqueHealthIdentificationId: [],
      summaryDetails: this.fb.group({
        INITIAL_DIAGNOSIS: '',
        CLINICAL_HISTORY_EXAMINATION: '',
        SIGNIFICANT_PAST_MEDICAL_SURGICAL_FAMILY_HISTORY: '',
        CLINICAL_FINDINGS: '',
        INVESTIGATIONS_RADIOLOGY: '',
        INVESTIGATIONS_PATHOLOGY: '',
        INVESTIGATIONS_RADIATION: '',
        OPERATION_PROCEDURE: '',
        TREATMENT_GIVEN: '',
        TREATMENT_ON_DISCHARGE: '',
        CONDITION_ON_DISCHARGE: '',
        ADVICE_ON_DISCHARGE: '',
        DIET_ADVICE: '',
        FINAL_DIAGNOSIS_ICD10_CODES: '',
        STATUS: '',
      }),
    });

    // Initialize sectionContent with empty strings for consistency
    this.sections.forEach((key) => {
      this.sectionContent[key] = '';
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
      (perm: any) => perm.moduleName === 'dischargeSummary'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    this.route.queryParams.subscribe((params) => {
      const ipdid = params['id'];
      const id = params['_id'];
      if (ipdid) {
        this.patientFromcase(ipdid);
      } else if (id) {
        this.editDischargeSummary(id);
      }
    });
    // Load today's UHID (if applicable)
    this.loadTodaysUHID();

    // Patient name autocomplete with debounce and suggestion handling
    this.dischargesummary
      .get('patientName')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((name: string) => {
          if (this.manuallySelected) return of([]);
          return name && name.trim().length > 2
            ? this.ipdservice.getDischargedPatientByName(name.trim())
            : of([]);
        })
      )
      .subscribe((res: any[]) => {
        if (this.manuallySelected) return;

        this.filteredPatients = res || [];
        this.showSuggestions = this.filteredPatients.length > 0;

        const bill = res[0] || {};
        this.inpatientbills = bill?.inpatientBills || [];
        this.inpatientcase = bill?.inpatientCase ? [bill.inpatientCase] : [];
        this.pharmaceuticalinward = bill?.pharmaceuticalInward || [];
        this.medicaltestinward = bill?.inpatientCase?.inwards || [];
        this.inpatientdeposit = bill?.inpatientCase?.inpatientDeposits || [];
        this.otbills = bill?.operationtheatresheet || [];

        const firstCase = this.inpatientcase[0];
        this.roomcharge = firstCase?.room?.roomType?.price_per_day || '';
        this.roomNumber = firstCase?.room?.roomNumber || '';
        this.bedcharge = firstCase?.bed?.bedType?.price_per_day || '';
        this.bedNumber = firstCase?.bed?.bed_number || '';
      });

    // patient by uhid
    this.dischargesummary
      .get('uhid')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((name: string) => {
          if (this.manuallySelected) return of([]);
          return name && name.trim().length > 2
            ? this.ipdservice.getDischargedPatientByUhid(name.trim())
            : of([]);
        })
      )
      .subscribe((res: any[]) => {
        if (this.manuallySelected) return;

        this.filteredPatients = res || [];
        this.showSuggestions = this.filteredPatients.length > 0;

        const bill = res[0] || {};
        this.inpatientbills = bill?.inpatientBills || [];
        this.inpatientcase = bill?.inpatientCase ? [bill.inpatientCase] : [];
        this.pharmaceuticalinward = bill?.pharmaceuticalInward || [];
        this.medicaltestinward = bill?.inpatientCase?.inwards || [];
        this.inpatientdeposit = bill?.inpatientCase?.inpatientDeposits || [];
        this.otbills = bill?.operationtheatresheet || [];

        const firstCase = this.inpatientcase[0];
        this.roomcharge = firstCase?.room?.roomType?.price_per_day || '';
        this.roomNumber = firstCase?.room?.roomNumber || '';
        this.bedcharge = firstCase?.bed?.bedType?.price_per_day || '';
        this.bedNumber = firstCase?.bed?.bed_number || '';
      });

    // patient by uhid

    // Get diagnosis sheet data
    this.doctorservice.getDiagnosissheet().subscribe((res) => {
      // console.log("🚀 Diagnosis Sheet:", res);
      this.diagnosissheet = res.diagnosis ? res.diagnosis : res.data;
      console.log(
        '🚀 ~ DoctordischargesummaryComponent ~ this.doctorservice.getDiagnosissheet ~ this.diagnosissheet:',
        this.diagnosissheet
      );
    });

    // Get treatment sheet data
    this.doctorservice.gettreatmentHistorySheetapi().subscribe((res) => {
      console.log('🚀 Treatment Sheet:', res);
    });

    // Get OT notes
    this.doctorservice.getotNote().subscribe((res) => {
      console.log('🚀 OT Notes:', res);
    });

    // Get discharge summary (master data)
    this.ipdservice.getipddischargeurl().subscribe((res) => {
      console.log('🚀 Discharge Master Info:', res);
    });

    // getintermbillhistory
    this.ipdservice.getinpatientIntermBillhistory().subscribe((res) => {
      console.log(
        '🚀 ~ DoctordischargesummaryComponent ~ this.ipdservice.getinpatientIntermBillhistory ~ res:',
        res
      );
      this.inpatientIntermBills = res;
    });
  }

  // discharge fo toadys
  showUHIDDropdown: boolean = false;

  loadTodaysUHID(): void {
    const today = new Date().toISOString().split('T')[0];

    this.ipdservice.getipddischargeurl(1, 100, '').subscribe(
      (res) => {
        const allRecords = res || [];

        this.uhidTodayRecords = allRecords.filter((record: any) => {
          if (!record?.discharges?.createdAt) return false;
          const createdAt = new Date(record.discharges.createdAt)
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

  // on input patchup work

  selectPatient(patient: any): void {
    console.log('select patient===>', patient);
    this.manuallySelected = true;

    const caseData = patient.inpatientcases || {}; // from your response
    const matchedDiagnosis = this.diagnosissheet.find(
      (d) => d.patientId === patient._id
    );

    this.dischargesummary.patchValue({
      uhid: patient.uhid || '',
      patientName: patient.patient_name || '',
      age: patient.age || '',
      gender: patient.gender || '',
      area: patient.area || '',
      mobile_no: patient.mobile_no || '',
      pincode: patient.pincode || '',
      dor: patient.dor || '',
      dot: patient.dot || '',
      dob: patient.dob || '',
      admittingDoctor: caseData?.admittingDoctorId,
      cons_doc: caseData?.admittingDoctorId?.name || '',
      uniqueHealthIdentificationId:
        patient?.discharges?.uniqueHealthIdentificationId || '',
      inpatientCaseId: caseData?._id,
    });

    this.inpatientcase = [caseData];
    this.inpatientbills = []; // Update when you integrate billing
    this.pharmaceuticalinward = []; // likewise
    this.medicaltestinward = caseData?.inwards || [];
    this.otbills = []; // update later

    this.showSuggestions = false;
    this.filteredPatients = [];

    const bed = caseData?.bed_id?.[0];

    this.bedNumber = bed?.bed_number || '';
    this.bedcharge = bed?.bed_type_id?.price_per_day || 0;

    this.roomNumber = ''; // not available
    this.roomcharge = '';

    // Days stayed
    let daysStayed = 0;
    if (caseData?.admissionDate) {
      const admissionDate = new Date(caseData.admissionDate);
      const today = new Date();
      const diffInTime = today.getTime() - admissionDate.getTime();
      daysStayed = Math.max(Math.ceil(diffInTime / (1000 * 3600 * 24)), 1);
    }

    caseData.daysStayed = daysStayed;
    this.roomTotal = daysStayed * (+this.roomcharge + +this.bedcharge);

    // Grand total (currently using dummy arrays)
    this.inpatientBillsTotal = 0;
    this.pharmaTotal = 0;
    this.medicaltestTotal = 0;
    this.otTotal = 0;
    this.grandTotal = this.roomTotal;

    const uhid = patient.uhid;
    if (matchedDiagnosis) {
      this.sectionContent['INITIAL DIAGNOSIS'] =
        matchedDiagnosis.diagnosis || this.sectionContent['INITIAL DIAGNOSIS'];
      this.sectionContent['CLINICAL HISTORY & EXAMINATION'] =
        matchedDiagnosis.clinical_examination ||
        this.sectionContent['CLINICAL HISTORY & EXAMINATION'];
      this.sectionContent[
        'SIGNIFICANT PAST MEDICAL / SURGICAL / FAMILY HISTORY'
      ] =
        matchedDiagnosis.medical_history ||
        this.sectionContent[
          'SIGNIFICANT PAST MEDICAL / SURGICAL / FAMILY HISTORY'
        ];
    }
    // Call all summary APIs like before
    // this.sectionContent = {
    //   'INITIAL DIAGNOSIS': patient.discharges?.finalDiagnosis || '',
    //   'CLINICAL HISTORY & EXAMINATION':
    //     patient.discharges?.clinicalHistory || '',
    //   'SIGNIFICANT PAST MEDICAL / SURGICAL / FAMILY HISTORY':
    //     patient.discharges?.pastMedicalHistory || '',
    //   'CLINICAL FINDINGS': patient.discharges?.clinicalFindings || '',
    //   'INVESTIGATIONS - RADIOLOGY': patient.discharges?.radiology || '',
    //   'INVESTIGATIONS - PATHOLOGY': patient.discharges?.pathology || '',
    //   'INVESTIGATIONS - RADIATION': patient.discharges?.radiation || '',
    //   'OPERATION / PROCEDURE': patient.discharges?.procedure || '',
    //   'TREATMENT GIVEN': patient.discharges?.treatmentGiven || '',
    //   'TREATMENT ON DISCHARGE': patient.discharges?.treatmentOnDischarge || '',
    //   'CONDITION ON DISCHARGE': patient.discharges?.conditionOnDischarge || '',
    //   'ADVICE ON DISCHARGE': patient.discharges?.adviceOnDischarge || '',
    //   'DIET ADVICE': patient.discharges?.dietAdvice || '',
    //   'FINAL DIAGNOSIS (ICD-10 CODES)': patient.discharge?.finalDiagnosis || '',
    // };

    // Load discharge summary into form and sectionContent with consistent keys
    if (patient.discharges) {
      this.dischargesummary.get('summaryDetails')?.patchValue({
        INITIAL_DIAGNOSIS: patient.discharges.finalDiagnosis || '',
        CLINICAL_HISTORY_EXAMINATION: patient.discharges.clinicalHistory || '',
        SIGNIFICANT_PAST_MEDICAL_SURGICAL_FAMILY_HISTORY:
          patient.discharges.pastMedicalHistory || '',
        CLINICAL_FINDINGS: patient.discharges.clinicalFindings || '',
        INVESTIGATIONS_RADIOLOGY: patient.discharges.radiology || '',
        INVESTIGATIONS_PATHOLOGY: patient.discharges.pathology || '',
        INVESTIGATIONS_RADIATION: patient.discharges.radiation || '',
        OPERATION_PROCEDURE: patient.discharges.procedure || '',
        TREATMENT_GIVEN: patient.discharges.treatmentGiven || '',
        TREATMENT_ON_DISCHARGE: patient.discharges.treatmentOnDischarge || '',
        CONDITION_ON_DISCHARGE: patient.discharges.conditionOnDischarge || '',
        ADVICE_ON_DISCHARGE: patient.discharges.adviceOnDischarge || '',
        DIET_ADVICE: patient.discharges.dietAdvice || '',
        FINAL_DIAGNOSIS_ICD10_CODES: patient.discharges.finalDiagnosis || '',
        STATUS: patient.discharges.status || '',
      });

      // Sync sectionContent with form values
      this.sectionContent = {
        ...this.dischargesummary.get('summaryDetails')?.value,
      };
    }
  }

  patientFromcase(id: string) {
    this.ipdservice.getIPDcaseById(id).subscribe((res) => {
      const patient = res.data || res;
      console.log('patient ipd case id', patient);

      this.manuallySelected = true;
      this.showSuggestions = false;

      this.dischargesummary.patchValue({
        uhid: patient.uniqueHealthIdentificationId?.uhid || '',
        patientName: patient.uniqueHealthIdentificationId?.patient_name || '',
        age: patient.uniqueHealthIdentificationId?.age || '',
        gender: patient.uniqueHealthIdentificationId?.gender || '',
        area: patient.uniqueHealthIdentificationId?.area || '',
        mobile_no: patient.uniqueHealthIdentificationId?.mobile_no || '',
        pincode: patient.uniqueHealthIdentificationId?.pincode || '',
        dor: patient.uniqueHealthIdentificationId?.dor || '',
        dot: patient.uniqueHealthIdentificationId?.dot || '',
        dob: patient.uniqueHealthIdentificationId?.dob || '',
        admittingDoctor: patient?.admittingDoctorId,
        cons_doc: patient.admittingDoctorId?.name || '',
        uniqueHealthIdentificationId: patient.uniqueHealthIdentificationId?._id,
        inpatientCaseId: patient._id,
      });
    });
  }

  editDischargeSummary(id: string) {
    this.doctorservice.getdischargeSummaryById(id).subscribe({
      next: (res) => {
        const summary = res.data || res;

        this.manuallySelected = true;
        this.showSuggestions = false;

        this.dischargesummary.patchValue({
          uhid: summary.uniqueHealthIdentificationId?.uhid || '',
          patientName: summary.uniqueHealthIdentificationId?.patient_name || '',
          age: summary.uniqueHealthIdentificationId?.age || '',
          gender: summary.uniqueHealthIdentificationId?.gender || '',
          area: summary.uniqueHealthIdentificationId?.area || '',
          mobile_no: summary.uniqueHealthIdentificationId?.mobile_no || '',
          pincode: summary.uniqueHealthIdentificationId?.pincode || '',
          dor: summary.uniqueHealthIdentificationId?.dor || '',
          dot: summary.uniqueHealthIdentificationId?.dot || '',
          dob: summary.uniqueHealthIdentificationId?.dob || '',
          admittingDoctor: summary.inpatientCaseId?.admittingDoctorId,
          cons_doc: summary.inpatientCaseId?.admittingDoctorId?.name || '',
          uniqueHealthIdentificationId:
            summary.uniqueHealthIdentificationId?._id,
          inpatientCaseId: summary.inpatientCaseId?._id,
        });

           if (summary.summaryDetails) {
             this.dischargesummary.get('summaryDetails')?.patchValue({
               INITIAL_DIAGNOSIS:
                 summary.summaryDetails.INITIAL_DIAGNOSIS || '',
               CLINICAL_HISTORY_EXAMINATION:
                 summary.summaryDetails.CLINICAL_HISTORY_EXAMINATION || '',
               SIGNIFICANT_PAST_MEDICAL_SURGICAL_FAMILY_HISTORY:
                 summary.summaryDetails
                   .SIGNIFICANT_PAST_MEDICAL_SURGICAL_FAMILY_HISTORY || '',
               CLINICAL_FINDINGS:
                 summary.summaryDetails.CLINICAL_FINDINGS || '',
               INVESTIGATIONS_RADIOLOGY:
                 summary.summaryDetails.INVESTIGATIONS_RADIOLOGY || '',
               INVESTIGATIONS_PATHOLOGY:
                 summary.summaryDetails.INVESTIGATIONS_PATHOLOGY || '',
               INVESTIGATIONS_RADIATION:
                 summary.summaryDetails.INVESTIGATIONS_RADIATION || '',
               OPERATION_PROCEDURE:
                 summary.summaryDetails.OPERATION_PROCEDURE || '',
               TREATMENT_GIVEN: summary.summaryDetails.TREATMENT_GIVEN || '',
               TREATMENT_ON_DISCHARGE:
                 summary.summaryDetails.TREATMENT_ON_DISCHARGE || '',
               CONDITION_ON_DISCHARGE:
                 summary.summaryDetails.CONDITION_ON_DISCHARGE || '',
               ADVICE_ON_DISCHARGE:
                 summary.summaryDetails.ADVICE_ON_DISCHARGE || '',
               DIET_ADVICE: summary.summaryDetails.DIET_ADVICE || '',
               FINAL_DIAGNOSIS_ICD10_CODES:
                 summary.summaryDetails.FINAL_DIAGNOSIS_ICD10_CODES || '',
               STATUS: summary.summaryDetails.STATUS || '',
             });

             // Sync sectionContent with form values
             this.sectionContent = {
               ...this.dischargesummary.get('summaryDetails')?.value,
             };
           }
        console.log('Discharge summary by id', res);
      },
      error: (err) => {
        console.error('Error loading discharge summary', err);
      },
    });
  }

  hideSuggestionsTimeout: any = null;

  onPatientInput(): void {
    const searchTerm = this.dischargesummary.get('patientName')?.value;

    if (this.manuallySelected && (!searchTerm || searchTerm.length < 3)) {
      this.manuallySelected = false;
    }

    if (!searchTerm || searchTerm.length < 3) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    this.showSuggestions = true;
  }
  onUhidInput(): void {
    const searchTerm = this.dischargesummary.get('patientName')?.value;

    if (this.manuallySelected && (!searchTerm || searchTerm.length < 3)) {
      this.manuallySelected = false;
    }

    if (!searchTerm || searchTerm.length < 3) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    this.showSuggestions = true;
  }

  onFocus(): void {
    const searchTerm = this.dischargesummary.get('patientName')?.value;
    if (
      searchTerm &&
      searchTerm.length >= 3 &&
      this.filteredPatients.length > 0
    ) {
      this.showSuggestions = true;
    }
  }

  hideSuggestionsWithDelay(): void {
    this.hideSuggestionsTimeout = setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  // prepareSummaryText(): string {
  //   return this.sections
  //     .map((section) => {
  //       const content = (this.sectionContent[section] || '').trim();
  //       return content ? `${section}\n${content}` : '';
  //     })
  //     .filter((text) => text !== '')
  //     .join('\n\n');
  // }

  resetForm(): void {
    const now = new Date();
    this.dischargesummary.reset({
      uhid: [''],
      patientName: [''],
      age: [''],
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
      dor: this.formatDate(now),
      dot: this.formatTime(now),
      dob: [''],
      totalRoomCharges: [],
      totalInpatientCharges: [],
      totalPharmacyCharges: [],
      totalMedicalCharges: [],
      totalOperationTheaterCharges: [],
      grandTotalAmount: [],
      netPayableAmount: [],
      paymentMode: [],
      summaryDetails: [],
      inpatientCaseId: [],
      uniqueHealthIdentificationId: [],
    });
    this.sectionContent = {
      'INITIAL DIAGNOSIS': '',
      'CLINICAL HISTORY & EXAMINATION': '',
      'SIGNIFICANT PAST MEDICAL / SURGICAL / FAMILY HISTORY': '',
      'CLINICAL FINDINGS': '',
      'INVESTIGATIONS - RADIOLOGY': '',
      'INVESTIGATIONS - PATHOLOGY': '',
      'INVESTIGATIONS - RADIATION': '',
      'OPERATION / PROCEDURE': '',
      'TREATMENT GIVEN': '',
      'TREATMENT ON DISCHARGE': '',
      'CONDITION ON DISCHARGE': '',
      'ADVICE ON DISCHARGE': '',
      'DIET ADVICE': '',
      'FINAL DIAGNOSIS (ICD-10 CODES)': '',
      'STATUS': '',
    };
  }

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;

    // const fullSummary = this.prepareSummaryText();
    // this.dischargesummary.patchValue({ summaryDetails: fullSummary }); // ✅ Include full summary

    // const summaryForm = this.dischargesummary.get('summaryDetails')?.value;
    // console.log("summary form", summaryForm);

    // const backendPayload: any = {
    //   INITIAL_DIAGNOSIS: summaryForm['INITIAL DIAGNOSIS'] || '',
    //   CLINICAL_HISTORY_EXAMINATION:
    //     summaryForm['CLINICAL HISTORY & EXAMINATION'] || '',
    //   SIGNIFICANT_PAST_MEDICAL_SURGICAL_FAMILY_HISTORY:
    //     summaryForm['SIGNIFICANT PAST MEDICAL / SURGICAL / FAMILY HISTORY'] ||
    //     '',
    //   CLINICAL_FINDINGS: summaryForm['CLINICAL FINDINGS'] || '',
    //   INVESTIGATIONS_RADIOLOGY: summaryForm['INVESTIGATIONS - RADIOLOGY'] || '',
    //   INVESTIGATIONS_PATHOLOGY: summaryForm['INVESTIGATIONS - PATHOLOGY'] || '',
    //   INVESTIGATIONS_RADIATION: summaryForm['INVESTIGATIONS - RADIATION'] || '',
    //   OPERATION_PROCEDURE: summaryForm['OPERATION / PROCEDURE'] || '',
    //   TREATMENT_GIVEN: summaryForm['TREATMENT GIVEN'] || '',
    //   TREATMENT_ON_DISCHARGE: summaryForm['TREATMENT ON DISCHARGE'] || '',
    //   CONDITION_ON_DISCHARGE: summaryForm['CONDITION ON DISCHARGE'] || '',
    //   ADVICE_ON_DISCHARGE: summaryForm['ADVICE ON DISCHARGE'] || '',
    //   DIET_ADVICE: summaryForm['DIET ADVICE'] || '',
    //   FINAL_DIAGNOSIS_ICD10_CODES:
    //     summaryForm['FINAL DIAGNOSIS (ICD-10 CODES)'] || '',
    // };

    const summaryDetailsFG = this.dischargesummary.get(
      'summaryDetails'
    ) as FormGroup;

    // Update form controls from sectionContent
    this.sections.forEach((key) => {
      summaryDetailsFG.get(key)?.setValue(this.sectionContent[key]);
    });

    // Now get the form group's current value as an object
    const backendPayload = summaryDetailsFG.value;

    if (this.dischargesummary.invalid) {
      this.dischargesummary.markAllAsTouched();
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

    // const formData = this.dischargesummary.value;

    // const payload: any = {
    //   inpatientCaseId: formData.inpatientCaseId?._id || formData.inpatientCaseId,
    //   admissionId: formData.admissionId?._id || formData.admissionId,
    //   patientId: formData.patientId?._id || formData.patientId,
    //   consultingDoctor: formData.consultingDoctor?._id || formData.consultingDoctor,
    //   dischargeDate: formData.dischargeDate,
    //   dischargeTime: formData.dischargeTime,
    //   summaryDetails: formData.summaryDetails,
    //   uniqueHealthIdentificationId: formData.pharmaceuticalInward?.[0]?.uniqueHealthIdentificationId || ''
    //   // Add other fields as needed
    // };

    const payload = {
      ...this.dischargesummary.value,
      summaryDetails: backendPayload,
    };

    console.log('dischare summary payload', payload);

    this.route.queryParams.subscribe((params) => {
      const summaryId = params['_id'] || null;

      if (summaryId) {
        // Update existing discharge summary
        this.doctorservice
          .updatedischargeSummary(summaryId, this.dischargesummary.value)
          .subscribe({
            next: (res) => {
              Swal.fire({
                icon: 'success',
                title: 'Discharge Summary Updated',
                text: 'Discharge summary has been updated successfully.',
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
              this.dischargesummary.reset();
              if (res?.inpatientCaseId || res.data?.inpatientCaseId) {
                this.router.navigate(['/ipdpatientsummary'], {
                  queryParams: { id: res.data?.inpatientCaseId },
                });
              } else {
                this.router.navigate(['/ipdpatientsummary']);
              }
              // this.router.navigateByUrl('/doctor/doctordischargelist');
            },
            error: (err) => {
              console.error('Error updating Discharge Summary:', err);
              Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text:
                  err?.error?.message ||
                  'Something went wrong while updating the discharge summary.',
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
        // Create new discharge summary
        this.doctorservice.postdischargeSummary(payload).subscribe({
          next: (res) => {
            console.log('response after submit', res);
            Swal.fire({
              icon: 'success',
              title: 'Discharge Summary Created',
              text: 'Discharge summary has been created successfully.',
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
            this.dischargesummary.reset();
            if (res?.inpatientCaseId || res.data?.inpatientCaseId) {
              this.router.navigate(['/ipdpatientsummary'], {
                queryParams: { id: res.data?.inpatientCaseId },
              });
            } else {
              this.router.navigate(['/ipdpatientsummary']);
            }
            // this.router.navigateByUrl('/doctor/doctordischargelist');
          },
          error: (err) => {
            console.error('Error creating Discharge Summary:', err);
            Swal.fire({
              icon: 'error',
              title: 'Creation Failed',
              text:
                err?.error?.message ||
                'Something went wrong while creating the discharge summary.',
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
    });
  }

  // Use keys exactly matching form control names
  sections = [
    'INITIAL_DIAGNOSIS',
    'CLINICAL_HISTORY_EXAMINATION',
    'SIGNIFICANT_PAST_MEDICAL_SURGICAL_FAMILY_HISTORY',
    'CLINICAL_FINDINGS',
    'INVESTIGATIONS_RADIOLOGY',
    'INVESTIGATIONS_PATHOLOGY',
    'INVESTIGATIONS_RADIATION',
    'OPERATION_PROCEDURE',
    'TREATMENT_GIVEN',
    'TREATMENT_ON_DISCHARGE',
    'CONDITION_ON_DISCHARGE',
    'ADVICE_ON_DISCHARGE',
    'DIET_ADVICE',
    'FINAL_DIAGNOSIS_ICD10_CODES',
    'STATUS',
  ];

  // Display labels for sidebar
  sectionLabels: { [key: string]: string } = {
    INITIAL_DIAGNOSIS: 'INITIAL DIAGNOSIS',
    CLINICAL_HISTORY_EXAMINATION: 'CLINICAL HISTORY & EXAMINATION',
    SIGNIFICANT_PAST_MEDICAL_SURGICAL_FAMILY_HISTORY:
      'SIGNIFICANT PAST MEDICAL / SURGICAL / FAMILY HISTORY',
    CLINICAL_FINDINGS: 'CLINICAL FINDINGS',
    INVESTIGATIONS_RADIOLOGY: 'INVESTIGATIONS - RADIOLOGY',
    INVESTIGATIONS_PATHOLOGY: 'INVESTIGATIONS - PATHOLOGY',
    INVESTIGATIONS_RADIATION: 'INVESTIGATIONS - RADIATION',
    OPERATION_PROCEDURE: 'OPERATION / PROCEDURE',
    TREATMENT_GIVEN: 'TREATMENT GIVEN',
    TREATMENT_ON_DISCHARGE: 'TREATMENT ON DISCHARGE',
    CONDITION_ON_DISCHARGE: 'CONDITION ON DISCHARGE',
    ADVICE_ON_DISCHARGE: 'ADVICE ON DISCHARGE',
    DIET_ADVICE: 'DIET ADVICE',
    FINAL_DIAGNOSIS_ICD10_CODES: 'FINAL DIAGNOSIS (ICD-10 CODES)',
    STATUS: 'STATUS',
  };

  selectedSection: string = 'FINAL DIAGNOSIS (ICD-10 CODES)';
  // selectedSection: string = this.sections[0];

  sectionContent: { [key: string]: string } = {};

  selectSection(section: string) {
    this.selectedSection = section;
  }

  async saveTemplate(): Promise<void> {
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;
    const doc = new jsPDF('p', 'mm', 'a4');

    let y = 20;
    const marginLeft = 15;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Medical Discharge Summary', marginLeft, y);
    y += 10;

    // Line
    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, 200, y);
    y += 10;

    // Loop through sections and print content
    doc.setFontSize(14);

    for (const section of this.sections) {
      const content = (this.sectionContent[section] || '').trim();
      if (content !== '') {
        // Section header
        doc.setFont('helvetica', 'bold');
        doc.text(section, marginLeft, y);
        y += 7;

        // Section content (wrapped)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        const splitContent = doc.splitTextToSize(content, 180); // wrap text
        doc.text(splitContent, marginLeft, y);
        y += splitContent.length * 7;

        // Spacing between sections
        y += 5;

        // If page overflow, add new page
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      }
    }

    doc.save('medical_summary.pdf');
  }
}
