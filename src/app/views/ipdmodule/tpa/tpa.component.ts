import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../../component/customcalendar/customcalendar.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { MasterService } from '../../mastermodule/masterservice/master.service';
import { UhidService } from '../../uhid/service/uhid.service';
import { IpdService } from '../ipdservice/ipd.service';
// import Swal from 'sweetalert2';

@Component({
  selector: 'app-tpa',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './tpa.component.html',
  styleUrl: './tpa.component.css',
})
export class TpaComponent {
  tpaform: FormGroup;
  manuallySelected = false;
  filteredPatients: any[] = [];
  inpatientcase: any[] = [];
  inpatientbills: any[] = [];
  pharmaceuticalinward: any[] = [];
  medicaltestinward: any[] = [];
  inpatientdeposit: any[] = [];
  otbills: any[] = [];
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
  editMode = false;
  opdcaseId: string | null = null;
  isSubmitting = false;
  consultingDoctor: string = '';

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private uhidService: UhidService,
    private router: Router,
    private route: ActivatedRoute,
    private ipdservice: IpdService
  ) {
    const now = new Date();

    this.tpaform = this.fb.group({
      uhid: [''],
      admitdate: [''],
      patient_type: [''],
      patient_name: [''],
      age: [''],
      ward_details: [''],
      company: [''],
      total_billing: [''],
      total_deposit: [''],
      due_amount: [''],
      cns_doc: [''],
      ref_doc: [''],

      // table form  control

      claimno: [''],
      claimamount: [0],
      remarks: [''],
      alno: [''],
      approvedamount: [0],
      deduction: [0],
      finalclaimno: [''],
      finalclaimamount: [0],
      finalremarks: [''],
      finalalno: [''],
      finalapprovedamount: [0],
      finaldeduction: [0],

      co_payment: [''],

      // paymentdetails
      paymentMode: [''],
      chequeno: [''],
      tpadeduction: [''],
      tpadeductioninr: [''],
      tpadiscount: [''],
      tpadiscountinr: [''],
      paymentrecevingdate: [''],
      chequeamount: [0],
      tds: [0],
      due: [0],

      // intembil detaisl
      patientName: ['', Validators.required],
      area: [''],
      cons_doc: [''],

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

      // formsbumit
      uniqueHealthIdentificationId: [''],
      inpatientCaseId: [''],
      // inpatientBillingId: [''],
      inpatientDepositId: [''],
    });
  }

  formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5); // 'HH:mm'
  }
  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10); // 'yyyy-MM-dd'
  }

  // uhids
  activeFilter: 'today' | 'dateRange' = 'today';
  dropdownOpen = false;

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
      (perm: any) => perm.moduleName === 'thirdPartyAdministrator'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    // tpa edit
    this.route.queryParams.subscribe((params) => {
      const tpaid = params['_id'] || null;
      this.editMode = !!tpaid;
      if (this.editMode && tpaid) {
        this.manuallySelected = true;
        this.loadtpa(tpaid);
      }
    });

    // tpa edit

    // uhid
    this.loadTodaysUHID();

    this.tpaform
      .get('patientName')
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

        this.filteredPatients = response?.intermBill?.length
          ? [response.intermBill[0]]
          : [];

        this.inpatientbills = bill?.inpatientBills || [];
        this.inpatientcase = bill?.inpatientCase || [];
        this.pharmaceuticalinward = bill?.pharmaceuticalInward || [];
        // this.medicaltestinward = Object.values(bill?.inpatientCase?.inwards || {});  // FIXED HERE ✅
        this.medicaltestinward = bill?.inpatientCase?.inwards
          ? [bill?.inpatientCase?.inwards]
          : [];
        this.inpatientdeposit = bill?.inpatientCase?.inpatientDeposits || [];
        this.otbills = bill?.operationtheatresheet || [];

        const firstCase = this.inpatientcase[0];
        this.roomcharge = firstCase?.room?.roomType?.price_per_day || '';
        this.roomNumber = firstCase?.room?.roomNumber || '';
        this.bedcharge = firstCase?.bed?.bedType?.price_per_day || '';
        this.bedNumber = firstCase?.bed?.bed_number || '';

        this.showSuggestions = this.filteredPatients.length > 0;

        console.log('🚀 Room Charge:', this.roomcharge);
        console.log('🚀 Bed Charge:', this.bedcharge);
        console.log('🚀 Inpatient Case:', this.inpatientcase);
        console.log('🚀 Inpatient Bills:', this.inpatientbills);
        console.log('🚀 Pharma Inward:', this.pharmaceuticalinward);
        console.log('🚀 Medical Inward:', this.medicaltestinward);
        console.log('🚀 OT Bills:', this.otbills);
        console.log(
          '🚀 ~ IntermbillComponent ~ .subscribe ~ this.inpatientdeposit:',
          this.inpatientdeposit
        );
      });
  }

  loadtpa(tpaid: string) {
    // Utility to format date to yyyy-MM-dd
    const toDateString = (date: string | Date | null | undefined): string => {
      if (!date) return '';
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    this.ipdservice.gettpaurl().subscribe((res: any) => {
      const tpacases = res.thirdPartyAdministrators || [];
      const tpacase = tpacases.find((p: any) => p._id === tpaid);

      console.log('🚀 ~ loadtpa ~ tpacase:', tpacase);

      if (!tpacase) {
        console.warn('TPA case not found for ID:', tpaid);
        return;
      }

      this.tpaform.patchValue({
        uhid: tpacase.uniqueHealthIdentificationId || '',
        inpatientCaseId: tpacase.inpatientCaseId || '',
        inpatientDepositId: tpacase.inpatientDepositId || '',

        claimno: tpacase.initialClaimNumber || '',
        initialClaimDate: toDateString(tpacase.initialClaimDate),
        claimamount: tpacase.initialClaimAmount || 0,
        remarks: tpacase.initialRemarks || '',
        alno: tpacase.initialAuthorizationNumber || '',
        approvedamount: tpacase.initialApprovedAmount || 0,
        deduction: tpacase.initialDeductionAmount || 0,

        finalclaimno: tpacase.finalClaimNumber || '',
        finalClaimDate: toDateString(tpacase.finalClaimDate),
        finalclaimamount: tpacase.finalClaimAmount || 0,
        finalremarks: tpacase.finalRemarks || '',
        finalalno: tpacase.finalAuthorizationNumber || '',
        finalapprovedamount: tpacase.finalApprovedAmount || 0,
        finaldeduction: tpacase.finalDeductionAmount || 0,

        co_payment: tpacase.coPaymentAmount || 0,
        paymentMode: tpacase.paymentMode || '',
        chequeno: tpacase.chequeNumber || '',
        chequeamount: tpacase.chequeAmount || 0,
        transactionId: tpacase.transactionId || '',
        paymentrecevingdate: toDateString(tpacase.paymentReceivedDate),

        tpadeduction: tpacase.totalDeductionAmount || 0,
        tpadeductioninr: tpacase.totalDeductionInRupees || 0,
        tpadiscount: tpacase.totalDiscountPercentage || 0,
        tpadiscountinr: tpacase.totalDiscountInRupees || 0,
        tds: tpacase.taxDeductedAtSource || 0,
        due: tpacase.dueBalanceAmount || 0,
      });
    });
  }

  showUHIDDropdown: boolean = false;
  uhidTodayRecords: any[] = [];
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

    const patientName = record?.uniqueHealthIdentificationId?.patient_name;

    if (!patientName) {
      console.warn('No patient name found in UHID record');
      return;
    }

    this.ipdservice
      .getPatientIntermByName(patientName)
      .subscribe((response: any) => {
        const fullPatientRecord = response?.intermBill?.[0];
        if (fullPatientRecord) {
          this.selectPatient(fullPatientRecord);
        } else {
          console.warn('No full patient record found for:', patientName);
        }

        this.showUHIDDropdown = false;
      });
  }

  selectPatient(patient: any): void {
    this.manuallySelected = true;

    const caseData = Array.isArray(patient.inpatientCase)
      ? patient.inpatientCase[0]
      : patient.inpatientCase || {};

    this.inpatientcase = [caseData];
    this.inpatientbills = patient.inpatientBills || [];
    this.pharmaceuticalinward = patient.pharmaceuticalInward || [];
    // this.medicaltestinward = Object.values(caseData.inwards || {});  // FIXED HERE ✅
    this.medicaltestinward = caseData.inwards ? [caseData.inwards] : [];

    this.otbills = patient.operationtheatresheet || [];
    // / ✅ Add this line to fix deposit patching
    this.inpatientdeposit = patient.inpatientDeposits || [];
    this.showSuggestions = false;
    this.filteredPatients = [];

    const room = caseData?.room;
    const bed = caseData?.bed;

    this.roomcharge = room?.roomType?.price_per_day || 0;
    this.roomNumber = room?.roomNumber || '';
    this.bedcharge = bed?.bedType?.price_per_day || 0;
    this.bedNumber = bed?.bed_number || '';

    const admissionDateStr = caseData?.admissionDate;
    let daysStayed = 0;

    if (admissionDateStr) {
      const admissionDate = new Date(admissionDateStr);
      const today = new Date();
      const diffInTime = today.getTime() - admissionDate.getTime();
      daysStayed = Math.ceil(diffInTime / (1000 * 3600 * 24));
    }

    caseData.daysStayed = daysStayed;

    this.roomTotal =
      daysStayed * ((+this.roomcharge || 0) + (+this.bedcharge || 0));

    this.inpatientBillsTotal = this.inpatientbills.reduce((sum, bill) => {
      return sum + (+bill.totalBillAmount || 0);
    }, 0);

    this.pharmaTotal = this.pharmaceuticalinward.reduce((sum, pharma) => {
      return sum + (+pharma.total || 0);
    }, 0);

    this.medicaltestTotal = this.medicaltestinward.reduce((sum, test) => {
      return sum + (+test.total || 0);
    }, 0);

    this.otTotal = this.otbills.reduce((sum, bill) => {
      return sum + (+bill.netAmount || 0);
    }, 0);

    this.grandTotal =
      this.roomTotal +
      this.inpatientBillsTotal +
      this.pharmaTotal +
      this.otTotal;

    this.tpaform.patchValue({
      uhid: patient.uhid || '',
      patientName: patient.patient_name,
      age: patient.age || '',
      gender: patient.gender || '',
      area: patient.area,
      mobile_no: patient.mobile_no,
      pincode: patient.pincode,
      dor: patient.dor,
      dot: patient.dot,
      dob: patient.dob,
      total_billing: this.grandTotal,
      // total_deposit: this.inpatientdeposit[0]?.amountDeposited || 0,
      total_deposit:
        patient.inpatientCase[0]?.inpatientDeposits?.amountDeposited || 0,
      uniqueHealthIdentificationId:
        patient.inpatientBills[0]?.uniqueHealthIdentificationId,
      inpatientBillingId: patient.inpatientBills[0]?._id,
      inpatientCaseId: patient.inpatientCase._id,
      inpatientDepositId: this.inpatientdeposit[0]?._id,
      admittingDoctor: patient.inpatientCase[0]?.admittingDoctor,
      cons_doc: Array.isArray(patient.inpatientCase)
        ? patient.inpatientCase[0]?.admittingDoctor?.name || ''
        : patient.inpatientCase?.admittingDoctor?.name || '',
    });
    console.log(
      '🚀 ~ TpaComponent ~ selectPatient ~ total_deposit:',
      this.tpaform.value.total_deposit
    );
  }

  onPatientInput() {
    const searchTerm = this.tpaform.get('patient_name')?.value;

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
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  resetForm(): void{
       const now = new Date();

       this.tpaform.reset({
         uhid: [''],
         admitdate: [''],
         patient_type: [''],
         patient_name: [''],
         age: [''],
         ward_details: [''],
         company: [''],
         total_billing: [''],
         total_deposit: [''],
         due_amount: [''],
         cns_doc: [''],
         ref_doc: [''],
         claimno: [''],
         claimamount: [0],
         remarks: [''],
         alno: [''],
         approvedamount: [0],
         deduction: [0],
         finalclaimno: [''],
         finalclaimamount: [0],
         finalremarks: [''],
         finalalno: [''],
         finalapprovedamount: [0],
         finaldeduction: [0],
         co_payment: [''],
         paymentMode: [''],
         chequeno: [''],
         tpadeduction: [''],
         tpadeductioninr: [''],
         tpadiscount: [''],
         tpadiscountinr: [''],
         paymentrecevingdate: [''],
         chequeamount: [0],
         tds: [0],
         due: [0],
         patientName: [''],
         area: [''],
         cons_doc: [''],
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
         uniqueHealthIdentificationId: [''],
         inpatientCaseId: [''],
         inpatientDepositId: [''],
       });
  }

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.tpaform.invalid) {
      console.log('🚀 ~ Form Invalid:', this.tpaform.invalid);
      this.tpaform.markAllAsTouched();
      return;
    }

    const raw = this.tpaform.value;

    const payload = {
      uniqueHealthIdentificationId: raw.uhid._id,
      inpatientCaseId: raw.inpatientCaseId,
      inpatientDepositId: raw.inpatientDepositId,
      initialClaimNumber: raw.claimno,
      initialClaimDate: raw.initialClaimDate,
      initialClaimAmount: raw.claimamount,
      initialRemarks: raw.remarks,
      initialAuthorizationNumber: raw.alno,
      initialApprovedAmount: raw.approvedamount,
      initialDeductionAmount: raw.deduction,
      finalClaimNumber: raw.finalclaimno,
      finalClaimDate: raw.finalClaimDate,
      finalClaimAmount: raw.finalclaimamount,
      finalRemarks: raw.finalremarks,
      finalAuthorizationNumber: raw.finalalno,
      finalApprovedAmount: raw.finalapprovedamount,
      finalDeductionAmount: raw.finaldeduction,
      coPaymentAmount: raw.co_payment,
      paymentMode: raw.paymentMode,
      chequeNumber: raw.chequeno,
      chequeAmount: raw.chequeamount,
      transactionId: '', // Optional field; use if needed
      paymentReceivedDate: raw.paymentrecevingdate,
      totalDeductionAmount: raw.tpadeduction,
      totalDeductionInRupees: raw.tpadeductioninr,
      totalDiscountPercentage: raw.tpadiscount,
      totalDiscountInRupees: raw.tpadiscountinr,
      taxDeductedAtSource: raw.tds,
      dueBalanceAmount: raw.due,
    };

    this.ipdservice.posttpaurl(payload).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'TPA Bill Created',
          text: 'TPA Bill Created Successfully.',
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
        this.tpaform.reset();
        this.router.navigateByUrl('/ipd/tpalist');
      },
      error: (err) => {
        console.error('Error creating TPA Bill:', err);
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text:
            err?.error?.message ||
            'Something went wrong while creating the TPA Bill.',
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
