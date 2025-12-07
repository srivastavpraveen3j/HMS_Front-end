import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MasterService } from '../../../../views/mastermodule/masterservice/master.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-lowstocklist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './lowstocklist.component.html',
  styleUrl: './lowstocklist.component.css',
})
export class LowstocklistComponent implements OnInit {
  // Dashboard summary data
  totalCriticalItems = 0;
  totalLowStockItems = 0;
  totalNearExpiryItems = 0;
  totalZeroStockItems = 0;
  transferForm!: FormGroup;

  // Active tab management
  activeTab: 'lowstock' | 'expired' = 'lowstock';

  // Low stock medicines
  lowStockMedicinesFullList: any[] = [];
  lowStockMedicines: any[] = [];

  // Expired medicines
  countexpired: string = '';
  expireproducts: any[] = [];
  expiredMedicinesForDisplay: any[] = [];

  // Pagination (unified for both tabs)
  currentPage = 1;
  totalPages = 1;
  recordsPerPage = 10;
  currentDisplayMedicines: any[] = [];

  // UI state
  showStockDetails = true;
  selectedMedicines: string[] = [];

  // Filter form
  filterForm!: FormGroup;
  userPermissions: any = {};

  // Sub-pharmacy tracking
  subPharmacies: any[] = [];
  subPharmacyLowStock: any[] = [];
  subPharmacyExpired: any[] = [];

  // Enhanced summary to include sub-pharmacy data
  centralStoreStats = {
    totalLowStock: 0,
    totalExpired: 0,
    totalZeroStock: 0
  };

  subPharmacyStats = {
    totalLowStock: 0,
    totalExpired: 0,
    totalZeroStock: 0
  };

  // Transfer Modal Properties
  showTransferModal = false;
  availableCentralInventory: any[] = [];
  isLoadingTransfer = false;

  // Individual pharmacy tab management
  pharmacyActiveTab: { [key: string]: 'lowstock' | 'expired' } = {};
  pharmacyStockDetailsVisible: { [key: string]: boolean } = {};

  // Store selected medicines data for modal
  private selectedMedicinesDataCache: any[] = [];

  // Central medicines from API
  medicines: any[] = [];

  // ✅ NEW: Transfer status tracking properties
  transferredMedicines: Set<string> = new Set(); // Store medicine IDs that have been transferred
  pendingTransferRequests: Set<string> = new Set(); // Store medicine IDs with pending transfers
  completedTransferRequests: Set<string> = new Set(); // Store completed transfer request IDs

  constructor(
    private masterService: MasterService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeTransferForm();
  }

  ngOnInit(): void {
    // Load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const medicineModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'medicine'
    );
    this.userPermissions = medicineModule?.permissions || {};

