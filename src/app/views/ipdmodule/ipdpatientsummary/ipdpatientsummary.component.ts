import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  OnInit,
} from '@angular/core';
import { DoctorService } from '../../doctormodule/doctorservice/doctor.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IpdService } from '../ipdservice/ipd.service';
import { IndianCurrencyPipe } from '../../../pipe/indian-currency.pipe';
import { DischargesummaryreportComponent } from '../../doctormodule/dischargesummaryreport/dischargesummaryreport.component';
import { ToastrService } from 'ngx-toastr';
import { LetterheaderComponent } from '../../../views/settingsmodule/letterhead/letterheader/letterheader.component';
import { IpdpatientinfoComponent } from '../../../component/ipdcustomfiles/ipdpatientinfo/ipdpatientinfo.component';
import { RoleService } from '../../mastermodule/usermaster/service/role.service';
import { VitalchartComponent } from '../vitalchart/vitalchart.component';
import { GrowthchartComponent } from '../growthchart/growthchart.component';
import { DietchartService } from '../bedwisedietchart/service/dietchart.service';
import { IpdestimatebillComponent } from '../../../component/ipdcustomfiles/ipdestimatebill/ipdestimatebill.component';
import { DateToISTPipe } from '../../../pipe/dateformatter/date-to-ist.pipe';
import { IpdbillcumreceiptComponent } from '../../../component/ipdcustomfiles/ipdbillcumreceipt/ipdbillcumreceipt.component';
import { VisitTypeService } from '../../mastermodule/visitmaster/service/visit.service';
import { VisitMasterModalComponent } from '../../mastermodule/visitmaster/visit-master-modal/visit-master-modal.component';

interface NavigationItem {
  id: string;
  icon: string;
  label: string;
  active: boolean;
  route?: string;
  requiredModule?: string | string[];
  requiredAction?: 'read' | 'create' | 'update' | 'delete';
  action?: () => void;
}

