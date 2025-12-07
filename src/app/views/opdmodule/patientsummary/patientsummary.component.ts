import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { OpdService } from '../opdservice/opd.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../doctormodule/doctorservice/doctor.service';
import { OpdbarcodeComponent } from '../../../component/opdcustomfiles/opdbarcode/opdbarcode.component';
import JsBarcode from 'jsbarcode';
import { FormsModule } from '@angular/forms';
import { OpdbillingservicesdetailesComponent } from '../opdbills/opdbillingservicesdetailes/opdbillingservicesdetailes.component';
import { PaginationFilterComponent } from '../../../component/pagination-filter/pagination-filter.component';
import { LetterheaderComponent } from '../../settingsmodule/letterhead/letterheader/letterheader.component';

interface NavigationItem {
  id: string;
  icon: string;
  label: string;
  active: boolean;
  requiredModule?: string; // ✅ Required module for permission check
  requiredAction?: 'read' | 'create' | 'update' | 'delete'; // ✅ Required action
}

interface Medication {
  id: string;
  startDate: string;
  name: string;
  type: string;
  dose: string;
  indication: string;
  quantity: string;
}

interface Service {
  _id: string;
  name: string;
  charge: number;
  type: string;
  __v?: number;
}

interface ServiceGroup {
  groupId: {
    _id: string;
    group_name: string;
    type: string;
    services: string[];
    __v: number;
  };
  serviceIds: Service[];
  _id: string;
}

interface ServicesData {
  services: ServiceGroup[];
  billnumber?: string;
  totalamount?: number;
  netpay?: number;
}

interface VisitData {
  caseId: string;
  visitDate: string;
  consultingDoctor: string;
  status: string;
  height: number;
  weight: number;
  caseType: string;
}

interface BillData {
  billId: string;
  caseId: string;
  billNumber: string;
  totalAmount: number;
  amountReceived: number;
  remainder: number;
  paymentMethod: string;
  createdAt: string;
  discountInfo?: {
    discountStatus?: string;
    discount?: number;
    reason?: string;
  };
}

@Component({
  selector: 'app-patientsummary',
  imports: [CommonModule, FormsModule, OpdbillingservicesdetailesComponent, PaginationFilterComponent, LetterheaderComponent],
  templateUrl: './patientsummary.component.html',
  styleUrl: './patientsummary.component.css',
})
export class PatientsummaryComponent implements OnInit, AfterViewInit, AfterViewChecked {
  // ✅ Updated navigation items with permission requirements
  navigationItems: NavigationItem[] = [
    {
      id: 'summary',
      icon: '📋',
      label: 'Patient Summary',
      active: true,
    },
    {
      id: 'vitals',
      icon: '📊',
      label: 'Vital parameters',
      active: false,
      requiredModule: 'vitals',
      requiredAction: 'read'
    },
    {
      id: 'allergies',
      icon: '🧑‍⚕️',
      label: 'Diagnosis',
      active: false,
      requiredModule: 'diagnosisSheet',
      requiredAction: 'read'
    },
    {
      id: 'conditions',
      icon: '🏷️',
      label: 'OPD Sticker',
      active: false,
      requiredModule: 'outpatientCase',
      requiredAction: 'read'
    },
    {
      id: 'immunizations',
      icon: '💉',
      label: 'Services',
      active: false,
      requiredModule: 'outpatientBill',
      requiredAction: 'read'
    },
    {
      id: 'attachments',
      icon: '📎',
      label: 'CasePaper',
      active: false,
      requiredModule: 'outpatientCase',
      requiredAction: 'read'
    },
    {
      id: 'visits',
      icon: '🏥',
      label: 'Visits',
      active: false,
      requiredModule: 'outpatientCase',
      requiredAction: 'read'
    },
    {
      id: 'orders',
      icon: '🗂️',
      label: 'Procedure',
      active: false,
      requiredModule: 'procedure',
      requiredAction: 'read'
    },
    {
      id: 'prescription',
      icon: '📋',
      label: 'Prescription',
      active: false,
      requiredModule: 'pharmaceuticalRequestList',
      requiredAction: 'read'
    },
  ];

