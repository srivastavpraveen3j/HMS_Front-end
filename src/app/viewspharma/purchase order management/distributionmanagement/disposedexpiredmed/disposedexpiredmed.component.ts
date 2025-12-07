// disposedexpiredmed.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MasterService } from '../../../../views/mastermodule/masterservice/master.service';
import { VendorService } from '../../vendor management/service/vendor.service';
import { PoService } from '../../po/service/po.service';

interface PoConfirmation {
  quantityVerified: boolean;
  vendorVerified: boolean;
  termsAccepted: boolean;
  budgetApproved: boolean;
}

@Component({
  selector: 'app-disposedexpiredmed',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './disposedexpiredmed.component.html',
  styleUrl: './disposedexpiredmed.component.css'
})
export class DisposedexpiredmedComponent implements OnInit {
  // Existing properties
  recordsPerPage: number = 25;
  medicines: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  totalRecords = 0;
  countexpired: string = '';
  expireproducts: any[] = [];
  selectedMedicines: any[] = [];

  // Tab management
  activeTab: string = 'pending';
  filteredMedicines: any[] = [];

  // Toast properties
  showToast = false;
  toastType: 'success' | 'error' | 'warning' | 'info' = 'success';
  toastTitle = '';
  toastMessage = '';
  toastTimeout: any;

  // PO-related properties
  showReplacementPOModal = false;
  poStep = 1;
  availableVendors: any[] = [];
  detectedVendor: any = null;
  isGeneratingPO = false;

  replacementPO = {
    vendorId: '',
    customQuantities: {} as any,
    deliveryDays: 7,
    paymentTerms: '30_days',
    specialInstructions: 'Please ensure all replacement medicines have minimum 12 months shelf life from delivery date.'
  };

  poConfirmation: PoConfirmation = {
    quantityVerified: false,
    vendorVerified: false,
    termsAccepted: false,
    budgetApproved: false
  };

