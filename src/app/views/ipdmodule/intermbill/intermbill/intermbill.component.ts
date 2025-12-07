import { Component } from '@angular/core';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { debounceTime, filter, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { UhidService } from '../../../uhid/service/uhid.service';
import { IpdService } from '../../ipdservice/ipd.service';
import { BillingDiscountBoxComponent } from '../../../../component/discountModule/BillingDiscountBoxComponent/discount.component';
import {
  DiscountService,
  DiscountRequest,
} from '../../../../core/services/discount.service';
import getAuthUserId from '../../../../helper/authGetter';
import { CompanyMasterService } from '../../../mastermodule/companymaster/service/companymaster.service';
import { IndianCurrencyPipe } from '../../../../pipe/indian-currency.pipe';
import { RoomchargecalculationComponent } from '../../roomchargecalculation/roomchargecalculation.component';
import { IpdpatientinfoComponent } from '../../../../component/ipdcustomfiles/ipdpatientinfo/ipdpatientinfo.component';
import { IpdfinalbillComponent } from '../../../../component/ipdcustomfiles/ipdfinalbill/ipdfinalbill.component';
import { OtmoduleService } from '../../otsheetmodule/service/otmodule.service';
import { DateToISTPipe } from '../../../../pipe/dateformatter/date-to-ist.pipe';
import { IpdpaymentdetailsComponent } from '../../ipdpaymentdetails/ipdpaymentdetails.component';
import { VisitTypeService } from '../../../mastermodule/visitmaster/service/visit.service';

@Component({
  selector: 'app-intermbill',
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BillingDiscountBoxComponent,
    IndianCurrencyPipe,
    RoomchargecalculationComponent,
    IpdfinalbillComponent,
    DateToISTPipe,
    IpdpaymentdetailsComponent,
  ],
  templateUrl: './intermbill.component.html',
  styleUrl: './intermbill.component.css',
})
export class IntermbillComponent {
  intermbill: FormGroup;
  tab: string = 'total';

  showBillReport = false;
  showSuggestions = false;
  manuallySelected = false;

  otbills: any[] = [];
  otCharge: any[] = [];
  userPermissions: any = {};
  inpatientcase: any[] = [];
  inpatientbills: any[] = [];
  filteredPatients: any[] = [];
  medicaltestinward: any[] = [];
  pharmaceuticalinward: any[] = [];

  roomTotal = 0;
  grandTotal = 0;
  pharmaTotal = 0;
  medicaltestTotal = 0;
  inpatientBillsTotal = 0;

  dayStayed: any;
  finalRoomCharge: any;
  dailyRoomCharges: any;
  bedNumber: string = '';
  bedcharge: string = '';
  roomcharge: string = '';
  roomNumber: string = '';
  appliedCompanyRates: any;
  categorySelected: Boolean = false;

  visits: any;
  otData: any;
  doctor: any;
  deposit: any;
  roomTransfer: any;
  patientFromCase: any;
  selectedPatientBill: any;

  billNum: any;
  ipdId: string = '';
  amountInWords: any;
  patientType: string = '';
  consultingDoctor: string = '';

  // ✅ COMPANY-RELATED PROPERTIES
  isCompanyPatient: boolean = false;
  lockedRates: any = null;
  companyInfo: any = null;
  standardRoomRate: number = 0;
  standardBedRate: number = 0;
  appliedRoomRate: number = 0;
  appliedBedRate: number = 0;

  show = {
    room: false,
    bed: false,
    case: false,
    bills: false,
    pharma: false,
    test: false,
  };
  user: any;

  constructor(
    private fb: FormBuilder,
    private ipdservice: IpdService,
    private discountService: DiscountService,
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyMasterService,
    private otservice: OtmoduleService,
    private visitService: VisitTypeService
  ) {
    const now = new Date();
    this.intermbill = this.fb.group({
      _id: [''],
      reason: [''],
      discount: [''],
      patientBillingId: [''],
      discountReason: [''],
      uhid: ['', Validators.required],
      patientName: ['', Validators.required],
      age: [''],
      area: [''],
      cons_doc: [''],
      patientType: [''],
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
      netPayableAmount: [0],
      paymentMode: [],
      cashAmount: [0],
      cardAmount: [0],
      upiAmount: [0],
      transactionId: [],
      amount_received: [0],
      partialPaid: [false],
      fullPaid: [false],
    });
  }

  formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }
  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  ngOnInit(): void {
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inpatientIntermBill'
    );
    this.userPermissions = uhidModule?.permissions || {};

    const userStr = JSON.parse(localStorage.getItem('authUser') || '[]');
    this.user = userStr._id;

    this.route.queryParams.subscribe((params) => {
      const ipdid = params['id'];
      if (ipdid) {
        this.ipdId = ipdid;
        this.ipdservice
          .getPatientIntermHistoryByCaseId(ipdid)
          .subscribe((res) => {
            // console.log('Interm bill history case data', res);
            const intermHistoryData = res[0] || [];
            this.amountPaid = intermHistoryData.amount_received;
            this.intermBillId = intermHistoryData._id;
            this.billNum = intermHistoryData.billNumber;
          });
        this.getPatientFromCase(ipdid);
        this.loadOtCharge(ipdid);
        this.loadVisitsByCase(ipdid);
      }
    });

    // Patient Name valueChanges
    // this.intermbill
    //   .get('patientName')
    //   ?.valueChanges.pipe(
    //     debounceTime(300),
    //     switchMap((name: string) => {
    //       if (this.manuallySelected) return of({ intermBill: [] });
    //       return name && name.length > 2
    //         ? this.ipdservice.getPatientIntermByName(name)
    //         : of({ intermBill: [] });
    //     })
    //   )
    //   .subscribe((response: any) => {
    //     if (this.manuallySelected) return;

    //     this.filteredBill(response);
    //   });

    // UHID valueChanges
    // this.intermbill
    //   .get('uhid')
    //   ?.valueChanges.pipe(
    //     debounceTime(300),
    //     switchMap((name: string) => {
    //       if (this.manuallySelected) return of({ intermBill: [] });
    //       return name && name.length > 2
    //         ? this.ipdservice.getPatientIntermByUhid(name)
    //         : of({ intermBill: [] });
    //     })
    //   )
    //   .subscribe((response: any) => {
    //     if (this.manuallySelected) return;
    //     this.filteredBill(response);
    //   });

    // Payment Mode logic
    // this.intermbill.get('paymentMode')?.valueChanges.subscribe((value) => {
    //   const txnControl = this.intermbill.get('transactionId');
    //   if (value === 'upi') {
    //     txnControl?.setValidators([Validators.required]);
    //   } else {
    //     txnControl?.clearValidators();
    //     txnControl?.setValue('');
    //   }
    //   txnControl?.updateValueAndValidity();
    // });
  }

  // ✅ Enhanced company rate loading
  async loadCaseRates(caseId: string): Promise<void> {
    if (!caseId) {
      console.log('❌ No case ID provided for company rate loading');
      return;
    }

    try {
      // console.log(`🔍 ⭐ LOADING COMPANY RATES FOR CASE: ${caseId}`);

      const response = await this.companyService
        .getCaseLockedRates(caseId, 'IPD')
        .toPromise();
      // console.log('🔍 ⭐ FULL API RESPONSE:', response);

      if (response && response.success && response.data) {
        this.lockedRates = response.data;
        this.isCompanyPatient = true;
        this.companyInfo = response.data.companyId;

        // console.log('🏢 ✅ ⭐ COMPANY RATES LOADED SUCCESSFULLY:');
        // console.log('  Company Info:', this.companyInfo);
        // console.log('  Company Name:', this.companyInfo?.companyName);
        // console.log(
        //   '  Locked Room Type Rates:',
        //   this.lockedRates?.lockedRoomTypeRates?.length || 0
        // );
        // console.log(
        //   '  Locked Bed Type Rates:',
        //   this.lockedRates?.lockedBedTypeRates?.length || 0
        // );

        // ✅ ENHANCED LOGGING FOR DEBUGGING lockedRate vs originalRate
        if (this.lockedRates.lockedRoomTypeRates?.length > 0) {
          // console.log('🏠 ⭐ ⭐ AVAILABLE ROOM TYPE RATES:');
          this.lockedRates.lockedRoomTypeRates.forEach(
            (rate: any, index: number) => {
              // console.log(`  ${index + 1}. Room Type: "${rate.roomTypeName}"`);
              // console.log(
              //   `       🔒 Locked Rate: ₹${rate.lockedRate} (COMPANY RATE - USE THIS!)`
              // );
              // console.log(
              //   `       📊 Original Rate: ₹${rate.originalRate} (STANDARD RATE - DON'T USE!)`
              // );
              // console.log(
              //   `       🆔 ID: ${rate.roomTypeId?._id || rate.roomTypeId}`
              // );
              // console.log('  ═══════════════════════════════════════');
            }
          );
        } else {
          console.log('⚠️ No lockedRoomTypeRates found in response');
        }

        if (this.lockedRates.lockedBedTypeRates?.length > 0) {
          // console.log('🛏️ ⭐ ⭐ AVAILABLE BED TYPE RATES:');
          this.lockedRates.lockedBedTypeRates.forEach(
            (rate: any, index: number) => {
              // console.log(`  ${index + 1}. Bed Type: "${rate.bedTypeName}"`);
              // console.log(
              //   `       🔒 Locked Rate: ₹${rate.lockedRate} (COMPANY RATE - USE THIS!)`
              // );
              // console.log(
              //   `       📊 Original Rate: ₹${rate.originalRate} (STANDARD RATE - DON'T USE!)`
              // );
              // console.log(
              //   `       🆔 ID: ${rate.bedTypeId?._id || rate.bedTypeId}`
              // );
              // console.log('  ═══════════════════════════════════════');
            }
          );
        }

        // ✅ Check for assigned rates (fallback)
        if (this.lockedRates.assignedRoomRate) {
          console.log(
            '🏠 ⭐ ASSIGNED ROOM RATE (fallback):',
            this.lockedRates.assignedRoomRate
          );
        }
        if (this.lockedRates.assignedBedRate) {
          // console.log(
          //   '🛏️ ⭐ ASSIGNED BED RATE (fallback):',
          //   this.lockedRates.assignedBedRate
          // );
        }
      } else {
        console.log('❌ ⭐ NO COMPANY RATES FOUND IN API RESPONSE');
        // console.log('Response:', response);
        this.resetCompanyData();
      }
    } catch (error) {
      console.log('❌ ⭐ ERROR LOADING COMPANY RATES:', error);
      this.resetCompanyData();
    }
  }

  private resetCompanyData(): void {
    // console.log('🔄 Resetting company data');
    this.isCompanyPatient = false;
    this.lockedRates = null;
    this.companyInfo = null;
    this.appliedRoomRate = 0;
    this.appliedBedRate = 0;
    this.standardRoomRate = 0;
    this.standardBedRate = 0;
  }

  // ✅ ⭐ ⭐ CRITICAL FIX: Enhanced room rate method - LOCKS THE COMPANY RATE (₹1000)
  async getCompanyRoomRate(
    roomTypeId?: string,
    roomTypeName?: string
  ): Promise<number> {
    console.log(`🏠 ⭐ ⭐ ⭐ GETTING COMPANY ROOM RATE`);
    console.log(`  Room Type Name: "${roomTypeName}"`);
    console.log(`  Room Type ID: "${roomTypeId}"`);
    console.log(`  Is Company Patient: ${this.isCompanyPatient}`);
    console.log(`  IPD Case ID: ${this.ipdId}`);

    if (!this.isCompanyPatient || !this.ipdId) {
      console.log('❌ Not a company patient or no IPD case ID - returning 0');
      return 0;
    }

    if (!this.lockedRates) {
      console.log('❌ No locked rates available - returning 0');
      return 0;
    }

    try {
      // ✅ METHOD 1: PRIORITY - Use company configured LOCKED rates first
      if (
        this.lockedRates.lockedRoomTypeRates &&
        this.lockedRates.lockedRoomTypeRates.length > 0
      ) {
        // console.log(
        //   `🔍 ⭐ ⭐ SEARCHING IN ${this.lockedRates.lockedRoomTypeRates.length} COMPANY LOCKED ROOM RATES...`
        // );

        // ✅ CRITICAL: Search by room type name first - FOR "General" ROOM TYPE
        if (roomTypeName) {
          const normalizedSearchName = roomTypeName.toLowerCase().trim();
          // console.log(`🔍 ⭐ ⭐ SEARCHING BY NAME: "${normalizedSearchName}"`);

          const lockedRateConfig = this.lockedRates.lockedRoomTypeRates.find(
            (rateConfig: any) => {
              const normalizedRateName = rateConfig.roomTypeName
                ?.toLowerCase()
                .trim();
              const exactMatch = normalizedRateName === normalizedSearchName;
              const includesMatch =
                normalizedRateName?.includes(normalizedSearchName) ||
                normalizedSearchName.includes(normalizedRateName || '');

              // console.log(
              //   `    ⭐ ⭐ Checking Rate Config: "${rateConfig.roomTypeName}"`
              // );
              // console.log(
              //   `      🔒 LOCKED RATE: ₹${rateConfig.lockedRate} (COMPANY RATE - WANT THIS!)`
              // );
              // console.log(
              //   `      📊 Original Rate: ₹${rateConfig.originalRate} (STANDARD RATE - DON'T WANT!)`
              // );
              // console.log(
              //   `      Normalized Rate Name: "${normalizedRateName}"`
              // );
              // console.log(`      Exact Match: ${exactMatch}`);
              // console.log(`      Includes Match: ${includesMatch}`);
              // console.log('    ═══════════════════════════════════════');

              return exactMatch || includesMatch;
            }
          );

          if (lockedRateConfig) {
            console.log(
              `✅ ✅ ⭐ ⭐ ⭐ FOUND COMPANY LOCKED ROOM RATE BY NAME:`
            );
            console.log(`  Rate Name: "${lockedRateConfig.roomTypeName}"`);
            console.log(
              `  🔒 LOCKED RATE VALUE: ₹${lockedRateConfig.lockedRate} (USING THIS!)`
            );
            console.log(
              `  📊 Original Rate Value: ₹${lockedRateConfig.originalRate} (IGNORING THIS!)`
            );
            console.log(
              `  🎯 RETURNING: ₹${lockedRateConfig.lockedRate} for ${roomTypeName} room`
            );

            // ✅ ⭐ ⭐ ⭐ RETURN THE LOCKED RATE, NOT THE ORIGINAL RATE!
            return lockedRateConfig.lockedRate; // ✅ This will return ₹1000 for General room
          } else {
            console.log(
              `❌ ⭐ NO LOCKED ROOM RATE FOUND BY NAME "${roomTypeName}"`
            );
          }
        }

        // ✅ METHOD 1B: Search by ID (fallback)
        if (roomTypeId) {
          // console.log(`🔍 ⭐ ⭐ SEARCHING BY ID: ${roomTypeId}`);
          const lockedRateConfig = this.lockedRates.lockedRoomTypeRates.find(
            (rateConfig: any) => {
              const roomTypeIdToMatch =
                rateConfig.roomTypeId?._id || rateConfig.roomTypeId;
              const idMatch =
                roomTypeIdToMatch?.toString() === roomTypeId.toString();
              // console.log(
              //   `    ⭐ Checking Rate ID: ${roomTypeIdToMatch} vs ${roomTypeId} = ${idMatch}`
              // );
              // console.log(`      🔒 LOCKED RATE: ₹${rateConfig.lockedRate}`);
              return idMatch;
            }
          );

          if (lockedRateConfig) {
            // console.log(
            //   `✅ ⭐ ⭐ FOUND COMPANY LOCKED ROOM RATE BY ID: ₹${lockedRateConfig.lockedRate}`
            // );

            // ✅ ⭐ ⭐ ⭐ RETURN THE LOCKED RATE, NOT THE ORIGINAL RATE!
            return lockedRateConfig.lockedRate; // ✅ This will return ₹1000
          } else {
            console.log(`❌ ⭐ NO LOCKED ROOM RATE FOUND BY ID ${roomTypeId}`);
          }
        }
      } else {
        console.log('❌ No lockedRoomTypeRates available or empty array');
      }

      // ✅ METHOD 2: FALLBACK - Use assigned rates if configured rates not found
      if (
        this.lockedRates.assignedRoomRate &&
        this.lockedRates.assignedRoomRate.lockedRate !== undefined
      ) {
        // console.log(
        //   `⚠️ ⭐ ⭐ USING FALLBACK ASSIGNED ROOM RATE: ₹${this.lockedRates.assignedRoomRate.lockedRate}`
        // );
        return this.lockedRates.assignedRoomRate.lockedRate; // This might be ₹800
      }

      // ✅ METHOD 3: API fallback
      // console.log('🔍 ⭐ TRYING API FALLBACK FOR ROOM RATE...');
      const apiResponse = await this.companyService
        .getCaseRoomRate(this.ipdId)
        .toPromise();

      if (
        apiResponse &&
        apiResponse.success &&
        apiResponse.data?.rate !== undefined
      ) {
        // console.log(`✅ ⭐ API RETURNED ROOM RATE: ₹${apiResponse.data.rate}`);
        return apiResponse.data.rate;
      }

      console.log('❌ ⭐ ⭐ NO ROOM RATE FOUND THROUGH ANY METHOD');
      return 0;
    } catch (error) {
      console.error('❌ ⭐ ⭐ ERROR GETTING COMPANY ROOM RATE:', error);
      return 0;
    }
  }

  // ✅ ⭐ ⭐ CRITICAL FIX: Enhanced bed rate method - LOCKS THE COMPANY RATE
  async getCompanyBedRate(
    bedTypeId?: string,
    bedTypeName?: string
  ): Promise<number> {
    // console.log(
    //   `🛏️ ⭐ ⭐ GETTING COMPANY BED RATE for: "${bedTypeName}" (ID: ${bedTypeId})`
    // );

    if (!this.isCompanyPatient || !this.ipdId) {
      console.log('❌ Not a company patient or no IPD case ID - returning 0');
      return 0;
    }

    try {
      // ✅ Use locked bed type rates first - PRIORITIZE LOCKED RATE
      if (
        this.lockedRates &&
        this.lockedRates.lockedBedTypeRates &&
        this.lockedRates.lockedBedTypeRates.length > 0
      ) {
        console.log(
          `🔍 ⭐ Searching in ${this.lockedRates.lockedBedTypeRates.length} company bed rates...`
        );

        // Search by name first
        if (bedTypeName) {
          const normalizedSearchName = bedTypeName.toLowerCase().trim();
          const lockedBedRateConfig = this.lockedRates.lockedBedTypeRates.find(
            (rateConfig: any) => {
              const normalizedRateName = rateConfig.bedTypeName
                ?.toLowerCase()
                .trim();
              const exactMatch = normalizedRateName === normalizedSearchName;
              const includesMatch =
                normalizedRateName?.includes(normalizedSearchName) ||
                normalizedSearchName.includes(normalizedRateName || '');

              // console.log(
              //   `    ⭐ Checking Bed Rate: "${rateConfig.bedTypeName}"`
              // );
              // console.log(
              //   `      🔒 LOCKED RATE: ₹${rateConfig.lockedRate} (COMPANY RATE)`
              // );
              // console.log(
              //   `      📊 Original Rate: ₹${rateConfig.originalRate} (STANDARD RATE)`
              // );

              return exactMatch || includesMatch;
            }
          );

          if (lockedBedRateConfig) {
            console.log(
              `✅ ✅ ⭐ ⭐ FOUND COMPANY LOCKED BED RATE BY NAME: "${lockedBedRateConfig.bedTypeName}" = ₹${lockedBedRateConfig.lockedRate}`
            );

            // ✅ ⭐ ⭐ RETURN THE LOCKED RATE, NOT THE ORIGINAL RATE!
            return lockedBedRateConfig.lockedRate;
          }
        }

        // Search by ID
        if (bedTypeId) {
          const lockedBedRateConfig = this.lockedRates.lockedBedTypeRates.find(
            (rateConfig: any) => {
              const bedTypeIdToMatch =
                rateConfig.bedTypeId?._id || rateConfig.bedTypeId;
              return bedTypeIdToMatch?.toString() === bedTypeId.toString();
            }
          );

          if (lockedBedRateConfig) {
            console.log(
              `✅ ⭐ Found company locked bed rate by ID: ₹${lockedBedRateConfig.lockedRate}`
            );

            // ✅ ⭐ ⭐ RETURN THE LOCKED RATE, NOT THE ORIGINAL RATE!
            return lockedBedRateConfig.lockedRate;
          }
        }
      }

      // Fallback to assigned bed rate
      if (
        this.lockedRates &&
        this.lockedRates.assignedBedRate &&
        this.lockedRates.assignedBedRate.lockedRate !== undefined
      ) {
        console.log(
          `⚠️ Using fallback assigned bed rate: ₹${this.lockedRates.assignedBedRate.lockedRate}`
        );
        return this.lockedRates.assignedBedRate.lockedRate;
      }

      // API fallback
      const apiResponse = await this.companyService
        .getCaseBedRate(this.ipdId)
        .toPromise();

      if (
        apiResponse &&
        apiResponse.success &&
        apiResponse.data?.rate !== undefined
      ) {
        // console.log(`✅ API returned bed rate: ₹${apiResponse.data.rate}`);
        return apiResponse.data.rate;
      }

      console.log('❌ No bed rate found through any method');
      return 0;
    } catch (error) {
      console.error('❌ Error getting company bed rate:', error);
      return 0;
    }
  }

  // ✅ Helper methods
  getTotalSavings(): number {
    if (!this.isCompanyPatient || !this.dayStayed) return 0;
    const roomSavings = Math.max(
      0,
      (this.standardRoomRate - this.appliedRoomRate) * this.dayStayed
    );
    const bedSavings = Math.max(
      0,
      (this.standardBedRate - this.appliedBedRate) * this.dayStayed
    );
    return roomSavings + bedSavings;
  }

  isPatientCompany(patient: any): boolean {
    return (
      patient?.inpatientCase?.[0]?.patient_type === 'cashless' ||
      patient?.patient_type === 'cashless'
    );
  }

  // filtering bill for patient
  filteredBill(response: any) {
    this.filteredPatients = response?.data?.length ? [response.data[0]] : [];
    // console.log('Filtered patients', this.filteredPatients);
    return this.filteredPatients;
  }

  // onUhidInput() {
  //   const searchTerm = this.intermbill.get('uhid')?.value;
  //   if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
  //     this.manuallySelected = false;
  //   }
  //   if (!searchTerm || searchTerm.length <= 2) {
  //     this.filteredPatients = [];
  //     this.showSuggestions = false;
  //     return;
  //   }
  //   this.showSuggestions = this.filteredPatients.length > 0;
  // }

  // onPatientInput() {
  //   const searchTerm = this.intermbill.get('patientName')?.value;
  //   if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
  //     this.manuallySelected = false;
  //   }
  //   if (!searchTerm || searchTerm.length <= 2) {
  //     this.filteredPatients = [];
  //     this.showSuggestions = false;
  //     return;
  //   }
  //   this.showSuggestions = this.filteredPatients.length > 0;
  // }

  // hideSuggestionsWithDelay() {
  //   setTimeout(() => {
  //     this.showSuggestions = false;
  //   }, 200);
  // }

  loadOtCharge(id: string) {
    this.otservice.getoperationChargeByCaseId(id).subscribe({
      next: (res) => {
        this.otCharge = res || []; // ALWAYS an array
        console.log('OT Charges:', this.otCharge);
      },
      error: (err) => {
        console.error('Error loading OT Charges', err);
      },
    });
  }

  selectedLogs: any;
  amountPaid: any;
  intermBillId: any;
  // ✅ Enhanced getPatientFromCase
  async getPatientFromCase(id: string) {
    console.log('🔍 ⭐ ⭐ GETTING PATIENT FROM CASE:', id);

    this.ipdservice.getIPDcaseById(id).subscribe({
      next: async (res) => {
        const patient = res.data || res;
        this.patientFromCase = patient;
        // console.log('🔍 ⭐ ⭐ PATIENT DATA FROM API:', patient);

        const uhid = patient.uniqueHealthIdentificationId?.uhid;
        this.doctor = patient.admittingDoctorId;

        // ✅ Enhanced company detection
        const isCashlessPatient = patient?.patient_type === 'cashless';
        const hasCompanyId = !!patient?.companyId;
        const hasCompanyName = !!patient?.companyName;
        const hasLockedRatesId = !!patient?.lockedRatesId;

        // console.log('🔍 ⭐ ⭐ COMPANY DETECTION ANALYSIS:');
        // console.log(`  Is Cashless: ${isCashlessPatient}`);
        // console.log(`  Has Company ID: ${hasCompanyId}`);
        // console.log(`  Has Company Name: ${hasCompanyName}`);
        // console.log(`  Has Locked Rates ID: ${hasLockedRatesId}`);
        // console.log(`  Company Name: ${patient?.companyName}`);
        // console.log(`  Company ID: ${patient?.companyId}`);
        // console.log(`  Locked Rates ID: ${patient?.lockedRatesId}`);

        // ✅ Load company rates if cashless patient
        if (isCashlessPatient && this.ipdId) {
          // console.log('🏢 ⭐ ⭐ LOADING COMPANY RATES FOR CASHLESS PATIENT');
          await this.loadCaseRates(this.ipdId);

          // ✅ Fallback: Set basic company info if API didn't load full rates
          if (!this.isCompanyPatient && (hasCompanyId || hasCompanyName)) {
            console.log(
              '⚠️ Fallback: Setting basic company info from patient data'
            );
            this.isCompanyPatient = true;
            this.companyInfo = {
              _id: patient?.companyId,
              companyName: patient?.companyName || 'Unknown Company',
              type: 'Cashless',
            };
          }
        } else {
          console.log('📊 Patient is not cashless, using standard rates');
          this.resetCompanyData();
        }

        this.ipdservice
          .getPatientIntermByCaseId(id)
          .subscribe((response: any) => {
            // console.log('Response here from interm by case id', response);
            const data = this.filteredBill(response); // filtered result yaha milega
            this.selectPatient(data); // yaha pass kar do
          });

        // Patch patient info
        this.intermbill.patchValue({
          uhid: uhid || '',
          patientName: patient.uniqueHealthIdentificationId?.patient_name || '',
          age: patient.uniqueHealthIdentificationId?.age || '',
          gender: patient.uniqueHealthIdentificationId?.gender || '',
          area: patient.uniqueHealthIdentificationId?.area || '',
          mobile_no: patient.uniqueHealthIdentificationId?.mobile_no || '',
          pincode: patient.uniqueHealthIdentificationId?.pincode || '',
          dor: patient.uniqueHealthIdentificationId?.dor || '',
          dot: patient.uniqueHealthIdentificationId?.dot || '',
          dob: patient.uniqueHealthIdentificationId?.dob || '',
          cons_doc: patient.admittingDoctorId?.name || '',
          patientType: patient.patient_type,
        });

        this.manuallySelected = true;
        this.showSuggestions = false;
      },
      error: (err) => {
        console.error('Error loading IPD case by ID', err);
      },
    });

    this.ipdservice.getIpdRoomTransferByCase(id).subscribe((res) => {
      const roomTransferData = res;
      this.roomTransfer = roomTransferData;
      this.dailyRoomCharges = roomTransferData.dailyRoomChargeLogs;
      // console.log('🏠 Room transfer data loaded:', this.dailyRoomCharges);
    });
  }

  loadVisitsByCase(ipid: string) {
    this.visitService.getVisitByCase(ipid).subscribe({
      next: (res) => {
        this.visits = res || [];
        console.log("VISITS", this.visits);
      },
    });
  }

  hasPermanentTransfer(): boolean {
    return (this.roomTransfer?.transfers || []).some(
      (t: any) => t.transferType === 'permanent'
    );
  }

  hasTemporaryTransfer(): boolean {
    return (this.roomTransfer?.transfers || []).some(
      (t: any) => t.transferType === 'temporary' && !t.transferEndTime
    );
  }

  getPermanentTransfers() {
    return (this.roomTransfer?.transfers || []).filter(
      (t: any) => t.transferType === 'permanent'
    );
  }

  // ✅ CRITICAL FIX: Enhanced selectPatient method
  async selectPatient(patient: any): Promise<void> {
    // console.log('🔍 ⭐ ⭐ ⭐ SELECTING PATIENT:', patient);
    this.manuallySelected = true;
    this.extractServices(patient[0]);

    const base = patient?.uniqueHealthIdentificationId || patient[0];
    const caseData = Array.isArray(this.patientFromCase)
      ? this.patientFromCase || {}
      : this.patientFromCase || {};

    // console.log('🔍 ⭐ CASE DATA:', caseData);
    this.patientType =
      base?.inpatientBills?.[0]?.patient_type || caseData.patient_type;

    // ✅ Enhanced company detection for selectPatient
    const isCashlessPatient =
      this.patientType === 'cashless' || caseData?.patient_type === 'cashless';
    const hasCompanyData = caseData?.companyId || caseData?.companyName;

    // console.log('🔍 ⭐ ⭐ COMPANY DETECTION IN SELECT PATIENT:');
    // console.log(`  Is Cashless: ${isCashlessPatient}`);
    // console.log(`  Has Company Data: ${!!hasCompanyData}`);
    // console.log(`  Patient Type: ${this.patientType}`);
    // console.log(`  Case Patient Type: ${caseData?.patient_type}`);
    // console.log(`  Company Name: ${caseData?.companyName}`);
    // console.log(`  Company ID: ${caseData?.companyId}`);

    // ✅ CRITICAL: Load company rates if applicable - WITH AWAIT
    if (isCashlessPatient && this.ipdId) {
      console.log(
        '🏢 ⭐ ⭐ LOADING COMPANY RATES FOR SELECTED CASHLESS PATIENT'
      );
      await this.loadCaseRates(this.ipdId);

      // ✅ Fallback company info setting
      if (!this.isCompanyPatient && hasCompanyData) {
        console.log('⚠️ Setting fallback company info');
        this.isCompanyPatient = true;
        this.companyInfo = {
          _id: caseData?.companyId,
          companyName: caseData?.companyName || 'Unknown Company',
          type: 'Cashless',
        };
      }
    } else {
      console.log('📊 Selected patient is not cashless, using standard rates');
      this.resetCompanyData();
    }

    const totalDeposit = (patient[0]?.inpatientDeposits || []).reduce(
      (sum: number, dep: any) => sum + (+dep.amountDeposited || 0),
      0
    );
    this.deposit = totalDeposit;
    // console.log('deposit', this.deposit);

    this.inpatientcase = [caseData];
    this.inpatientbills = patient[0]?.inpatientBills || [];
    this.pharmaceuticalinward = patient[0]?.pharmaceuticalInward || [];
    this.medicaltestinward = caseData?.inwards ? [caseData.inwards] : [];
    this.otbills = patient[0]?.operationtheatresheet || [];

    // console.log('OT ENTRY', this.otbills);

    this.showSuggestions = false;
    this.filteredPatients = [];

    const room = caseData?.room_id;
    const bed = caseData?.bed_id;

    // console.log('🏠 ⭐ ROOM DATA FOR RATE CALCULATION:', room);
    // console.log('🛏️ ⭐ BED DATA FOR RATE CALCULATION:', bed);

    // ✅ CRITICAL: Room charge calculation WITH company rates - WAIT FOR COMPLETION
    await this.calculateRoomCharges(room, bed, caseData);

    // ✅ Calculate other totals
    this.calculateOtherTotals();

    // console.log('💰 ⭐ ⭐ ⭐ FINAL CALCULATION SUMMARY:');
    // console.log(`  Standard Room Rate: ₹${this.standardRoomRate}`);
    // console.log(
    //   `  Applied Room Rate: ₹${this.appliedRoomRate} (SHOULD BE ₹1000 FOR ICICI LOMBARD GENERAL)`
    // );
    // console.log(`  Standard Bed Rate: ₹${this.standardBedRate}`);
    // console.log(`  Applied Bed Rate: ₹${this.appliedBedRate}`);
    // console.log(`  Room Total: ₹${this.roomTotal}`);
    // console.log(`  Grand Total: ₹${this.grandTotal}`);
    // console.log(
    //   `  Company Patient: ${
    //     this.isCompanyPatient ? `Yes (${this.companyInfo?.companyName})` : 'No'
    //   }`
    // );
    // console.log(`  Total Savings: ₹${this.getTotalSavings()}`);
  }

  // ✅ Room charge calculation methods
  async calculateRoomCharges(
    room: any,
    bed: any,
    caseData: any
  ): Promise<void> {
    // console.log('🔍 ⭐ CALCULATING ROOM CHARGES...');

    if (
      this.roomTransfer &&
      Array.isArray(this.roomTransfer.transfers) &&
      this.roomTransfer.transfers.length > 0
    ) {
      // console.log('🔄 Using transfer charges calculation');
      await this.calculateTransferCharges(room, bed);
    } else if (this.patientFromCase?.isBedCategorySelected) {
      // console.log('🏷️ Using category charges calculation');
      await this.calculateCategoryCharges(room, bed, caseData);
    } else {
      // console.log('🏠 ⭐ Using standard room/bed charges calculation');
      await this.calculateStandardCharges(room, bed, caseData);
    }
  }

  // ✅ ⭐ ⭐ CRITICAL FIX: Standard room/bed charge calculation - USES LOCKED RATE (₹1000)
  async calculateStandardCharges(
    room: any,
    bed: any,
    caseData: any
  ): Promise<void> {
    // console.log('🏠 ⭐ ⭐ ⭐ CALCULATING STANDARD ROOM/BED CHARGES');

    // ✅ Extract STANDARD rates from API response structure (for comparison)
    let standardRoomChargePerDay = 0;
    let standardBedChargePerDay = 0;

    // Handle different API response structures for STANDARD rates
    if (room?.room_type_id?.price_per_day !== undefined) {
      standardRoomChargePerDay = room.room_type_id.price_per_day;
    } else if (room?.roomType?.price_per_day !== undefined) {
      standardRoomChargePerDay = room.roomType.price_per_day;
    }

    if (bed?.bed_type_id?.price_per_day !== undefined) {
      standardBedChargePerDay = bed.bed_type_id.price_per_day;
    } else if (bed?.bedType?.price_per_day !== undefined) {
      standardBedChargePerDay = bed.bedType.price_per_day;
    }

    // console.log('📊 ⭐ ⭐ ⭐ EXTRACTED STANDARD RATES FROM API:');
    // console.log(
    //   `  Room Type: ${room?.room_type_id?.name || room?.roomType?.name}`
    // );
    // console.log(
    //   `  📊 Standard Room Rate: ₹${standardRoomChargePerDay}/day (HOSPITAL DEFAULT)`
    // );
    // console.log(`  Bed Type: ${bed?.bed_type_id?.name || bed?.bedType?.name}`);
    // console.log(
    //   `  📊 Standard Bed Rate: ₹${standardBedChargePerDay}/day (HOSPITAL DEFAULT)`
    // );

    // Store standard rates FOR COMPARISON
    this.standardRoomRate = standardRoomChargePerDay;
    this.standardBedRate = standardBedChargePerDay;

    // ✅ ⭐ ⭐ Initialize applied rates with standard rates (will be overridden by company rates)
    let appliedRoomChargePerDay = standardRoomChargePerDay;
    let appliedBedChargePerDay = standardBedChargePerDay;

    // ✅ ⭐ ⭐ ⭐ CRITICAL: Apply company LOCKED rates if available
    if (this.isCompanyPatient) {
      // console.log(
      //   '🏢 ⭐ ⭐ ⭐ ⭐ APPLYING COMPANY LOCKED RATES TO STANDARD ROOM/BED CHARGES'
      // );
      // console.log(`   Company: ${this.companyInfo?.companyName}`);

      // ✅ ⭐ ⭐ Get company LOCKED room rate - CRITICAL FOR ICICI LOMBARD GENERAL ROOM
      const companyLockedRoomRate = await this.getCompanyRoomRate(
        room?.room_type_id?._id || room?.roomType?._id,
        room?.room_type_id?.name || room?.roomType?.name
      );

      const companyLockedBedRate = await this.getCompanyBedRate(
        bed?.bed_type_id?._id || bed?.bedType?._id,
        bed?.bed_type_id?.name || bed?.bedType?.name
      );

      // console.log(`💰 ⭐ ⭐ ⭐ ⭐ COMPANY LOCKED RATES RECEIVED:`);
      // console.log(
      //   `  🔒 Company LOCKED Room Rate: ₹${companyLockedRoomRate}/day (SHOULD BE ₹1000 FOR GENERAL)`
      // );
      // console.log(`  🔒 Company LOCKED Bed Rate: ₹${companyLockedBedRate}/day`);

      // ✅ ⭐ ⭐ ⭐ Apply company LOCKED room rate if available and valid
      if (companyLockedRoomRate > 0) {
        appliedRoomChargePerDay = companyLockedRoomRate;
        // console.log(
        //   `✅ ✅ ⭐ ⭐ ⭐ ⭐ COMPANY LOCKED ROOM RATE APPLIED: ₹${appliedRoomChargePerDay}/day (was ₹${standardRoomChargePerDay})`
        // );
        // console.log(
        //   `    🎯 SUCCESS: Using ₹${companyLockedRoomRate} instead of ₹${standardRoomChargePerDay}!`
        // );
      } else {
        // console.log(
        //   `⚠️ ⭐ No valid company locked room rate found, using standard: ₹${standardRoomChargePerDay}/day`
        // );
      }

      // ✅ ⭐ ⭐ Apply company LOCKED bed rate if available
      if (companyLockedBedRate >= 0) {
        // Allow 0 for company bed rates
        appliedBedChargePerDay = companyLockedBedRate;
        console.log(
          `✅ ✅ ⭐ ⭐ ⭐ ⭐ COMPANY LOCKED BED RATE APPLIED: ₹${appliedBedChargePerDay}/day (was ₹${standardBedChargePerDay})`
        );
      } else {
        console.log(
          `⚠️ ⭐ No valid company locked bed rate found, using standard: ₹${standardBedChargePerDay}/day`
        );
      }
    }

    // ✅ Set applied rates
    this.appliedRoomRate = appliedRoomChargePerDay;
    this.appliedBedRate = appliedBedChargePerDay;
    this.roomcharge = appliedRoomChargePerDay.toString();
    this.roomNumber = room?.roomNumber || '';
    this.bedcharge = appliedBedChargePerDay.toString();
    this.bedNumber = bed?.bed_number || '';

    // Calculate days stayed
    let daysStayed = 0;
    const admissionDateStr = caseData?.admissionDate;
    if (admissionDateStr) {
      const admissionDate = new Date(admissionDateStr);
      const today = new Date();
      const diffInTime = today.getTime() - admissionDate.getTime();
      daysStayed = Math.ceil(diffInTime / (1000 * 3600 * 24));
    }

    caseData.daysStayed = daysStayed;
    this.dayStayed = daysStayed;

    // ✅ ⭐ ⭐ Calculate total using applied (company locked) rates
    this.roomTotal =
      daysStayed * (appliedRoomChargePerDay + appliedBedChargePerDay);

    // console.log('💰 ⭐ ⭐ ⭐ ⭐ FINAL STANDARD ROOM/BED CALCULATION:');
    // console.log(
    //   `  📊 Standard Room Rate: ₹${this.standardRoomRate}/day (Hospital Default)`
    // );
    // console.log(
    //   `  🔒 Applied Room Rate: ₹${this.appliedRoomRate}/day (COMPANY LOCKED RATE)`
    // );
    // console.log(
    //   `  📊 Standard Bed Rate: ₹${this.standardBedRate}/day (Hospital Default)`
    // );
    // console.log(
    //   `  🔒 Applied Bed Rate: ₹${this.appliedBedRate}/day (COMPANY LOCKED RATE)`
    // );
    // console.log(`  📅 Days Stayed: ${daysStayed}`);
    // console.log(`  💰 Room Total: ₹${this.roomTotal}`);
    // console.log(
    //   `  🎯 Expected for ICICI General: ₹${
    //     this.isCompanyPatient ? '1000' : '800'
    //   } room rate`
    // );

    // ✅ VALIDATION CHECK
    if (this.isCompanyPatient && this.appliedRoomRate === 1000) {
      console.log(
        '✅ ✅ ✅ SUCCESS! Company locked rate of ₹1000 is being used for General room!'
      );
    } else if (this.isCompanyPatient && this.appliedRoomRate !== 1000) {
      console.log(
        '❌ ❌ ❌ ERROR! Company locked rate is not ₹1000. Current applied rate:',
        this.appliedRoomRate
      );
    }
  }

  async calculateTransferCharges(room: any, bed: any): Promise<void> {
    let primaryBedCharge = +this.roomTransfer.primaryBed?.bedCharge || 0;
    let primaryRoomCharge = +this.roomTransfer.primaryBed?.roomCharge || 0;

    this.standardBedRate = primaryBedCharge;
    this.standardRoomRate = primaryRoomCharge;

    if (this.isCompanyPatient) {
      const companyBedRate = await this.getCompanyBedRate(
        bed?.bedType?._id || bed?.bed_type_id?._id,
        bed?.bedType?.name || bed?.bed_type_id?.name
      );

      const companyRoomRate = await this.getCompanyRoomRate(
        room?.roomType?._id || room?.room_type_id?._id,
        room?.roomType?.name || room?.room_type_id?.name
      );

      if (companyBedRate > 0) {
        primaryBedCharge = companyBedRate;
      }
      if (companyRoomRate > 0) {
        primaryRoomCharge = companyRoomRate;
      }
    }

    this.appliedBedRate = primaryBedCharge;
    this.appliedRoomRate = primaryRoomCharge;

    if (
      !Array.isArray(this.roomTransfer.dailyRoomChargeLogs) ||
      this.roomTransfer.dailyRoomChargeLogs.length === 0
    ) {
      return;
    }
    const finalRoomCharge = this.roomTransfer.dailyRoomChargeLogs.reduce(
      (sum: any, item: any) => {
        const room = Number(item?.roomCharge) || 0;
        const bed = Number(item?.bedCharge) || 0;
        return sum + room + bed;
      },
      0
    );
    this.finalRoomCharge = finalRoomCharge;
    this.roomTotal = this.finalRoomCharge;
  }

  async calculateCategoryCharges(
    room: any,
    bed: any,
    caseData: any
  ): Promise<void> {
    this.categorySelected = true;
    let daysStayed = 0;
    const admissionDateStr = caseData?.admissionTime;
    const roomName = caseData?.categoryChargeAs;
    if (admissionDateStr) {
      const admissionDate = new Date(admissionDateStr);
      const today = new Date();
      const diffInTime = today.getTime() - admissionDate.getTime();
      daysStayed = Math.ceil(diffInTime / (1000 * 3600 * 24) + 1);
    }

    let roomCharge = this.patientFromCase.categoryRoomCharge;
    let bedCharge = this.patientFromCase.categoryBedCharge;
    this.standardRoomRate = roomCharge;

    if (this.isCompanyPatient) {
      const companyBedRate = await this.getCompanyBedRate(
        // bed?.bedType?._id || bed?.bed_type_id?._id,
        // bed?.bedType?.name || bed?.bed_type_id?.name
        roomName,
        roomName
      );
      const companyRoomRate = await this.getCompanyRoomRate(
        // room?.roomType?._id || room?.room_type_id?._id,
        // room?.roomType?.name || room?.room_type_id?.name
        roomName,
        roomName
      );

      if (companyBedRate > 0 || companyRoomRate > 0) {
        roomCharge = companyRoomRate || 0;
        bedCharge = companyBedRate || 0;
      }
    }

    this.roomcharge = roomCharge.toString();
    this.appliedRoomRate = roomCharge;
    this.appliedBedRate = bedCharge;
    caseData.daysStayed = daysStayed;
    this.dayStayed = daysStayed;
    this.roomTotal = (roomCharge + bedCharge) * daysStayed;
  }

  calculateOtherTotals(): void {
    this.inpatientBillsTotal = this.inpatientbills.reduce(
      (sum, bill) => sum + (+bill.totalBillAmount || 0),
      0
    );
    this.pharmaTotal = this.pharmaceuticalinward.reduce(
      (sum, pharma) => sum + (+pharma.total || 0),
      0
    );
    this.medicaltestTotal = this.medicaltestinward.reduce(
      (sum, test) => sum + (+test.total || 0),
      0
    );

    const grandTotal =
      this.roomTotal + this.inpatientBillsTotal + this.calculateOtTotal();
    console.log('GRAND TOTAL', grandTotal);
    console.log('AMOUNT PAID', this.amountPaid);
    this.grandTotal = grandTotal;
  }

  calculateOtTotal() {
    return this.otbills.reduce((sum, bill) => {
      const charge = this.getChargeForOperation(bill);
      return sum + (charge ? charge.totalPrice : +bill.netAmount || 0);
    }, 0);
  }

  getTotalDaysFromLogs(logs: any[]): number {
    if (!logs || logs.length === 0) return 0;

    const dates = logs.map((log) => new Date(log.date));
    const firstDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const lastDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Difference in time in milliseconds
    const diffTime = lastDate.getTime() - firstDate.getTime();

    // Convert time difference to days and add 1 to include both days
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  }

  selectTab(tabName: string): void {
    this.tab = tabName;
  }

  private isUpdating = false;

  onPaymentChange(updatedPayment: any) {
    if (this.isUpdating) return;
    this.isUpdating = true;

    // your update logic e.g., patchValue, calculations, etc.
    this.intermbill.patchValue({
      cashAmount: updatedPayment.cashAmount || 0,
      upiAmount: updatedPayment.upiAmount || 0,
      cardAmount: updatedPayment.cardAmount || 0,
      amount_received:
        (updatedPayment.cashAmount || 0) +
        (updatedPayment.upiAmount || 0) +
        (updatedPayment.cardAmount || 0),
      transactionId: updatedPayment.transactionId || '',
      discount: updatedPayment.discount || 0,
      reason: updatedPayment.reason || '',
      // ...anything else you emit
    });

    this.isUpdating = false;
  }

  // ✅ Enhanced submitForm method
  async submitForm() {
    const Swal = (await import('sweetalert2')).default;

    if (this.intermbill.invalid) {
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

    const correctedInpatientCase = this.inpatientcase.map((caseData: any) => {
      return {
        ...caseData,
        room: {
          ...caseData.room_id,
          roomTypeId:
            caseData.room_id?.room_type_id ||
            caseData.room?.roomType?._id ||
            '',
          roomType: {
            ...caseData.room_id?.room_type_id,
            pricePerDay: this.appliedRoomRate,
          },
        },
        bed: {
          ...caseData.bed_id,
          bedTypeId:
            caseData.bed_id?.bed_type_id || caseData.bed?.bedType?._id || '',
          bedNumber: caseData.bed_id?.bed_number || '',
          bedType: {
            ...caseData.bed_id?.bed_type_id,
            pricePerDay: this.appliedBedRate,
          },
        },
      };
    });

    const dorDate = new Date(this.intermbill.value.dor);
    const dotTime = this.intermbill.value.dot;
    const [hours, minutes] = dotTime.split(':').map(Number);
    dorDate.setHours(hours, minutes, 0, 0);
    const dotISO = dorDate.toISOString();

    this.intermbill.patchValue({
      grandTotalAmount: this.grandTotal,
      totalRoomCharges: this.roomTotal,
      totalInpatientCharges: this.inpatientBillsTotal,
      totalPharmacyCharges: this.pharmaTotal,
      totalMedicalCharges: this.medicaltestTotal,
      totalOperationTheaterCharges: this.calculateOtTotal(),
      netPayableAmount: this.grandTotal - this.deposit,
    });

    const paid =
      (+this.grandTotal || 0) - (+this.deposit || 0) ===
      this.intermbill.value.amount_received
        ? true
        : false;

    const partialPaid =
      this.intermbill.value.amount_received > 0 &&
      this.intermbill.value.amount_received <
        (+this.grandTotal || 0) - (+this.deposit || 0)
        ? true
        : false;

    const payload = {
      formData: this.intermbill.value,
      patientType: this.patientType,
      grandTotalAmount: this.grandTotal,
      depositAmount: this.deposit,
      totalRoomCharges: this.roomTotal,
      totalInpatientCharges: this.inpatientBillsTotal,
      totalPharmacyCharges: this.pharmaTotal,
      totalMedicalCharges: this.medicaltestTotal,
      totalOperationTheaterCharges: this.calculateOtTotal(),
      netPayableAmount: (+this.grandTotal || 0) - (+this.deposit || 0),
      amount_received: this.intermbill.value.amount_received,
      paymentMode: this.intermbill.value.paymentMode,
      cashAmount: this.intermbill.value.cashAmount || 0,
      upiAmount: this.intermbill.value.upiAmount || 0,
      cardAmount: this.intermbill.value.cardAmount || 0,
      transactionId: this.intermbill.value.transactionId || '',
      patientName: this.intermbill.value.patientName,
      age: this.intermbill.value.age,
      uhid: this.intermbill.value.uhid,
      gender: this.intermbill.value.gender,
      dob: this.intermbill.value.dob,
      area: this.intermbill.value.area,
      pincode: this.intermbill.value.pincode,
      mobileNo: this.intermbill.value.mobile_no,
      dor: this.intermbill.value.dor,
      dot: dotISO,
      admittingDoctor: this.doctor,
      consultingDoctor: this.doctor,
      referringDoctor: this.intermbill.value.ref_doc,
      totalBilling: this.grandTotal,
      roomTotal: this.roomTotal,
      inpatientBillsTotal: this.inpatientBillsTotal,
      pharmaTotal: this.pharmaTotal,
      otTotal: this.calculateOtTotal(),
      inpatientCase: correctedInpatientCase,
      inpatientCaseId: correctedInpatientCase[0]?._id,
      inpatientBills: this.inpatientbills,
      pharmaceuticalInward: this.pharmaceuticalinward.map((entry: any) => ({
        ...entry,
        inwardSerialNumber:
          +entry.inwardSerialNumber?.toString().replace(/\D/g, '') || 0,
        total: +entry.total || 0,
        paymentMode: entry.paymentMode || 'cash',
        amountReceived: +entry.amountReceived || 0,
        dueAmount: +entry.dueAmount || 0,
      })),
      otBills: this.otbills.map((entry: any) => ({
        ...entry,
        netAmount: +entry.netAmount || 0,
      })),
      medicaltestinward: this.medicaltestinward,
      partialPaid: partialPaid,
      fullPaid: paid,
      createdBy: this.user,
      // ✅ Enhanced company information with locked rates
      isCompanyPatient: this.isCompanyPatient,
      companyInfo: this.companyInfo,
      appliedCompanyRates: this.isCompanyPatient
        ? {
            roomRatesApplied: true,
            bedRatesApplied: true,
            companyName: this.companyInfo?.companyName,
            standardRoomRate: this.standardRoomRate,
            appliedRoomRate: this.appliedRoomRate, // ✅ This should be ₹1000 for ICICI General
            standardBedRate: this.standardBedRate,
            appliedBedRate: this.appliedBedRate,
            roomSavings: this.standardRoomRate - this.appliedRoomRate,
            bedSavings: this.standardBedRate - this.appliedBedRate,
            totalSavings:
              this.standardRoomRate -
              this.appliedRoomRate +
              (this.standardBedRate - this.appliedBedRate),
          }
        : null,
    };

    // console.log(
    //   '🚀 ⭐ ⭐ ⭐ SUBMITTING ENHANCED INTERIM BILL WITH LOCKED RATES:',
    //   payload
    // );

    if (this.intermBillId) {
      this.ipdservice
        .updateinpatientIntermBill(this.intermBillId, payload)
        .subscribe({
          next: (response) => {
            console.log('✅ Data updated successfully:', response);
            Swal.fire({
              icon: 'success',
              title: 'Interim Bill Updated',
              text: `Inpatient Interim Bill has been saved successfully.`,
              position: 'top-end',
              toast: true,
              timer: 4000,
              showConfirmButton: false,
              customClass: {
                popup: 'hospital-toast-popup',
                title: 'hospital-toast-title',
                htmlContainer: 'hospital-toast-text',
              },
            });
            this.intermbill.reset();
            if (this.ipdId) {
              this.router.navigate(['/ipdpatientsummary'], {
                queryParams: { id: this.ipdId },
              });
            }
          },
          error: (err) => {
            console.error('❌ Update failed:', err);
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text:
                err?.error?.message ||
                'Something went wrong while updating the Interim Bill.',
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
      this.ipdservice.postinpatientIntermBill(payload).subscribe({
        next: (response) => {
          console.log('✅ Data submitted successfully:', response);

          const companyMessage = this.isCompanyPatient
            ? ` (${this.companyInfo?.companyName} locked rates applied: ₹${this.appliedRoomRate} room rate)`
            : '';

          // const savingsMessage = this.isCompanyPatient && payload.appliedCompanyRates?.totalSavings > 0
          //   ? ` | Savings: ₹${payload.appliedCompanyRates?.totalSavings}`
          //   : '';

          Swal.fire({
            icon: 'success',
            title: 'Interim Bill Created',
            text: `Inpatient Interim Bill has been created successfully.${companyMessage}`,
            position: 'top-end',
            toast: true,
            timer: 4000,
            showConfirmButton: false,
            customClass: {
              popup: 'hospital-toast-popup',
              title: 'hospital-toast-title',
              htmlContainer: 'hospital-toast-text',
            },
          });

          this.intermbill.reset();
          if (this.ipdId) {
            this.router.navigate(['/ipdpatientsummary'], {
              queryParams: { id: this.ipdId },
            });
          }
        },
        error: (err) => {
          console.error('❌ Submission failed:', err);
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text:
              err?.error?.message ||
              'Something went wrong while creating the Interim Bill.',
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

  toggleSection(key: keyof typeof this.show): void {
    this.show[key] = !this.show[key];
  }

  get netAmount(): number {
    return this.grandTotal - this.deposit - this.amountPaid;
  }

  async loadHtml2PdfScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src*="html2pdf"]');
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src =
        'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load html2pdf.js'));
      document.body.appendChild(script);
    });
  }

  async generateFullBill() {
    this.showBillReport = true;

    setTimeout(async () => {
      const billElement = document.getElementById('billReport');
      if (!billElement) {
        +console.error('Bill report section not found.');
        return;
      }

      billElement.scrollIntoView({ behavior: 'smooth' });
      await new Promise((resolve) => setTimeout(resolve, 300));

      const html2canvas = (await import('html2canvas')).default;
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;

      try {
        const canvas = await html2canvas(billElement, {
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        const filename = this.isCompanyPatient
          ? `ipd-interim-bill-${
              this.companyInfo?.companyShortName || 'company'
            }.pdf`
          : 'ipd-interim-bill-summary.pdf';

        pdf.save(filename);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }, 200);
  }

  generateFinalBillAndPrint(patientId: string) {
    if (!this.billNum) {
      this.ipdservice
        .updateinpatientIntermBill(this.intermBillId, {
          inpatientCaseId: patientId,
        })
        .subscribe({
          next: (res) => {
            console.log('Final bill marked as generated:', res);
          },
          error: (err) => {
            console.error('Error marking final bill as generated:', err);
          },
        });
    }
    this.generateFinalBill(patientId); // Load bill data as you do

    // Use a slight delay or Angular lifecycle hook to ensure bill component fully rendered
    setTimeout(() => {
      this.printBill(); // Then open print immediately
    }, 500);
  }

  generateFinalBill(patientId: string): void {
    this.ipdservice.getIPDcaseById(patientId).subscribe((res) => {
      const casedata = res.data || res;
      // console.log('casedata from estimate', casedata);
      // const uhid = casedata.uniqueHealthIdentificationId?.uhid;

      this.ipdservice.getPatientIntermByCaseId(patientId).subscribe({
        next: (res: any) => {
          const interm = res.data[0] || res;
          this.selectedPatientBill = interm;
          this.selectedPatientBill.billNumber = this.billNum;
          this.otData = interm.operationtheatresheet || [];
          console.log('🧾 Interm Bill:', this.selectedPatientBill);
          this.extractServices(this.selectedPatientBill);

          const admissionDate = new Date(interm.admissionDate);
          const isDischarge = interm.isDischarge;
          const today = new Date();
          const endDate = isDischarge
            ? new Date(interm.dischargeDate || today)
            : today;

          const oneDay = 1000 * 60 * 60 * 24;
          const daysStay =
            Math.floor((endDate.getTime() - admissionDate.getTime()) / oneDay) +
            1;

          // 💡 Identify cashless patient
          // const isCashless = casedata.patient_type === 'cashless';
        },
        error: (err) => {
          console.error('❌ Error loading estimate bill', err);
        },
      });
    });
  }

  printBill() {
    // Get the bill HTML element (adapt selector if needed)
    const billElement = document.getElementById('opd-sheet');

    if (!billElement) {
      console.error('Bill element not found for printing.');
      return;
    }

    // Get outer HTML content to preserve layout/styles
    const printContent = billElement.outerHTML;

    // Open new window for printing
    const printWindow = window.open('', '_blank', 'width=1000,height=1200');
    if (!printWindow) {
      console.error('Failed to open print window.');
      return;
    }

    // Copy styles from current document
    const styles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((node) => node.outerHTML)
      .join('\n');

    // Write full HTML with improved spacing and print styles
    printWindow.document.write(`
    <html>
      <head>
        <title>Inpatient Bill</title>
        ${styles}
        <style>
          @media print {
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact;
            }
            #opd-sheet {
              width: 800px !important;
              margin: 0 auto !important;
              background: white !important;
              box-sizing: border-box !important;
              padding: 0 24px !important;
            }
            #opd-sheet > div,
            #opd-sheet > section,
            #opd-sheet > table,
            #opd-sheet > h1,
            #opd-sheet > h2,
            #opd-sheet > h3,
            #opd-sheet > p {
              margin-bottom: 14px !important;
            }
            #opd-sheet table tr td,
            #opd-sheet table tr th {
              padding: 7px 10px !important;
              font-size: 15px !important;
            }
            #opd-sheet .bill-header-row {
              margin-bottom: 20px !important;
              display: block;
            }
            #opd-sheet .sign-row {
              margin-top: 36px !important;
              display: flex;
              justify-content: space-between;
            }
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);

    printWindow.document.close();

    // Wait for new window to load content before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Optionally close window after print
      // printWindow.onafterprint = () => printWindow.close();
    };
  }

  serviceList: { services: any[]; totalAmount: number } = {
    services: [],
    totalAmount: 0,
  };
  radiotest: { services: any[]; totalAmount: number } = {
    services: [],
    totalAmount: 0,
  };

  extractServices(patient: any) {
    console.log('patient from extract services', patient);
    if (!patient || patient.isDischarge) return;

    let ipdServices: any[] = [];
    let radiologyServices: any[] = [];

    patient.inpatientBills?.forEach((bill: any) => {
      bill.serviceId?.forEach((service: any) => {
        const serviceData = {
          doctor: patient.consultingDoctor?.name,
          date: bill.billingDate,
          service: service.name,
          charge: service.charge,
          quantity: service.quantity,
          total: service.totalAmount,
        };

        if (service.type === 'ipd') {
          ipdServices.push(serviceData);
        } else if (service.type === 'radiology') {
          radiologyServices.push(serviceData);
        }
      });
    });

    this.serviceList = {
      services: ipdServices,
      totalAmount: ipdServices.reduce((sum, s) => sum + (+s.charge || 0), 0),
    };

    this.radiotest = {
      services: radiologyServices,
      totalAmount: radiologyServices.reduce(
        (sum, s) => sum + (+s.charge || 0),
        0
      ),
    };
  }

  convertNumberToWords(amount: number): string {
    const a = [
      '',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen',
    ];
    const b = [
      '',
      '',
      'twenty',
      'thirty',
      'forty',
      'fifty',
      'sixty',
      'seventy',
      'eighty',
      'ninety',
    ];

    // Split rupees and paise
    const [rupeesPart, paisePart] = amount.toString().split('.').map(Number);
    const paise = paisePart
      ? Math.round(
          (paisePart / Math.pow(10, paisePart.toString().length)) * 100
        )
      : 0;

    const numToWords = (num: number): string => {
      if (!num) return '';
      if (num < 20) return a[num];
      if (num < 100)
        return b[Math.floor(num / 10)] + (num % 10 ? '-' + a[num % 10] : '');
      if (num < 1000)
        return a[Math.floor(num / 100)] + ' hundred ' + numToWords(num % 100);
      if (num < 100000)
        return (
          numToWords(Math.floor(num / 1000)) +
          ' thousand ' +
          numToWords(num % 1000)
        );
      if (num < 10000000)
        return (
          numToWords(Math.floor(num / 100000)) +
          ' lakh ' +
          numToWords(num % 100000)
        );
      return (
        numToWords(Math.floor(num / 10000000)) +
        ' crore ' +
        numToWords(num % 10000000)
      );
    };

    let words = numToWords(rupeesPart).trim() + ' rupees';
    if (paise > 0) {
      words += ' and ' + numToWords(paise).trim() + ' paise';
    }
    return words;
  }

  isPay: Boolean = false;
  generatePatientReceipt() {
    this.isPay = !this.isPay;
  }

  // async onRequestDiscount() {
  //   const Swal = (await import('sweetalert2')).default;

  //   if (this.intermbill.invalid) {
  //     Swal.fire('Invalid Form', 'Please check all required fields.', 'warning');
  //     return;
  //   }

  //   const payload: DiscountRequest = {
  //     uhid: this.intermbill.get('_id')?.value,
  //     patientBillingId: this.intermbill.get('_id')?.value,
  //     discount: this.intermbill.get('discount')?.value,
  //     reason: this.intermbill.get('discountReason')?.value,
  //     discountStatus: 'pending',
  //     requestedBy: getAuthUserId(),
  //   };

  //   this.discountService.requestDiscountIPD(payload).subscribe({
  //     next: (res: any) => {
  //       Swal.fire(
  //         'Requested',
  //         'Discount request submitted successfully.',
  //         'success'
  //       );
  //     },
  //     error: (err: any) => {
  //       console.error('Discount request failed:', err);
  //       Swal.fire('Error', 'Failed to submit discount request.', 'error');
  //     },
  //   });
  // }

  viewRoomDetails(data: any) {
    this.selectedLogs = data;
    console.log('daily log', this.selectedLogs);
  }

  closeModal(): void {
    this.selectedLogs = null;
    this.selectedPatientBill = null;
  }

  // naviagation of patient id to ot charge

  navigateWithPatientIdToOtCharge(patientId: string) {
    console.log(
      '🚀 ~ IntermbillComponent ~ navigateWithPatientIdToOtCharge ~ patientId:',
      patientId
    );
    this.router.navigate(['/ipd/otcharge'], {
      queryParams: { id: patientId },
    });
  }

  getChargeForOperation(otBill: any) {
    if (!this.otCharge) return null;
    if (!Array.isArray(this.otCharge)) return null;

    return (
      this.otCharge.find(
        (charge: any) => charge.operationId?._id === otBill._id
      ) || null
    );
  }

  calculateTotal() {
    return this.otbills.reduce((sum, bill) => {
      const charge = this.getChargeForOperation(bill);
      const amount = charge ? charge.totalPrice : Number(bill.netAmount) || 0;
      return sum + amount;
    }, 0);
  }
}