  // Tab state
  activeTab: 'vitals' | 'biometrics' = 'biometrics';
  bills: any
  // Content visibility state
  showMoreDetails: boolean = false;
  showActionsMenu: boolean = false;

  // Current section state
  currentSection: string = 'summary';

  // Pagination state
  currentPage: number = 0;
  itemsPerPage: number = 1;
  totalPages: number = 1;

  // Patient data
  patientData = {
    avatar: '',
    visitStatus: 'Active Visit',
  };

  // Data properties
  opdcase: any;
  vitals: any;
  diagnosis: any;
  services: any;
  doctorId: string = '';

  // Barcode state - Fixed implementation
  private barcodeGenerated = false;
  private currentUHID: string | null = null;

  // ViewChild for barcode element - Simplified approach
  @ViewChild('barcode', { static: false })
  private barcodeElement!: ElementRef<SVGElement>;

  constructor(
    private opdservice: OpdService,
    private route: ActivatedRoute,
    private router: Router,
    private doctorservice: DoctorService
  ) { }

  ngOnInit() {
    const userStr = localStorage.getItem('authUser');
    if (!userStr) {
      console.error('No user found in localStorage');
      return;
    }
    const user = JSON.parse(userStr);
    const id = user._id;
    const role = user.role?.name;
    if (role === 'doctor') {
      this.doctorId = id;
    }

    // ✅ Set the first available tab as active on initialization
    const defaultTab = this.getDefaultActiveTab();
    if (defaultTab) {
      // Reset all tabs
      this.navigationItems.forEach(item => item.active = false);
      // Set default tab as active
      defaultTab.active = true;
      this.currentSection = defaultTab.id;
    }

    this.route.queryParams.subscribe((params) => {
      const patientId = params['id'];
      if (patientId) {
        this.getOPDcaseIdpatientId(patientId);
        this.getOPDcasevitals(patientId);
        this.getOPDcasediagnosis(patientId);
        this.getOPDcaseBill(patientId);
        this.getOPDcaseBillall(patientId);
        this.getOPDProcedure(patientId);
      }
    });
  }

  ngAfterViewInit(): void {
    // Generate barcode after view is fully initialized
    this.generateBarcodeIfReady();
  }

  ngAfterViewChecked(): void {
    // Generate barcode after view changes (important for *ngIf conditions)
    this.generateBarcodeIfReady();
  }

