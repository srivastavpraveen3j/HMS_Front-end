import { CommonModule } from '@angular/common';
import { Component, AfterViewChecked, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IpdService } from '../ipdservice/ipd.service';
import { DoctorService } from '../../doctormodule/doctorservice/doctor.service';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from '../../mastermodule/usermaster/service/role.service';
import { DietchartService } from '../bedwisedietchart/service/dietchart.service';
import { FormsModule } from '@angular/forms';
import { DischargesummaryreportComponent } from '../../doctormodule/dischargesummaryreport/dischargesummaryreport.component';
import { LetterheaderComponent } from '../../settingsmodule/letterhead/letterheader/letterheader.component';
import { IpdpatientinfoComponent } from '../../../component/ipdcustomfiles/ipdpatientinfo/ipdpatientinfo.component';
import { VitalchartComponent } from '../vitalchart/vitalchart.component';
import { GrowthchartComponent } from '../growthchart/growthchart.component';
import { IndianCurrencyPipe } from '../../../pipe/indian-currency.pipe';

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
  selector: 'app-indoordischargesummary',
  imports: [
    CommonModule,
    FormsModule,
    DischargesummaryreportComponent,
    LetterheaderComponent,
    RouterModule,
    VitalchartComponent,
    GrowthchartComponent,
    IndianCurrencyPipe,
  ],
  templateUrl: './indoordischargesummary.component.html',
  styleUrl: './indoordischargesummary.component.css',
})
export class IndoordischargesummaryComponent
  implements OnInit, AfterViewChecked, AfterViewInit
{
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ipdservice: IpdService,
    private doctorservice: DoctorService,
    private toastr: ToastrService,
    private userservice: RoleService,
    private dietService: DietchartService
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
      label: 'Room Transfer',
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
  deposit: any;
  diagnosis: any;
  bill: any;
  otsheet: any;
  otnotes: any;
  treatmentsheet: any;
  services: any;
  doctorId: string = '';
  summary: any;
  user: any;
  stickerCount: number = 40;

  ngOnInit(): void {
    const userStr = JSON.parse(localStorage.getItem('authUser') || '[]');
    this.user = userStr.name;

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
    });

    // Set default dates
    const date = new Date();
    const today = date.toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;
  }

  // ✅ Add this method to properly reset component state
  private resetComponentState(): void {
    console.log('🔄 Resetting component state for new patient');

    // Reset data
    this.allPharmaRequisitions = [];
    this.vitals = [];
    this.diagnoses = [];
    this.diagnosis = null;
  }

  // ✅ Enhanced data loading with proper sequencing
  private loadPatientDataSequentially(ipdId: string): void {
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
    }, 200);
  }

  private loadPharmacyDataWithRetry(id: string, retryCount: number = 0): void {
    const maxRetries = 2;

    console.log(`🔄 Loading pharmacy data (attempt ${retryCount + 1}):`, id);

    if (this.hasModuleAccess('pharmaceuticalRequestList', 'read')) {
      this.doctorservice.getpharmaByIpdCaseId(id).subscribe({
        next: (res: any) => {
          const pharmacyData = res?.data || res || [];

          if (pharmacyData.length === 0 && retryCount < maxRetries) {
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
        } else {
          // No data found → clear arrays
          this.vitals = [];
        }
      },
      () => {
        // API error → fallback to empty arrays
        this.vitals = [];
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
    this.doctorservice.getDiagnosisByIpdCaseId(id).subscribe((res) => {
      const diagnosis = res.diagnosis || res || [];
      this.diagnoses = diagnosis;
      console.log('All diagnoses:', this.diagnoses);
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

  allPharmaRequisitions: any[] = []; // Store all data

  loadIpdPharma(id: string): void {
    if (this.hasModuleAccess('pharmaceuticalRequestList', 'read')) {
      this.doctorservice.getpharmaByIpdCaseId(id).subscribe({
        next: (res: any) => {
          this.allPharmaRequisitions = res?.data || res || [];
          console.log(
            '📋 All Pharmacy requisitions loaded:',
            this.allPharmaRequisitions
          );
        },
        error: (err) => {
          console.error('Error loading pharmacy requisitions:', err);
        },
      });
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
          },
          error: (err) => {
            console.error('Error loading pharmacy requisitions:', err);
          },
        });
    }
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

  editPharmacyRequest(requestId: string): void {
    if (this.hasModuleAccess('pharmaceuticalRequestList', 'update')) {
      this.router.navigate(['/doctor/pharmareq'], {
        queryParams: { _id: requestId },
      });
    }
  }

  // ✅ Get total count for display based on current view mode
  getTotalPharmaCount(): number {
    return this.allPharmaRequisitions?.length || 0;
  }

  loadIpdPathology(id: string) {}

  loadIpdRadiology(id: string) {}

  loadIpdOTSheet(id: string) {
    this.ipdservice.getPatientOTByCase(id).subscribe({
      next: (res) => {
        this.otsheet = res.data || res || {};
        console.log('OT sheet', this.otsheet);
      },
      error: (err) => {
        console.error('Error loading ot sheet', err);
      },
    });
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

  groupedBills: any;
  loadIpdBill(id: string) {
    const today = new Date().toISOString().split('T')[0];

    this.ipdservice.getIPDBillByCase(id).subscribe((res) => {
      const bill = res.inpatientBill || res || [];
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
            return {
              billNumber,
              totalBillAmount: items.reduce(
                (sum: number, b: any) => sum + (b.totalBillAmount || 0),
                0
              ),
              services: items.flatMap((b: any) => b.serviceId || []),
            };
          });

        return { date, bills };
      });
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
          <title>Discharge summary</title>
          ${styles}
          <style>
          body, html {
            margin: 0; padding: 0; width: 100%; height: auto !important;
            overflow: visible !important; font-family: Arial, sans-serif;
            -webkit-print-color-adjust: exact;
          }
          #opd-sheet {
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
          /* ADD THIS */
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
        // Dynamically set height for full content to prevent cutting off
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
        console.log('Loading vitals...');
        break;
      case 'diagnosis':
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
    this.ipdservice.getinpatientIntermBillhistory().subscribe({
      next: (res) => {
        const allBills = res.intermBill || res;

        this.ipdservice.getIPDcaseById(patientId).subscribe((res) => {
          const patient = res.data || res;
          // console.log('patient', patient);
          this.selectedPatientBill.ipdNum = patient.inpatientCaseNumber;
        });

        // Filter bills for current patient
        const patientBills = allBills.filter(
          (bill: any) =>
            Array.isArray(bill.inpatientCase) &&
            bill.inpatientCase.some(
              (caseItem: any) => caseItem._id === patientId
            )
        );

        // console.log("patient bills",patientBills);

        // Sort by createdAt (or billDate) descending to get latest first
        const sortedBills = patientBills.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // console.log("SORTED",sortedBills);
        // Pick the latest one
        this.selectedPatientBill = sortedBills[0] || null;

        if (this.selectedPatientBill) {
          this.selectedPatientBill.entryByUser = this.user;
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
  loadPatientEstimate(patientId: string) {
    this.ipdservice.getIPDcaseById(patientId).subscribe((res) => {
      const casedata = res.data || res;
      console.log('casedata from estimate', casedata);
      const uhid = casedata.uniqueHealthIdentificationId?.uhid;

      this.ipdservice.getPatientIntermByUhid(uhid).subscribe({
        next: (res: any) => {
          const interm = res.intermBill[0] || res;
          this.estimateBill = interm;
          console.log('🧾 Interm Bill:', this.estimateBill);

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
          const isCashless = casedata.patient_type === 'cashless';
          // 1️⃣ Get patient's room type name
          const patientRoomTypeName =
            interm.inpatientCase?.room?.roomType?.name;
          const patientBedTypeName = interm.inpatientCase?.bed?.bedType?.name;

          // 2️⃣ Find matching locked rate from companyRates
          const matchedRoomRate = this.companyRates?.lockedRoomTypeRates?.find(
            (r: any) => r.roomTypeName === patientRoomTypeName
          );
          const matchedBedRate = this.companyRates?.lockedBedTypeRates?.find(
            (b: any) => b.bedTypeName === patientBedTypeName
          );

          // 3️⃣ Use those locked rates
          const bedPricePerDay = matchedBedRate?.lockedRate || 0;
          const roomPricePerDay = matchedRoomRate?.lockedRate || 0;

          // --- CASE 1: Has transfer data ---
          if (this.transferData) {
            console.log('🔁 Transfer data detected');
            const transferCharges = this.transferData.transfers
              .filter((t: any) => t.transferType !== 'permanent')
              .map((t: any) => +t.totalCharge || 0);
            const totalTransferCharge = transferCharges.reduce(
              (sum: any, c: any) => sum + c,
              0
            );

            const assignedDateStr = this.transferData.primaryBed?.assignedDate;
            let daysStayed = 0;

            if (assignedDateStr) {
              const assignedDate = new Date(assignedDateStr);
              const diffInTime = today.getTime() - assignedDate.getTime();
              daysStayed = Math.ceil(diffInTime / (1000 * 3600 * 24));
            }

            // 🏨 Use locked rates if cashless, otherwise standard
            const primaryBedCharge = isCashless
              ? bedPricePerDay
              : +this.transferData.primaryBed?.bedCharge || 0;

            const primaryRoomCharge = isCashless
              ? roomPricePerDay
              : +this.transferData.primaryBed?.roomCharge || 0;

            const totalPrimaryCharges =
              daysStayed * (primaryBedCharge + primaryRoomCharge);

            const permanentCharges = this.transferData.transfers
              .filter((t: any) => t.transferType === 'permanent')
              .map((t: any) =>
                isCashless
                  ? (this.companyRates?.assignedRoomRate?.lockedRate || 0) +
                    (this.companyRates?.assignedBedRate?.lockedRate || 0)
                  : +t.roomCharge + +t.bedCharge || 0
              );

            const totalPermanentCharge = permanentCharges.reduce(
              (sum: any, c: any) => sum + c,
              0
            );

            const finalRoomCharge =
              totalPrimaryCharges + totalTransferCharge + totalPermanentCharge;

            this.finalRoomCharge = finalRoomCharge;
            this.roomCharge = finalRoomCharge;
            if (isCashless) {
              console.log('🏨 cashless room price per day:', roomPricePerDay);
              console.log(
                '🏨 total room charge + bed charge:',
                totalPrimaryCharges
              );
              console.log(
                '🏨 Final Room Charge (transfer+cashless):',
                finalRoomCharge
              );
            } else {
              console.log('🏨 Final Room Charge (transfer):', finalRoomCharge);
            }
          }

          // --- CASE 2: Cashless (no transfer) ---
          else if (isCashless) {
            console.log('💳 Cashless patient — using locked rates');

            const dailyCharge = bedPricePerDay + roomPricePerDay;
            const totalBedRoomCharge = daysStay * dailyCharge;
            this.roomCharge = totalBedRoomCharge;
            console.log('💰 Cashless Room Charge:', totalBedRoomCharge);
          }

          // --- CASE 3: Regular (no transfer, not cashless) ---
          else {
            console.log('🏥 Regular patient — using standard room rates');
            const bedPricePerDay =
              interm.inpatientCase?.bed?.bedType?.price_per_day || 0;
            const roomPricePerDay =
              interm.inpatientCase?.room?.roomType?.price_per_day || 0;
            const dailyCharge = bedPricePerDay + roomPricePerDay;

            const totalBedRoomCharge = daysStay * dailyCharge;
            this.roomCharge = totalBedRoomCharge;
            console.log('💰 Standard Room Charge:', totalBedRoomCharge);
          }

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

          console.log('🧾 Summary');
          console.log('Room Charge:', this.roomCharge);
          console.log('Service Charge:', totalServiceCharge);
          console.log('OT Charges:', otCharges);
          console.log('Grand Total:', grandTotal);
        },
        error: (err) => {
          console.error('❌ Error loading estimate bill', err);
        },
      });
    });
  }

  dailyRoomCharges: any;
  bedCharge: any;
  transferCharge: any;
  transferInProgress: any;
  generateEstimate(patient: any) {
    console.log('🧾 Generating estimate for:', patient);

    // --- 1️⃣ Generate Service List ---
    let tempServices: any[] = [];
    patient.inpatientBills?.forEach((bill: any) => {
      bill.serviceId?.forEach((svc: any) => {
        tempServices.push({
          service: svc.name,
          charge: svc.charge,
          date: new Date(bill.billingDate),
        });
      });
    });
    this.serviceList = tempServices;

    // --- 2️⃣ Admission/Discharge Dates ---
    const admissionDate = new Date(
      patient.inpatientCase?.admissionDate || patient.dor
    );
    const today = new Date();
    const isDischarge = patient.inpatientCase?.isDischarge || false;
    const endDate = isDischarge
      ? new Date(patient.inpatientCase?.dischargeDate || today)
      : today;

    const oneDay = 1000 * 60 * 60 * 24;
    const daysStay =
      Math.floor((endDate.getTime() - admissionDate.getTime()) / oneDay) + 1;

    // console.log(`📅 Days Stayed: ${daysStay}`);

    // --- 3️⃣ Detect Patient Type & Transfer ---
    const isCashless = this.ipdCase?.patient_type === 'cashless';
    const hasTransfer = !!this.transferData;

    let bedPricePerDay = 0;
    let roomPricePerDay = 0;
    let transferChargeTotal: number | string = 0;

    // --- 4️⃣ Determine Rates ---
    if (hasTransfer) {
      const transfers = this.transferData.transfers?.filter(
        (t: any) => t.transferType !== 'permanent'
      );

      // 🕒 Check if any transfer is still ongoing (no end time)
      const ongoingTransfer = transfers?.some((t: any) => !t.transferEndTime);

      if (ongoingTransfer) {
        transferChargeTotal = 'In Calculation';
      } else {
        const transferCharges = transfers?.map((t: any) => +t.totalCharge || 0);
        transferChargeTotal = transferCharges?.reduce(
          (sum: any, c: any) => sum + c,
          0
        );
      }

      if (isCashless) {
        // 💳 Cashless + Transfer → Locked rates + transfer charges
        bedPricePerDay =
          this.companyRates?.lockedBedTypeRates?.find(
            (b: any) =>
              b.bedTypeName === patient.inpatientCase?.bed?.bedType?.name
          )?.lockedRate || 0;

        roomPricePerDay =
          this.companyRates?.lockedRoomTypeRates?.find(
            (r: any) =>
              r.roomTypeName === patient.inpatientCase?.room?.roomType?.name
          )?.lockedRate || 0;

        // console.log(
        //   `💳 Cashless + Transfer: Locked Bed = ${bedPricePerDay}, Locked Room = ${roomPricePerDay}`
        // );
      } else {
        // 🔁 Transfer only → Use transferData rates
        bedPricePerDay = +this.transferData.primaryBed?.bedCharge || 0;
        roomPricePerDay = +this.transferData.primaryBed?.roomCharge || 0;
        // console.log(
        //   `🔁 Transfer only: Bed = ${bedPricePerDay}, Room = ${roomPricePerDay}`
        // );
      }
    } else if (isCashless) {
      // 💳 Cashless only
      bedPricePerDay =
        this.companyRates?.lockedBedTypeRates?.find(
          (b: any) =>
            b.bedTypeName === patient.inpatientCase?.bed?.bedType?.name
        )?.lockedRate || 0;

      roomPricePerDay =
        this.companyRates?.lockedRoomTypeRates?.find(
          (r: any) =>
            r.roomTypeName === patient.inpatientCase?.room?.roomType?.name
        )?.lockedRate || 0;

      console.log(
        `💳 Cashless only: Locked Bed = ${bedPricePerDay}, Locked Room = ${roomPricePerDay}`
      );
    } else {
      // 🏥 Standard case
      bedPricePerDay = patient.inpatientCase?.bed?.bedType?.price_per_day || 0;
      roomPricePerDay =
        patient.inpatientCase?.room?.roomType?.price_per_day || 0;

      console.log(
        `🏥 Standard: Bed = ${bedPricePerDay}, Room = ${roomPricePerDay}`
      );
    }

    // --- 5️⃣ Generate Daily Breakdown (with transfer timeline awareness) ---
    this.dailyRoomCharges = [];
    const logDetails: string[] = [];

    for (let i = 0; i < daysStay; i++) {
      const currentDay = new Date(admissionDate.getTime() + i * oneDay);
      const currentDateStr = currentDay.toISOString().split('T')[0]; // 'YYYY-MM-DD'

      // Find transfer (if any) for this date
      const transferForDay = this.transferData?.transfers?.find((t: any) => {
        const start = new Date(t.transferStartTime).toISOString().split('T')[0];
        const end = t.transferEndTime
          ? new Date(t.transferEndTime).toISOString().split('T')[0]
          : null;

        // Case 1: transfer ongoing and started this day
        if (!end && start === currentDateStr) return true;

        // Case 2: transfer ended and includes this day
        if (end && currentDateStr >= start && currentDateStr <= end)
          return true;

        return false;
      });

      let transferChargeDisplay: string | number = 0;

      if (transferForDay) {
        if (!transferForDay.transferEndTime) {
          transferChargeDisplay = 'In Calculation';
        } else {
          transferChargeDisplay = +transferForDay.totalCharge || 0;
        }
      }

      const amount =
        bedPricePerDay +
        roomPricePerDay +
        (typeof transferChargeDisplay === 'number' ? transferChargeDisplay : 0);

      this.dailyRoomCharges.push({
        date: currentDay,
        bedCharge: bedPricePerDay,
        roomCharge: roomPricePerDay,
        transferCharge: transferChargeDisplay,
        amount: amount,
      });
    }

    console.log('📋 Daily Breakdown:');
    logDetails.forEach((d) => console.log(d));

    // --- 6️⃣ Totals ---
    this.roomCharge = this.dailyRoomCharges.reduce(
      (sum: any, r: any) => sum + r.roomCharge,
      0
    );
    this.bedCharge = this.dailyRoomCharges.reduce(
      (sum: any, r: any) => sum + r.bedCharge,
      0
    );

    this.serviceCharge = this.serviceList.reduce((sum, s) => sum + s.charge, 0);

    // Handle string case safely for transferChargeTotal
    this.transferCharge =
      typeof transferChargeTotal === 'number' ? transferChargeTotal : 0;

    this.total =
      this.roomCharge +
      this.bedCharge +
      this.transferCharge +
      this.serviceCharge;

    this.amountInWords = this.convertNumberToWords(this.total) + ' only';

    console.log('✅ Room Charge:', this.roomCharge);
    console.log('✅ Bed Charge:', this.bedCharge);
    console.log('✅ Transfer Charge:', transferChargeTotal);
    console.log('✅ Service Charge:', this.serviceCharge);
    console.log('💰 Grand Total:', this.total);
  }

  serviceList: any[] = [];
  extractServices(patient: any) {
    if (
      patient?.inpatientCase?.[0]?.isDischarge === false ||
      patient.inpatientCase?.isDischarge === false
    ) {
      let temp: any[] = [];
      patient.inpatientBills?.forEach((bill: any) => {
        bill.service?.forEach((service: any) => {
          temp.push({
            doctor: patient.consultingDoctor?.name,
            service: service.name,
            charge: service.charge,
            date: bill.billingDate,
          });
        });
      });
      this.serviceList = temp;
    }
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

  allProgressdata: any[] = [];
  loadDailyProgressData(id: string) {
    this.ipdservice.getProgressReportByCase(id).subscribe((res) => {
      const report = res || [];
      this.allProgressdata = report;
      console.log('All progress data:', this.allProgressdata);
    });
  }
}