    // Initialize filter form
    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: [''],
    });

    // ✅ FIXED: Proper loading sequence
    console.log('🔄 Starting data loading sequence...');

    // Step 1: Load sub-pharmacies first
    this.loadSubPharmacies();

    // Step 2: Load ALL central medicines
    this.fetchMedicines();

    // ✅ NEW: Load existing transfer requests
    this.checkTransferStatuses();

    // Setup search debouncing
    this.filterForm
      .get('searchText')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchText: string) => {
        this.currentPage = 1;
        if (this.activeTab === 'lowstock') {
          this.fetchLowStockMedicines();
        } else {
          this.expiredmedicine();
        }
      });
  }

  // ✅ FIXED: Initialize transfer form without strict validation
  private initializeTransferForm(): void {
    this.transferForm = this.fb.group({
      to_pharmacy: this.fb.group({
        pharmacy_id: ['', Validators.required], // ✅ Add required validation
        pharmacy_name: ['', Validators.required]
      }),
      request_type: [this.activeTab === 'expired' ? 'expired_replacement' : 'stock_replenishment'],
      priority: ['medium', Validators.required],
      notes: [''],
      requested_medicines: this.fb.array([])
    });
  }

  initializeTransferFormWithData(selectedMedicines: any[]): void {
    console.log('🔄 Initializing form with medicines:', selectedMedicines);

    // Clear existing form array
    const medicinesArray = this.transferForm.get('requested_medicines') as FormArray;
    medicinesArray.clear();

    if (selectedMedicines.length === 0) {
      console.warn('No medicines available for transfer');
      this.isLoadingTransfer = false;
      return;
    }

    // ✅ FIXED: Add medicines without strict validators for testing
    selectedMedicines.forEach((medicine, index) => {
      console.log(`Adding medicine ${index}:`, medicine.medicine_name);
      console.log(`Medicine ID being used:`, medicine.medicine);

      // ✅ Create form group without validators temporarily
      const medicineGroup = this.fb.group({
        medicine: [medicine.medicine], // ✅ No validator for now
        medicine_name: [medicine.medicine_name],
        requested_quantity: [medicine.requested_quantity], // ✅ No validator for now
        urgency_level: [medicine.urgency_level || 'medium'],
        disposal_reference: [medicine.disposal_reference],
        unit_price: [medicine.unit_price || 100],
        central_available_stock: [medicine.central_available_stock || 0] // ✅ Add this field
      });

      medicinesArray.push(medicineGroup);
    });

    this.isLoadingTransfer = false;
    console.log('✅ Form initialized with medicines:', medicinesArray.length);
    console.log('✅ Form valid after init:', this.transferForm.valid);
    console.log('✅ Form errors:', this.getFormValidationErrors());
  }

  // ✅ NEW: Debug form validation method
  getFormValidationErrors(): any {
    const errors: any = {};

    // Check main form errors
    Object.keys(this.transferForm.controls).forEach(key => {
      const control = this.transferForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });

    // Check nested form group errors (to_pharmacy)
    const toPharmacyGroup = this.transferForm.get('to_pharmacy');
    if (toPharmacyGroup && toPharmacyGroup.errors) {
      errors['to_pharmacy_group'] = toPharmacyGroup.errors;
    }

    // Check to_pharmacy nested controls
    if (toPharmacyGroup) {
      Object.keys(toPharmacyGroup.value || {}).forEach(key => {
        const control = toPharmacyGroup.get(key);
        if (control && control.errors) {
          errors[`to_pharmacy.${key}`] = control.errors;
        }
      });
    }

    // Check requested_medicines array errors
    const medicinesArray = this.transferForm.get('requested_medicines') as FormArray;
    if (medicinesArray) {
      medicinesArray.controls.forEach((control, index) => {
        if (control.errors) {
          errors[`medicine_${index}`] = control.errors;
        }

        // Check each field in the medicine group
        Object.keys(control.value || {}).forEach(fieldKey => {
          const fieldControl = control.get(fieldKey);
          if (fieldControl && fieldControl.errors) {
            errors[`medicine_${index}.${fieldKey}`] = fieldControl.errors;
          }
        });
      });
    }

    return errors;
  }

  // ✅ NEW: Check for completed transfers and update medicine availability
  checkTransferStatuses(): void {
    // This should call your backend to get updated transfer statuses
    this.masterService.getTransferRequests().subscribe({
      next: (transfers: any[]) => {
        this.pendingTransferRequests.clear();
        this.transferredMedicines.clear();
        this.completedTransferRequests.clear();

        transfers.forEach(transfer => {
          if (transfer.status === 'completed') {
            this.completedTransferRequests.add(transfer._id);
            // Move medicines from pending to completed
            transfer.requested_medicines?.forEach((med: any) => {
              this.pendingTransferRequests.delete(med.medicine);
              this.transferredMedicines.add(med.medicine);
            });
          } else if (transfer.status === 'pending' || transfer.status === 'approved') {
            // Add to pending requests
            transfer.requested_medicines?.forEach((med: any) => {
              this.pendingTransferRequests.add(med.medicine);
            });
          }
        });

        console.log('✅ Transfer statuses updated:', {
          pending: this.pendingTransferRequests.size,
          completed: this.transferredMedicines.size
        });
      },
      error: (err) => {
        console.error('Error checking transfer statuses:', err);
      }
    });
  }

  // ✅ NEW: Enhanced medicine selection with transfer status check
  onMedicineSelect(medicineId: string): void {
    // Check if medicine already has a pending transfer request
    if (this.pendingTransferRequests.has(medicineId)) {
      this.showTransferStatusAlert(medicineId, 'pending');
      return;
    }

    // Check if medicine has already been transferred
    if (this.transferredMedicines.has(medicineId)) {
      this.showTransferStatusAlert(medicineId, 'completed');
      return;
    }

    // Proceed with normal selection
    const index = this.selectedMedicines.indexOf(medicineId);
    if (index > -1) {
      this.selectedMedicines.splice(index, 1);
    } else {
      this.selectedMedicines.push(medicineId);
    }
  }

  // ✅ NEW: Check if medicine is already selected or has transfer status
  isMedicineSelected(medicineId: string): boolean {
    return this.selectedMedicines.includes(medicineId);
  }

  // ✅ NEW: Check if medicine is disabled due to transfer status
  isMedicineDisabled(medicineId: string): boolean {
    return this.pendingTransferRequests.has(medicineId) ||
           this.transferredMedicines.has(medicineId);
  }

  // ✅ NEW: Get the transfer status of a medicine
  getMedicineTransferStatus(medicineId: string): 'available' | 'pending' | 'completed' {
    if (this.transferredMedicines.has(medicineId)) return 'completed';
    if (this.pendingTransferRequests.has(medicineId)) return 'pending';
    return 'available';
  }

  // ✅ NEW: Show alert for transfer status
  async showTransferStatusAlert(medicineId: string, status: 'pending' | 'completed'): Promise<void> {
    const Swal = (await import('sweetalert2')).default;

    const config = status === 'pending' ? {
      icon: 'warning' as const,
      title: 'Transfer Request Pending',
      text: 'This medicine already has a pending transfer request. Please wait for approval.',
      iconColor: '#f59e0b'
    } : {
      icon: 'info' as const,
      title: 'Already Transferred',
      text: 'This medicine has already been successfully transferred and is no longer available for selection.',
      iconColor: '#3b82f6'
    };

    Swal.fire({
      ...config,
      position: 'top-end',
      toast: true,
      timer: 4000,
      showConfirmButton: false,
      customClass: {
        popup: 'hospital-toast-popup transfer-status-toast',
        title: 'hospital-toast-title',
        htmlContainer: 'hospital-toast-text',
      },
    });
  }

  // Tab management
  switchToTab(tab: 'lowstock' | 'expired'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.selectedMedicines = [];
    this.updateCurrentDisplay();
  }

  // ✅ FIXED: Load all central medicines without restrictions
  fetchMedicines(): void {
    const limit = 200; // ✅ Load more medicines
    const search = ''; // ✅ No search filter to get ALL medicines

    console.log('🔍 Fetching ALL central medicines for transfer matching...');

    this.masterService.getmedicine(1, limit, search).subscribe({
      next: (res) => {
        this.medicines = res.data || [];
        this.totalPages = res.totalPages || 1;

        console.log("✅ Fetched medicines:", this.medicines.length);
        console.log("Medicine names:", this.medicines.map(m => m.medicine_name));

        // ✅ Load sub-pharmacy data after medicines are loaded
        if (this.subPharmacies.length > 0) {
          this.loadSubPharmacyStockData();
        }
      },
      error: (err) => {
        console.error("❌ Error fetching medicines:", err);
        this.medicines = [];
        // Still proceed with sub-pharmacy data loading
        if (this.subPharmacies.length > 0) {
          this.loadSubPharmacyStockData();
        }
      }
    });
  }

  // ✅ FIXED: Load sub-pharmacies and wait for medicines
  loadSubPharmacies(): void {
    this.masterService.getSubPharmacies().subscribe({
      next: (res: any) => {
        this.subPharmacies = res.data || [];
        console.log('✅ Loaded sub-pharmacies:', this.subPharmacies.length);

        // Initialize tab states for each pharmacy
        this.subPharmacies.forEach(pharmacy => {
          this.pharmacyActiveTab[pharmacy._id] = 'lowstock';
          this.pharmacyStockDetailsVisible[pharmacy._id] = true;
        });

        // ✅ Load stock data only if medicines are already loaded
        if (this.medicines.length > 0) {
          this.loadSubPharmacyStockData();
        }
      },
      error: (err) => {
        console.error('❌ Error loading sub-pharmacies:', err);
      }
    });
  }

  // Load sub-pharmacy stock data
  loadSubPharmacyStockData(): void {
    // Reset arrays
    this.subPharmacyLowStock = [];
    this.subPharmacyExpired = [];

    if (this.subPharmacies.length === 0) {
      console.log('No sub-pharmacies found');
      return;
    }

    // Track completed requests
    let completedRequests = 0;
    const totalRequests = this.subPharmacies.length;

    // For each sub-pharmacy, get their low stock data
    this.subPharmacies.forEach(pharmacy => {
      this.masterService.getSubPharmacyStock(pharmacy._id).subscribe({
        next: (res: any) => {
          console.log(`Stock data for ${pharmacy.name}:`, res.data?.length || 0);

          const stockData = res.data || [];

          // ✅ Filter out transferred medicines
          const lowStockItems = stockData.filter((item: any) =>
            (item.current_stock || 0) <= 10 &&
            !this.isExpiredItem(item) &&
            !this.transferredMedicines.has(item._id || item.medicine?._id)
          );

          const expiredItems = stockData.filter((item: any) =>
            this.isExpiredItem(item) &&
            !this.transferredMedicines.has(item._id || item.medicine?._id)
          );

          console.log(`${pharmacy.name} - Low stock: ${lowStockItems.length}, Expired: ${expiredItems.length}`);

          // Add to sub-pharmacy collections with source info
          this.subPharmacyLowStock.push(...lowStockItems.map((item: any) => ({
            ...item,
            source_pharmacy: pharmacy.name,
            source_pharmacy_id: pharmacy._id,
            medicine_name: item.medicine?.medicine_name || item.medicine_name || 'Unknown',
            stock: item.current_stock || 0,
            _id: item._id || item.medicine?._id,
            // Copy expiry date for consistency
            expiry_date: item.expiry_date || item.batch_details?.[0]?.expiry_date
          })));

          this.subPharmacyExpired.push(...expiredItems.map((item: any) => ({
            ...item,
            source_pharmacy: pharmacy.name,
            source_pharmacy_id: pharmacy._id,
            medicine_name: item.medicine?.medicine_name || item.medicine_name || 'Unknown',
            stock: item.current_stock || 0,
            _id: item._id || item.medicine?._id,
            // Copy expiry date for consistency
            expiry_date: item.expiry_date || item.batch_details?.[0]?.expiry_date
          })));

          completedRequests++;

          // When all requests are complete, update stats
          if (completedRequests === totalRequests) {
            this.updateSubPharmacyStats();
            this.updateAggregatedStats();
          }
        },
        error: (err) => {
          console.error(`Error loading stock for ${pharmacy.name}:`, err);
          completedRequests++;
          // Continue even if one fails
          if (completedRequests === totalRequests) {
            this.updateSubPharmacyStats();
            this.updateAggregatedStats();
          }
        }
      });
    });
  }

  // Helper method to check if sub-pharmacy item is expired
  isExpiredItem(item: any): boolean {
    const expiryDate = item.expiry_date || item.batch_details?.[0]?.expiry_date;
    if (!expiryDate) return false;

    try {
      const expiry = new Date(expiryDate);
      const today = new Date();
      return expiry < today;
    } catch (error) {
      return false;
    }
  }

  updateSubPharmacyStats(): void {
    this.subPharmacyStats.totalLowStock = this.subPharmacyLowStock.length;
    this.subPharmacyStats.totalExpired = this.subPharmacyExpired.length;
    this.subPharmacyStats.totalZeroStock = this.subPharmacyLowStock.filter(item => (item.stock || 0) === 0).length;

    console.log('Sub-pharmacy stats updated:', this.subPharmacyStats);
  }

  updateAggregatedStats(): void {
    this.calculateSummaryStats();
  }

  // Method to refresh when sub-pharmacy is created
  refreshDataWhenPharmacyCreated(): void {
    this.loadSubPharmacies();
  }

  // Update current display based on active tab
  updateCurrentDisplay(): void {
    const sourceList =
      this.activeTab === 'lowstock'
        ? this.lowStockMedicinesFullList
        : this.expiredMedicinesForDisplay;

    this.totalPages = Math.ceil(sourceList.length / this.recordsPerPage);

    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;

    this.currentDisplayMedicines = sourceList.slice(startIndex, endIndex);
  }

  // Pagination methods
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateCurrentDisplay();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateCurrentDisplay();
    }
  }

  // Selection methods
  selectAllMedicines(event: any): void {
    const checked = event.target.checked;
    if (checked) {
      this.selectedMedicines = this.currentDisplayMedicines
        .map((med) => (med._id || med.id || '').toString())
        .filter((id) => id && !this.isMedicineDisabled(id)); // ✅ Filter out disabled medicines
    } else {
      this.selectedMedicines = [];
    }
  }

  isAllSelected(): boolean {
    return (
      this.currentDisplayMedicines.length > 0 &&
      this.currentDisplayMedicines
        .filter(med => !this.isMedicineDisabled(med.id || med.medicine_id || med._id))
        .every((med) =>
          this.isMedicineSelected(med.id || med.medicine_id || med._id)
        )
    );
  }

  // Utility methods for expired medicines
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  }

  getDaysOverdue(dateString: string): number {
    if (!dateString) return 0;
    try {
      const expiryDate = new Date(dateString);
      const today = new Date();
      const timeDiff = today.getTime() - expiryDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return Math.max(0, daysDiff);
    } catch {
      return 0;
    }
  }

  // Calculate summary statistics
  calculateSummaryStats(): void {
    this.totalLowStockItems = this.lowStockMedicinesFullList.length;
    this.totalCriticalItems = this.lowStockMedicinesFullList.filter(
      (med) => this.calculatePriority(med) === 'Critical'
    ).length;
    this.totalNearExpiryItems = this.lowStockMedicinesFullList.filter((med) =>
      this.isNearExpiry(med, 30)
    ).length;
    this.totalZeroStockItems = this.lowStockMedicinesFullList.filter(
      (med) => (med.stock || 0) === 0
    ).length;
  }

  calculatePriority(medicine: any): 'Critical' | 'High' | 'Medium' {
    const stockLevel = medicine.stock || 0;
    const isNearExpiry = this.isNearExpiry(medicine, 30);

    if (stockLevel === 0 || isNearExpiry) {
      return 'Critical';
    } else if (stockLevel <= 2) {
      return 'Critical';
    } else if (stockLevel <= 5) {
      return 'High';
    } else {
      return 'Medium';
    }
  }

  calculateMinRequired(medicine: any): number {
    const stockLevel = medicine.stock || 0;
    if (stockLevel === 0) return 50;
    if (stockLevel <= 2) return 30;
    if (stockLevel <= 5) return 20;
    return 15;
  }

  getCategoryFromName(medicineName: string): string {
    if (!medicineName) return 'General';

    const name = medicineName.toLowerCase();

    if (
      name.includes('paracetamol') ||
      name.includes('ibuprofen') ||
      name.includes('aspirin')
    ) {
      return 'Analgesics';
    } else if (name.includes('amoxicillin') || name.includes('antibiotic')) {
      return 'Antibiotics';
    } else if (name.includes('insulin') || name.includes('metformin')) {
      return 'Diabetes';
    } else if (name.includes('inhaler') || name.includes('salbutamol')) {
      return 'Respiratory';
    } else if (name.includes('omeprazole') || name.includes('gastro')) {
      return 'Gastro';
    }

    return 'General';
  }

  isExpired(medicine: any): boolean {
    if (!medicine.expiry_date) return false;
    try {
      const expiryDate = new Date(medicine.expiry_date);
      const today = new Date();
      return expiryDate < today;
    } catch (error) {
      return false;
    }
  }

  isNearExpiry(medicine: any, daysThreshold: number = 30): boolean {
    if (!medicine.expiry_date) return false;
    try {
      const expiryDate = new Date(medicine.expiry_date);
      const today = new Date();
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff <= daysThreshold && daysDiff > 0;
    } catch (error) {
      return false;
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Critical':
        return 'priority-critical';
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      default:
        return '';
    }
  }

  getStockPercentage(medicine: any): number {
    const minRequired = this.calculateMinRequired(medicine);
    const stockLevel = medicine.stock || 0;
    return Math.round((stockLevel / minRequired) * 100);
  }

  toggleStockDetails(): void {
    this.showStockDetails = !this.showStockDetails;
  }

  // Add this method to your component
  hasDataToShow(): boolean {
    if (this.activeTab === 'lowstock') {
      return this.subPharmacyStats.totalLowStock > 0;
    } else {
      return this.subPharmacyStats.totalExpired > 0;
    }
  }

  // ✅ Filter out transferred medicines from alerts
  getPharmacyLowStockMedicines(pharmacyId: string): any[] {
    return this.subPharmacyLowStock
      .filter(item => item.source_pharmacy_id === pharmacyId)
      .filter(item => !this.transferredMedicines.has(item._id)) // ✅ Exclude transferred medicines
      .map(item => ({
        ...item,
        priority: this.calculatePriority(item),
        minRequired: this.calculateMinRequired(item),
        category: this.getCategoryFromName(item.medicine_name || 'Unknown')
      }));
  }

  getPharmacyExpiredMedicines(pharmacyId: string): any[] {
    return this.subPharmacyExpired
      .filter(item => item.source_pharmacy_id === pharmacyId)
      .filter(item => !this.transferredMedicines.has(item._id)) // ✅ Exclude transferred medicines
      .map(item => ({
        ...item,
        category: this.getCategoryFromName(item.medicine_name || 'Unknown')
      }));
  }

  // Modify fetchLowStockMedicines to exclude central store
  fetchLowStockMedicines(): void {
    // Only use sub-pharmacy low stock data
    this.lowStockMedicinesFullList = this.subPharmacyLowStock
      .filter(item => !this.transferredMedicines.has(item._id)) // ✅ Exclude transferred
      .map((item: any) => ({
        ...item,
        id: item._id || item.id || Math.random().toString(36).substr(2, 9),
        priority: this.calculatePriority(item),
        minRequired: this.calculateMinRequired(item),
        category: this.getCategoryFromName(item.medicine_name || 'Unknown')
      }));

    console.log('Sub-pharmacy only low stock medicines:', this.lowStockMedicinesFullList.length);
    this.calculateSummaryStats();
    this.updateCurrentDisplay();
  }

  // Modify expiredmedicine to exclude central store
  expiredmedicine(): void {
    // Only use sub-pharmacy expired data
    this.expiredMedicinesForDisplay = this.subPharmacyExpired
      .filter(item => !this.transferredMedicines.has(item._id)) // ✅ Exclude transferred
      .map((item: any) => ({
        ...item,
        id: item._id || item.id || Math.random().toString(36).substr(2, 9),
        category: this.getCategoryFromName(item.medicine_name || 'Unknown')
      }));

    // Update total count
    this.countexpired = this.expiredMedicinesForDisplay.length.toString();

    console.log('Sub-pharmacy only expired medicines:', this.expiredMedicinesForDisplay.length);

    this.updateCurrentDisplay();
  }

  // Remove central store methods and use only sub-pharmacy totals
  getTotalExpired(): number {
    return this.subPharmacyStats.totalExpired;
  }

  getTotalLowStock(): number {
    return this.subPharmacyStats.totalLowStock;
  }

  getTotalZeroStock(): number {
    return this.subPharmacyStats.totalZeroStock;
  }

  // Add method to navigate to create pharmacy
  navigateToCreatePharmacy(): void {
    this.router.navigate(['/inventorylayout/subpharmacy']);
  }

  // Enhanced viewStock method with the service you provided
  viewStock(pharmacyId: any): void {
    console.log('Navigating to pharmacy inventory:', pharmacyId);

    // Use your service to fetch inventory data first
    this.masterService.getSubPharmacyInventoryItems(pharmacyId, 1, 100, '').subscribe({
      next: (res: any) => {
        console.log('Pharmacy inventory preview:', res);
        // Navigate to the detailed view
        this.router.navigate(['/inventorylayout/pharmamanagementlist', pharmacyId])
          .then(success => console.log('Navigation success?', success));
      },
      error: (err) => {
        console.error('Error loading pharmacy inventory:', err);
        // Still navigate even if preview fails
        this.router.navigate(['/inventorylayout/pharmamanagementlist', pharmacyId]);
      }
    });
  }

  // Add method to filter sub-pharmacy data
  filterSubPharmacyData(searchText: string): void {
    if (this.activeTab === 'lowstock') {
      this.fetchLowStockMedicines();
    } else {
      this.expiredmedicine();
    }
  }

  // Individual pharmacy management methods
  getActiveTab(pharmacyId: string): 'lowstock' | 'expired' {
    return this.pharmacyActiveTab[pharmacyId] || 'lowstock';
  }

  switchPharmacyTab(pharmacyId: string, tab: 'lowstock' | 'expired'): void {
    this.pharmacyActiveTab[pharmacyId] = tab;
  }

  getStockDetailsVisible(pharmacyId: string): boolean {
    return this.pharmacyStockDetailsVisible[pharmacyId] !== false; // Default to true
  }

  togglePharmacyStockDetails(pharmacyId: string): void {
    this.pharmacyStockDetailsVisible[pharmacyId] = !this.getStockDetailsVisible(pharmacyId);
  }

  // Get counts for individual pharmacy
  getPharmacyLowStockCount(pharmacyId: string): number {
    return this.subPharmacyLowStock
      .filter(item => item.source_pharmacy_id === pharmacyId)
      .filter(item => !this.transferredMedicines.has(item._id)).length;
  }

  getPharmacyExpiredCount(pharmacyId: string): number {
    return this.subPharmacyExpired
      .filter(item => item.source_pharmacy_id === pharmacyId)
      .filter(item => !this.transferredMedicines.has(item._id)).length;
  }

  getPharmacyZeroStockCount(pharmacyId: string): number {
    return this.subPharmacyLowStock
      .filter(item => item.source_pharmacy_id === pharmacyId && (item.stock || 0) === 0)
      .filter(item => !this.transferredMedicines.has(item._id))
      .length;
  }

  // Check if pharmacy has data to show
  hasPharmacyData(pharmacyId: string): boolean {
    const activeTab = this.getActiveTab(pharmacyId);
    if (activeTab === 'lowstock') {
      return this.getPharmacyLowStockCount(pharmacyId) > 0;
    } else {
      return this.getPharmacyExpiredCount(pharmacyId) > 0;
    }
  }

  // Handle actions for individual pharmacy
  handlePharmacyAction(pharmacyId: string): void {
    const activeTab = this.getActiveTab(pharmacyId);
    const pharmacy = this.subPharmacies.find(p => p._id === pharmacyId);

    if (activeTab === 'expired') {
      const expiredMeds = this.getPharmacyExpiredMedicines(pharmacyId);
      console.log(`Disposing expired medicines for ${pharmacy?.name}:`, expiredMeds);
      // Implement disposal logic for this specific pharmacy
    } else {
      const lowStockMeds = this.getPharmacyLowStockMedicines(pharmacyId);
      console.log(`Requesting stock for ${pharmacy?.name}:`, lowStockMeds);
      // Implement stock request logic for this specific pharmacy
    }
  }

  // ✅ FIXED: Always open transfer modal
  openTransferModal(): void {
    if (this.selectedMedicines.length === 0) {
      this.showNoSelectionAlert();
      return;
    }

    console.log('🚀 Opening transfer modal...');
    console.log('Selected medicine IDs:', this.selectedMedicines);

    // ✅ Get selected medicines data
    this.selectedMedicinesDataCache = this.getSelectedMedicinesData();

    if (this.selectedMedicinesDataCache.length === 0) {
      this.showNoValidMedicinesAlert();
      return;
    }

    console.log('Processed medicines for transfer:', this.selectedMedicinesDataCache);

    // ✅ Set the target pharmacy automatically based on selected medicines
    const firstMedicine = this.selectedMedicinesDataCache[0];
    if (firstMedicine.source_pharmacy_id && firstMedicine.source_pharmacy) {
      this.transferForm.patchValue({
        to_pharmacy: {
          pharmacy_id: firstMedicine.source_pharmacy_id,
          pharmacy_name: firstMedicine.source_pharmacy
        }
      });
    }

    this.showTransferModal = true;
    this.initializeTransferFormWithData(this.selectedMedicinesDataCache);
  }

  // ✅ NEW: Show alert when no medicines are selected
  async showNoSelectionAlert(): Promise<void> {
    const Swal = (await import('sweetalert2')).default;

    await Swal.fire({
      icon: 'warning',
      title: 'No Medicines Selected',
      text: 'Please select medicines to transfer before opening the transfer request modal.',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
      },
    });
  }

  // ✅ NEW: Show alert when no valid medicines found
  async showNoValidMedicinesAlert(): Promise<void> {
    const Swal = (await import('sweetalert2')).default;

    await Swal.fire({
      icon: 'error',
      title: 'No Valid Medicines Found',
      text: 'The selected medicines are not available for transfer. They may have already been transferred or are not found in the system.',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
      },
    });
  }

  // ✅ FIXED: Simplified getSelectedMedicinesData method
  getSelectedMedicinesData(): any[] {
    const selectedData: any[] = [];

    console.log('🔍 Getting selected medicines data...');
    console.log('Selected IDs:', this.selectedMedicines);

    this.selectedMedicines.forEach(selectedId => {
      console.log('Looking for ID:', selectedId);

      // ✅ Search in current display medicines first
      let foundMedicine = this.currentDisplayMedicines.find(med => {
        const medId = (med._id || med.id)?.toString();
        return medId === selectedId.toString();
      });

      // If not found, search in full lists
      if (!foundMedicine) {
        foundMedicine = [...this.subPharmacyLowStock, ...this.subPharmacyExpired]
          .find(med => (med._id || med.id)?.toString() === selectedId.toString());
      }

      if (foundMedicine) {
        // ✅ CRITICAL: Map sub-pharmacy medicine to central medicine
        const centralMedicine = this.findCentralMedicineByName(foundMedicine.medicine_name);

        if (centralMedicine) {
          selectedData.push({
            medicine: centralMedicine._id, // ✅ Use central medicine ID
            medicine_name: foundMedicine.medicine_name,
            requested_quantity: this.calculateRecommendedQuantity(foundMedicine),
            urgency_level: this.mapPriorityToUrgency(foundMedicine.priority),
            disposal_reference: this.activeTab === 'expired' ? `EXP-${foundMedicine._id}` : null,
            unit_price: centralMedicine.price || 100,
            // Additional info for display
            current_sub_pharmacy_stock: foundMedicine.current_stock || foundMedicine.stock || 0,
            source_pharmacy: foundMedicine.source_pharmacy,
            source_pharmacy_id: foundMedicine.source_pharmacy_id,
            central_available_stock: centralMedicine.stock || 0,
            batch_no: foundMedicine.batch_no || centralMedicine.batch_no || 'N/A'
          });
          console.log(`✅ Mapped: ${foundMedicine.medicine_name} -> Central ID: ${centralMedicine._id}`);
        } else {
          console.warn(`❌ No central medicine found for: ${foundMedicine.medicine_name}`);
          // ✅ Still add but mark as unavailable
          selectedData.push({
            medicine: selectedId, // Use original ID as fallback
            medicine_name: foundMedicine.medicine_name,
            requested_quantity: this.calculateRecommendedQuantity(foundMedicine),
            urgency_level: 'medium',
            disposal_reference: this.activeTab === 'expired' ? `EXP-${foundMedicine._id}` : null,
            unit_price: 100,
            current_sub_pharmacy_stock: foundMedicine.current_stock || foundMedicine.stock || 0,
            source_pharmacy: foundMedicine.source_pharmacy,
            source_pharmacy_id: foundMedicine.source_pharmacy_id,
            central_available_stock: 0,
            batch_no: foundMedicine.batch_no || 'N/A',
            error: 'Medicine not found in central inventory'
          });
        }
      } else {
        console.warn(`❌ Medicine with ID ${selectedId} not found`);
      }
    });

    console.log('📦 Final medicines for transfer:', selectedData.length);
    return selectedData;
  }

  // ✅ Enhanced submit transfer request with SweetAlert2
  async submitTransferRequest(): Promise<void> {
    console.log('🚀 Submitting transfer request...');

    // Import SweetAlert2
    const Swal = (await import('sweetalert2')).default;

    // Validation checks (keeping your existing logic)
    const validationErrors = this.getFormValidationErrors();
    console.log('📋 Validation errors:', validationErrors);

    const medicines = this.transferForm.get('requested_medicines')?.value || [];
    const invalidMedicines = medicines.filter((med: any) => !med.medicine);

    if (invalidMedicines.length > 0) {
      console.error('❌ Found medicines with null IDs in form:', invalidMedicines);

      await Swal.fire({
        icon: 'error',
        title: 'Invalid Medicine Data',
        text: 'Some medicines have invalid IDs. Please refresh and try again.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
      return;
    }

    const toPharmacyId = this.transferForm.get('to_pharmacy.pharmacy_id')?.value;
    if (!toPharmacyId) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Target pharmacy is required',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
      return;
    }

    if (medicines.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'No Medicines Selected',
        text: 'At least one medicine is required for transfer request',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      icon: 'question',
      title: 'Confirm Transfer Request',
      html: `
        <div class="transfer-confirmation">
          <p><strong>Transfer Summary:</strong></p>
          <ul class="transfer-summary-list">
            <li><strong>${medicines.length}</strong> medicines</li>
            <li><strong>${this.getTotalRequestedQuantity()}</strong> total units</li>
            <li><strong>₹${this.getTotalRequestedValue().toLocaleString()}</strong> estimated cost</li>
          </ul>
          <p class="mt-3">Are you sure you want to submit this transfer request?</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Yes, Submit Request',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-confirm',
        cancelButton: 'hospital-swal-cancel',
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    this.isLoadingTransfer = true;

    // Show loading toast
    const loadingToast = Swal.fire({
      icon: 'info',
      title: 'Processing Request...',
      text: 'Please wait while we create your transfer request.',
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'hospital-toast-popup loading-toast',
      },
    });

    const userData = this.getUserData();
    const requestData = {
      ...this.transferForm.value,
      requested_by: {
        user_name: userData.name,
        user_email: userData.email,
        role: 'Pharmacist'
      }
    };

    console.log('📤 Final request data being sent:', JSON.stringify(requestData, null, 2));

    this.masterService.createTransferRequest(requestData).subscribe({
      next: async (res: any) => {
        console.log('✅ Transfer request created:', res);

        // Close loading toast
        Swal.close();

        // ✅ Add selected medicines to pending transfers
        const selectedMedicineIds = medicines.map((med: any) => med.medicine);
        selectedMedicineIds.forEach((id: string) => {
          this.pendingTransferRequests.add(id);
        });

        // Show success notification
        await Swal.fire({
          icon: 'success',
          title: 'Transfer Request Submitted Successfully!',
          html: `
            <div class="success-details">
              <p><strong>Request ID:</strong> <code>${res.data?.request_id || 'Generated'}</code></p>
              <p><strong>Status:</strong> <span class="status-badge pending">${res.data?.status || 'Pending Approval'}</span></p>
              <p><strong>Medicines:</strong> ${medicines.length} items</p>
              <hr>
              <p class="note">Your request has been sent to the inventory manager for approval. You will be notified once it's processed.</p>
            </div>
          `,
          confirmButtonText: 'OK',
          customClass: {
            popup: 'hospital-swal-popup success-popup',
            title: 'hospital-swal-title success-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-confirm success-button',
          },
        });

        // Show success toast as well
        Swal.fire({
          icon: 'success',
          title: 'Request Submitted',
          text: `Transfer request #${res.data?.request_id || 'Generated'} created successfully`,
          position: 'top-end',
          toast: true,
          timer: 5000,
          showConfirmButton: false,
          customClass: {
            popup: 'hospital-toast-popup success-toast',
            title: 'hospital-toast-title',
            htmlContainer: 'hospital-toast-text',
          },
        });

        this.closeTransferModal();
        this.selectedMedicines = [];
        this.refreshDataAfterTransfer();
      },
      error: async (err) => {
        console.error('❌ Error creating transfer request:', err);

        // Close loading toast
        Swal.close();

        // Show error notification
        await Swal.fire({
          icon: 'error',
          title: 'Transfer Request Failed',
          html: `
            <div class="error-details">
              <p><strong>Error:</strong> ${err.error?.message || err.message || 'Unknown error occurred'}</p>
              <p class="error-suggestion">Please check your connection and try again. If the problem persists, contact IT support.</p>
            </div>
          `,
          confirmButtonText: 'Try Again',
          customClass: {
            popup: 'hospital-swal-popup error-popup',
            title: 'hospital-swal-title error-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-confirm error-button',
          },
        });

        this.isLoadingTransfer = false;
      }
    });
  }

  // ✅ Helper method to get user data
  private getUserData(): { name: string, email: string } {
    try {
      const userData = localStorage.getItem('authUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        return {
          name: parsedUser.name || 'Current User',
          email: parsedUser.email || 'N/A'
        };
      }
    } catch (error) {
      console.warn('Could not parse user data:', error);
    }

    return { name: 'Current User', email: 'N/A' };
  }

  // ✅ Method to refresh data and update transfer statuses
  private refreshDataAfterTransfer(): void {
    // Refresh your pharmacy data
    this.loadSubPharmacyStockData();
    this.checkTransferStatuses();

    if (this.activeTab === 'lowstock') {
      this.fetchLowStockMedicines();
    } else {
      this.expiredmedicine();
    }
  }

  closeTransferModal(): void {
    this.showTransferModal = false;
    this.isLoadingTransfer = false;
    this.selectedMedicinesDataCache = []; // Clear cache
  }

  // Get medicines form array
  get requestedMedicines(): FormArray {
    return this.transferForm.get('requested_medicines') as FormArray;
  }

  // Update quantity for specific medicine
  updateRequestedQuantity(index: number, value: string): void {
    const medicineControl = this.requestedMedicines.at(index);
    const availableStock = this.getAvailableStock(index);

    const newQuantity = parseInt(value) || 0;
    const validQuantity = Math.min(Math.max(1, newQuantity), availableStock);
    medicineControl.patchValue({ requested_quantity: validQuantity });
  }

  getTotalRequestedValue(): number {
    const medicines = this.requestedMedicines;
    if (!medicines) return 0;
    return medicines.controls.reduce((total, control) => {
      const quantity = control.get('requested_quantity')?.value || 0;
      const price = control.get('unit_price')?.value || 0;
      return total + (quantity * price);
    }, 0);
  }

  // Additional methods needed by template
  trackPharmacyById(index: number, pharmacy: any): any {
    return pharmacy._id;
  }

  trackMedicineById(index: number, medicine: any): any {
    return medicine._id || medicine.id;
  }

  isAllPharmacyMedicinesSelected(pharmacyId: string): boolean {
    const pharmacyMedicines = this.getPharmacyLowStockMedicines(pharmacyId);
    return pharmacyMedicines.length > 0 && pharmacyMedicines.every(med =>
      this.isMedicineSelected(med._id || med.id)
    );
  }

  selectAllPharmacyMedicines(pharmacyId: string, event: any): void {
    const checked = (event.target as HTMLInputElement).checked;
    const pharmacyMedicines = this.getPharmacyLowStockMedicines(pharmacyId);

    pharmacyMedicines.forEach(medicine => {
      const id = (medicine._id || medicine.id).toString();

      // ✅ Skip disabled medicines
      if (this.isMedicineDisabled(id)) return;

      const index = this.selectedMedicines.indexOf(id);

      if (checked && index === -1) {
        this.selectedMedicines.push(id);
      } else if (!checked && index > -1) {
        this.selectedMedicines.splice(index, 1);
      }
    });
  }

  isAllPharmacyExpiredMedicinesSelected(pharmacyId: string): boolean {
    const expiredMedicines = this.getPharmacyExpiredMedicines(pharmacyId);
    const availableMedicines = expiredMedicines.filter(med => !this.isMedicineDisabled(med._id || med.id));
    return availableMedicines.length > 0 && availableMedicines.every(med =>
      this.isMedicineSelected(med._id || med.id)
    );
  }

  selectAllPharmacyExpiredMedicines(pharmacyId: string, event: any): void {
    const checked = (event.target as HTMLInputElement).checked;
    const expiredMedicines = this.getPharmacyExpiredMedicines(pharmacyId);

    expiredMedicines.forEach(medicine => {
      const id = (medicine._id || medicine.id).toString();

      // ✅ Skip disabled medicines
      if (this.isMedicineDisabled(id)) return;

      const index = this.selectedMedicines.indexOf(id);

      if (checked && index === -1) {
        this.selectedMedicines.push(id);
      } else if (!checked && index > -1) {
        this.selectedMedicines.splice(index, 1);
      }
    });
  }

  getSelectedMedicinesSummary(): { lowStock: number, expired: number } {
    const summary = { lowStock: 0, expired: 0 };

    this.selectedMedicines.forEach(id => {
      if (this.lowStockMedicinesFullList.some(med => (med._id || med.id) === id)) {
        summary.lowStock++;
      }
      if (this.expiredMedicinesForDisplay.some(med => (med._id || med.id) === id)) {
        summary.expired++;
      }
    });

    return summary;
  }

  clearSelection(): void {
    this.selectedMedicines = [];
  }

  getTransferRequestTitle(): string {
    return this.activeTab === 'expired'
      ? 'Replace Expired Medicines'
      : 'Replenish Low Stock';
  }

  getUniquePharmaciesCount(): number {
    const pharmacyIds = new Set();
    const selectedData = this.selectedMedicinesDataCache.length > 0
      ? this.selectedMedicinesDataCache
      : this.getSelectedMedicinesData();
    selectedData.forEach(med => pharmacyIds.add(med.source_pharmacy_id));
    return pharmacyIds.size;
  }

  getTotalRequestedQuantity(): number {
    const medicines = this.requestedMedicines;
    if (!medicines) return 0;
    return medicines.controls.reduce((total, control) => {
      return total + (control.get('requested_quantity')?.value || 0);
    }, 0);
  }

  recalculateQuantities(): void {
    const medicinesArray = this.transferForm.get('requested_medicines') as FormArray;
    const selectedData = this.selectedMedicinesDataCache.length > 0
      ? this.selectedMedicinesDataCache
      : this.getSelectedMedicinesData();

    medicinesArray.controls.forEach((control, index) => {
      const recommendedQty = this.calculateRecommendedQuantity(selectedData[index]);
      control.patchValue({ requested_quantity: recommendedQty });
    });
  }

  getCostForMedicine(index: number): number {
    const medicineControl = this.requestedMedicines.at(index);
    const quantity = medicineControl.get('requested_quantity')?.value || 0;
    const price = medicineControl.get('unit_price')?.value || 0;
    return quantity * price;
  }

  removeMedicineFromRequest(index: number): void {
    const medicinesArray = this.transferForm.get('requested_medicines') as FormArray;
    medicinesArray.removeAt(index);
    // Also remove from cache
    this.selectedMedicinesDataCache.splice(index, 1);
  }

  hasInsufficientStock(): boolean {
    return this.requestedMedicines.controls.some(control => {
      const requested = control.get('requested_quantity')?.value || 0;
      const available = control.get('central_available_stock')?.value || 0;
      return requested > available;
    });
  }

  getInsufficientStockCount(): number {
    return this.requestedMedicines.controls.filter(control => {
      const requested = control.get('requested_quantity')?.value || 0;
      const available = control.get('central_available_stock')?.value || 0;
      return requested > available;
    }).length;
  }

  hasValidMedicines(): boolean {
    return this.requestedMedicines.controls.length > 0;
  }

  getStockBadgeClass(stock: number): string {
    if (stock === 0) return 'badge-danger';
    if (stock <= 5) return 'badge-warning';
    return 'badge-success';
  }

  // Method to get cached selected medicines data for template
  getSelectedMedicinesDataForTemplate(): any[] {
    console.log("data=>", this.selectedMedicinesDataCache);
    return this.selectedMedicinesDataCache.length > 0
      ? this.selectedMedicinesDataCache
      : this.getSelectedMedicinesData();
  }

  // ✅ NEW: Find central medicine by name
  findCentralMedicineByName(medicineName: string): any | null {
    if (!medicineName || !this.medicines.length) {
      return null;
    }

    // Try exact match first
    let centralMedicine = this.medicines.find(med =>
      med.medicine_name?.toLowerCase().trim() === medicineName.toLowerCase().trim()
    );

    // If no exact match, try partial match
    if (!centralMedicine) {
      centralMedicine = this.medicines.find(med =>
        med.medicine_name?.toLowerCase().includes(medicineName.toLowerCase()) ||
        medicineName.toLowerCase().includes(med.medicine_name?.toLowerCase())
      );
    }

    console.log(`🔍 Central medicine lookup: "${medicineName}" -> ${centralMedicine ? 'FOUND' : 'NOT FOUND'}`);
    return centralMedicine;
  }

  // ✅ NEW: Map priority to urgency level
  mapPriorityToUrgency(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  // ✅ IMPROVED: Calculate recommended quantity with better logic
  calculateRecommendedQuantity(medicine: any): number {
    const currentStock = medicine.current_stock || medicine.stock || 0;

    if (this.activeTab === 'expired') {
      // For expired medicines, replace the current stock
      return Math.max(currentStock, 10); // At least 10 units
    } else {
      // For low stock, calculate based on minimum threshold
      const minThreshold = medicine.minimum_threshold || 20;
      const recommendedStock = Math.max(minThreshold * 2, 30); // 2x threshold or 30, whichever is higher
      return Math.max(recommendedStock - currentStock, 10);
    }
  }

  // Get available stock for a medicine at index i
  getAvailableStock(index: number): number {
    const medicineData = this.getSelectedMedicinesDataForTemplate()[index];

    // Priority order for getting stock:
    // 1. central_available_stock (if exists)
    // 2. stock (main stock field)
    // 3. available_in_central (fallback)
    // 4. 0 (default)

    return medicineData?.central_available_stock ||
           medicineData?.stock ||
           this.requestedMedicines?.at(index)?.get('central_available_stock')?.value ||
           0;
  }

  // Check if requested quantity exceeds available stock
  isQuantityExceeded(index: number): boolean {
    const requestedQty = this.requestedMedicines?.at(index)?.get('requested_quantity')?.value || 0;
    const availableStock = this.getAvailableStock(index);

    return requestedQty > availableStock;
  }

  // Get appropriate badge class for available stock
  getAvailableStockBadgeClass(stock: number): string {
    if (stock === 0) {
      return 'badge-danger'; // Red for no stock
    } else if (stock <= 10) {
      return 'badge-warning'; // Orange for low stock
    } else if (stock <= 50) {
      return 'badge-info'; // Blue for moderate stock
    } else {
      return 'badge-success'; // Green for good stock
    }
  }

  // Enhanced quantity input handler
  onQuantityInput(event: any, index: number): void {
    const inputValue = parseInt(event.target.value) || 0;
    const availableStock = this.getAvailableStock(index);

    // Cap the input value to available stock
    if (inputValue > availableStock) {
      const medicineControl = this.requestedMedicines?.at(index);
      medicineControl?.get('requested_quantity')?.setValue(availableStock);

      // Show toast notification
      this.showToast('warning', `Quantity adjusted to maximum available: ${availableStock}`);
    }

    // Recalculate totals
    this.calculateTotals();
  }

  // Show toast notification (if you have a toast service)
  showToast(type: string, message: string): void {
    // Implement your toast notification here
    console.log(`${type}: ${message}`);
  }

  // Calculate totals
  calculateTotals(): void {
    // Implement your total calculation logic
  }
}