  constructor(
    private masterService: MasterService,
    private fb: FormBuilder,
    private vendorservice: VendorService,
    private poservice: PoService
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      searchText: ['']
    });

    this.loadDisposedMedicines();
    this.loadAvailableVendors();

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.filterMedicines();
    });
  }

  // Toast methods
  showToastMessage(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration: number = 5000) {
    this.toastType = type;
    this.toastTitle = title;
    this.toastMessage = message;
    this.showToast = true;

    // Clear existing timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    // Auto-hide toast
    this.toastTimeout = setTimeout(() => {
      this.closeToast();
    }, duration);
  }

  closeToast() {
    this.showToast = false;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  getToastIcon(): string {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[this.toastType];
  }

  // Tab management methods
  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.selectedMedicines = []; // Clear selection when switching tabs
    this.filterMedicines();
  }

  getStatusCount(status: string): number {
    return this.expireproducts.filter(med => med.replacement_status === status).length;
  }

  filterMedicines() {
    const searchText = this.filterForm.get('searchText')?.value?.toLowerCase() || '';

    this.filteredMedicines = this.expireproducts.filter(medicine => {
      const matchesTab = medicine.replacement_status === this.activeTab;
      const matchesSearch = searchText === '' ||
        medicine.medicine_name.toLowerCase().includes(searchText) ||
        medicine.batch_no.toLowerCase().includes(searchText) ||
        (medicine.supplier?.vendorName || '').toLowerCase().includes(searchText);

      return matchesTab && matchesSearch;
    });
  }

  clearSearch() {
    this.filterForm.get('searchText')?.setValue('');
  }

  clearSelection() {
    this.selectedMedicines = [];
  }

  loadDisposedMedicines() {
    const search = this.filterForm.get('searchText')?.value || '';
    this.masterService.getDisposedMedicines(this.currentPage, this.recordsPerPage, search).subscribe({
      next: (res: any) => {
        this.expireproducts = res.data.data || res.medicines || [];
        this.totalPages = res.pagination?.total_pages || 1;
        this.totalRecords = res.pagination?.total_records || this.expireproducts.length;
        this.filterMedicines();
      },
      error: (err) => {
        console.log("Error fetching disposed medicines:", err);
        this.showToastMessage('error', 'Loading Error', 'Failed to load disposed medicines. Please try again.');
      }
    });
  }

  loadAvailableVendors() {
    this.vendorservice.getvendor().subscribe({
      next: (res: any) => {
        this.availableVendors = res.data || [];
        console.log("Available vendors loaded:", this.availableVendors);
        this.detectCommonVendor();
      },
      error: (err) => {
        console.error('Error loading vendors:', err);
        this.showToastMessage('error', 'Vendor Error', 'Failed to load vendor information.');
      }
    });
  }

  // Selection methods
  isMedicineSelected(medicine: any): boolean {
    return this.selectedMedicines.some(m => m._id === medicine._id);
  }

  isMedicineSelectable(medicine: any): boolean {
    return medicine.replacement_status === 'pending';
  }

  hasSelectableMedicines(): boolean {
    return this.filteredMedicines.some(medicine => this.isMedicineSelectable(medicine));
  }

  selectMedicine(medicine: any, event: any) {
    if (!this.isMedicineSelectable(medicine)) {
      event.preventDefault();
      return;
    }

    if (event.target.checked) {
      this.selectedMedicines.push(medicine);
    } else {
      this.selectedMedicines = this.selectedMedicines.filter(m => m._id !== medicine._id);
    }
  }

  selectAllMedicines(event: any) {
    if (event.target.checked) {
      this.selectedMedicines = this.filteredMedicines.filter(medicine =>
        this.isMedicineSelectable(medicine)
      );
    } else {
      this.selectedMedicines = [];
    }
  }

  isAllSelected(): boolean {
    const selectableMedicines = this.filteredMedicines.filter(medicine =>
      this.isMedicineSelectable(medicine)
    );
    return selectableMedicines.length > 0 &&
           this.selectedMedicines.length === selectableMedicines.length;
  }

  // Status and utility methods
  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': 'fas fa-clock',
      'po_generated': 'fas fa-file-alt',
      'po_sent': 'fas fa-paper-plane',
      'replaced': 'fas fa-check-circle',
      'cancelled': 'fas fa-times-circle'
    };
    return icons[status] || 'fas fa-question-circle';
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'po_generated': 'PO Generated',
      'po_sent': 'PO Sent',
      'replaced': 'Replaced',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status.toUpperCase();
  }

  convertToRupees(dollarPrice: number): number {
    const usdToInrRate = 83;
    return Math.round(dollarPrice * usdToInrRate);
  }

  // Pagination methods
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadDisposedMedicines();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadDisposedMedicines();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDisposedMedicines();
    }
  }

  // PO-related methods
  detectCommonVendor() {
    if (this.selectedMedicines.length === 0) return;

    const vendorCounts: { [key: string]: { count: number, vendor: any } } = {};

    this.selectedMedicines.forEach(med => {
      if (med.supplier && med.supplier._id) {
        const vendorId = med.supplier._id;
        if (vendorCounts[vendorId]) {
          vendorCounts[vendorId].count++;
        } else {
          vendorCounts[vendorId] = {
            count: 1,
            vendor: med.supplier
          };
        }
      }
    });

    let maxCount = 0;
    let commonVendor = null;

    Object.values(vendorCounts).forEach(entry => {
      if (entry.count > maxCount) {
        maxCount = entry.count;
        commonVendor = entry.vendor;
      }
    });

    this.detectedVendor = commonVendor;
  }

  openReplacementPOModal() {
    const selectableMedicines = this.selectedMedicines.filter(medicine =>
      this.isMedicineSelectable(medicine)
    );

    if (selectableMedicines.length === 0) {
      this.showToastMessage('warning', 'Selection Required', 'Please select at least one medicine with "Pending" status for PO generation');
      return;
    }

    this.showReplacementPOModal = true;
    this.poStep = 1;
    this.initializeReplacementPO();
    this.detectCommonVendor();
  }

  closeReplacementPOModal() {
    this.showReplacementPOModal = false;
    this.poStep = 1;
    this.resetReplacementPO();
  }

  initializeReplacementPO() {
    this.replacementPO.customQuantities = {};
    this.selectedMedicines.forEach(med => {
      this.replacementPO.customQuantities[med._id] = med.disposed_stock;
    });

    this.poConfirmation = {
      quantityVerified: false,
      vendorVerified: false,
      termsAccepted: false,
      budgetApproved: false
    };
  }

  resetReplacementPO() {
    this.replacementPO = {
      vendorId: '',
      customQuantities: {},
      deliveryDays: 7,
      paymentTerms: '30_days',
      specialInstructions: 'Please ensure all replacement medicines have minimum 12 months shelf life from delivery date.'
    };

    this.poConfirmation = {
      quantityVerified: false,
      vendorVerified: false,
      termsAccepted: false,
      budgetApproved: false
    };
  }

  selectVendor(vendor: any) {
    this.replacementPO.vendorId = vendor._id;
  }

  getSelectedVendorName(): string {
    const vendor = this.availableVendors.find(v => v._id === this.replacementPO.vendorId);
    return vendor ? vendor.vendorName : '';
  }

  getVendorMedicineCount(vendorId: string): number {
    return this.selectedMedicines.filter(med =>
      med.supplier && med.supplier._id === vendorId
    ).length;
  }

  calculateLineTotal(medicine: any): string {
    const quantity = this.replacementPO.customQuantities[medicine._id] || medicine.disposed_stock;
    const priceInRupees = this.convertToRupees(medicine.price);
    return (quantity * priceInRupees).toFixed(2);
  }

  getTotalReplacementQuantity(): number {
    return Object.values(this.replacementPO.customQuantities)
      .reduce((sum: number, qty: any) => sum + (parseInt(qty) || 0), 0);
  }

  getTotalReplacementCost(): string {
    let total = 0;
    this.selectedMedicines.forEach(med => {
      const quantity = this.replacementPO.customQuantities[med._id] || med.disposed_stock;
      const priceInRupees = this.convertToRupees(med.price);
      total += quantity * priceInRupees;
    });
    return total.toFixed(2);
  }

  formatDeliveryDate(): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + this.replacementPO.deliveryDays);
    return deliveryDate.toLocaleDateString();
  }

  nextPOStep() {
    if (this.poStep < 3 && this.canProceedToPONext()) {
      this.poStep++;
      if (this.poStep === 3) {
        this.autoSetConfirmations();
      }
    }
  }

  previousPOStep() {
    if (this.poStep > 1) {
      this.poStep--;
    }
  }

  canProceedToPONext(): boolean {
    switch (this.poStep) {
      case 1:
        return this.replacementPO.vendorId !== '';
      case 2:
        return this.getTotalReplacementQuantity() > 0;
      default:
        return false;
    }
  }

  autoSetConfirmations() {
    if (this.replacementPO.vendorId !== '') {
      this.poConfirmation.vendorVerified = true;
    }
    if (this.getTotalReplacementQuantity() > 0) {
      this.poConfirmation.quantityVerified = true;
    }
  }

  updateConfirmation(field: keyof PoConfirmation, checked: boolean): void {
    this.poConfirmation[field] = checked;
  }

  isAllConfirmationChecked(): boolean {
    return this.poConfirmation.quantityVerified &&
           this.poConfirmation.vendorVerified &&
           this.poConfirmation.termsAccepted &&
           this.poConfirmation.budgetApproved;
  }

  generateReplacementPO() {
    if (!this.isAllConfirmationChecked()) {
      this.showToastMessage('warning', 'Confirmation Required', 'Please complete all confirmation checks before generating PO');
      return;
    }

    this.isGeneratingPO = true;

    const poPayload = {
      disposedMedicines: this.selectedMedicines.map(med => ({
        ...med,
        replacementQuantity: this.replacementPO.customQuantities[med._id] || med.disposed_stock
      })),
      disposedMedicineIds: this.selectedMedicines.map(med => med._id),
      vendorId: this.replacementPO.vendorId,
      customQuantities: this.replacementPO.customQuantities,
      deliveryDays: this.replacementPO.deliveryDays,
      paymentTerms: this.replacementPO.paymentTerms,
      specialInstructions: this.replacementPO.specialInstructions
    };

    this.poservice.createReplacementPO(poPayload).subscribe({
      next: (response) => {
        this.isGeneratingPO = false;

        // Show success toast with detailed information
        const successMessage = `
          <div class="po-success-details">
            <p><strong>PO Number:</strong> ${response.data.poNumber}</p>
            <p><strong>Vendor:</strong> ${response.data.vendor}</p>
            <p><strong>Total Amount:</strong> ₹${response.data.totalAmount}</p>
            <p><em>The PO has been sent to the vendor for acknowledgment.</em></p>
          </div>
        `;

        this.showToastMessage('success', 'Replacement PO Generated Successfully!', successMessage, 8000);

        this.closeReplacementPOModal();
        this.selectedMedicines = [];
        this.loadDisposedMedicines();
      },
      error: (error) => {
        this.isGeneratingPO = false;
        console.error('Error generating replacement PO:', error);
        this.showToastMessage('error', 'PO Generation Failed', 'Failed to generate replacement PO. Please try again.');
      }
    });
  }

  // Action methods
  viewMedicineDetails(medicine: any) {
    // Implement medicine details view
    console.log('View medicine details:', medicine);
    this.showToastMessage('info', 'Feature Coming Soon', 'Medicine details view will be available soon.');
  }

  viewPODetails(medicine: any) {
    // Implement PO details view
    console.log('View PO details:', medicine);
    this.showToastMessage('info', 'Feature Coming Soon', 'PO details view will be available soon.');
  }

  // Math for template
  Math = Math;
}