@Component({
  selector: 'app-ipdpatientsummary',
  imports: [
    CommonModule,
    FormsModule,
    IndianCurrencyPipe,
    DischargesummaryreportComponent,
    LetterheaderComponent,
    RouterModule,
    VitalchartComponent,
    GrowthchartComponent,
    IpdestimatebillComponent,
    DateToISTPipe,
    IpdbillcumreceiptComponent,
    VisitMasterModalComponent
  ],
  templateUrl: './ipdpatientsummary.component.html',
  styleUrl: './ipdpatientsummary.component.css',
})
export class IpdpatientsummaryComponent
  implements OnInit, AfterViewChecked, AfterViewInit
{
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ipdservice: IpdService,
    private doctorservice: DoctorService,
    private toastr: ToastrService,
    private userservice: RoleService,
    private dietService: DietchartService,
    private visitService : VisitTypeService
  ) {}

  // ✅ Enhanced Navigation state with proper module permissions
  navigationItems: NavigationItem[] = [
    { id: 'summary', icon: '📝', label: 'Patient Summary', active: true },
    {
      id: 'deposit',
      icon: '💰',
      label: 'Deposit',
      active: false,
      requiredModule: 'inpatientDeposit',
      requiredAction: 'read',
    },
    {
      id: 'vitals',
      icon: '📊',
      label: 'Vital chart',
      active: false,
      requiredModule: 'vitals',
      requiredAction: 'read',
    },
    {
      id: 'diagnosis',
      icon: '🩺',
      label: 'Indoor Case Summary',
      active: false,
      requiredModule: 'diagnosisSheet',
      requiredAction: 'read',
    },
    {
      id: 'treatmentsheet',
      icon: '🩺',
      label: 'Treatment Sheet',
      active: false,
      requiredModule: 'treatmentSheet',
      requiredAction: 'read',
    },
    {
      id: 'pharmaReq',
      icon: '💊',
      label: 'Pharmacy Requisition',
      active: false,
      // ✅ Multiple modules support - user needs ANY of these
      requiredModule: ['pharmaceuticalRequestList', 'diagnosisSheet'],
      requiredAction: 'read',
    },
    // {
    //   id: 'pathologyReq',
    //   icon: '🔬',
    //   label: 'Pathology Requisition',
    //   active: false,
    //   requiredModule: 'departmentRequestList',
    //   requiredAction: 'read',
    // },
    // {
    //   id: 'radioReq',
    //   icon: '🩻',
    //   label: 'Radiology Requisition',
    //   active: false,
    //   requiredModule: 'departmentRequestList',
    //   requiredAction: 'read',
    // },
    {
      id: 'roomTransfer',
      icon: '🏨',
      label: 'Room Log',
      active: false,
      requiredModule: 'inpatientRoomTransfer',
      requiredAction: 'read',
    },
    {
      id: 'operationEntry',
      icon: '🏥',
      label: 'Operation entry',
      active: false,
      requiredModule: 'oprationTheatresheet',
      requiredAction: 'read',
    },
    {
      id: 'Otsheet',
      icon: '✍️',
      label: 'OT Sheets',
      active: false,
      requiredModule: 'operationTheatreNotes',
      requiredAction: 'read',
    },
    {
      id: 'dailyprogressReport',
      icon: '✍️',
      label: 'Daily Progress',
      active: false,
      requiredModule: 'dailyProgressReport',
      requiredAction: 'read',
    },
    // {
    //   id: 'treatmentsheet2',
    //   icon: '💊',
    //   label: 'Treatment sheet',
    //   active: false,
    //   requiredModule: 'treatmentHistorySheet',
    //   requiredAction: 'read',
    // },


    {
      id: 'dietchart',
      icon: '🥗',
      label: 'Diet Chart',
      active: false,
      requiredAction: 'read',
    },
    {
      id: 'ipdbill',
      icon: '🧾',
      label: 'Services Bill',
      active: false,
      requiredModule: 'inpatientBilling',
      requiredAction: 'read',
    },
     {
      id: 'visits',
      icon: '👨‍⚕️',
      label: 'Doctor Visits/ Procedurial Visit',
      active: false,
      requiredModule: 'visitmaster',
      requiredAction: 'read',
    },
    {
      id: 'dischargeSummary',
      icon: '📄',
      label: 'Discharge Summary',
      active: false,
      requiredModule: 'dischargeSummary',
      requiredAction: 'read',
    },
    {
      id: 'estimateBill',
      icon: '🧾',
      label: 'Estimate Bill',
      active: false,
      requiredModule: 'inpatientIntermBill',
      requiredAction: 'read',
    },
    {
      id: 'finalBill',
      icon: '🧾',
      label: 'Final Bill',
      active: false,
      requiredModule: 'inpatientIntermBill',
      requiredAction: 'read',
      action: () => this.viewPatientBill(this.ipdCase._id),
    },
    {
      id: 'discharge',
      icon: '🚪',
      label: 'Gate Pass',
      active: false,
      route: '/ipd/ipddischarge',
      requiredModule: 'discharge',
      requiredAction: 'read',
    },

    // Door for discharge
    // {
    //   id: 'chargesatadmisison',
    //   icon: '🚪',
    //   label: 'Charges at the Time of Admission',
    //   active: false,
    //   requiredModule: 'discharge',
    //   requiredAction: 'read',
    // }, // Door for discharge
  ];

  sectionKeys = [
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
  sectionLabels: any = {
    INITIAL_DIAGNOSIS: 'Initial Diagnosis',
    CLINICAL_HISTORY_EXAMINATION: 'Clinical History & Examination',
    SIGNIFICANT_PAST_MEDICAL_SURGICAL_FAMILY_HISTORY:
      'Significant Past Medical / Surgical / Family History',
    CLINICAL_FINDINGS: 'Clinical Findings',
    INVESTIGATIONS_RADIOLOGY: 'Investigations - Radiology',
    INVESTIGATIONS_PATHOLOGY: 'Investigations - Pathology',
    INVESTIGATIONS_RADIATION: 'Investigations - Radiation',
    OPERATION_PROCEDURE: 'Operation / Procedure',
    TREATMENT_GIVEN: 'Treatment Given',
    TREATMENT_ON_DISCHARGE: 'Treatment on Discharge',
    CONDITION_ON_DISCHARGE: 'Condition on Discharge',
    ADVICE_ON_DISCHARGE: 'Advice on Discharge',
    DIET_ADVICE: 'Diet Advice',
    FINAL_DIAGNOSIS_ICD10_CODES: 'Final Diagnosis (ICD-10 Codes)',
    STATUS: 'Status',
  };

  // Tab state
  activeTab: 'vitals' | 'biometrics' | 'ipdSticker' = 'biometrics';
  startDate: string | null = null;
  endDate: string | null = null;

  // Content visibility state
  showMoreDetails: boolean = false;
  showActionsMenu: boolean = false;

  // Current section state
  currentSection: string = 'summary';

  // Pagination state
  currentPage: number = 1;
  itemsPerPage: number = 1;
  totalPages: number = 1;
  ipdId: string = '';

  // Patient data
  patientData = {
    avatar: '',
    visitStatus: 'Active Visit',
  };

  // Data properties
  vitals: any;
  vital: any;
  deposit: any;
  diagnosis: any;
  bill: any;
  otsheet: any;
  otnotes: any;
  treatmentsheet: any;
  services: any;
  doctorId: string = '';
  todayVitals: any;
  isHistory: boolean = false;
  isDiagnosisHistory: boolean = false;
  summary: any;
  user: any;
  stickerCount: number = 40;
  accountpermissions: any = {};
  dailyRoomCharges: any;
  bedCharge: any;
  transferCharge: any;
  transferInProgress: any;
  serviceList: { services: any[]; totalAmount: number } = {
    services: [],
    totalAmount: 0,
  };
  radiotest: { services: any[]; totalAmount: number } = {
    services: [],
    totalAmount: 0,
  };
  serviceData: { services: any[]; totalAmount: number } = {
    services: [],
    totalAmount: 0,
  };
  radioData: { services: any[]; totalAmount: number } = {
    services: [],
    totalAmount: 0,
  };

  ngOnInit(): void {
    // ✅ Set the first available tab as active on initialization
    const defaultTab = this.getDefaultActiveTab();
    if (defaultTab) {
      this.navigationItems.forEach((item) => (item.active = false));
      defaultTab.active = true;
      this.currentSection = defaultTab.id;
    }

    // ✅ Enhanced route parameter subscription with state reset
    this.route.queryParams.subscribe((params: any) => {
      const newIpdId = params['id'];

      console.log('🔄 Route params changed:', {
        oldId: this.ipdId,
        newId: newIpdId,
      });

      if (newIpdId && newIpdId !== this.ipdId) {
        // ✅ Reset state before loading new patient data
        this.resetComponentState();

        // Update ID
        this.ipdId = newIpdId;

        // ✅ Load data with proper sequencing
        this.loadPatientDataSequentially(newIpdId);
      }

      // accounts permission to see bill details
      const allPermissions = JSON.parse(
        localStorage.getItem('permissions') || '[]'
      );
      const uhidModule = allPermissions.find(
        (perm: any) => perm.moduleName === 'oprationTheatresheetaccounts'
      );
      this.accountpermissions = uhidModule?.permissions || {};
    });

    // Set default dates
    const date = new Date();
    const today = date.toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;
    this.pharmaStartDate = today;
    this.pharmaEndDate = today;
  }

  // ✅ Add this method to properly reset component state
  private resetComponentState(): void {
    console.log('🔄 Resetting component state for new patient');

    // Reset pharmacy data
    this.allPharmaRequisitions = [];
    this.pharmaRequisitions = [];
    this.todayPharmaRequests = [];
    this.filteredPharmaRequisitions = [];
    this.combinedPharmaData = [];

    // Reset other data arrays
    this.vitals = [];
    this.vital = [];
    this.diagnoses = [];
    this.diagnosis = null;

    // Reset UI state
    this.isPharmaHistory = false;
    this.isHistory = false;
    this.isDiagnosisHistory = false;

    console.log('✅ Component state reset complete');
  }

  // ✅ Enhanced data loading with proper sequencing
  private loadPatientDataSequentially(ipdId: string): void {
    console.log('🔄 Loading patient data sequentially for:', ipdId);

    // ✅ Phase 1: Load basic patient data first
    this.loadIpdCaseById(ipdId);

    // ✅ Phase 2: Load clinical data
    Promise.resolve().then(() => {
      this.getIPDcasevitals(ipdId);
      this.loadIpdDeposit(ipdId);
      this.loadIpdDiagnosis(ipdId);
    });

    // ✅ Phase 3: Load pharmacy data after diagnosis is loaded
    setTimeout(() => {
      this.loadPharmacyDataWithRetry(ipdId);
    }, 100);

    // ✅ Phase 4: Load remaining data
    setTimeout(() => {
      this.loadTreatmentSheetData(ipdId);
      this.loadIpdBill(ipdId);
      this.loadIpdOTSheet(ipdId);
      this.loadDailyProgressData(ipdId);
      this.loadIpdOTNotes(ipdId);
      this.loadIpdDischargeSummary(ipdId);
      this.loadRoomTransferData(ipdId);
      this.loadDietCharts(ipdId);
      this.viewPatientBill(ipdId);
      this.loadPatientEstimate(ipdId);
      this.loadCompanyRates(ipdId);
      this.loadVisitsByCase(ipdId)
    }, 200);
  }

  // ✅ Enhanced pharmacy loading with retry logic
  private loadPharmacyDataWithRetry(id: string, retryCount: number = 0): void {
    const maxRetries = 2;

    console.log(`🔄 Loading pharmacy data (attempt ${retryCount + 1}):`, id);

    if (this.hasModuleAccess('pharmaceuticalRequestList', 'read')) {
      this.doctorservice.getpharmaByIpdCaseId(id).subscribe({
        next: (res: any) => {
          console.log('📡 Pharmacy API response:', res);

          const pharmacyData = res?.data || res || [];

          if (pharmacyData.length === 0 && retryCount < maxRetries) {
            console.log(`⚠️ No pharmacy data received, retrying in 500ms...`);
            setTimeout(() => {
              this.loadPharmacyDataWithRetry(id, retryCount + 1);
            }, 500);
            return;
          }

          // ✅ Success - process the data
          this.allPharmaRequisitions = pharmacyData;
          console.log(
            '📋 Pharmacy data loaded successfully:',
            this.allPharmaRequisitions
          );

          // Reset to today's view
          this.isPharmaHistory = false;

          // Apply filtering
          this.filterTodaysPharmaData();

          console.log(
            '✅ Pharmacy display ready:',
            this.pharmaRequisitions.length
          );
        },
        error: (err) => {
          console.error('❌ Error loading pharmacy data:', err);

          if (retryCount < maxRetries) {
            console.log(`🔄 Retrying pharmacy load in 1000ms...`);
            setTimeout(() => {
              this.loadPharmacyDataWithRetry(id, retryCount + 1);
            }, 1000);
          } else {
            console.error('❌ Max retries exceeded for pharmacy data');
            this.allPharmaRequisitions = [];
            this.pharmaRequisitions = [];
            this.todayPharmaRequests = [];
            this.combinePharmaDatas();
          }
        },
      });

      // ✅ Also load without IPD permission as fallback
      this.loadIpdPharmawithoutipdpermission(id);
    } else {
      console.warn('⚠️ No permission to read pharmaceutical requests');
    }
  }

  // ✅ Enhanced permission checking with multiple modules support
  hasModuleAccess(
    module: string | string[],
    action: 'read' | 'create' | 'update' | 'delete' = 'read'
  ): boolean {
    try {
      const permissions = JSON.parse(
        localStorage.getItem('permissions') || '[]'
      );

      if (!Array.isArray(permissions) || permissions.length === 0) {
        console.warn('No permissions found in localStorage');
        return false;
      }

      if (Array.isArray(module)) {
        // Check if user has access to ANY module in the array
        for (const mod of module) {
          const modulePermission = permissions.find(
            (perm: any) => perm.moduleName === mod
          );

          if (
            modulePermission &&
            modulePermission.permissions &&
            modulePermission.permissions[action] === 1
          ) {
            // console.log(
            //   `✅ Access granted for module: ${mod} with action: ${action}`
            // );
            return true;
          }
        }

        console.log(
          `❌ No access found for any module in: [${module.join(
            ', '
          )}] with action: ${action}`
        );
        return false;
      }

      // Single module check
      const modulePermission = permissions.find(
        (perm: any) => perm.moduleName === module
      );

      const hasAccess =
        modulePermission &&
        modulePermission.permissions &&
        modulePermission.permissions[action] === 1;

      // console.log(
      //   `${hasAccess ? '✅' : '❌'} Access ${
      //     hasAccess ? 'granted' : 'denied'
      //   } for module: ${module} with action: ${action}`
      // );
      return hasAccess;
    } catch (error) {
      console.error('Error checking module access:', error);
      return false;
    }
  }

  // ✅ Computed property to get visible navigation items based on permissions
  get visibleNavigationItems(): NavigationItem[] {
    return this.navigationItems.filter((item) => {
      // If no module is specified, show the item
      if (!item.requiredModule) {
        return true;
      }

      // Check if user has required permission
      return this.hasModuleAccess(
        item.requiredModule,
        item.requiredAction || 'read'
      );
    });
  }

  // ✅ Method to check if a specific tab should be visible
  isTabVisible(item: NavigationItem): boolean {
    if (!item.requiredModule) {
      return true;
    }
    return this.hasModuleAccess(
      item.requiredModule,
      item.requiredAction || 'read'
    );
  }

  // ✅ Method to get the first available tab for initial navigation
  getDefaultActiveTab(): NavigationItem | null {
    const visibleItems = this.visibleNavigationItems;
    return visibleItems.length > 0 ? visibleItems[0] : null;
  }

  ipdCase: any = {};
  loadIpdCaseById(patientId: string) {
    this.ipdservice.getIPDcaseById(patientId).subscribe((res) => {
      console.log('ipd case by id', res);
      this.ipdCase = res.data || res;
    });
  }

  filtered: any[] = [];

  getIPDcasevitals(patientId: string) {
    const date = new Date();
    const today = date.toISOString().split('T')[0];

    this.doctorservice.getVitalsByIpdCaseId(patientId).subscribe(
      (res) => {
        if (res.success && res.data) {
          this.vitals = res.data;
          console.log('vitals', this.vitals);
          this.vital = res.data.filter((v: any) => {
            const createdDate = new Date(v.createdAt || v.created_at)
              .toISOString()
              .split('T')[0];
            return createdDate === today;
          });
        } else {
          // No data found → clear arrays
          this.vitals = [];
          this.vital = [];
        }
        this.applyFilters(this.vitals);
      },
      () => {
        // API error → fallback to empty arrays
        this.vitals = [];
        this.vital = [];
        this.filtered = [];
      }
    );
  }

  loadIpdDeposit(id: string) {
    this.ipdservice.getIPDdepositByCase(id).subscribe((res) => {
      this.deposit = res.data || res.data?.data;
      console.log('ipd deposit by case===>', this.deposit);
    });
  }

  diagnoses: any;
  loadIpdDiagnosis(id: string) {
    const date = new Date();
    const today = date.toISOString().split('T')[0];

    this.doctorservice.getDiagnosisByIpdCaseId(id).subscribe((res) => {
      const diagnosis = res.diagnosis || res || [];

      // Sort by created date descending (latest first)
      const sortedDiagnosis = diagnosis.sort((a: any, b: any) => {
        return (
          new Date(b.createdAt || b.created_at).getTime() -
          new Date(a.createdAt || a.created_at).getTime()
        );
      });

      // Take only the most recent diagnosis for today
      this.diagnosis =
        sortedDiagnosis.find((v: any) => {
          const createdDate = new Date(v.createdAt || v.created_at)
            .toISOString()
            .split('T')[0];
          return createdDate === today;
        }) || null;

      console.log('Most recent diagnosis today:', this.diagnosis);

      // Keep all diagnoses if you need them elsewhere
      this.diagnoses = diagnosis;
      console.log('All diagnoses:', this.diagnoses);

      this.applyFilters(this.diagnoses);
    });
  }

  onClickRoomTransfer(patientId: string) {
    if (this.hasModuleAccess('inpatientRoomTransfer', 'create')) {
      this.router.navigate(['/ipd/ipdroomtransfer'], {
        queryParams: { Id: patientId },
      });
    } else {
      console.warn('Access denied for Room Transfer');
    }
  }

  renderOnRoomTransferList(patientId: string) {
    this.router.navigate(['/ipd/ipdroomtransferlist'], {
      queryParams: { Id: patientId },
    });
  }

  showVitalsHistory() {
    this.isHistory = !this.isHistory;
    this.getIPDcasevitals(this.ipdId);
  }

  showDiagnosisHistory() {
    this.isDiagnosisHistory = !this.isDiagnosisHistory;
    this.loadIpdDiagnosis(this.ipdId);
  }

  showDailyProgressHistory() {
    this.isProgressHistory = !this.isProgressHistory;
    this.loadDailyProgressData(this.ipdId);
  }

  pharmaRequisitions: any[] = [];
  allPharmaRequisitions: any[] = []; // Store all data
  filteredPharmaRequisitions: any[] = []; // Filtered data for display
  combinedPharmaData: any;

  // ✅ Pharmacy history state
  isPharmaHistory: boolean = false;
  pharmaStartDate: string | null = null;
  pharmaEndDate: string | null = null;
  todayPharmaRequests: any[] = [];

  loadIpdPharma(id: string): void {
    if (this.hasModuleAccess('pharmaceuticalRequestList', 'read')) {
      console.log('🔄 Loading pharmacy data for IPD:', id);

      this.doctorservice.getpharmaByIpdCaseId(id).subscribe({
        next: (res: any) => {
          console.log('📡 Raw API response:', res);

          this.allPharmaRequisitions = res?.data || res || [];
          console.log(
            '📋 Stored all requisitions:',
            this.allPharmaRequisitions.length
          );

          // Reset display mode to today's view
          this.isPharmaHistory = false;

          // Apply filtering
          this.filterTodaysPharmaData();

          console.log(
            '✅ Final display array:',
            this.pharmaRequisitions.length
          );
        },
        error: (err) => {
          console.error('❌ Error loading pharmacy requisitions:', err);
          this.allPharmaRequisitions = [];
          this.pharmaRequisitions = [];
          this.todayPharmaRequests = [];
          this.combinePharmaDatas();
        },
      });
    } else {
      console.warn('⚠️ No permission to read pharmaceutical requests');
    }
  }
  loadIpdPharmawithoutipdpermission(id: string): void {
    if (this.hasModuleAccess('pharmaceuticalRequestList', 'read')) {
      this.doctorservice
        .getpharmaByIpdCaseIdwithoutipdpermission(id)
        .subscribe({
          next: (res: any) => {
            this.allPharmaRequisitions = res?.data || res || [];
            console.log(
              '📋 All Pharmacy requisitions loaded:',
              this.allPharmaRequisitions
            );

            // ✅ Filter today's data by default
            this.filterTodaysPharmaData();
            this.combinePharmaDatas();
          },
          error: (err) => {
            console.error('Error loading pharmacy requisitions:', err);
            this.allPharmaRequisitions = [];
            this.pharmaRequisitions = [];
            this.combinePharmaDatas();
          },
        });
    }
  }

  // ✅ Filter today's pharmacy data
  // ✅ Enhanced filterTodaysPharmaData method with debugging
  filterTodaysPharmaData(): void {
    const today = new Date().toISOString().split('T')[0];

    console.log('🔍 DEBUGGING TODAY FILTER:');
    console.log('📅 Today string:', today);
    console.log('📊 All pharma data count:', this.allPharmaRequisitions.length);

    this.todayPharmaRequests = this.allPharmaRequisitions.filter((req: any) => {
      const createdDate = new Date(req.createdAt).toISOString().split('T')[0];
      console.log(
        `📅 Record ${req._id}: ${req.createdAt} -> ${createdDate} (matches: ${
          createdDate === today
        })`
      );
      return createdDate === today;
    });

    // Set current display data
    this.pharmaRequisitions = this.isPharmaHistory
      ? this.filteredPharmaRequisitions
      : this.todayPharmaRequests;

    console.log('✅ TODAY RESULTS:');
    console.log('📊 Today requests count:', this.todayPharmaRequests.length);
    console.log('📊 Display requests count:', this.pharmaRequisitions.length);
    console.log('📊 Is history mode:', this.isPharmaHistory);
  }

  // ✅ Toggle between today's data and history
  showPharmaHistory(): void {
    this.isPharmaHistory = !this.isPharmaHistory;

    if (this.isPharmaHistory) {
      // Show history with current date range
      this.applyPharmaFilters();
    } else {
      // Show today's data
      this.filterTodaysPharmaData();
    }

    this.combinePharmaDatas();
    console.log('📋 Pharmacy history mode:', this.isPharmaHistory);
  }

  // ✅ Apply date range filters for pharmacy history
  applyPharmaFilters(): void {
    if (!this.pharmaStartDate && !this.pharmaEndDate) {
      this.filteredPharmaRequisitions = [...this.allPharmaRequisitions];
    } else {
      const startDate = this.pharmaStartDate
        ? new Date(this.pharmaStartDate)
        : null;
      const endDate = this.pharmaEndDate ? new Date(this.pharmaEndDate) : null;

      // Set time ranges
      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      this.filteredPharmaRequisitions = this.allPharmaRequisitions.filter(
        (req: any) => {
          const createdDate = new Date(req.createdAt);

          if (startDate && endDate) {
            return createdDate >= startDate && createdDate <= endDate;
          } else if (startDate) {
            return createdDate >= startDate;
          } else if (endDate) {
            return createdDate <= endDate;
          }
          return true;
        }
      );
    }

    // Update current display data
    this.pharmaRequisitions = this.filteredPharmaRequisitions;
    this.combinePharmaDatas();

    console.log(
      '📋 Filtered pharmacy requests:',
      this.filteredPharmaRequisitions.length
    );
  }

  // ✅ Handle date change
  onPharmaDateChange(): void {
    if (this.isPharmaHistory) {
      this.applyPharmaFilters();
    }
  }

  // ✅ Enhanced combinePharmaDatas method
  combinePharmaDatas(): void {
    this.combinedPharmaData = [];

    // Add pharmacy requisitions with source identifier
    if (this.pharmaRequisitions.length > 0) {
      this.combinedPharmaData.push(
        ...this.pharmaRequisitions.map((req) => ({
          ...req,
          source: 'pharmacyRequest',
          displayTitle: 'Pharmacy Request',
        }))
      );
    }

    // Add diagnosis prescriptions if needed
    if (this.diagnoses && this.diagnoses.length > 0) {
      // Apply same date filtering to diagnosis data if in history mode
      let filteredDiagnoses = this.diagnoses;

      if (
        this.isPharmaHistory &&
        (this.pharmaStartDate || this.pharmaEndDate)
      ) {
        const startDate = this.pharmaStartDate
          ? new Date(this.pharmaStartDate)
          : null;
        const endDate = this.pharmaEndDate
          ? new Date(this.pharmaEndDate)
          : null;

        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);

        filteredDiagnoses = this.diagnoses.filter((diag: any) => {
          const createdDate = new Date(diag.createdAt);
          if (startDate && endDate) {
            return createdDate >= startDate && createdDate <= endDate;
          } else if (startDate) {
            return createdDate >= startDate;
          } else if (endDate) {
            return createdDate <= endDate;
          }
          return true;
        });
      } else if (!this.isPharmaHistory) {
        // Show only today's diagnosis data
        const today = new Date().toISOString().split('T')[0];
        filteredDiagnoses = this.diagnoses.filter((diag: any) => {
          const createdDate = new Date(diag.createdAt)
            .toISOString()
            .split('T')[0];
          return createdDate === today;
        });
      }

      this.combinedPharmaData.push(
        ...filteredDiagnoses
          .filter((diag: any) => diag.packages && diag.packages.length > 0)
          .map((pres: any) => ({
            ...pres,
            source: 'diagnosisSheet',
            displayTitle: 'Prescription',
          }))
      );
    }

    // Sort by creation date (newest first)
    this.combinedPharmaData.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log('📋 Combined pharma data:', this.combinedPharmaData);
  }

  getTotalChargeForRecord(record: any): number {
    if (!record.packages || record.packages.length === 0) {
      return 0;
    }

    return record.packages.reduce((total: number, medicine: any) => {
      return total + (medicine.charge || 0);
    }, 0);
  }

  showMedicineDetails(medicine: any): void {
    // You can implement a modal or detailed view for individual medicines
    console.log('Medicine details:', medicine);

    // Example: Show in a toast or modal
    this.toastr.info(
      `Quantity: ${medicine.quantity}, Charge: ₹${medicine.charge}`,
      `${medicine.medicineName} Details`,
      {
        timeOut: 5000,
        positionClass: 'toast-top-right',
      }
    );
  }

  // ✅ Quick date range methods
  setQuickDateRange(range: string): void {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (range) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        endDate = new Date(startDate);
        break;
      case 'thisWeek':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        endDate = new Date(today);
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today);
        break;
      default:
        return;
    }

    this.pharmaStartDate = startDate.toISOString().split('T')[0];
    this.pharmaEndDate = endDate.toISOString().split('T')[0];
    this.applyPharmaFilters();
  }

  clearDateRange(): void {
    this.pharmaStartDate = null;
    this.pharmaEndDate = null;
    this.applyPharmaFilters();
  }

  editPharmacyRequest(requestId: string): void {
    if (this.hasModuleAccess('pharmaceuticalRequestList', 'update')) {
      this.router.navigate(['/doctor/pharmareq'], {
        queryParams: { _id: requestId },
      });
    }
  }

  // ✅ Get total count for display based on current view mode
  getTotalPharmaCount(): number {
    if (this.isPharmaHistory) {
      // In history mode, return filtered data count
      return this.filteredPharmaRequisitions?.length || 0;
    } else {
      // In today mode, return today's data count
      return this.todayPharmaRequests?.length || 0;
    }
  }

  // combinePharmaDatas(): void {
  //   this.combinedPharmaData = [];

  //   // Add pharmacy requisitions with source identifier
  //   if (this.pharmaRequisitions.length > 0) {
  //     this.combinedPharmaData.push(
  //       ...this.pharmaRequisitions.map((req) => ({
  //         ...req,
  //         source: 'pharmacyRequest',
  //         displayTitle: 'Pharmacy Request',
  //       }))
  //     );
  //   }

  //   // Add diagnosis prescriptions with source identifier
  //   if (this.diagnoses.length > 0) {
  //     this.combinedPharmaData.push(
  //       ...this.diagnoses.map((pres: any) => ({
  //         ...pres,
  //         source: 'diagnosisSheet',
  //         displayTitle: 'Prescription',
  //       }))
  //     );
  //   }

  //   // Sort by creation date (newest first)
  //   // this.combinedPharmaData.sort(((a), b) =>
  //   //   new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  //   // );

  //   console.log('📋 Combined pharma data:', this.combinedPharmaData);
  // }

  loadIpdPathology(id: string) {}

  loadIpdRadiology(id: string) {}

  otsheetList: any[] = []; // Do not use undefined or null!
  selectedOTIndex: number = 0; // default is first surgery

  loadIpdOTSheet(id: string) {
    this.ipdservice.getPatientOTByCase(id).subscribe({
      next: (res) => {
        console.log('OT SHEET', res);
        this.otsheetList = Array.isArray(res) ? res : [res];
        this.otsheetList.forEach((sheet: any) => {
          sheet.surgeryPackage =
            sheet.surgeryPackages?.[0] || sheet.surgeryPackage || null;
        });
        this.selectedOTIndex = 0; // always select first entry by default
      },
      error: (err) => {
        console.error('Error loading ot sheet', err);
      },
    });
  }

  // getSurgeryNames(entry: any): string {
  //   if (entry.manualEntryEnabled && entry.manualOperationEntries?.length) {
  //     return entry.manualOperationEntries[0].name;
  //   }
  //   if (entry.surgeryPackages?.length) {
  //     return entry.surgeryPackages.map((x: any) => x.name).join(', ');
  //   }
  //   if (entry.surgeryPackage?.name) {
  //     return entry.surgeryPackage.name;
  //   }
  //   return 'No Surgery Name';
  // }

  getSurgeryNames(entry: any): string {
    if (entry.manualEntryEnabled && entry.manualOperationEntries?.length) {
      return entry.manualOperationEntries[0].name;
    }
    if (entry.surgeryPackages?.length) {
      return entry.surgeryPackages.map((x: any) => x.name).join(', ');
    }
    if (entry.surgeryPackage?.name) {
      return entry.surgeryPackage.name;
    }
    return 'No Surgery Name';
  }

  selectOTEntry(index: number) {
    this.selectedOTIndex = index;
  }

  getPatientInfo() {
    return this.otsheetList[0]?.uniqueHealthIdentificationId || {};
  }

  loadIpdOTNotes(id: string) {
    this.doctorservice.getOtNoteByCaseId(id).subscribe({
      next: (res) => {
        this.otnotes = res.data || res || [];
        console.log('ot notes', res);
      },
      error: (err) => {
        console.error('Error loading Operation Entry', err);
      },
    });
  }

  loadIpdTreatmentSheet(id: string) {
    this.doctorservice.getTreatmentHistorySheetByCaseId(id).subscribe({
      next: (res) => {
        this.treatmentsheet = Array.isArray(res) ? res : res.data || [];
        console.log('treatment sheet response', this.treatmentsheet);
      },
      error: (err) => {
        console.error('Error loading Treatment sheet', err);
      },
    });
  }

  isBillHistory: boolean = false;
  groupedBills: any[] = [];

  loadIpdBill(id: string) {
    const today = new Date().toISOString().split('T')[0];

    this.ipdservice.getIPDBillByCase(id).subscribe((res) => {
      const bill = res.inpatientBill || res || [];
      console.log("BILLS", bill);
      const billGroups: { [date: string]: any[] } = {};

      bill.forEach((b: any) => {
        const dateStr = b.billingDate || b.createdAt || b.created_at;
        const billingDate = dateStr ? new Date(dateStr) : null;
        const formattedDate =
          billingDate && !isNaN(billingDate.getTime())
            ? billingDate.toISOString().split('T')[0]
            : null;

        b.isToday = formattedDate === today;

        // Group bills by date
        if (formattedDate) {
          if (!billGroups[formattedDate]) {
            billGroups[formattedDate] = [];
          }
          billGroups[formattedDate].push(b);
        }
      });

      // Sort dates descending (latest date first)
      const sortedDates = Object.keys(billGroups).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      );

      // Group by date -> then by billNumber
      this.groupedBills = sortedDates.map((date) => {
        const billsForDate = billGroups[date];
        // Group by billNumber
        const billNumberGroups = billsForDate.reduce((acc, b) => {
          if (!acc[b.billNumber]) {
            acc[b.billNumber] = [];
          }
          acc[b.billNumber].push(b);
          return acc;
        }, {} as { [billNumber: string]: any[] });

        // Convert to array and sort bills descending by billNumber
        const bills = Object.keys(billNumberGroups)
          .sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
            return numB - numA;
          })
          .map((billNumber) => {
            const items = billNumberGroups[billNumber];
            // take billingTime from the first record in this bill group
            const billingTime = items[0].billingTime || null;

            return {
              billNumber,
              totalBillAmount: items.reduce(
                (sum: number, b: any) => sum + (b.totalBillAmount || 0),
                0
              ),
              services: items.flatMap((b: any) => b.serviceId || []),
              billingTime,
            };
          });

        return { date, bills };
      });

      console.log("GROUPED BILLS", this.groupedBills);

      // Directly apply filters (to populate and show data instantly)
      this.applyBillFilters(this.groupedBills);
    });
  }

  transferData: any;
  showTransferEndColumn: any;
  userMap = new Map<string, string>(); // Cache user names by ID

  loadRoomTransferData(id: string) {
    this.ipdservice.getIpdRoomTransferByCase(id).subscribe({
      next: (res) => {
        const transfers = res || [];
        console.log('roommmmm', transfers);
        this.transferData = transfers;

        // Filter by inpatientCaseId
        // this.transferData = transfers.filter(
        //   (t: any) => t.inpatientCaseId?._id === id
        // );

        console.log('Room transfer data', this.transferData);

        // Check if any transfer has a transferEndTime
        this.showTransferEndColumn =
          this.transferData.transfers?.some(
            (transfer: any) => !!transfer.transferEndTime
          ) ?? false;

        // Collect all unique transferredBy IDs
        const userIds: string[] =
          this.transferData.transfers
            ?.map((t: any) => t.transferredBy)
            .filter((id: any): id is string => !!id) || [];

        // Preload users
        userIds.forEach((id: string) => {
          this.userservice.getuserById(id).subscribe({
            next: (res) => {
              this.userMap.set(id, res?.name || 'Unknown');
            },
            error: (err) => {
              console.error('Error loading user', err);
              this.userMap.set(id, 'Error');
            },
          });
        });
      },
      error: (error) => {
        console.error('Error loading', error);
      },
    });
  }

  getUserName(id: string): string {
    // Just return from cache (this runs synchronously)
    return this.userMap.get(id) || '';
  }

  loadIpdDischargeSummary(id: string) {
    this.doctorservice.getDischargeSummaryByCase(id).subscribe({
      next: (res) => {
        this.summary = res;
        console.log('Resposne from discharge data', res);
      },
      error: (err) => {
        console.error('Error occured', err);
      },
    });
  }

  editDischargeSummary(patientid: string) {
    if (this.hasModuleAccess('dischargeSummary', 'update')) {
      this.router.navigate(['/doctor/doctordischarge'], {
        queryParams: { _id: patientid },
      });
    } else {
      console.warn('Access denied for Edit Discharge summary');
    }
  }

  stickerPrint: Boolean = false;
  printSticker(): void {
    this.stickerPrint = true;
    const printContent = document.querySelector(
      '.print-sticker-grid'
    )?.innerHTML;
    if (!printContent) return;

    const WindowPrt = window.open('', '', 'width=900,height=700');
    if (!WindowPrt) return;

    WindowPrt.document.write(`
      <html>
        <head>
          <title>Sticker Print</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 5mm;
            }

            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .sticker-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 2.2mm 2.5mm; /* horizontal and vertical gap */
              width: 200mm;      /* ensure fits within A4 */
              margin: auto;
              justify-items: center;
            }

            .sticker-container {
              width: 48.5mm;
              height: 26.9mm;
              padding: 0.5mm;
              box-sizing: border-box;
              background: #fff;
              overflow: hidden;
              font-size: 10.5px;
              line-height: 1.1;
              border: 0.1mm solid transparent; /* light outline for testing */
            }

            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="sticker-grid">
            ${printContent}
          </div>
        </body>
      </html>
    `);

    WindowPrt.document.close();
  }

  print() {
    const opdElement = document.getElementById('opd-sheet');
    if (!opdElement) return;
    const opdClone = opdElement.cloneNode(true) as HTMLElement;

    // Approximate printable height for A4 at 96 DPI in pixels (297mm ~ 1122px)
    const pageHeightPx = 1122;

    // Helper to insert page breaks dynamically based on height
    function insertPageBreaks(container: HTMLElement, maxHeight: number) {
      let accumulatedHeight = 0;
      const children = Array.from(container.children);
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        accumulatedHeight += child.offsetHeight;

        if (accumulatedHeight > maxHeight) {
          // Insert page break before this element
          const pageBreak = document.createElement('div');
          pageBreak.className = 'page-break';

          container.insertBefore(pageBreak, child);

          // Reset accumulator to height of this element (starting new page)
          accumulatedHeight = child.offsetHeight;
        }
      }
    }

    // Convert images to base64 for cross-origin safety
    const images = opdClone.querySelectorAll('img');
    const convertImageToBase64 = (img: HTMLImageElement) => {
      return new Promise<void>((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = img.src;
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          img.src = canvas.toDataURL('image/png');
          resolve();
        };
        image.onerror = () => resolve();
      });
    };

    Promise.all(
      Array.from(images).map((img) => convertImageToBase64(img))
    ).then(() => {
      // Insert dynamic page breaks into the cloned content
      insertPageBreaks(opdClone, pageHeightPx);

      const printWindow = window.open('', '_blank', 'width=1000,height=1200');
      if (!printWindow) return;
      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((style) => style.outerHTML)
        .join('\n');
      printWindow.document.write(`
      <html>
        <head>
          <title></title>
          ${styles}
          <style>
            body, html {
              margin: 0; padding: 0; width: 100%; height: auto !important;
              overflow: visible !important; font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact;
            }
            .header {
              width: 100%;
              height: auto;           /* let header content set the height */
              min-height: unset;
              box-sizing: border-box;
              overflow: visible;
              margin: 0;
              padding: 0;
            }
            .opd-sheet {
              width: 210mm; /* A4 width */
              min-height: 100vh;
              max-width: 100%;
              overflow: visible !important;
              box-sizing: border-box;
              background: white;
              padding: 15px;
              page-break-inside: avoid;
            }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            .summary-section {
              page-break-inside: avoid !important;
              break-inside: avoid-page !important;
            }
            .page-break {
              display: block;
              height: 0;
              break-before: page;
              page-break-before: always;
            }
            .screen-sticker { display: none !important; }
            .print-sticker-grid { display: block !important; }
          </style>
        </head>
        <body>
          <div id="opd-sheet">${opdClone.outerHTML}</div>
        </body>
      </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        const opdPrintElement =
          printWindow.document.getElementById('opd-sheet');
        if (opdPrintElement) {
          const fullHeight = opdPrintElement.scrollHeight;
          opdPrintElement.style.height = fullHeight + 'px';
        }
        setTimeout(() => {
          printWindow.print();
          printWindow.onafterprint = () => printWindow.close();
        }, 500);
      };
    });
  }

  activeFilter: any;
  recordsPerPage: number = 10;

  applyFilters(data: any) {
    let baselist = data;
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      baselist = baselist.filter((d: any) => {
        const createdAt = d.createdAt || d.created_at;
        const date = new Date(createdAt);
        return date >= start && date <= end;
      });
    }
    this.totalPages = Math.ceil(baselist.length / this.recordsPerPage);
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    this.filtered = baselist.slice(startIndex, endIndex);
  }

  showBillHistory() {
    this.isBillHistory = !this.isBillHistory;
    this.applyBillFilters(this.groupedBills);
  }

  filteredBill: any[] = [];
  applyBillFilters(data: any) {
    // Start with full data set
    let baselist = data;

    // Only filter if at least one date is selected
    if (this.startDate || this.endDate) {
      const start = this.startDate || '0000-01-01'; // Earliest possible
      const end = this.endDate || '9999-12-31'; // Latest possible

      baselist = baselist.filter((group: any) => {
        return group.date >= start && group.date <= end;
      });
    }

    // Always paginate whatever the resulting list is (filtered or not)
    this.totalPages = Math.ceil(baselist.length / this.recordsPerPage);
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    this.filteredBill = baselist.slice(startIndex, endIndex);

    // Optional: Log for debugging
    console.log('Filtered after applyBillFilters:', this.filteredBill);
  }

  previousPage() {}

  nextPage() {}

  ngAfterViewInit(): void {}
  ngAfterViewChecked(): void {}

  // Animation and UI state methods
  getNavItemClass(item: NavigationItem): string {
    return item.active ? 'nav-item active' : 'nav-item';
  }

  getTotalBillAmount(bills: any[]): number {
    return bills?.reduce((sum, b) => sum + (b.totalBillAmount || 0), 0);
  }

  // ✅ Updated navigation methods with permission checks
  onNavigationClick(item: NavigationItem): void {
    // Check permission before allowing navigation
    if (
      item.requiredModule &&
      !this.hasModuleAccess(item.requiredModule, item.requiredAction)
    ) {
      console.warn(
        `Access denied: User doesn't have ${item.requiredAction} permission for ${item.requiredModule}`
      );
      return; // Don't allow navigation
    }

    // Reset all visible items to inactive
    this.visibleNavigationItems.forEach((navItem) => (navItem.active = false));

    // Set clicked item as active
    item.active = true;
    this.currentSection = item.id;

    console.log(`Navigating to: ${item.label}`);

    this.handleSectionChange(item.id);

    if (item.route) {
      this.router.navigate([item.route], {
        queryParams: { id: this.ipdCase?._id },
      });
    }

    if (item.action) {
      item.action();
    }
  }

  private handleSectionChange(sectionId: string): void {
    switch (sectionId) {
      case 'summary':
        console.log('Loading patient summary...');
        break;
      case 'deposit':
        console.log('Loading deposit...');
        this.activeTab = 'vitals';
        break;
      case 'vitals':
        this.isHistory = false;
        console.log('Loading vitals...');
        break;
      case 'diagnosis':
        this.isDiagnosisHistory = false;
        console.log('Loading diagnosis...');
        break;
      case 'pharmaReq':
        console.log('Loading pharmacy requisition...');
        break;
      case 'pathologyReq':
        console.log('Loading pathology requisition...');
        break;
      case 'radioReq':
        console.log('Loading radiology requisition...');
        break;
      case 'operationEntry':
        console.log('Loading operation entry...');
        break;
      case 'Otsheet':
        console.log('Loading OT sheets...');
        break;
      case 'treatmentSheet':
        console.log('Loading treatment sheet...');
        break;
      case 'ipdbill':
        console.log('Loading IPD bill...');
        break;
      case 'dischargeSummary':
        console.log('Loading discharge summary...');
        break;
      case 'discharge':
        console.log('Loading discharge...');
        break;
      default:
        console.log('Unknown section');
    }
  }

  shouldShowContent(section: string): boolean {
    return this.currentSection === section;
  }

  // ✅ Enhanced record action methods with permission checks
  onAddDeposit(patientId: string): void {
    if (this.hasModuleAccess('inpatientDeposit', 'create')) {
      console.log('Add deposit clicked');
      this.router.navigate(['/ipd/ipddeposit'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for Add Deposit');
    }
  }

  onRecordVitalsClick(patientId: string): void {
    if (this.hasModuleAccess('vitals', 'create')) {
      console.log('Record vitals clicked');
      this.router.navigate(['/doctor/vitals'], {
        queryParams: { ipdId: patientId },
      });
    } else {
      console.warn('Access denied for Record Vitals');
    }
  }

  getTabClass(tab: string): string {
    return this.activeTab === tab ? 'tab active' : 'tab';
  }

  // Tab methods
  onTabClick(tab: 'vitals' | 'biometrics' | 'ipdSticker'): void {
    this.activeTab = tab;
    console.log(`Switched to ${tab} tab`);
  }

  // Edit and navigation methods with permission checks
  editVitals(patientid: string) {
    if (this.hasModuleAccess('vitals', 'update')) {
      this.router.navigate(['/doctor/vitals'], {
        queryParams: { _id: patientid },
      });
    } else {
      console.warn('Access denied for Edit Vitals');
    }
  }

  editTreatmentSheet(patientid: string) {
    if (this.hasModuleAccess('treatmentSheet', 'update')) {
      this.router.navigate(['/ipd/treatmentsheet'], {
        queryParams: { _id: patientid },
      });
    } else {
      console.warn('Access denied for Edit Vitals');
    }
  }

  editDiagnosis(patientId: string) {
    if (this.hasModuleAccess('diagnosisSheet', 'update')) {
      this.router.navigate(['doctor/daignosissheet'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for Edit Diagnosis');
    }
  }

  editOTsheet(patientId: string) {
    if (this.hasModuleAccess('oprationTheatresheet', 'update')) {
      this.router.navigate(['/ipd/otsheet'], {
        queryParams: { otid: patientId },
      });
    } else {
      console.warn('Access denied for Edit OT Sheet');
    }
  }

  editDeposit(patientid: string) {
    if (this.hasModuleAccess('inpatientDeposit', 'update')) {
      this.router.navigate(['/ipd/ipddeposit'], {
        queryParams: { _id: patientid },
      });
    } else {
      console.warn('Access denied for Edit Deposit');
    }
  }

  onRecordVitalSignsClick(patientId: string): void {
    if (this.hasModuleAccess('vitals', 'create')) {
      console.log('Record vital signs clicked');
      this.router.navigate(['/doctor/vitals'], {
        queryParams: { ipdId: patientId },
      });
    } else {
      console.warn('Access denied for Record Vital Signs');
    }
  }

  onClickIntermBill(patientId: string) {
    if (this.hasModuleAccess('inpatientIntermBill', 'create')) {
      this.router.navigate(['/ipd/intermbill'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for Interim Bill');
    }
  }

  onClickDiagnosis(patientId: string) {
    if (this.hasModuleAccess('diagnosisSheet', 'create')) {
      this.router.navigate(['doctor/daignosissheet'], {
        queryParams: { _id: patientId },
      });
    } else {
      console.warn('Access denied for Diagnosis');
    }
  }

  onClickTreatmentsheet(patientId: string) {
    if (this.hasModuleAccess('treatmentSheet', 'create')) {
      this.router.navigate(['ipd/treatmentsheet'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for Treatment Sheet');
    }
  }

  // ✅ Enhanced Pharma Request with multiple module support
  onClickPharmaReq(patientId: string) {
    // Navigate if user has any of the permissions
    if (
      this.hasModuleAccess(
        ['pharmaceuticalRequestList', 'diagnosisSheet'],
        'create'
      )
    ) {
      this.router.navigate(['/doctor/pharmareq'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for Pharma Request');
    }
  }

  onClickPathologyReq(patientId: string) {
    if (this.hasModuleAccess('departmentRequestList', 'create')) {
      this.router.navigate(['doctor/pathologyreq'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for Pathology Request');
    }
  }

  onClickRadiologyReq(patientId: string) {
    if (this.hasModuleAccess('departmentRequestList', 'create')) {
      this.router.navigate(['doctor/radiologyreq'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for Radiology Request');
    }
  }

  onClickOTSheet(patientId: string) {
    if (this.hasModuleAccess('oprationTheatresheet', 'create')) {
      this.router.navigate(['ipd/otsheet'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for OT Sheet');
    }
  }

  onClickOTNotes(patientId: string) {
    if (this.hasModuleAccess('operationTheatreNotes', 'create')) {
      this.router.navigate(['doctor/otnotes'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for OT Notes');
    }
  }

  onClickDailyProgressReport(patientId: string) {
    if (this.hasModuleAccess('dailyProgressReport', 'create')) {
      this.router.navigate(['ipd/dailyprogressreport'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for Treatment Sheet');
    }
  }

  onClickTreatmentSheet(patientId: string) {
    if (this.hasModuleAccess('treatmentHistorySheet', 'create')) {
      this.router.navigate(['doctor/tretmentordersheet'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for Treatment Sheet');
    }
  }

  onClickIPDBill(patientId: string) {
    if (this.hasModuleAccess('inpatientBilling', 'create')) {
      this.router.navigate(['ipd/ipdbill'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for IPD Bill');
    }
  }

  onClickDischarge(patientId: string) {
    if (this.hasModuleAccess('discharge', 'create')) {
      this.router.navigate(['ipd/ipddischarge'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for Discharge');
    }
  }

  onClickDischargeSummary(patientId: string) {
    if (this.hasModuleAccess('dischargeSummary', 'create')) {
      this.router.navigate(['doctor/doctordischarge'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for Discharge Summary');
    }
  }

  onClickDietChart(patientId: string) {
    if (this.hasModuleAccess('departmentRequestList', 'create')) {
      this.router.navigate(['ipd/dietchart'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for Radiology Request');
    }
  }

  // Medication methods
  onAddMedicationClick(): void {
    console.log('Add medication clicked');
    this.navigateToAddMedication();
  }

  selectedSummary: any;
  summaryOpen: boolean = false;
  openDischargeSummary(summary: any) {
    this.summaryOpen = true;
    this.selectedSummary = summary;
  }

  private navigateToAddMedication(): void {
    console.log('Navigating to add medication form...');
  }

  selectedPatientBill: any;
  amountInWords: any;
  viewPatientBill(patientId: string): void {
    // console.log('Patient ID:', patientId);
    this.ipdservice.getPatientIntermHistoryByCaseId(patientId).subscribe({
      next: (res) => {
        console.log('getinpatientIntermBillhistory response', res);
        const bill = res[0] || res;
        this.selectedPatientBill = bill || null;

        if (this.selectedPatientBill) {
          this.amountInWords =
            this.convertNumberToWords(this.selectedPatientBill.total) +
            ' rupees';

          this.selectedPatientBill.amountInWords = this.amountInWords;
        }
        console.log('Latest Interim Bill:', this.selectedPatientBill);
        this.extractServices(this.selectedPatientBill);
      },
      error: (err) => {
        console.error('Error fetching interim bills:', err);
      },
    });
  }

  estimateBill: any;
  roomCharge: any;
  serviceCharge: any;
  otcharge: any;
  total: any;
  showEstimate: boolean = false;
  showFinalBill: boolean = false;

  showestimate() {
    this.showEstimate = true;
  }

  showFinalbill() {
    this.showFinalBill = true;
  }

  finalRoomCharge: any;
  otData: any;
  amountinwords: any;
  loadPatientEstimate(patientId: string) {
    this.ipdservice.getIPDcaseById(patientId).subscribe((res) => {
      const casedata = res.data || res;

      this.ipdservice.getPatientIntermByCaseId(patientId).subscribe({
        next: (res: any) => {
          const interm = res.data[0] || res;
          this.estimateBill = interm;
          console.log(
            '🚀 ~ IpdpatientsummaryComponent ~ loadPatientEstimate ~ this.estimateBill:',
            this.estimateBill
          );
          this.otData = interm.operationtheatresheet || [];

          this.generateEstimate(interm);

          const admissionDate = new Date(interm.inpatientCase?.admissionDate);
          const isDischarge = interm.inpatientCase?.isDischarge;
          const today = new Date();
          const endDate = isDischarge
            ? new Date(interm.inpatientCase?.dischargeDate || today)
            : today;

          const oneDay = 1000 * 60 * 60 * 24;
          const daysStay =
            Math.floor((endDate.getTime() - admissionDate.getTime()) / oneDay) +
            1;

          // 💡 Identify cashless patient
          // const isCashless = casedata.patient_type === 'cashless';

          if (
            !Array.isArray(this.transferData.dailyRoomChargeLogs) ||
            this.transferData.dailyRoomChargeLogs.length === 0
          ) {
            return;
          }
          const finalRoomCharge = this.transferData.dailyRoomChargeLogs.reduce(
            (sum: any, item: any) => {
              const room = Number(item?.roomCharge) || 0;
              const bed = Number(item?.bedCharge) || 0;
              return sum + room + bed;
            },
            0
          );
          this.roomCharge = finalRoomCharge;

          // --- Common section ---
          const inpatientBills = interm.inpatientBills || [];
          const totalServiceCharge = inpatientBills.reduce(
            (sum: number, bill: any) => sum + (bill.totalBillAmount || 0),
            0
          );

          const otCharges =
            interm.operationtheatresheet?.reduce(
              (sum: number, ot: any) => sum + (ot.netAmount || 0),
              0
            ) || 0;

          const grandTotal = this.roomCharge + totalServiceCharge + otCharges;
          this.serviceCharge = totalServiceCharge;
          this.otcharge = otCharges;
          this.total = grandTotal;
          this.amountinwords = this.convertNumberToWords(this.total) + ' only';

          // console.log('🧾 Summary');
          // console.log('Room Charge:', this.roomCharge);
          // console.log('Service Charge:', totalServiceCharge);
          // console.log('OT Charges:', otCharges);
          // console.log('Grand Total:', grandTotal);
        },
        error: (err) => {
          console.error('❌ Error loading estimate bill', err);
        },
      });
    });
  }

  generateEstimate(patient: any) {
    // console.log('🧾 Generating estimate for:', patient);

    // --- 1️⃣ Generate Service List ---
    this.extractEstimateServices(patient);
    const today = new Date();
    const isDischarge = patient.inpatientCase?.isDischarge || false;
    const endDate = isDischarge
      ? new Date(patient.inpatientCase?.dischargeDate || today)
      : today;

    if (
      !Array.isArray(this.transferData.dailyRoomChargeLogs) ||
      this.transferData.dailyRoomChargeLogs.length === 0
    ) {
      return;
    }
    const finalRoomCharge = this.transferData.dailyRoomChargeLogs.reduce(
      (sum: any, item: any) => {
        const room = Number(item?.roomCharge) || 0;
        const bed = Number(item?.bedCharge) || 0;
        return sum + room + bed;
      },
      0
    );
    this.finalRoomCharge = finalRoomCharge;
    this.roomCharge = this.finalRoomCharge;

    this.dailyRoomCharges = this.transferData.dailyRoomChargeLogs;
    // console.log(
    //   '🚀 ~ IpdpatientsummaryComponent ~ generateEstimate ~  this.dailyRoomCharges:',
    //   this.dailyRoomCharges
    // );

    // --- 6️⃣ Totals ---
    this.serviceCharge = this.serviceList.services.reduce(
      (sum: any, s: any) => sum + s.charge,
      0
    );

    this.total = this.roomCharge + this.serviceCharge;

    // console.log('✅ Room Charge:', this.roomCharge);
    // console.log('✅ Bed Charge:', this.bedCharge);
    // console.log('✅ Service Charge:', this.serviceCharge);
    // console.log('💰 Grand Total:', this.total);
  }

  extractEstimateServices(patient: any) {
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
          total: service.totalAmount
        };

        if (service.type === 'ipd') {
          ipdServices.push(serviceData);
        } else if (service.type === 'radiology') {
          radiologyServices.push(serviceData);
        }
        console.log('HERE PRINTING SERVICE DAAT', serviceData);
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

  extractServices(patient: any) {
    if (!patient || patient.inpatientCase[0]?.isDischarge) return;

    let ipdServices: any[] = [];
    let radiologyServices: any[] = [];

    patient.inpatientBills?.forEach((bill: any) => {
      bill.serviceId?.forEach((service: any) => {
        const serviceData = {
          doctor: patient.consultingDoctor?.name,
          service: service.name,
          charge: service.charge,
          date: bill.billingDate,
        };

        if (service.type === 'ipd') {
          ipdServices.push(serviceData);
        } else if (service.type === 'radiology') {
          radiologyServices.push(serviceData);
        }
      });
    });

    this.serviceData = {
      services: ipdServices,
      totalAmount: ipdServices.reduce((sum, s) => sum + (+s.charge || 0), 0),
    };

    this.radioData = {
      services: radiologyServices,
      totalAmount: radiologyServices.reduce(
        (sum, s) => sum + (+s.charge || 0),
        0
      ),
    };
  }

  convertNumberToWords(amount: number): string {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
      return '';
    }

    amount = Number(amount);

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

    const parts = amount.toString().split('.');
    const rupeesPart = Number(parts[0]);
    const paisePart = parts[1] ? Number(parts[1]) : 0;

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

    let words = (numToWords(rupeesPart).trim() || 'zero') + ' rupees';
    if (paise > 0) words += ' and ' + numToWords(paise).trim() + ' paise';

    return words;
  }

  closeModal(): void {
    this.selectedPatientBill = null;
    this.selectedSummary = null;
    this.selectedDietChart = null;
  }
  // ✅ CORRECTED: Properties
  companyRates: any = null; // ✅ Changed from array to object since your API returns an object
  loadingCompanyRates: boolean = false; // ✅ Add loading state

  // Search and filter properties
  serviceSearchTerm: string = '';
  serviceTypeFilter: string = '';
  filteredServices: any[] = [];
  showAllServices: boolean = false;

  // ✅ CORRECTED: Load company rates method

  // ✅ NEW: Initialize filtered services
  initializeFilteredServices(): void {
    if (this.companyRates?.lockedServiceRates) {
      this.filteredServices = [...this.companyRates.lockedServiceRates];
    } else {
      this.filteredServices = [];
    }
  }

  // ✅ CORRECTED: Filter services method
  filterServices(): void {
    if (!this.companyRates?.lockedServiceRates) {
      this.filteredServices = [];
      return;
    }

    this.filteredServices = this.companyRates.lockedServiceRates.filter(
      (service: any) => {
        const matchesSearch =
          !this.serviceSearchTerm ||
          service.serviceName
            .toLowerCase()
            .includes(this.serviceSearchTerm.toLowerCase()) ||
          service.serviceId?.name
            ?.toLowerCase()
            .includes(this.serviceSearchTerm.toLowerCase());

        const matchesType =
          !this.serviceTypeFilter ||
          service.serviceType === this.serviceTypeFilter;

        return matchesSearch && matchesType;
      }
    );
  }

  // diet chart

  dietCharts: any[] = [];
  isLoadingDietCharts = false;
  showTodayOnly = true;
  selectedDateRange = {
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  };

  loadDietCharts(inpatientCaseId: string): void {
    this.isLoadingDietCharts = true;

    const options = this.showTodayOnly
      ? { dietDate: new Date().toISOString().split('T')[0] }
      : { dateRange: this.selectedDateRange };

    this.dietService.getDietChartsByCase(inpatientCaseId, options).subscribe({
      next: (response) => {
        this.dietCharts = response.data || [];
        this.isLoadingDietCharts = false;
        console.log('Diet charts loaded:', this.dietCharts);
      },
      error: (error) => {
        console.error('Error loading diet charts:', error);
        this.dietCharts = [];
        this.isLoadingDietCharts = false;
      },
    });
  }

  // ✅ Quick filter methods
  // ✅ Better date handling methods
  getDayInLocalTimezone(daysOffset: number = 0): string {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);

    // Get local date components to avoid timezone issues
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // ✅ Updated quick filter methods
  showTodaysDietCharts(): void {
    this.showTodayOnly = true;
    const today = this.getDayInLocalTimezone(0); // Today
    this.selectedDateRange = { from: today, to: today };

    if (this.ipdId) {
      this.loadDietCharts(this.ipdId);
    }
  }

  showYesterdaysDietCharts(): void {
    this.showTodayOnly = false;
    const yesterday = this.getDayInLocalTimezone(-1); // Yesterday
    this.selectedDateRange = { from: yesterday, to: yesterday };

    if (this.ipdId) {
      this.loadDietCharts(this.ipdId);
    }
  }

  showThisWeeksDietCharts(): void {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    this.showTodayOnly = false;
    this.selectedDateRange = {
      from: this.formatDateForComparison(weekStart),
      to: this.getDayInLocalTimezone(0),
    };

    if (this.ipdId) {
      this.loadDietCharts(this.ipdId);
    }
  }

  showThisMonthsDietCharts(): void {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    this.showTodayOnly = false;
    this.selectedDateRange = {
      from: this.formatDateForComparison(monthStart),
      to: this.getDayInLocalTimezone(0),
    };

    if (this.ipdId) {
      this.loadDietCharts(this.ipdId);
    }
  }

  // ✅ Helper method for consistent date formatting
  private formatDateForComparison(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  clearDateFilter(): void {
    this.showTodayOnly = true;
    this.selectedDateRange = {
      from: new Date().toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0],
    };
    if (this.ipdId) {
      this.loadDietCharts(this.ipdId);
    }
  }

  // ✅ Apply custom date range
  applyDateRange(): void {
    this.showTodayOnly = false;
    if (this.ipdId) {
      this.loadDietCharts(this.ipdId);
    }
  }

  // ✅ Diet chart actions

  editDietChart(dietChart: any): void {
    this.router.navigate(['/ipd/dietchart'], {
      queryParams: {
        id: this.ipdId,
        dietChartId: dietChart._id,
        edit: true,
      },
    });
  }

  // Add these properties to your component
  selectedDietChart: any = null;

  viewDietChart(dietChart: any): void {
    this.selectedDietChart = dietChart;

    // Open Bootstrap modal programmatically
    const modalElement = document.getElementById('viewDietChartModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Helper methods for better data display
  getMealIcon(mealTime: string): string {
    const icons: { [key: string]: string } = {
      breakfast: 'fas fa-coffee',
      lunch: 'fas fa-utensils',
      dinner: 'fas fa-moon',
      evening_snack: 'fas fa-cookie-bite',
      night_snack: 'fas fa-cookie',
    };
    return icons[mealTime] || 'fas fa-utensils';
  }

  getMealDisplayName(mealTime: string): string {
    const names: { [key: string]: string } = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      evening_snack: 'Evening Snack',
      night_snack: 'Night Snack',
    };
    return (
      names[mealTime] ||
      mealTime.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    );
  }

  deleteDietChart(dietChart: any): void {
    if (
      confirm(
        `Are you sure you want to delete the diet chart for ${new Date(
          dietChart.dietDate
        ).toLocaleDateString()}?`
      )
    ) {
      this.dietService.deleteDietChart(dietChart._id).subscribe({
        next: () => {
          this.loadDietCharts(this.ipdId);
          alert('Diet chart deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting diet chart:', error);
          alert('Error deleting diet chart');
        },
      });
    }
  }

  getDietTypeLabel(type: string): string {
    const dietTypes = {
      normal: 'Normal Diet',
      diabetic: 'Diabetic Diet',
      cardiac: 'Cardiac Diet',
      renal: 'Renal Diet',
      liquid: 'Liquid Diet',
      soft: 'Soft Diet',
      npom: 'NPO Modified',
    };
    return dietTypes[type as keyof typeof dietTypes] || type;
  }

  getDietTypeClass(type: string): string {
    const typeClasses = {
      normal: 'badge-success',
      diabetic: 'badge-warning',
      cardiac: 'badge-danger',
      renal: 'badge-info',
      liquid: 'badge-primary',
      soft: 'badge-secondary',
      npom: 'badge-dark',
    };
    return typeClasses[type as keyof typeof typeClasses] || 'badge-light';
  }
  // diet chart

  toggleShowAllServices(): void {
    this.showAllServices = !this.showAllServices;
  }

  // ✅ CORRECTED: Get discounted services count
  getDiscountedServicesCount(): number {
    if (!this.companyRates?.lockedServiceRates) return 0;

    return this.companyRates.lockedServiceRates.filter(
      (service: any) => service.originalRate > service.lockedRate
    ).length;
  }

  // ✅ CORRECTED: Get total savings
  getTotalSavings(): number {
    if (!this.companyRates?.lockedServiceRates) return 0;

    return this.companyRates.lockedServiceRates.reduce(
      (total: number, service: any) => {
        return (
          total +
          (service.originalRate > service.lockedRate
            ? service.originalRate - service.lockedRate
            : 0)
        );
      },
      0
    );
  }

  // ✅ CORRECTED: Get services by type
  getServicesByType(type: string): any[] {
    if (!this.companyRates?.lockedServiceRates) return [];

    return this.companyRates.lockedServiceRates.filter(
      (service: any) => service.serviceType === type
    );
  }

  // ✅ Add this property for active tab
  activeTabs: string = 'services';

  // ✅ Add this method
  setActiveTab(tab: string): void {
    this.activeTabs = tab;
    console.log('Active tab set to:', tab);
  }

  // ✅ Update your loadCompanyRates method to set default tab
  loadCompanyRates(ipdid: string): void {
    console.log(
      '🚀 ~ IpdpatientsummaryComponent ~ loadCompanyRates ~ ipdid:',
      ipdid
    );

    this.loadingCompanyRates = true;

    this.ipdservice.getCompanyLockedRates(ipdid).subscribe({
      next: (response) => {
        console.log('✅ Company rates loaded:', response);
        this.companyRates = response.data;

        // ✅ Initialize filtered services after data loads
        this.initializeFilteredServices();

        // ✅ Set default tab
        this.activeTabs = 'services';

        console.log(
          '🚀 ~ IpdpatientsummaryComponent ~ loadCompanyRates ~ this.companyRates:',
          this.companyRates
        );
        this.loadingCompanyRates = false;
      },
      error: (error) => {
        console.error('❌ Error loading company rates:', error);
        this.loadingCompanyRates = false;
        this.companyRates = null;
      },
    });
  }

  treatmentSheet: any;
  loadTreatmentSheetData(id: string) {
    this.ipdservice.getTreatmentSheetByCase(id).subscribe({
      next: (res) => {
        this.treatmentSheet = res || res.data;
        console.log('Treatment sheet data', this.treatmentSheet);
      },
      error: (err) => {
        console.log('Error fetching Treatment sheet data', err);
      },
    });
  }

  progressdata: any;
  allProgressdata: any[] = [];
  isProgressHistory: boolean = false;
  loadDailyProgressData(id: string) {
    const date = new Date();
    const today = date.toISOString().split('T')[0];

    this.ipdservice.getProgressReportByCase(id).subscribe((res) => {
      const report = res || [];

      // Sort by created date descending (latest first)
      const sortedReport = report.sort((a: any, b: any) => {
        return (
          new Date(b.createdAt || b.created_at).getTime() -
          new Date(a.createdAt || a.created_at).getTime()
        );
      });

      // Take only the most recent diagnosis for today
      this.progressdata =
        sortedReport.find((v: any) => {
          const createdDate = new Date(v.createdAt || v.created_at)
            .toISOString()
            .split('T')[0];
          return createdDate === today;
        }) || null;

      console.log('Most recent progress data today:', this.progressdata);

      // Keep all diagnoses if you need them elsewhere
      this.allProgressdata = report;
      console.log('All progress data:', this.allProgressdata);

      this.applyFilters(this.allProgressdata);
    });
  }

  // ✅ REMOVED: This method is not needed for IPD case, only for company master
  // You can remove the viewCompanyRates method since you're using loadCompanyRates instead

  // ✅ Add these methods to your component

  getBillingTypeLabel(billingType: string): string {
    const labels: { [key: string]: string } = {
      hourly: 'Per Hour',
      daily: 'Per Day',
      session: 'Per Session',
      quantity: 'Per Unit',
      fixed: 'Fixed Charge',
    };
    return labels[billingType] || 'Fixed Charge';
  }

  getDefaultUnitLabel(billingType: string): string {
    const labels: { [key: string]: string } = {
      hourly: 'hour',
      daily: 'day',
      session: 'session',
      quantity: 'unit',
      fixed: 'service',
    };
    return labels[billingType] || 'unit';
  }

  getBillTotalAmount(bill: any): number {
    if (bill.totalBillAmount !== undefined) {
      return bill.totalBillAmount;
    }

    // Calculate from services if totalBillAmount is not available
    if (bill.services && bill.services.length > 0) {
      return bill.services.reduce((total: number, service: any) => {
        return total + (service.totalAmount || service.charge || 0);
      }, 0);
    }

    return 0;
  }


  // Add to your existing component
visits: any[] = [];
showVisitModal = false;
selectedInpatientCaseId?: string;

loadVisitsByCase(ipid : string) {
  // if (this.ipdId && this.hasModuleAccess('visitmaster', 'read')) {
    this.visitService.getVisitByCase(ipid).subscribe({
      next: (res) => {
        this.visits = res || [];
      }
    });
  // }
}

opemdalofcreatevisit(patientId : string) {
  // this.selectedInpatientCaseId = this.ipdId;
  // this.showVisitModal = true;
   if (this.hasModuleAccess('visittypemaster', 'create')) {
      this.router.navigate(['/master/visitmaster'], {
        queryParams: { id: patientId },
      });
    } else {
      console.warn('Access denied for Treatment Sheet');
    }
}


onVisitCreated(visit: any) {
  this.showVisitModal = false;
  this.loadVisitsByCase(this.ipdId); // Refresh visits list
}

}
