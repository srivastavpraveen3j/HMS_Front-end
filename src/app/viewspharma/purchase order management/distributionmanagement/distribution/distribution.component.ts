// distribution.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  Subject,
  takeUntil,
  finalize,
  catchError,
  of,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
  map,
  tap,
} from 'rxjs';
import { DistributionService } from './distribution.service';
import { MasterService } from '../../../../views/mastermodule/masterservice/master.service';
import { LetterheaderComponent } from '../../../../views/settingsmodule/letterhead/letterheader/letterheader.component';

interface Medicine {
  _id: string;
  medicine_name: string;
  stock: number;
  price: number;
  dose: number;
  expiry_date: string;
  batch_no: string;
  supplier: any;
  maxStock: number;
  isLowStock?: boolean;
}

interface SubPharmacy {
  _id: string;
  name: string;
  type: string;
  location: string;
  pharmacist: string;
  status: string;
}

interface StockTransfer {
  _id: string;
  transferId: string;
  from: string;
  to:
    | {
        _id: string;
        name: string;
        type: string;
        location: string;
      }
    | string;
  items: Array<{
    medicine?: {
      _id: string;
      medicine_name: string;
      dose: number;
      lowStockThreshold: number;
      isLowStock: boolean;
      id: string;
    };
    medicine_name: string;
    requested_quantity: number;
    approved_quantity: number;
    unit_price: number;
    total_value: number;
    batch_details?: Array<{
      batch_no: string;
      expiry_date: string;
      mfg_date: string;
      unit_price: number;
      quantity: number;
      _id: string;
    }>;
  }>;
  status: 'completed' | 'in_progress' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  total_value: number;
  total_items_count: number;
  requested_by: string;
  approved_by?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface TransferSummary {
  totalPending: number;
  totalInProgress: number;
  completedToday: number;
  totalValue: number;
}

// ✅ NEW: Enhanced interfaces for stock management
interface StockUpdate {
  medicine: string;
  transferred: number;
  previousStock: number;
  updatedStock: number;
}

interface BulkUploadResult {
  success: boolean;
  message: string;
  totalRecords?: number;
  uploaded?: number;
  failed?: number;
  failures?: Array<{
    error: string;
    input: {
      medicine_name: string;
      requested_quantity: number;
    };
  }>;
  transferId?: string;
  transferSample?: any[];
  stockUpdates?: StockUpdate[]; // Enhanced with stock updates
}

@Component({
  selector: 'app-distribution',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LetterheaderComponent,
  ],
  templateUrl: './distribution.component.html',
  styleUrl: './distribution.component.css',
})
export class DistributionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Loading states
  loading = false;
  summaryLoading = false;
  actionLoading: { [key: string]: boolean } = {};
  medicinesLoading = false;
  subPharmaciesLoading = false;

  // Data properties
  pendingTransfers = 0;
  inProgress = 0;
  completedToday = 0;
  stockTransfers: StockTransfer[] = [];
  filteredTransfers: StockTransfer[] = [];

  // Date filtering properties
  fromDate: string = '';
  toDate: string = '';
  statusFilter: string = '';
  priorityFilter: string = '';
  pharmacyFilter: string = '';

  // Pagination and filtering
  currentPage = 1;
  pageSize = 50;
  searchTerm = '';
  totalRecords = 0;

  // Error handling
  error: string | null = null;
  successMessage: string | null = null;

  // Modal properties
  showCreateModal = false;
  createFormLoading = false;

  // View Transfer Modal properties
  showViewModal = false;
  selectedTransfer: StockTransfer | null = null;
  viewTransferLoading = false;

  // Data for dropdowns
  subPharmacies: SubPharmacy[] = [];
  medicines: Medicine[] = [];
  filteredMedicines: Medicine[] = [];

  // ✅ NEW: Enhanced Bulk Upload Properties
  showBulkUploadModal = false;
  bulkUploadLoading = false;
  bulkUploadAttempted = false;
  selectedFile: File | null = null;
  selectedSubPharmacyId: string = '';
  bulkUploadResult: BulkUploadResult | null = null; // Enhanced typing

  // Filter options
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
  ];

  priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  // Forms
  createTransferForm: FormGroup;
  medicineSearchControl = new FormControl('');
  stockWarning = false;

  // Math reference for template
  Math = Math;

  constructor(
    private distributionService: DistributionService,
    private masterService: MasterService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.createTransferForm = this.fb.group({
      to: ['', Validators.required],
      priority: ['normal'],
      remarks: [''],
      items: this.fb.array([this.createMedicineItemFormGroup()]),
    });
  }

  private createMedicineItemFormGroup(): FormGroup {
    return this.fb.group({
      medicine: ['', Validators.required],
      medicine_name: [''],
      requested_quantity: [1, [Validators.required, Validators.min(1)]],
      available_stock: [0],
      unit_price: [0],
      dose: [0],
      batch_no: [''],
      expiry_date: [''],
    });
  }

  get itemsFormArray(): FormArray {
    return this.createTransferForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    console.log('🚀 Initializing Distribution Component');
    this.setDefaultDateRange();
    this.loadInitialData();
    this.setupMedicineSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setDefaultDateRange(): void {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    this.fromDate = todayString;
    this.toDate = todayString;
    console.log('✅ Default date range set to today:', todayString);
  }

  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  getFilterSummary(): string {
    if (this.fromDate && this.toDate) {
      const from = new Date(this.fromDate);
      const to = new Date(this.toDate);
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      if (this.fromDate === this.toDate && this.fromDate === todayStr) {
        return "Today's transfers";
      } else if (this.fromDate === this.toDate) {
        return `Transfers for ${from.toLocaleDateString('en-IN')}`;
      } else {
        return `Transfers from ${from.toLocaleDateString(
          'en-IN'
        )} to ${to.toLocaleDateString('en-IN')}`;
      }
    }
    return 'All transfers';
  }

  isShowingTodayData(): boolean {
    const today = new Date().toISOString().split('T')[0];
    return this.fromDate === today && this.toDate === today;
  }

  applyFilters(): void {
    console.log('🔍 Applying filters - From:', this.fromDate, 'To:', this.toDate);

    this.filteredTransfers = this.stockTransfers.filter((transfer) => {
      if (this.fromDate || this.toDate) {
        const transferDate = new Date(transfer.createdAt)
          .toISOString()
          .split('T')[0];

        if (this.fromDate && transferDate < this.fromDate) return false;
        if (this.toDate && transferDate > this.toDate) return false;
      }

      if (this.statusFilter && transfer.status !== this.statusFilter) return false;
      if (this.priorityFilter && transfer.priority !== this.priorityFilter) return false;

      if (this.pharmacyFilter) {
        const toName =
          typeof transfer.to === 'string'
            ? transfer.to
            : transfer.to?.name || '';
        if (!toName.toLowerCase().includes(this.pharmacyFilter.toLowerCase()))
          return false;
      }

      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        return (
          transfer.transferId.toLowerCase().includes(searchLower) ||
          transfer.from.toLowerCase().includes(searchLower) ||
          this.getToDisplay(transfer).toLowerCase().includes(searchLower) ||
          transfer.requested_by.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    console.log('✅ Filtered results:', this.filteredTransfers.length, 'transfers');
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.priorityFilter = '';
    this.pharmacyFilter = '';
    this.setDefaultDateRange();
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.statusFilter ||
      this.priorityFilter ||
      this.pharmacyFilter ||
      !this.isShowingTodayData()
    );
  }

  private setupMedicineSearch(): void {
    this.medicineSearchControl.valueChanges
      .pipe(
        startWith('' as string),
        map((val) => val ?? ''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm: string) => {
          const term = searchTerm.trim();
          if (term.length > 1) {
            this.medicinesLoading = true;
            return this.masterService.getmedicine(1, 20, term);
          } else {
            return of({ data: [] });
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((res: any) => {
        this.filteredMedicines = res?.data || [];
        this.medicinesLoading = false;
      });
  }

  selectMedicine(medicine: Medicine): void {
    console.log('🔍 Selecting medicine:', medicine);

    let targetIndex = -1;
    for (let i = 0; i < this.itemsFormArray.length; i++) {
      const medicineControl = this.itemsFormArray.at(i).get('medicine');
      if (!medicineControl?.value) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex === -1) {
      this.addMedicineItem();
      targetIndex = this.itemsFormArray.length - 1;
    }

    const itemControl = this.itemsFormArray.at(targetIndex);

    itemControl.patchValue({
      medicine: medicine._id,
      medicine_name: medicine.medicine_name,
      available_stock: medicine.stock,
      unit_price: medicine.price,
      dose: medicine.dose,
      batch_no: medicine.batch_no,
      expiry_date: medicine.expiry_date,
      requested_quantity: 1,
    });

    if (!this.medicines.some((m) => m._id === medicine._id)) {
      this.medicines.push(medicine);
    }

    const quantityControl = itemControl.get('requested_quantity');
    quantityControl?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(medicine.stock),
    ]);
    quantityControl?.updateValueAndValidity();

    this.stockWarning = medicine.stock === 0;
    this.medicineSearchControl.setValue('');
    this.filteredMedicines = [];
    this.showSuccess(`${medicine.medicine_name} added to transfer`);
  }

  private loadMedicinesForDropdown(): void {
    if (this.medicines.length === 0) {
      this.masterService.getmedicine(1, 100, '').subscribe({
        next: (res: any) => {
          console.log('📦 Loaded medicines for dropdown:', res);
          this.medicines = res.data || [];
        },
        error: (err) => {
          console.error('❌ Error loading medicines for dropdown:', err);
        },
      });
    }
  }

  loadTransfers(): void {
    this.loading = true;
    this.error = null;

    console.log('🔍 Loading transfers with date range:', this.fromDate, 'to', this.toDate);

    this.distributionService
      .exportAllTransfers(this.currentPage, this.pageSize, this.searchTerm)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading transfers:', error);
          this.error = 'Failed to load transfers. Please refresh the page.';
          return of({ success: false, data: [] });
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe((response) => {
        if (response?.success) {
          this.stockTransfers = response.data || [];
          this.totalRecords = response.data?.length || 0;
          this.applyFilters();
          console.log('📊 Total transfers loaded:', this.stockTransfers.length);
          console.log('📊 Filtered transfers:', this.filteredTransfers.length);
          this.clearMessages();
        }
      });
  }

  createTransfer(): void {
    this.showCreateModal = true;
    this.resetCreateForm();
    this.loadSubPharmacies();
    this.loadMedicinesForDropdown();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetCreateForm();
  }

  resetCreateForm(): void {
    this.createTransferForm.reset({
      to: '',
      priority: 'normal',
      remarks: '',
    });

    const itemsArray = this.itemsFormArray;
    itemsArray.clear();
    itemsArray.push(this.createMedicineItemFormGroup());

    this.medicineSearchControl.setValue('');
    this.filteredMedicines = [];
    this.stockWarning = false;
  }

  loadSubPharmacies(): void {
    this.subPharmaciesLoading = true;

    this.masterService.getSubPharmacies().subscribe({
      next: (res: any) => {
        console.log('Loaded pharmacies from API:', res);
        this.subPharmacies = res.data || [];
        this.subPharmaciesLoading = false;
      },
      error: (err) => {
        console.error('Error loading pharmacies:', err);
        this.showError('Failed to load pharmacies. Please check your backend connection.');
        this.subPharmaciesLoading = false;
      },
    });
  }

  addMedicineItem(): void {
    this.itemsFormArray.push(this.createMedicineItemFormGroup());
  }

  removeMedicineItem(index: number): void {
    if (this.itemsFormArray.length > 1) {
      this.itemsFormArray.removeAt(index);
    }
  }

  onMedicineSelect(index: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const medicineId = target.value;

    console.log('📋 Medicine selected from dropdown:', medicineId);

    if (!medicineId) {
      const itemControl = this.itemsFormArray.at(index);
      itemControl.patchValue({
        medicine_name: '',
        available_stock: 0,
        unit_price: 0,
        dose: 0,
        batch_no: '',
        expiry_date: '',
        requested_quantity: 1,
      });
      return;
    }

    if (this.medicines.length === 0) {
      this.loadMedicinesForDropdown();
      setTimeout(() => {
        this.updateMedicineDetails(index, medicineId);
      }, 1000);
    } else {
      this.updateMedicineDetails(index, medicineId);
    }
  }

  private updateMedicineDetails(index: number, medicineId: string): void {
    const selectedMedicine = this.medicines.find((m) => m._id === medicineId);
    if (selectedMedicine) {
      const itemControl = this.itemsFormArray.at(index);

      itemControl.patchValue({
        medicine: medicineId,
        medicine_name: selectedMedicine.medicine_name,
        available_stock: selectedMedicine.stock,
        unit_price: selectedMedicine.price,
        dose: selectedMedicine.dose,
        batch_no: selectedMedicine.batch_no,
        expiry_date: selectedMedicine.expiry_date,
      });

      const currentQuantity = itemControl.get('requested_quantity')?.value || 0;
      if (currentQuantity > selectedMedicine.stock) {
        itemControl.patchValue({ requested_quantity: 1 });
      }

      const quantityControl = itemControl.get('requested_quantity');
      quantityControl?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(selectedMedicine.stock),
      ]);
      quantityControl?.updateValueAndValidity();
    }
  }

  isFormValid(): boolean {
    return this.createTransferForm.valid && this.itemsFormArray.length > 0;
  }

  submitCreateTransfer(): void {
    if (!this.isFormValid()) {
      this.showError('Please fill all required fields correctly.');
      this.createTransferForm.markAllAsTouched();
      return;
    }

    this.createFormLoading = true;

    const formValue = this.createTransferForm.value;
    const payload = {
      to: formValue.to,
      items: formValue.items.map((item: any) => ({
        medicine: item.medicine,
        requested_quantity: item.requested_quantity,
      })),
      requested_by: 'Current User',
      priority: formValue.priority,
      remarks: formValue.remarks,
    };

    this.distributionService
      .createTransfer(payload)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error creating transfer:', error);
          this.showError('Failed to create transfer. Please try again.');
          return of({ success: false });
        }),
        finalize(() => (this.createFormLoading = false))
      )
      .subscribe((response) => {
        if (response?.success) {
          this.showSuccess('Transfer created successfully!');
          this.closeCreateModal();
          this.refreshData();
        }
      });
  }

  // Utility methods for calculations
  getTotalQuantity(): number {
    return this.itemsFormArray.value.reduce(
      (sum: number, item: any) => sum + (item.requested_quantity || 0),
      0
    );
  }

  getTotalValue(): number {
    return this.itemsFormArray.value.reduce((total: number, item: any) => {
      return total + (item.requested_quantity || 0) * (item.unit_price || 0);
    }, 0);
  }

  getItemTotal(index: number): number {
    const item = this.itemsFormArray.at(index).value;
    return (item.requested_quantity || 0) * (item.unit_price || 0);
  }

  getCalculatedTotalValue(transfer: StockTransfer): number {
    if (transfer.status === 'pending') {
      return transfer.items.reduce((total, item) => {
        return total + item.requested_quantity * item.unit_price;
      }, 0);
    }
    return transfer.total_value;
  }

  getDisplayQuantity(item: any): number {
    if (item.approved_quantity > 0) {
      return item.approved_quantity;
    }
    return item.requested_quantity || 0;
  }

  getDisplayTotal(item: any): number {
    const quantity = this.getDisplayQuantity(item);
    return quantity * (item.unit_price || 0);
  }

  getTransferDisplayValue(transfer: StockTransfer): number {
    if (transfer.status === 'pending') {
      return transfer.items.reduce((total, item) => {
        return total + item.requested_quantity * item.unit_price;
      }, 0);
    }
    return transfer.total_value;
  }

  getExpiryStatus(expiryDate: string): string {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays <= 30) return 'expiring-soon';
    return 'valid';
  }

  getExpiryClass(expiryDate: string): string {
    const status = this.getExpiryStatus(expiryDate);
    return (
      {
        expired: 'text-danger',
        'expiring-soon': 'text-warning',
        valid: 'text-success',
      }[status] || ''
    );
  }

  getPriorityClass(priority: string): string {
    const priorityClasses: Record<string, string> = {
      low: 'priority-low',
      normal: 'priority-normal',
      high: 'priority-high',
      urgent: 'priority-urgent',
    };
    return priorityClasses[priority] || 'priority-normal';
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      completed: 'status-completed',
      in_progress: 'status-in-progress',
      approved: 'status-approved',
      pending: 'status-pending',
      rejected: 'status-rejected',
    };
    return statusClasses[status] || 'status-unknown';
  }

  trackByTransferId(index: number, transfer: StockTransfer): string {
    return transfer._id;
  }

  exportTransfers(): void {
    this.actionLoading['export'] = true;

    const filters = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      status: this.statusFilter,
      priority: this.priorityFilter,
      searchTerm: this.searchTerm,
    };

    this.distributionService
      .exportTransfers(this.currentPage, this.pageSize, this.searchTerm)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error exporting transfers:', error);
          this.showError('Failed to export transfers. Please try again.');
          return of({ success: false, data: [] });
        }),
        finalize(() => (this.actionLoading['export'] = false))
      )
      .subscribe((response) => {
        if (response?.success) {
          this.downloadCSV(response.data, 'stock_transfers.csv');
          this.showSuccess('Transfers exported successfully!');
        }
      });
  }

  approveTransfer(transferId: string): void {
    console.log('Approving transfer with _id:', transferId, typeof transferId);
    this.actionLoading[transferId] = true;

    this.distributionService
      .approveTransfer(transferId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Full error:', error);
          this.showError(`Failed to approve transfer: ${error.error?.message || error.message}`);
          return of({ success: false });
        }),
        finalize(() => (this.actionLoading[transferId] = false))
      )
      .subscribe((response) => {
        if (response?.success) {
          this.showSuccess('Transfer approved successfully!');
          this.closeViewModal();
          this.refreshData();
        } else {
          this.showError(response?.message || 'Failed to approve transfer.');
        }
      });
  }

  completeTransfer(transferId: string): void {
    console.log('Completing transfer with _id:', transferId);
    this.actionLoading[transferId] = true;

    this.distributionService
      .completeTransfer(transferId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error completing transfer:', error);
          this.showError('Failed to complete transfer. Please try again.');
          return of({ success: false });
        }),
        finalize(() => (this.actionLoading[transferId] = false))
      )
      .subscribe((response) => {
        if (response?.success) {
          this.showSuccess('Transfer completed successfully!');
          this.closeViewModal();
          this.refreshData();

          const transferIndex = this.stockTransfers.findIndex((t) => t._id === transferId);
          if (transferIndex >= 0) {
            this.stockTransfers[transferIndex].status = 'completed';
          }

          if (this.selectedTransfer && this.selectedTransfer._id === transferId) {
            this.selectedTransfer.status = 'completed';
          }
        } else {
          this.showError(response?.message || 'Failed to complete transfer.');
        }
      });
  }

  isTransferActionLoading(transfer: StockTransfer): boolean {
    return this.actionLoading[transfer._id] || false;
  }

  private processTransfer(transferId: string): void {
    this.distributionService
      .processTransfer(transferId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error processing transfer:', error);
          this.showError('Transfer approved but failed to process automatically.');
          return of({ success: false });
        })
      )
      .subscribe((response) => {
        if (response?.success) {
          this.refreshData();
        }
      });
  }

  private downloadCSV(data: any[], filename: string): void {
    if (!data.length) {
      this.showError('No data available to export.');
      return;
    }

    try {
      const csvContent = this.convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
      this.showError('Failed to download export file.');
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    const csvRows = data.map((item) =>
      headers
        .map((header) => {
          const value = item[header];
          const stringValue =
            typeof value === 'object' && value !== null
              ? JSON.stringify(value).replace(/"/g, '""')
              : String(value || '').replace(/"/g, '""');
          return `"${stringValue}"`;
        })
        .join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  }

  getFormattedDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    } catch {
      return dateString || 'N/A';
    }
  }

  getItemsDisplay(transfer: StockTransfer): string {
    return `${transfer.total_items_count || transfer.items?.length || 0} item(s)`;
  }

  getToDisplay(transfer: StockTransfer): string {
    if (typeof transfer.to === 'string') {
      return transfer.to;
    }
    return transfer.to?.name || 'Unknown Pharmacy';
  }

  getFormattedValue(value: number): string {
    return value ? `₹${value.toFixed(2)}` : '₹0.00';
  }

  isActionLoading(transferId: string): boolean {
    return this.actionLoading[transferId] || false;
  }

  isExportLoading(): boolean {
    return this.actionLoading['export'] || false;
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.error = null;
    setTimeout(() => (this.successMessage = null), 5000);
  }

  private showError(message: string): void {
    this.error = message;
    this.successMessage = null;
  }

  private clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  retryLoad(): void {
    this.clearMessages();
    this.loadInitialData();
  }

  getRequestedQuantityTotal(transfer: StockTransfer): number {
    return transfer.items.reduce((sum, item) => sum + item.requested_quantity, 0);
  }

  getApprovedQuantityTotal(transfer: StockTransfer): number {
    return transfer.items.reduce((sum, item) => sum + (item.approved_quantity || 0), 0);
  }

  viewTransfer(transferId: string): void {
    console.log('View transfer:', transferId);

    this.selectedTransfer =
      this.stockTransfers.find((t) => t.transferId === transferId) || null;

    if (this.selectedTransfer) {
      this.showViewModal = true;
    } else {
      this.fetchTransferDetails(transferId);
    }
  }

  private fetchTransferDetails(transferId: string): void {
    this.viewTransferLoading = true;

    this.distributionService
      .getTransferById(transferId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error fetching transfer details:', error);
          this.showError('Failed to load transfer details. Please try again.');
          return of({ success: false, data: null });
        }),
        finalize(() => (this.viewTransferLoading = false))
      )
      .subscribe((response) => {
        if (response?.success && response.data) {
          this.selectedTransfer = response.data;
          this.showViewModal = true;
        }
      });
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedTransfer = null;
  }

  getSelectedTransferItems(): any[] {
    return this.selectedTransfer?.items || [];
  }

  getBatchDetails(item: any): string {
    if (item.batch_details && item.batch_details.length > 0) {
      const batch = item.batch_details[0];
      return `${batch.batch_no} (Exp: ${new Date(batch.expiry_date).toLocaleDateString()})`;
    }
    return 'N/A';
  }

  getMedicineName(item: any): string {
    if (item.medicine && typeof item.medicine === 'object') {
      return item.medicine.medicine_name;
    }
    return item.medicine_name || 'Unknown Medicine';
  }

  getItemDisplayTotal(item: any): number {
    const quantity =
      item.approved_quantity > 0 ? item.approved_quantity : item.requested_quantity;
    return quantity * item.unit_price;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'warning',
      approved: 'info',
      in_progress: 'primary',
      completed: 'success',
      rejected: 'danger',
    };
    return colors[status] || 'secondary';
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      low: 'success',
      normal: 'info',
      high: 'warning',
      urgent: 'danger',
    };
    return colors[priority] || 'secondary';
  }

  private loadInitialData(): void {
    console.log('📊 Loading initial data...');
    this.loadTransfers();
    this.loadSummary();
  }

  loadSummary(): void {
    this.summaryLoading = true;
    this.error = null;

    console.log('📈 Loading summary for date range:', this.fromDate, 'to', this.toDate);

    this.distributionService
      .getSummary(this.currentPage, this.pageSize, this.searchTerm)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading summary:', error);
          this.error = 'Failed to load transfer summary. Please try again.';
          return of({ success: false, data: null });
        }),
        finalize(() => (this.summaryLoading = false))
      )
      .subscribe((response) => {
        if (response?.success && response.data) {
          const summary: TransferSummary = response.data;
          this.pendingTransfers = summary.totalPending || 0;
          this.inProgress = summary.totalInProgress || 0;

          const todayStr = this.getTodayString();
          const todayCompleted = this.stockTransfers.filter((transfer) => {
            const transferDate = new Date(transfer.createdAt)
              .toISOString()
              .split('T')[0];
            return transferDate === todayStr && transfer.status === 'completed';
          }).length;

          this.completedToday = todayCompleted;

          console.log('📊 Summary updated:', {
            pending: this.pendingTransfers,
            inProgress: this.inProgress,
            completedToday: this.completedToday,
          });
        }
      });
  }

  setDateRange(preset: string): void {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    console.log('📅 Setting date range preset:', preset);

    switch (preset) {
      case 'today':
        this.fromDate = todayStr;
        this.toDate = todayStr;
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        this.fromDate = yesterdayStr;
        this.toDate = yesterdayStr;
        break;
      case 'last7days':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 6);
        this.fromDate = weekAgo.toISOString().split('T')[0];
        this.toDate = todayStr;
        break;
      case 'thisMonth':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.fromDate = monthStart.toISOString().split('T')[0];
        this.toDate = todayStr;
        break;
      case 'clear':
        this.fromDate = '';
        this.toDate = '';
        break;
    }

    console.log('📅 New date range:', this.fromDate, 'to', this.toDate);
    this.applyFilters();
  }

  onDateChange(): void {
    console.log('📅 Date manually changed:', this.fromDate, 'to', this.toDate);
    this.applyFilters();
    this.loadSummary();
  }

  getTodayTransfersCount(): number {
    const todayStr = this.getTodayString();
    return this.stockTransfers.filter((transfer) => {
      const transferDate = new Date(transfer.createdAt).toISOString().split('T')[0];
      return transferDate === todayStr;
    }).length;
  }

  getTransferDates(): string[] {
    return this.stockTransfers.map(
      (transfer) => new Date(transfer.createdAt).toISOString().split('T')[0]
    );
  }

  private refreshData(): void {
    console.log('🔄 Refreshing all data...');
    this.loadTransfers();
    this.loadSummary();
  }

  // ✅ NEW: Refresh medicine stocks after bulk upload
  private refreshMedicineStocks(): void {
    this.masterService.getmedicine(1, 100, '').subscribe({
      next: (res: any) => {
        console.log('🔄 Refreshed medicine stocks:', res);
        this.medicines = res.data || [];

        if (this.medicineSearchControl.value) {
          this.filteredMedicines = this.medicines.filter(med =>
            med.medicine_name.toLowerCase().includes(
              this.medicineSearchControl.value?.toLowerCase() || ''
            )
          );
        }
      },
      error: (err) => {
        console.error('❌ Error refreshing medicine stocks:', err);
      }
    });
  }

  debugTransferData(): void {
    console.log('🔍 DEBUG: Transfer Data Analysis');
    console.log('📊 Total transfers loaded:', this.stockTransfers.length);
    console.log('📊 Filtered transfers:', this.filteredTransfers.length);
    console.log('📅 Current date filter:', this.fromDate, 'to', this.toDate);
    console.log('📅 Today string:', this.getTodayString());
    console.log('🔄 Loading state:', this.loading);

    const transferDates = this.stockTransfers.map((t) => ({
      id: t.transferId,
      date: new Date(t.createdAt).toISOString().split('T')[0],
      status: t.status,
      rawDate: t.createdAt,
    }));
    console.log('📅 All transfer dates:', transferDates);

    const todayTransfers = this.stockTransfers.filter((t) => {
      const transferDate = new Date(t.createdAt).toISOString().split('T')[0];
      return transferDate === this.getTodayString();
    });
    console.log("📅 Today's transfers found:", todayTransfers.length, todayTransfers);
    console.log('📊 Current filtered transfers:', this.filteredTransfers);
  }

  shouldShowTable(): boolean {
    return !this.loading && this.filteredTransfers.length > 0;
  }

  shouldShowEmptyState(): boolean {
    return !this.loading && this.filteredTransfers.length === 0;
  }

  @ViewChild('printTemplate', { static: false }) printTemplate!: ElementRef;

  printTransfer(): void {
    if (!this.selectedTransfer) {
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      alert('Please allow pop-ups to print the transfer document.');
      return;
    }

    const printContent = this.printTemplate.nativeElement.innerHTML;

    const printDocument = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Transfer Document - ${this.selectedTransfer.transferId}</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          font-size: 11px;
          line-height: 1.2;
          color: #000;
          margin: 0;
          padding: 0;
        }
        .print-content {
          width: 100%;
          max-width: 210mm;
          margin: 0 auto;
          padding: 10mm;
          background: white;
        }
        .document-title {
          text-align: center;
          margin: 15px 0;
          padding: 8px;
          background-color: #5a6c7d;
          color: white;
        }
        .document-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: bold;
          letter-spacing: 1px;
        }
        .transfer-details-section {
          display: flex;
          margin: 20px 0;
          gap: 20px;
        }
        .left-details, .right-details {
          flex: 1;
        }
        .left-details h6, .right-details h6 {
          margin: 0 0 10px 0;
          padding: 6px;
          background-color: #4a90e2;
          color: white;
          font-size: 12px;
          text-align: center;
        }
        .right-details h6 {
          background-color: #9b59b6;
        }
        .detail-row {
          display: flex;
          padding: 4px 8px;
          border-bottom: 1px solid #eee;
        }
        .detail-label {
          font-weight: bold;
          width: 120px;
          color: #333;
        }
        .detail-value {
          flex: 1;
          color: #000;
        }
        .items-section {
          margin: 20px 0;
        }
        .items-section h5 {
          margin: 0 0 8px 0;
          padding: 8px;
          background-color: #5a6c7d;
          color: white;
          text-align: center;
          font-size: 14px;
        }
        .clean-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        .clean-table th, .clean-table td {
          border: 1px solid #000;
          padding: 6px 8px;
          font-size: 10px;
          text-align: left;
        }
        .clean-table th {
          background-color: #5a6c7d;
          color: white;
          text-align: center;
          font-weight: bold;
        }
        .clean-table tbody tr:nth-child(odd) {
          background-color: #f8f9fa;
        }
        .clean-table tfoot {
          background-color: #e9ecef;
          font-weight: bold;
        }
        .item-name {
          font-weight: bold;
        }
        .item-details {
          font-size: 8px;
          color: #666;
        }
        .bottom-summary {
          display: flex;
          justify-content: flex-end;
          margin: 20px 0;
        }
        .summary-box-right {
          width: 300px;
          border: 2px solid #6c757d;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          border-bottom: 1px solid #dee2e6;
          font-size: 11px;
        }
        .summary-item:last-child {
          border-bottom: none;
        }
        .summary-item.final-total {
          background-color: #6c757d;
          color: white;
          font-weight: bold;
        }
        .sum-label {
          font-weight: bold;
        }
        .final-divider {
          border-bottom: 2px solid #000;
          margin: 30px 0;
          clear: both;
        }
        .final-signatures {
          display: flex;
          justify-content: space-between;
          margin: 30px 0;
          page-break-inside: avoid;
        }
        .sig-col {
          flex: 1;
          text-align: center;
          margin: 0 10px;
        }
        .sig-line {
          border-bottom: 1px solid #000;
          margin: 0 auto 8px auto;
          width: 120px;
          height: 40px;
        }
        .sig-title {
          font-weight: bold;
          font-size: 10px;
          margin-bottom: 4px;
        }
        .sig-name {
          font-size: 9px;
          color: #666;
          margin-bottom: 4px;
        }
        .sig-date {
          font-size: 8px;
          color: #666;
        }
        .final-footer {
          text-align: center;
          font-size: 8px;
          color: #666;
          margin-top: 20px;
        }
        .final-footer p {
          margin: 2px 0;
        }
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .print-content {
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 8mm;
            box-shadow: none;
            border: none;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      </style>
    </head>
    <body>
      ${printContent}
    </body>
    </html>
  `;

    printWindow.document.write(printDocument);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ✅ NEW: Enhanced Bulk Upload Methods
  openBulkUploadModal(): void {
    this.showBulkUploadModal = true;
    this.resetBulkUploadForm();
    this.loadSubPharmacies();
  }

  closeBulkUploadModal(): void {
    this.showBulkUploadModal = false;
    this.resetBulkUploadForm();
  }

  resetBulkUploadForm(): void {
    this.selectedFile = null;
    this.selectedSubPharmacyId = '';
    this.bulkUploadAttempted = false;
    this.bulkUploadResult = null;
    this.bulkUploadLoading = false;

    const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const file = files[0];

      if (!file.name.toLowerCase().endsWith('.csv')) {
        this.showError('Please select a CSV file.');
        target.value = '';
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.showError('File size must be less than 5MB.');
        target.value = '';
        return;
      }

      this.selectedFile = file;
      this.bulkUploadResult = null;
      console.log('File selected:', file.name, this.getFileSize(file.size));
    } else {
      this.selectedFile = null;
    }
  }

  canProcessBulkUpload(): boolean {
    return !!(
      this.selectedFile &&
      this.selectedSubPharmacyId &&
      !this.bulkUploadLoading
    );
  }

  // ✅ ENHANCED: Process bulk upload with stock management
  processBulkUpload(): void {
    this.bulkUploadAttempted = true;

    if (!this.canProcessBulkUpload()) {
      if (!this.selectedSubPharmacyId) {
        this.showError('Please select a sub-pharmacy.');
      }
      if (!this.selectedFile) {
        this.showError('Please select a CSV file.');
      }
      return;
    }

    this.bulkUploadLoading = true;
    this.bulkUploadResult = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile!);
    formData.append('subPharmacyId', this.selectedSubPharmacyId);

    console.log('Processing bulk upload:', {
      fileName: this.selectedFile!.name,
      subPharmacyId: this.selectedSubPharmacyId,
    });

    this.distributionService
      .bulkstocktansfer(formData)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Bulk upload error:', error);
          const errorMessage =
            error.error?.message ||
            error.message ||
            'Upload failed. Please try again.';
          this.showError(errorMessage);

          this.bulkUploadResult = {
            success: false,
            message: errorMessage,
          };

          return of({ success: false });
        }),
        finalize(() => (this.bulkUploadLoading = false))
      )
      .subscribe((response: any) => {
        console.log('Bulk upload response:', response);

        if (response && response.message) {
          this.bulkUploadResult = {
            success: true,
            message: response.message,
            totalRecords: response.totalRecords || 0,
            uploaded: response.uploaded || 0,
            failed: response.failed || 0,
            failures: response.failures || [],
            transferId: response.transferId || null,
            transferSample: response.transferSample || [],
            stockUpdates: response.stockUpdates || [], // ✅ NEW: Include stock updates
          };

          // ✅ ENHANCED: Success message with stock information
          const stockUpdateCount = response.stockUpdates?.length || 0;
          this.showBulkUploadSuccess(response);

          // ✅ ENHANCED: Refresh data and medicine stocks
          setTimeout(() => {
            this.refreshData();
            this.refreshMedicineStocks(); // ✅ NEW: Refresh medicine stocks
          }, 1000);
        }
      });
  }

  downloadCSVTemplate(): void {
    const csvContent =
      'medicine_name,requested_quantity\n' +
      'Paracetamol 500mg,10\n' +
      'Amoxicillin 250mg,5\n' +
      'Aspirin 75mg,15\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'bulk_transfer_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    this.showSuccess('CSV template downloaded successfully!');
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ✅ NEW: Enhanced success message for bulk upload
  private showBulkUploadSuccess(response: any): void {
    const uploaded = response.uploaded || 0;
    const stockUpdates = response.stockUpdates || [];
    const totalStockReduced = stockUpdates.reduce((sum: number, update: StockUpdate) =>
      sum + update.transferred, 0
    );

    let message = `✅ Bulk upload completed successfully!\n`;
    message += `📦 ${uploaded} items processed\n`;
    message += `📊 ${stockUpdates.length} medicine stocks updated\n`;
    message += `🔢 Total quantities transferred: ${totalStockReduced}`;

    if (response.transferId) {
      message += `\n🆔 Transfer ID: ${response.transferId}`;
    }

    this.showSuccess(message);
  }
}
