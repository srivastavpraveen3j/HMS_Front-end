import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MasterService } from '../../../../../views/mastermodule/masterservice/master.service';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

// Define interfaces for better type safety
// Updated interface to match your data structure
interface Medicine {
  _id: string;
  medicine_name: string;
  supplier?: {
    vendorName?: string;
    contactNumber?: string;
  };
  dose?: string | number;
  expiry_date: string;
  mfg_date?: string;
  stock: number;
  price: number;
  batch_no?: string;
  sub_pharmacy?: string;
  batch_id?: string;
  // Additional properties from your data structure
  location_in_pharmacy?: string;
  minimum_threshold?: number;
  maximum_capacity?: number;
  current_stock?: number;
  sub_pharmacy_obj?: {
    _id: string;
    name: string;
    type: string;
    location: string;
  };
}


interface ApiResponse {
  count: number;
  data: any[];
  message?: string;
}

@Component({
  selector: 'app-subphamracyexpiredmed',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './subphamracyexpiredmed.component.html',
  styleUrl: './subphamracyexpiredmed.component.css'
})
export class SubphamracyexpiredmedComponent implements OnInit {
  recordsPerPage: number = 25;
  medicines: Medicine[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  countexpired: string = '';
  expireproducts: Medicine[] = [];
  selectedMedicines: string[] = [];
  activeTab: string = 'expired';
  expiredMedicinesForDisplay: Medicine[] = [];
  message: string = 'No expired medicines found';
  isLoading: boolean = false;
  showLowStockOnly: boolean = false;

  constructor(
    private masterService: MasterService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadExpiredMedicines();
    this.setupFormSubscriptions();
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      searchText: ['']
    });
  }

  private setupFormSubscriptions(): void {
    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadExpiredMedicines();
    });
  }

  loadExpiredMedicines(): void {
  this.isLoading = true;
  const pharmacyId = '68beb0b38066685ac24f8017';

  this.masterService.getSubPharmacyExpiredStock(pharmacyId).subscribe({
    next: (res: any) => { // Changed from ApiResponse to any for flexibility
      console.log("API Response:", res);

      this.countexpired = res.count?.toString() || '0';
      this.expireproducts = this.transformExpiredData(res.data || []);
      this.calculatePagination();
      this.isLoading = false;

      console.log("Transformed data:", this.expireproducts);
      console.log("Count of expired products:", this.expireproducts.length);

      if (this.expireproducts.length === 0) {
        this.message = 'No expired medicines found';
        this.toastr.info('No expired medicines found in pharmacy', 'Information', {
          timeOut: 3000,
          progressBar: true,
          positionClass: 'toast-top-right'
        });
      } else {
        this.toastr.success(
          `Found ${this.expireproducts.length} expired medicines`,
          'Data Loaded Successfully',
          {
            timeOut: 3000,
            progressBar: true,
            positionClass: 'toast-top-right'
          }
        );
      }
    },
    error: (err) => {
      console.error("Error loading expired medicines:", err);
      this.message = 'Error loading expired medicines';
      this.expireproducts = [];
      this.isLoading = false;

      this.toastr.error(
        'Failed to load expired medicines. Please try again.',
        'Loading Error',
        {
          timeOut: 5000,
          progressBar: true,
          positionClass: 'toast-top-right'
        }
      );
    }
  });
}


  private calculatePagination(): void {
    this.totalPages = Math.ceil((this.expireproducts?.length || 0) / this.recordsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
  }

  // Transform nested API data to flat structure for table
  // Transform nested API data to flat structure for table
transformExpiredData(data: any[]): Medicine[] {
  const transformedData: Medicine[] = [];

  if (!data || !Array.isArray(data)) {
    return transformedData;
  }

  console.log("Raw API Data:", data);

  data.forEach(item => {
    // Check if expired_batches exists and has expired batches (updated property name)
    if (item.expired_batches && Array.isArray(item.expired_batches)) {
      item.expired_batches.forEach((batch: any) => {
        // All batches in expired_batches are already expired, so no need to check again
        transformedData.push({
          _id: item._id, // Use the main item _id
          medicine_name: item.medicine_name || 'Unknown',
          supplier: {
            vendorName: batch.supplier || 'Unknown',
            contactNumber: '' // Add if available in your data
          },
          dose: item.medicine?.dose || batch.dose || 'N/A', // Get from medicine object or batch
          expiry_date: batch.expiry_date,
          mfg_date: batch.mfg_date,
          stock: batch.quantity || 0,
          price: batch.unit_price || 0,
          batch_no: batch.batch_no || 'N/A',
          // Updated sub_pharmacy handling
          sub_pharmacy: item.sub_pharmacy?.name || item.sub_pharmacy?._id || 'Main Pharmacy',
          batch_id: batch._id,
          // Additional fields from your structure
          location_in_pharmacy: item.sub_pharmacy?.location || 'Unknown',
          minimum_threshold: item.medicine?.lowStockThreshold || 0,
          maximum_capacity: 500, // Default value or get from medicine if available
          current_stock: item.current_stock || 0,
          // Store sub_pharmacy object for display
          sub_pharmacy_obj: item.sub_pharmacy
        });
      });
    }
  });

  console.log("Transformed Data:", transformedData);
  return transformedData;
}

  // Get sub-pharmacy name from ID (you might want to maintain a lookup map)


  // Get stock level badge class
  getStockLevelBadge(currentStock: number = 0, minThreshold: number = 0): string {
    if (currentStock <= 0) return 'badge bg-danger me-1';
    if (currentStock <= minThreshold) return 'badge bg-warning text-dark me-1';
    if (currentStock <= minThreshold * 2) return 'badge bg-info me-1';
    return 'badge bg-success me-1';
  }

  // Check if item is critically low on stock
  isCriticallyLowStock(currentStock: number = 0, minThreshold: number = 0): boolean {
    return currentStock <= minThreshold;
  }

  // Get expiry urgency level
  getExpiryUrgencyLevel(expiryDate: string | undefined): 'critical' | 'warning' | 'normal' {
    if (!expiryDate) return 'normal';

    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysUntilExpiry < 0) return 'critical'; // Already expired
    if (daysUntilExpiry <= 7) return 'warning'; // Expires within a week
    return 'normal';
  }

  // Enhanced checkbox selection methods
  onMedicineSelect(medicineId: string, event: any): void {
    if (!medicineId) return;

    if (event.target.checked) {
      if (!this.selectedMedicines.includes(medicineId)) {
        this.selectedMedicines.push(medicineId);
      }
    } else {
      const index = this.selectedMedicines.indexOf(medicineId);
      if (index > -1) {
        this.selectedMedicines.splice(index, 1);
      }
    }
  }

  selectAllMedicines(event: any): void {
    if (!this.expireproducts || this.expireproducts.length === 0) return;

    if (event.target.checked) {
      this.selectedMedicines = this.expireproducts
        .filter(medicine => medicine._id)
        .map(medicine => medicine._id);

      this.toastr.info(
        `Selected ${this.selectedMedicines.length} medicines`,
        'All Selected',
        {
          timeOut: 2000,
          progressBar: true,
          positionClass: 'toast-top-right'
        }
      );
    } else {
      this.selectedMedicines = [];
      this.toastr.info('All medicines deselected', 'Selection Cleared', {
        timeOut: 2000,
        progressBar: true,
        positionClass: 'toast-top-right'
      });
    }
  }

  isMedicineSelected(medicineId: string): boolean {
    return medicineId ? this.selectedMedicines.includes(medicineId) : false;
  }

  areAllMedicinesSelected(): boolean {
    return this.expireproducts &&
           this.expireproducts.length > 0 &&
           this.selectedMedicines.length === this.expireproducts.length;
  }

  // Pagination methods
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadExpiredMedicines();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadExpiredMedicines();
    }
  }

  fetchLowStockMedicines(): void {
    console.log('Fetching low stock medicines...');
  }

  // Enhanced disposal method with SweetAlert2 and ToastrService
  disposeSelectedMedicines(): void {
    if (this.selectedMedicines.length === 0) {
      this.toastr.warning(
        'Please select at least one medicine to dispose',
        'No Selection',
        {
          timeOut: 4000,
          progressBar: true,
          positionClass: 'toast-top-right'
        }
      );
      return;
    }

    if (this.activeTab !== 'expired') {
      this.toastr.error(
        'You can only dispose expired medicines',
        'Invalid Operation',
        {
          timeOut: 4000,
          progressBar: true,
          positionClass: 'toast-top-right'
        }
      );
      return;
    }

    // Use SweetAlert2 for confirmation
    Swal.fire({
      title: 'Confirm Disposal',
      html: `
        <div class="swal-custom-content">
          <div class="text-center mb-3">
            <i class="fas fa-exclamation-triangle text-warning fa-3x"></i>
          </div>
          <p>Are you sure you want to dispose <strong>${this.selectedMedicines.length}</strong> expired medicine(s)?</p>
          <div class="alert alert-warning mt-3">
            <small><i class="fas fa-info-circle"></i> This action cannot be undone and will permanently remove these medicines from inventory.</small>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="fas fa-trash-alt"></i> Yes, dispose them!',
      cancelButtonText: '<i class="fas fa-times"></i> Cancel',
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      allowEscapeKey: true,
      preConfirm: () => {
        const payload = { inventoryIds: this.selectedMedicines };
        return this.masterService.subpharmacydisposeMedicines(payload).toPromise()
          .then(response => response)
          .catch(error => {
            Swal.showValidationMessage(`Request failed: ${error.message || 'Unknown error'}`);
            throw error;
          });
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const disposedCount = result.value.data?.count || this.selectedMedicines.length;

        // Success notification with SweetAlert2
        Swal.fire({
          title: 'Disposal Successful!',
          html: `
            <div class="swal-success-content">
              <div class="text-center mb-3">
                <i class="fas fa-check-circle text-success fa-4x"></i>
              </div>
              <p class="mb-2">Successfully disposed <strong>${disposedCount}</strong> expired medicines</p>
              <small class="text-muted">Inventory has been updated automatically</small>
            </div>
          `,
          icon: 'success',
          timer: 4000,
          showConfirmButton: false,
          allowOutsideClick: true
        });

        // Success notification with Toastr
        this.toastr.success(
          `${disposedCount} expired medicines disposed successfully`,
          'Disposal Complete',
          {
            timeOut: 4000,
            progressBar: true,
            positionClass: 'toast-top-right'
          }
        );

        // Refresh data and clear selection
        this.loadExpiredMedicines();
        this.selectedMedicines = [];

      } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
        this.toastr.info('Medicine disposal was cancelled', 'Operation Cancelled', {
          timeOut: 3000,
          progressBar: true,
          positionClass: 'toast-top-right'
        });
      }
    }).catch((error) => {
      console.error('Disposal error:', error);
      this.toastr.error(
        'Failed to dispose medicines. Please try again.',
        'Disposal Error',
        {
          timeOut: 5000,
          progressBar: true,
          positionClass: 'toast-top-right'
        }
      );
    });
  }

  // Utility methods with null safety
  isExpired(expiryDate: string | undefined): boolean {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  }

  isExpiringSoon(expiryDate: string | undefined, days: number = 30): boolean {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= days && daysUntilExpiry > 0;
  }

  getStockBadgeClass(stock: number): string {
    if (stock <= 5) return 'badge bg-danger';
    if (stock <= 10) return 'badge bg-warning text-dark';
    if (stock <= 20) return 'badge bg-info';
    return 'badge bg-success';
  }

  getDaysUntilExpiry(expiryDate: string | undefined): number {
    if (!expiryDate) return 0;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
  }

  getExpiryStatus(expiryDate: string | undefined): string {
    if (!expiryDate) return 'Unknown';
    const days = this.getDaysUntilExpiry(expiryDate);
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires Today';
    if (days <= 7) return `Expires in ${days} day(s)`;
    return 'Valid';
  }

  getExpiryStatusClass(expiryDate: string | undefined): string {
    const urgency = this.getExpiryUrgencyLevel(expiryDate);
    switch (urgency) {
      case 'critical': return 'text-danger fw-bold';
      case 'warning': return 'text-warning fw-bold';
      default: return 'text-muted';
    }
  }

  // Additional helper methods
  calculateTotalLoss(): number {
    if (!this.expireproducts || this.expireproducts.length === 0) return 0;
    return this.expireproducts.reduce((total, medicine) => {
      return total + ((medicine?.price || 0) * (medicine?.stock || 0));
    }, 0);
  }

  clearSearch(): void {
    this.filterForm.patchValue({ searchText: '' });
    this.toastr.info('Search filter cleared', 'Filter Reset', {
      timeOut: 2000,
      progressBar: true,
      positionClass: 'toast-top-right'
    });
  }

  clearSelection(): void {
    this.selectedMedicines = [];
    this.toastr.info('Selection cleared', 'Clear Selection', {
      timeOut: 2000,
      progressBar: true,
      positionClass: 'toast-top-right'
    });
  }

  refreshData(): void {
    this.toastr.info('Refreshing expired medicines data...', 'Refreshing', {
      timeOut: 1500,
      progressBar: true,
      positionClass: 'toast-top-right'
    });
    this.loadExpiredMedicines();
  }

  exportToCSV(): void {
    if (!this.expireproducts || this.expireproducts.length === 0) {
      this.toastr.warning('No data available to export', 'Export Warning', {
        timeOut: 3000,
        progressBar: true,
        positionClass: 'toast-top-right'
      });
      return;
    }

    // Implementation for CSV export
    this.toastr.success('CSV export initiated for expired medicines', 'Export Started', {
      timeOut: 3000,
      progressBar: true,
      positionClass: 'toast-top-right'
    });
  }

  filterLowStock(): void {
    if (this.showLowStockOnly) {
      this.toastr.info('Filtering low stock medicines only', 'Filter Applied', {
        timeOut: 2000,
        progressBar: true,
        positionClass: 'toast-top-right'
      });
    } else {
      this.toastr.info('Showing all expired medicines', 'Filter Removed', {
        timeOut: 2000,
        progressBar: true,
        positionClass: 'toast-top-right'
      });
    }
    // Add your low stock filtering logic here
  }

  // Track by function for better performance
  trackByMedicineId(index: number, medicine: Medicine): string {
    return medicine._id || index.toString();
  }


  // Get sub-pharmacy name from ID (Fixed to handle undefined)
// Updated getSubPharmacyName method
getSubPharmacyName(subPharmacy: any): string {
  if (!subPharmacy) {
    return 'Unknown Pharmacy';
  }

  // If it's a string (ID), use the lookup map
  if (typeof subPharmacy === 'string') {
    const subPharmacyMap: { [key: string]: string } = {
      '68beb0b38066685ac24f8017': 'Sub Pharmacy',
      // Add more mappings as needed
    };
    return subPharmacyMap[subPharmacy] || subPharmacy.substring(0, 8) + '...';
  }

  // If it's an object with name property
  if (subPharmacy.name) {
    return subPharmacy.name;
  }

  // Fallback to ID if available
  return subPharmacy._id?.substring(0, 8) + '...' || 'Unknown';
}


}
