import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PharmaService } from '../../pharma.service';
import { RouterModule } from '@angular/router';
import { LetterheaderComponent } from '../../../views/settingsmodule/letterhead/letterheader/letterheader.component';

// ✅ Complete interface with all required properties
interface ReturnRecord {
  _id: string;
  inwardSerialNumber: string;
  returnDetails: {
    isReturn: boolean;
    originalBillNumber: string;
    returnReason: string;
    returnedPackages: Array<{
      medicineName: string;
      returnedQuantity: number;
      originalQuantity: number;
      refundAmount: number;
      batchNumber: string;
    }>;
  };
  total: number;
  refundAmount: number;
  type: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  // ✅ Add missing properties for patient data
  isWalkIn?: boolean;
  walkInPatient?: {
    name?: string;
    age?: number;
    gender?: string;
    mobile_no?: string;
    address?: string;
    doctor_name?: string;
  };
  uniqueHealthIdentificationId?: any;
}

@Component({
  selector: 'app-returnmedicinelist',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LetterheaderComponent],
  templateUrl: './returnmedicinelist.component.html',
  styleUrls: ['./returnmedicinelist.component.css']
})
export class ReturnmedicinelistComponent implements OnInit {

  @ViewChild('printModal', { static: false }) printModal!: ElementRef;

  returnRecords: ReturnRecord[] = [];
  filteredRecords: ReturnRecord[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  selectedDateRange: string = 'today';
  selectedType: string = '';
  selectedStatus: string = '';

  // Modal data
  selectedRecord: ReturnRecord | null = null;
  showPrintModal: boolean = false;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  Math = Math;

  // Date range options
  dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thismonth', label: 'This Month' },
    { value: 'lastmonth', label: 'Last Month' },
    { value: 'all', label: 'All Time' }
  ];

  // Return reason mapping
  returnReasonLabels: { [key: string]: string } = {
    'expired': 'Medicine Expired',
    'wrong_medicine': 'Wrong Medicine Dispensed',
    'patient_discharged': 'Patient Discharged Early',
    'doctor_changed': 'Doctor Changed Prescription',
    'excess_quantity': 'Excess Quantity Dispensed',
    'other': 'Other Reason'
  };

  constructor(
    private pharmaService: PharmaService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadReturnRecords();
  }

  loadReturnRecords(): void {
    this.loading = true;
    this.pharmaService.getAllReturnRecords().subscribe({
      next: (response) => {
        console.log('Return records response:', response);

        let records = response?.data || response || [];

        // ✅ Filter only return records
        records = records.filter((record: any) =>
          record.returnDetails && record.returnDetails.isReturn === true
        );

        this.returnRecords = records;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading return records:', error);
        this.toastr.error('Failed to load return records');
        this.loading = false;
      }
    });
  }

  // ✅ Utility methods
  getCurrentDate(): Date {
    return new Date();
  }

  getTotalRefunded(): number {
    return this.filteredRecords.reduce((sum, r) => sum + this.getCalculatedRefundAmount(r), 0);
  }

  getUnitPrice(pkg: any): number {
    if (pkg.refundAmount && pkg.returnedQuantity) {
      return pkg.refundAmount / pkg.returnedQuantity;
    }
    return 0;
  }