  // ✅ Computed property to get visible navigation items based on permissions
  get visibleNavigationItems(): NavigationItem[] {
    return this.navigationItems.filter(item => {
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

  // ✅ Permission check method
  hasModuleAccess(
    module: string,
    action: 'read' | 'create' | 'update' | 'delete' = 'read'
  ): boolean {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    return permissions.some(
      (perm: any) =>
        perm.moduleName === module && perm.permissions?.[action] === 1
    );
  }

  // ✅ Method to check if a specific tab should be visible
  isTabVisible(item: NavigationItem): boolean {
    if (!item.requiredModule) {
      return true;
    }
    return this.hasModuleAccess(item.requiredModule, item.requiredAction || 'read');
  }

  // ✅ Method to get the first available tab for initial navigation
  getDefaultActiveTab(): NavigationItem | null {
    const visibleItems = this.visibleNavigationItems;
    return visibleItems.length > 0 ? visibleItems[0] : null;
  }

  // API calls
  getOPDcaseIdpatientId(patientId: string) {
    this.opdservice.getOPDcaseById(patientId).subscribe((res) => {
      this.opdcase = res;
      console.log('🚀 ~ PatientsummaryComponent ~ getOPDcaseIdpatientId ~ this.opdcase:', this.opdcase);

      // Reset barcode state when new data arrives
      this.resetBarcodeState();

      // Use setTimeout to ensure DOM is updated after data binding
      setTimeout(() => {
        this.generateBarcodeIfReady();
      }, 0);

      this.opdhistory();
    });
  }

  getOPDcasevitals(patientId: string) {
    this.doctorservice.getVitalsByCaseId(patientId).subscribe((res) => {
      this.vitals = res.data[0];
    });
  }

  getOPDcasediagnosis(patientId: string) {
    this.doctorservice.getDiagnosisByCaseId(patientId).subscribe((res) => {
      this.diagnosis = res.diagnosis[0];
    });
  }

  getOPDcaseBill(patientId: string) {
    this.opdservice.getOPDbillByCaseId(patientId).subscribe((res) => {
      this.services = res.OutpatientBill[0];
      console.log('Services data:', this.services.services);
    });
  }

  getOPDProcedure(patientId: string) {
    this.opdservice.getProcedureByCaseId(patientId).subscribe((res) => {
      this.procedures = res.procedures;
      console.log('🚀 ~ PatientsummaryComponent ~ getOPDProcedure ~ this.procedure:', this.procedures);
    });
  }

  // Enhanced barcode methods - Fixed implementation
  private resetBarcodeState(): void {
    this.barcodeGenerated = false;
    this.currentUHID = null;
  }

  private generateBarcodeIfReady(): void {
    const uhid = this.opdcase?.uniqueHealthIdentificationId?.uhid;

    // Check all conditions are met
    if (!uhid || !this.shouldShowContent('conditions')) {
      return;
    }

    // Check if barcode element is available
    if (!this.barcodeElement?.nativeElement) {
      return;
    }

    // Only generate if not already generated for this UHID
    if (this.barcodeGenerated && this.currentUHID === uhid) {
      return;
    }

    try {
      // Clear existing content
      this.barcodeElement.nativeElement.innerHTML = '';

      // Generate new barcode
      JsBarcode(this.barcodeElement.nativeElement, uhid, {
        format: 'CODE128',
        lineColor: '#000',
        width: 1.5,
        height: 40,
        displayValue: true,
        fontSize: 14,
        margin: 10,
      });

      this.barcodeGenerated = true;
      this.currentUHID = uhid;
      console.log('✅ Barcode generated successfully for UHID:', uhid);
    } catch (err) {
      console.error('❌ Error generating barcode:', err);
      this.barcodeGenerated = false;
    }
  }

  // ✅ Updated navigation methods with permission checks
  onNavigationClick(item: NavigationItem): void {
    // Check permission before allowing navigation
    if (item.requiredModule && !this.hasModuleAccess(item.requiredModule, item.requiredAction)) {
      console.warn(`Access denied: User doesn't have ${item.requiredAction} permission for ${item.requiredModule}`);
      return; // Don't allow navigation
    }

    // Reset all visible items to inactive
    this.visibleNavigationItems.forEach((navItem) => (navItem.active = false));

    // Set clicked item as active
    item.active = true;
    this.currentSection = item.id;

    console.log(`Navigating to: ${item.label}`);

    // Handle barcode generation for conditions section
    if (item.id === 'conditions') {
      this.resetBarcodeState();
      // Use setTimeout to allow Angular to update the DOM
      setTimeout(() => {
        this.generateBarcodeIfReady();
      }, 100);
    }

    this.handleSectionChange(item.id);
  }

  private handleSectionChange(sectionId: string): void {
    switch (sectionId) {
      case 'summary':
        console.log('Loading patient summary...');
        break;
      case 'vitals':
        console.log('Loading vitals & biometrics...');
        this.activeTab = 'vitals';
        break;
      case 'conditions':
        console.log('Loading conditions...');
        // Additional barcode handling for conditions section
        setTimeout(() => {
          this.generateBarcodeIfReady();
        }, 50);
        break;
      default:
        console.log('Unknown section');
    }
  }

  // Content visibility methods
  shouldShowContent(section: string): boolean {
    return this.currentSection === section;
  }

  // Print methods
  printSticker(): void {
    // Ensure barcode is generated before printing
    this.generateBarcodeIfReady();

    setTimeout(() => {
      const printContents = document.getElementById('print-label')?.innerHTML;
      if (printContents) {
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Restore Angular functionality
      }
    }, 100);
  }

  printPrescription() {
    const printContent = document.getElementById('printSection')?.innerHTML;
    if (printContent) {
      const WindowPrt = window.open('', '', 'width=900,height=650');
      WindowPrt?.document.write(`
      <html>
        <head>
          <title>Prescription</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; margin-top: 15px; }
            th, td { border: 1px solid black; padding: 6px; text-align: left; }
            h2, h3 { text-align: center; margin: 0; }
            hr { margin: 10px 0; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
      WindowPrt?.document.close();
      WindowPrt?.print();
    }
  }

  // getOPDcaseBill(patientId: string) {
  //   this.opdservice.getOPDbillByCaseId(patientId).subscribe((res) => {
  //     this.services = res.OutpatientBill[1];
  //     console.log('Services data:', this.services.services);
  //   });
  // }

  getOPDcaseBillall(patientId: string) {
    this.opdservice.getOPDbillByCaseId(patientId).subscribe((res) => {
      this.bills = res.OutpatientBill;
      console.log(this.bills, "werwe");
    });
  }
  // Calculate total for a specific group
  calculateGroupTotal(serviceIds: any[]): number {
    if (!serviceIds || !Array.isArray(serviceIds)) {
      return 0;
    }

    return serviceIds.reduce((total, service) => {
      return total + (service?.charge || 0);
    }, 0);
  }

  // Calculate grand total from all groups
  calculateGrandTotal(): number {
    if (!this.services?.services || !Array.isArray(this.services.services)) {
      return 0;
    }

    return this.services.services.reduce(
      (grandTotal: number, serviceGroup: ServiceGroup) => {
        const groupTotal = this.calculateGroupTotal(serviceGroup.serviceIds);
        return grandTotal + groupTotal;
      },
      0
    );
  }

  // Legacy method for backward compatibility (if needed)
  calculateTotal(): number {
    return this.calculateGrandTotal();
  }

  editopdbill(opdbillid: string) {
    this.router.navigate(['/opd/opdbill', opdbillid]);
  }

  // Procedure methods
  procedures: any[] = [];

  startNewProcedure() {
    this.procedures.push({
      procedure_name: '',
      remarks: '',
      createdAt: '',
      editing: true,
      isNew: true,
    });
  }

  editProcedure(index: number) {
    this.procedures[index].editing = true;
  }

  saveProcedure(index: number) {
    const proc = this.procedures[index];

    const payload = {
      procedure_name: proc.procedure_name,
      remarks: proc.remarks,
      outpatientCaseId: this.opdcase._id,
      createdAt: new Date(),
    };

    this.opdservice.postprocedureapis(payload).subscribe({
      next: (res) => {
        console.log('Procedure saved:', res);
        this.procedures[index].editing = false;
        this.procedures[index].isNew = false;
        this.procedures[index]._id = res._id;
        this.procedures[index].createdAt = res.createdAt || payload.createdAt;
      },
      error: (err) => {
        console.error('Error saving procedure', err);
      },
    });
  }

  cancelEdit(index: number) {
    if (this.procedures[index].isNew) {
      this.procedures.splice(index, 1);
    } else {
      this.procedures[index].editing = false;
    }
  }

  // Visit history methods
  opdhist: any[] = [];
  vistingdate: any[] = [];
  billtotalamlount: any[] = [];
  billtotalreceived: any[] = [];
  billtotalMap: { [key: string]: number[] } = {};
  billreceivedMap: { [key: string]: number[] } = {};
  billDepositMap: { [key: string]: number[] } = {};

  opdhistory() {
    if (!this.opdcase) {
      console.error('opdcase not loaded yet!');
      return;
    }

    // Initialize everything on every fetch
    this.vistingdate = [];
    this.billtotalamlount = [];
    this.billtotalreceived = [];
    this.billtotalMap = {};
    this.billreceivedMap = {};
    this.billDepositMap = {};

    const patientId = this.opdcase?.uniqueHealthIdentificationId?._id;

    console.log('Passing ID to API:', patientId);

    if (!patientId) {
      console.error('UHID / Patient ID is missing!');
      return;
    }

    this.opdservice.getOPDhistoryById(patientId).subscribe({
      next: (opdhistory) => {
        this.opdhist = opdhistory?.history ?? [];
        this.processOpdHistory();
      },
      error: (err) => {
        console.error('Error fetching OPD history:', err);
      },
    });
  }

  processOpdHistory() {
    if (!Array.isArray(this.opdhist) || this.opdhist.length === 0) return;

    this.opdhist.forEach((history) => {
      if (Array.isArray(history?.outpatientcases)) {
        history.outpatientcases.forEach((outcase: any) => {
          if (!outcase) return;
          this.vistingdate.push({
            caseId: outcase._id ?? '',
            visitDate: outcase.createdAt ?? '',
            consultingDoctor: outcase.consulting_Doctor.name ?? 'Not assigned',
            status: outcase.consulted ?? 'unknown',
            height: outcase.height ?? 0,
            weight: outcase.weight ?? 0,
            caseType: outcase.caseType ?? 'general',
          });
        });
      }

      if (Array.isArray(history?.OutpatientBills)) {
        history.OutpatientBills.forEach((outbill: any) => {
          if (!outbill) return;
          const caseId = outbill.OutpatientcaseId ?? '';
          this.billtotalamlount.push({
            billId: outbill._id ?? '',
            caseId,
            billNumber: outbill.billnumber ?? '',
            totalAmount: outbill.totalamount ?? 0,
            amountReceived: outbill.amountreceived ?? 0,
            remainder: outbill.remainder ?? 0,
            paymentMethod: outbill.paymentmethod ?? 'unknown',
            createdAt: outbill.createdAt ?? '',
            discountInfo: outbill.discountMeta ?? undefined,
          });
          if (typeof outbill.amountreceived === 'number')
            this.billtotalreceived.push(outbill.amountreceived);

          if (caseId) {
            if (!this.billtotalMap[caseId]) this.billtotalMap[caseId] = [];
            if (typeof outbill.totalamount === 'number')
              this.billtotalMap[caseId].push(outbill.totalamount);

            if (!this.billreceivedMap[caseId])
              this.billreceivedMap[caseId] = [];
            if (typeof outbill.amountreceived === 'number')
              this.billreceivedMap[caseId].push(outbill.amountreceived);
          }
        });
      }

      if (Array.isArray(history?.OutpatientDeposits)) {
        history.OutpatientDeposits.forEach((outdeposit: any) => {
          const billId = outdeposit?.outpatientBillId;
          if (!billId) return;
          if (!this.billDepositMap[billId]) this.billDepositMap[billId] = [];
          if (typeof outdeposit.depositAmount === 'number')
            this.billDepositMap[billId].push(outdeposit.depositAmount);
        });
      }
    });
  }

  // Helper methods for visit history
  getBillsForCase(caseId: string | undefined | null): BillData[] {
    if (!caseId) return [];
    return this.billtotalamlount.filter((bill) => bill?.caseId === caseId);
  }

  getTotalAmountForCase(caseId: string | undefined | null): number {
    if (!caseId) return 0;
    const arr = this.billtotalMap[caseId] ?? [];
    return arr.reduce((sum, a) => sum + (a ?? 0), 0);
  }

  getTotalReceivedForCase(caseId: string | undefined | null): number {
    if (!caseId) return 0;
    const arr = this.billreceivedMap[caseId] ?? [];
    return arr.reduce((sum, a) => sum + (a ?? 0), 0);
  }

  hasBillsForVisit(visit: VisitData | undefined): boolean {
    return !!visit?.caseId && this.getBillsForCase(visit.caseId).length > 0;
  }

  trackByVisitId(index: number, visit: VisitData): any {
    return visit?.caseId ?? index;
  }

  trackByBillId(index: number, bill: BillData): any {
    return bill?.billId ?? index;
  }

  // Formatting helpers
  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Invalid date'
      : date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
  }

  formatTime(dateString: string | undefined | null): string {
    if (!dateString) return 'Time not available';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Invalid time'
      : date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
  }

  printOPDSheet() {
    const opdElement = document.getElementById('opd-sheet');
    if (!opdElement) return;

    const opdClone = opdElement.cloneNode(true) as HTMLElement;
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
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) return;

      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((style) => style.outerHTML)
        .join('\n');

      printWindow.document.write(`
      <html>
        <head>
          <title>OPD Sheet</title>
          ${styles}
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            #opd-print {
              width: 100%;
            }
            @media print {
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
              #opd-print {
                page-break-inside: auto !important;
              }
              #opd-print * {
                page-break-inside: auto !important;
                page-break-before: auto !important;
                page-break-after: auto !important;
              }
              .no-break {
                page-break-inside: avoid !important;
              }
            }
          </style>
        </head>
        <body>
          <div id="opd-print">${opdClone.outerHTML}</div>
        </body>
      </html>
    `);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      };
    });
  }

  // All other existing methods...
  onTabClick(tab: 'vitals' | 'biometrics'): void {
    this.activeTab = tab;
    console.log(`Switched to ${tab} tab`);
  }

  onActionsClick(): void {
    this.showActionsMenu = !this.showActionsMenu;
    console.log('Actions menu toggled:', this.showActionsMenu);

    if (this.showActionsMenu) {
      this.showActionsDropdown();
    }
  }

  onShowMoreClick(): void {
    this.showMoreDetails = !this.showMoreDetails;
    console.log('Show more details toggled:', this.showMoreDetails);

    if (this.showMoreDetails) {
      this.loadAdditionalPatientDetails();
    }
  }

  onCartClick(): void {
    console.log('Cart button clicked');
    this.handleCartAction();
  }

  onEditClick(): void {
    console.log('Edit button clicked');
    this.handleEditPatient();
  }

  onRecordVitalsClick(patientId: string): void {
    console.log('Record vitals clicked');
    this.router.navigate(['/doctor/vitals'], {
      queryParams: { patientId: patientId },
    });
  }

  onRecordVitalSignsClick(patientId: string): void {
    console.log('Record vital signs clicked');
    this.router.navigate(['/doctor/vitals'], {
      queryParams: { patientId: patientId },
    });
  }

  onRecordBiometricsClick(): void {
    console.log('Record biometrics clicked');
    this.navigateToBiometricsRecording();
  }

  onRecordConditionsClick(): void {
    console.log('Record conditions clicked');
    this.navigateToConditionsRecording();
  }

  onAddMedicationClick(): void {
    console.log('Add medication clicked');
    this.navigateToAddMedication();
  }

  onMedicationMenuClick(medication: Medication): void {
    console.log('Medication menu clicked for:', medication.name);
    this.showMedicationMenu(medication);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      console.log('Page changed to:', page);
    }
  }

  private showActionsDropdown(): void {
    const actions = [
      'Edit Patient',
      'View History',
      'Print Summary',
      'Export Data',
      'Schedule Appointment',
    ];
    console.log('Available actions:', actions);
  }

  private loadAdditionalPatientDetails(): void {
    const additionalDetails = {
      address: '123 Main Street, City, State',
      phone: '+1 (555) 123-4567',
      email: 'patient@example.com',
      emergencyContact: 'John Doe - +1 (555) 987-6543',
      insuranceProvider: 'Health Insurance Co.',
      primaryPhysician: 'Dr. Smith',
    };
    console.log('Additional patient details:', additionalDetails);
  }

  private handleCartAction(): void {
    console.log('Processing cart action...');
  }

  private handleEditPatient(): void {
    console.log('Navigating to edit patient form...');
  }

  private navigateToVitalsRecording(): void {
    console.log('Navigating to vitals recording form...');
  }

  private navigateToVitalSignsRecording(): void {
    console.log('Navigating to vital signs recording form...');
  }

  private navigateToBiometricsRecording(): void {
    console.log('Navigating to biometrics recording form...');
  }

  private navigateToConditionsRecording(): void {
    console.log('Navigating to conditions recording form...');
  }

  private navigateToAddMedication(): void {
    console.log('Navigating to add medication form...');
  }

  private showMedicationMenu(medication: Medication): void {
    const menuOptions = [
      'Edit Medication',
      'Discontinue',
      'View Details',
      'Print Prescription',
    ];
    console.log(`Medication menu for ${medication.name}:`, menuOptions);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  isCurrentSection(section: string): boolean {
    return this.currentSection === section;
  }

  getNavItemClass(item: NavigationItem): string {
    return item.active ? 'nav-item active' : 'nav-item';
  }

  getTabClass(tab: string): string {
    return this.activeTab === tab ? 'tab active' : 'tab';
  }

  formatDateTime(date: string): string {
    return date;
  }

  formatMedicationDetails(medication: Medication): string {
    return `${medication.dose}\n${medication.indication} — ${medication.quantity}`;
  }

  editVitals(patientid: string) {
    this.router.navigate(['/doctor/vitals'], {
      queryParams: { _id: patientid },
    });
  }
  //  FIXED NOW CASE LEAD TO CASE
  //  AND BILL LEAD TO BILL
  // NOTHING TO DO WITH EDITING

  openBill(patientid: string) {
    this.router.navigate(['/opd/case'], {
      queryParams: { _id: patientid },
    });
  }

  Patientdiagnosis(patientid: string) {
    this.router.navigate(['/opd/opddiagnosissheet'], {
      queryParams: { _id: patientid },
    });
  }

  editDiagnosis(patientId: string) {
    this.router.navigate(['/opd/opddiagnosissheet'], {
      queryParams: { id: patientId },
    });
  }

  endConsultation(data: any) {
    const caseId = data?._id;

    console.log('Ending consultation...');
    const updateData = {
      caseId: data?._id,
      doctorId: data.consulting_Doctor?._id,
      status: 'completed',
      isConsultDone: true,
    };

    this.opdservice.updateQueue(updateData).subscribe({
      next: (res) => {
        console.log(`Queue updated successfully to ${updateData.status}:`, res);
      },
      error: (err) => {
        console.error('Error updating queue:', err);
      },
    });

    const opdUpdate = {
      consulted: 'completed',
    };
    this.opdservice.updateOPDcase(caseId, opdUpdate).subscribe({
      next: (res) => {
        console.log(`OPD case status updated to ${opdUpdate.consulted}:`, res);
      },
      error: (err) => {
        console.error('Error updating OPD case:', err);
      },
    });

    this.router.navigateByUrl('/opd/opdcases');
  }

  holdUnholdConsultation(data: any) {
    const caseId = data?._id;

    const newStatus = data.consulted === 'onHold' ? 'inConsultation' : 'onHold';
    const prevStatus = data.consulted;
    data.consulted = newStatus;

    this.opdservice.updateOPDcase(caseId, { consulted: newStatus }).subscribe({
      next: (res) => {
        console.log(`OPD case status updated to ${newStatus}:`, res);
      },
      error: (err) => {
        console.error('Error updating OPD case:', err);
        data.consulted = prevStatus;
      },
    });

    const updateData = {
      caseId: caseId,
      doctorId: data.consulting_Doctor?._id,
      status: newStatus,
      isConsultDone: false,
    };

    this.opdservice.updateQueue(updateData).subscribe({
      next: (res) => {
        console.log(`Queue updated successfully to ${updateData.status}:`, res);
      },
      error: (err) => {
        console.error('Error updating queue:', err);
      },
    });
  }
}