  // ✅ Filter methods
  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.returnRecords];

    // Search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.inwardSerialNumber.toLowerCase().includes(searchLower) ||
        record.returnDetails.originalBillNumber.toLowerCase().includes(searchLower) ||
        record.returnDetails.returnedPackages.some(pkg =>
          pkg.medicineName.toLowerCase().includes(searchLower)
        )
      );
    }

    // Type filter
    if (this.selectedType) {
      filtered = filtered.filter(record => record.type === this.selectedType);
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(record => record.status === this.selectedStatus);
    }

    // Date range filter
    if (this.selectedDateRange && this.selectedDateRange !== 'all') {
      const today = new Date();
      let startDate: Date;
      let endDate: Date | null = null;

      switch (this.selectedDateRange) {
        case 'today':
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'yesterday':
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'last7days':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last30days':
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'thismonth':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'lastmonth':
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(record => {
        const recordDate = new Date(record.createdAt);
        if (endDate) {
          return recordDate >= startDate && recordDate < endDate;
        }
        return recordDate >= startDate;
      });
    }

    this.filteredRecords = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDateRange = 'today';
    this.selectedType = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  // ✅ Pagination methods
  get paginatedRecords(): ReturnRecord[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredRecords.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  getDisplayedFromCount(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getDisplayedToCount(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ✅ Helper methods
  getReturnReasonLabel(reason: string): string {
    return this.returnReasonLabels[reason] || reason;
  }

  getTotalMedicines(record: ReturnRecord): number {
    return record.returnDetails.returnedPackages.length;
  }

  getTotalQuantity(record: ReturnRecord): number {
    return record.returnDetails.returnedPackages.reduce((sum, pkg) => sum + pkg.returnedQuantity, 0);
  }

  getTypeLabel(type: string): string {
    return type === 'inpatientDepartment' ? 'IPD' : 'OPD';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  // ✅ Statistics methods
  getIpdReturnsCount(): number {
    return this.filteredRecords.filter(record => record.type === 'inpatientDepartment').length;
  }

  getOpdReturnsCount(): number {
    return this.filteredRecords.filter(record => record.type === 'outpatientDepartment').length;
  }

  getCompletedReturnsCount(): number {
    return this.filteredRecords.filter(record => record.status === 'completed').length;
  }

  getPendingReturnsCount(): number {
    return this.filteredRecords.filter(record => record.status === 'pending').length;
  }

  // ✅ Patient information methods
  debugReturnRecord(record: ReturnRecord): void {
    console.log('=== RETURN RECORD DEBUG ===');
    console.log('Full record:', JSON.stringify(record, null, 2));
    console.log('isWalkIn:', record.isWalkIn);
    console.log('walkInPatient:', record.walkInPatient);
    console.log('uniqueHealthIdentificationId:', record.uniqueHealthIdentificationId);
    console.log('Patient info result:', this.getPatientInfo(record));
    console.log('Mobile result:', this.getPatientMobile(record));
    console.log('=== END DEBUG ===');
  }

  getPatientInfo(record: ReturnRecord): string {
    console.log('Getting patient info for record:', {
      isWalkIn: record.isWalkIn,
      walkInPatient: record.walkInPatient,
      uhid: record.uniqueHealthIdentificationId
    });

    // For walk-in patients
    if (record.isWalkIn && record.walkInPatient) {
      const name = record.walkInPatient.name || 'Walk-in Patient';
      const mobile = record.walkInPatient.mobile_no || '';
      return mobile ? `${name} (${mobile})` : name;
    }

    // For registered patients with UHID
    if (record.uniqueHealthIdentificationId) {
      const patientData = record.uniqueHealthIdentificationId;
      if (typeof patientData === 'object') {
        const name = patientData.patient_name || patientData.name || 'Registered Patient';
        const mobile = patientData.mobile_no || patientData.phone || '';
        return mobile ? `${name} (${mobile})` : name;
      }
    }

    return 'Patient Information Not Available';
  }

  getPatientMobile(record: ReturnRecord): string {
    if (record.isWalkIn && record.walkInPatient?.mobile_no) {
      return record.walkInPatient.mobile_no;
    }

    if (record.uniqueHealthIdentificationId && typeof record.uniqueHealthIdentificationId === 'object') {
      return record.uniqueHealthIdentificationId.mobile_no || record.uniqueHealthIdentificationId.phone || 'N/A';
    }

    return 'N/A';
  }

  // ✅ Fetch patient info from original bill when not present in return
  async fetchOriginalBillPatientInfo(record: ReturnRecord): Promise<string> {
    if (!record.returnDetails?.originalBillNumber) {
      return 'Patient Information Not Available';
    }

    try {
      const originalBill = await this.pharmaService.getPharmaceuticalInwardByBillNumber(
        record.returnDetails.originalBillNumber
      ).toPromise();

      if (originalBill?.success && originalBill?.data) {
        const billData = originalBill.data;

        // For walk-in patients
        if (billData.isWalkIn && billData.walkInPatient) {
          const name = billData.walkInPatient.name || 'Walk-in Patient';
          const mobile = billData.walkInPatient.mobile_no || '';
          return mobile ? `${name} (${mobile})` : name;
        }

        // For registered patients
        if (billData.uniqueHealthIdentificationId) {
          const uhid = billData.uniqueHealthIdentificationId;
          const name = uhid.patient_name || uhid.name || 'Registered Patient';
          const mobile = uhid.mobile_no || uhid.phone || '';
          return mobile ? `${name} (${mobile})` : name;
        }
      }
    } catch (error) {
      console.error('Error fetching original bill patient info:', error);
    }

    return 'Patient Information Not Available';
  }

  async getPatientInfoEnhanced(record: ReturnRecord): Promise<string> {
    // First try the return record itself
    const directInfo = this.getPatientInfo(record);

    if (directInfo !== 'Patient Information Not Available') {
      return directInfo;
    }

    // If no patient info in return record, fetch from original bill
    return await this.fetchOriginalBillPatientInfo(record);
  }

  // ✅ Enhanced print method with patient data fetching
  async printRecord(record: ReturnRecord): Promise<void> {
    this.debugReturnRecord(record); // ✅ Debug what data is available
    this.selectedRecord = record;
    this.showPrintModal = true;

    // ✅ If patient info is missing, try to fetch from original bill
    const currentPatientInfo = this.getPatientInfo(record);

    if (currentPatientInfo === 'Patient Information Not Available') {
      console.log('Patient info missing, fetching from original bill...');

      try {
        const patientInfo = await this.fetchOriginalBillPatientInfo(record);
        console.log('Fetched patient info:', patientInfo);

        // Update the display after fetching
        setTimeout(() => {
          const customerNameElement = document.getElementById('customerName');
          const customerPhoneElement = document.getElementById('customerPhone');

          if (customerNameElement && patientInfo !== 'Patient Information Not Available') {
            customerNameElement.textContent = patientInfo;

            if (customerPhoneElement) {
              // Extract phone from the patient info string
              const phoneMatch = patientInfo.match(/\(([^)]+)\)/);
              if (phoneMatch) {
                customerPhoneElement.textContent = `Phone: ${phoneMatch[1]}`;
                customerPhoneElement.style.display = 'block';
              }
            }
          }
        }, 100);

      } catch (error) {
        console.error('Error fetching patient info for print:', error);
      }
    }
  }

  // ✅ Calculation methods
  getCalculatedRefundAmount(record: ReturnRecord): number {
    return record.returnDetails.returnedPackages.reduce((total, pkg) => {
      return total + (pkg.refundAmount || 0);
    }, 0);
  }

  // ✅ Modal methods
  closePrintModal(): void {
    this.showPrintModal = false;
    this.selectedRecord = null;
  }

  printModalContent(): void {
    if (this.selectedRecord) {
      const printContent = document.getElementById('printModalContent');
      if (printContent) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Medicine Return Receipt</title>
              <style>
                body { font-family: 'Courier New', monospace; margin: 20px; font-size: 12px; }
                .return-receipt { border: 2px solid #000; padding: 15px; max-width: 800px; margin: 0 auto; }
                .header-section { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; }
                .gst-invoice { font-weight: bold; font-size: 11px; margin-top: 5px; }
                .customer-info { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #000; font-size: 9px; }
                .medicine-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 8px; }
                .medicine-table th, .medicine-table td { border: 1px solid #000; padding: 3px 2px; text-align: center; }
                .medicine-table th { background-color: #f0f0f0; font-weight: bold; }
                .medicine-table .left { text-align: left; }
                .medicine-table .right { text-align: right; }
                .totals-section { display: flex; justify-content: space-between; margin-top: 8px; border-top: 1px solid #000; padding-top: 8px; }
                .left-info { flex: 1; font-size: 7px; padding-right: 10px; }
                .right-totals { flex: 1; text-align: right; }
                .totals-table { width: 100%; font-size: 9px; margin-bottom: 8px; }
                .totals-table td { padding: 2px 5px; border: none; }
                .totals-table .right { text-align: right; }
                .payment-mode { font-size: 8px; font-weight: bold; border: 1px solid #000; padding: 4px; text-align: center; }
                .footer { text-align: center; border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; font-size: 7px; }
                @media print { .return-receipt { border: none; padding: 0; font-size: 12px; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
    }
  }

  viewDetails(record: ReturnRecord): void {
    this.printRecord(record);
  }

  // ✅ Generate empty rows for consistent table formatting
  getEmptyReturnRows(): any[] {
    const minRows = 5; // Minimum rows to show
    const currentRows = this.selectedRecord?.returnDetails?.returnedPackages?.length || 0;
    const emptyRowsNeeded = Math.max(0, minRows - currentRows);
    return new Array(emptyRowsNeeded);
  }
}
