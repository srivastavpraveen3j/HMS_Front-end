import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MasterService } from '../../../views/mastermodule/masterservice/master.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { DistributionService } from '../../purchase order management/distributionmanagement/distribution/distribution.service';

@Component({
  selector: 'app-pharmamanagementlist',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pharmamanagementlist.component.html',
  styleUrl: './pharmamanagementlist.component.css',
})
export class PharmamanagementlistComponent implements OnInit, OnDestroy {
  // Form Controls
  searchControl = new FormControl<string>('');
  locationControl = new FormControl<string>(''); // Location search control
  recordsPerPageControl = new FormControl<number>(25);
  filterForm!: FormGroup;

  // Data Arrays
  medicines: any[] = [];
  allMedicines: any[] = []; // Store all medicines for location filtering
  pharmacies: any[] = [];
  lowStockMedicinesFullList: any[] = [];
  lowStockMedicines: any[] = [];

  // Pagination Properties
  currentPage = 1;
  totalPages = 1;
  totalRecords = 0;
  perPage = 25;

  // Low Stock Pagination
  lowStockCurrentPage = 1;
  lowStockTotalPages = 1;
  lowStockRecordsPerPage = 10;

  // UI State
  showingLowStock = false;
  showTableView = true;
  selectedPharmacyId: string | null = null;
  pharmacyId!: string;
  pharmacyDetails: any;

  // Location filtering properties
  filteredMedicinesCount = 0;

  // Location editing properties
  isSavingLocation = false;
  editingLocationIndex: number = -1;

  // Utility
  Math = Math;

  constructor(
    private masterService: MasterService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private distributionservice: DistributionService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    // Clean up any ongoing edits when component is destroyed
    this.cancelAllLocationEdits();
  }

  private initializeComponent(): void {
    // Initialize filter form
    this.filterForm = this.fb.group({
      recordsPerPage: [25],
      searchText: [''],
    });

    // Setup subscriptions
    this.setupSearchSubscription();
    this.setupLocationSubscription();
    this.setupRecordsPerPageSubscription();

    // Get pharmacy ID from route and load data
    this.route.paramMap.subscribe((params) => {
      this.pharmacyId = params.get('pharmacyId') || '';
      if (this.pharmacyId) {
        this.loadPharmacyDetails(this.pharmacyId);
      }
      this.loadPharmacies();
    });
  }

  private setupSearchSubscription(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        console.log('🔍 Search changed:', this.searchControl.value);
        this.currentPage = 1;
        this.refreshMedicines();
      });

    // Keep legacy search for compatibility
    this.filterForm
      .get('searchText')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.refreshMedicines();
      });
  }

  // Setup location search subscription
  private setupLocationSubscription(): void {
    this.locationControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((location) => {
        console.log('📍 Location search changed:', location);
        this.currentPage = 1;
        this.applyLocationFilter();
      });
  }

  // Apply location filter
  private applyLocationFilter(): void {
    const locationQuery = this.locationControl.value?.toLowerCase().trim();

    if (!locationQuery) {
      // If no location filter, show all medicines
      this.filteredMedicinesCount = this.totalRecords;
      this.refreshMedicines();
      return;
    }

    // Filter medicines by location
    const filtered = this.allMedicines.filter((medicine: any) => {
      const location = medicine.location_in_pharmacy?.toLowerCase() || '';
      return location.includes(locationQuery);
    });

    this.medicines = filtered;
    this.filteredMedicinesCount = filtered.length;

    // Update pagination for filtered results
    this.totalRecords = filtered.length;
    this.totalPages = Math.ceil(filtered.length / this.perPage);
    this.currentPage = 1;

    console.log('📍 Location filter applied:', {
      query: locationQuery,
      filtered: filtered.length,
      total: this.allMedicines.length
    });
  }

  // Clear location search
  clearLocationSearch(): void {
    this.locationControl.setValue('');
    this.filteredMedicinesCount = 0;
  }

  // Check if medicine location matches search
  isLocationMatched(medicine: any): boolean {
    const locationQuery = this.locationControl.value?.toLowerCase().trim();
    if (!locationQuery) return false;

    const medicineLocation = medicine.location_in_pharmacy?.toLowerCase() || '';
    return medicineLocation.includes(locationQuery);
  }

  // *** LOCATION EDITING METHODS WITH REAL API INTEGRATION ***
  startLocationEdit(medicine: any, index?: number): void {
    // Cancel any other ongoing edits
    this.cancelAllLocationEdits();

    medicine.isEditingLocation = true;
    medicine.tempLocation = medicine.location_in_pharmacy || '';
    this.editingLocationIndex = index ?? -1;

    console.log('📝 Starting location edit for:', medicine.medicine_name);

    // Focus on input after a short delay
    setTimeout(() => {
      const input = document.querySelector('.location-edit-input, .location-edit-input-card') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  cancelLocationEdit(medicine: any): void {
    medicine.isEditingLocation = false;
    medicine.tempLocation = '';
    this.editingLocationIndex = -1;

    console.log('❌ Cancelled location edit for:', medicine.medicine_name);
  }

  cancelAllLocationEdits(): void {
    const allMedicines = this.showingLowStock ? this.lowStockMedicines : this.medicines;
    allMedicines.forEach((med: any) => {
      if (med.isEditingLocation) {
        med.isEditingLocation = false;
        med.tempLocation = '';
      }
    });
    this.editingLocationIndex = -1;
  }

  // *** REAL API INTEGRATION FOR LOCATION UPDATE ***

  // Save location on blur (optional)
  saveLocationOnBlur(medicine: any): void {
    // Small delay to allow button clicks to register
    setTimeout(() => {
      if (medicine.isEditingLocation && !this.isSavingLocation) {
        this.saveLocation(medicine);
      }
    }, 150);
  }

  // Handle null values properly
  private setupRecordsPerPageSubscription(): void {
    this.recordsPerPageControl.valueChanges.subscribe((newLimit) => {
      console.log('📄 Records per page changed:', newLimit);
      this.currentPage = 1;
      this.perPage = newLimit ?? 25;
      this.refreshMedicines();
    });
  }

  onRecordsPerPageChange(): void {
    this.currentPage = 1;
    this.perPage = this.recordsPerPageControl.value ?? 25;
    this.refreshMedicines();
  }

  get currentRecordsPerPage(): number {
    return this.recordsPerPageControl.value ?? 25;
  }

  refreshMedicines(): void {
    if (this.showingLowStock) {
      this.fetchLowStockMedicines();
    } else {
      this.fetchMedicines();
    }
  }

  fetchMedicines(): void {
    const limit = this.currentRecordsPerPage;
    const search = this.searchControl.value || this.filterForm.get('searchText')?.value || '';

    if (!this.selectedPharmacyId) {
      console.warn('⚠️ No pharmacy selected yet.');
      return;
    }

    console.log('🔄 Fetching medicines:', {
      page: this.currentPage,
      limit,
      search,
      pharmacyId: this.selectedPharmacyId
    });

    this.masterService
      .getSubPharmacyInventoryItems(
        this.selectedPharmacyId,
        this.currentPage,
        limit,
        search
      )
      .subscribe({
        next: (res) => {
          console.log('✅ API Response:', res);

          // Store all medicines for location filtering
          this.allMedicines = res.data || [];

          // Apply location filter if active
          if (this.locationControl.value?.trim()) {
            this.applyLocationFilter();
          } else {
            this.medicines = res.data || [];
            this.filteredMedicinesCount = this.medicines.length;
          }

          // Extract pagination from API response
          const pagination = res.pagination;
          if (pagination) {
            this.currentPage = pagination.current_page || 1;
            this.totalPages = pagination.total_pages || 1;
            this.totalRecords = pagination.total_records || 0;
            this.perPage = pagination.per_page || 25;
          } else {
            this.totalPages = 1;
            this.totalRecords = this.medicines.length;
          }

          console.log('📊 Pagination Info:', {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            totalRecords: this.totalRecords,
            perPage: this.perPage,
            medicinesCount: this.medicines.length
          });
        },
        error: (err) => {
          console.error('❌ Error fetching medicines:', err);
          this.medicines = [];
          this.allMedicines = [];
          this.totalPages = 1;
          this.totalRecords = 0;
        },
      });
  }

  fetchLowStockMedicines(): void {
    const veryLargeLimit = 10000;
    const search = this.searchControl.value || this.filterForm.get('searchText')?.value || '';

    if (!this.selectedPharmacyId) {
      console.warn('⚠️ No pharmacy selected yet.');
      return;
    }

    this.masterService
      .getSubPharmacyInventoryItems(
        this.selectedPharmacyId,
        1,
        veryLargeLimit,
        search
      )
      .subscribe({
        next: (res) => {
          const allMedicines = res.data || [];

          // Filter for low stock (< 10) and not expired
          let filtered = allMedicines.filter(
            (med: any) => med.current_stock < 10 && !this.isExpired(med)
          );

          // Apply location filter to low stock medicines
          const locationQuery = this.locationControl.value?.toLowerCase().trim();
          if (locationQuery) {
            filtered = filtered.filter((medicine: any) => {
              const location = medicine.location_in_pharmacy?.toLowerCase() || '';
              return location.includes(locationQuery);
            });
          }

          this.lowStockMedicinesFullList = filtered;
          this.lowStockTotalPages = Math.ceil(
            this.lowStockMedicinesFullList.length / this.lowStockRecordsPerPage
          );
          this.lowStockCurrentPage = 1;

          this.updateLowStockMedicinesPage();

          console.log('🔴 Low stock medicines:', filtered.length);
        },
        error: (err) => {
          console.error('❌ Error fetching low stock medicines:', err);
          this.lowStockMedicinesFullList = [];
        },
      });
  }

  updateLowStockMedicinesPage(): void {
    const startIndex = (this.lowStockCurrentPage - 1) * this.lowStockRecordsPerPage;
    const endIndex = startIndex + this.lowStockRecordsPerPage;
    this.lowStockMedicines = this.lowStockMedicinesFullList.slice(startIndex, endIndex);
  }

  // Navigation Methods
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      console.log('➡️ Next page:', this.currentPage);
      this.fetchMedicines();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      console.log('⬅️ Previous page:', this.currentPage);
      this.fetchMedicines();
    }
  }

  lowStockNextPage(): void {
    if (this.lowStockCurrentPage < this.lowStockTotalPages) {
      this.lowStockCurrentPage++;
      this.updateLowStockMedicinesPage();
    }
  }

  lowStockPreviousPage(): void {
    if (this.lowStockCurrentPage > 1) {
      this.lowStockCurrentPage--;
      this.updateLowStockMedicinesPage();
    }
  }

  // Utility Methods
  getCurrentPageEndRecord(): number {
    return Math.min(this.currentPage * this.perPage, this.totalRecords);
  }

  getCurrentPageStartRecord(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.perPage + 1;
  }

  toggleView(): void {
    this.showTableView = !this.showTableView;
    console.log('👁️ View toggled:', this.showTableView ? 'Table' : 'Cards');
  }

  toggleLowStockView(): void {
    this.showingLowStock = !this.showingLowStock;
    console.log('🔄 Toggling low stock view:', this.showingLowStock);
    this.refreshMedicines();
  }

  onPharmacyChange(): void {
    console.log('🏥 Pharmacy changed:', this.selectedPharmacyId);
    this.currentPage = 1;
    // Clear location search when pharmacy changes
    this.locationControl.setValue('');
    this.cancelAllLocationEdits();
    this.refreshMedicines();
  }

  // Date Utility Methods
  isExpired(medicine: any): boolean {
    if (!medicine?.batch_details?.[0]?.expiry_date) return false;
    try {
      const expiryDate = new Date(medicine.batch_details[0].expiry_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiryDate.setHours(0, 0, 0, 0);
      return expiryDate < today;
    } catch {
      return false;
    }
  }

  isNearExpiry(medicine: any, daysThreshold: number = 30): boolean {
    if (!medicine?.batch_details?.[0]?.expiry_date) return false;
    try {
      const expiryDate = new Date(medicine.batch_details[0].expiry_date);
      const today = new Date();
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff <= daysThreshold && daysDiff > 0;
    } catch {
      return false;
    }
  }

  // Data Loading Methods
  loadPharmacies(): void {
    this.masterService.getSubPharmacies().subscribe({
      next: (res: any) => {
        this.pharmacies = res.data || [];

        if (this.pharmacies.length > 0) {
          this.selectedPharmacyId = this.pharmacyId || this.pharmacies[0]._id;
          this.refreshMedicines();
          this.fetchLowStockMedicines();
        }

        console.log('🏥 Pharmacies loaded:', this.pharmacies.length);
      },
      error: (err) => {
        console.error('❌ Error loading pharmacies:', err);
        alert('Failed to load pharmacies. Please check your backend connection.');
      },
    });
  }

  loadPharmacyDetails(id: string): void {
    this.masterService.getSubPharmacyById(id).subscribe({
      next: (res) => {
        this.pharmacyDetails = res.data;
        console.log('🏥 Pharmacy details:', this.pharmacyDetails);
      },
      error: (err) => {
        console.error('❌ Error loading pharmacy:', err);
      },
    });
  }

  // CRUD Methods
  editmedicine(medicineId: string): void {
    this.router.navigate(['/pharmalayout/pharmamanagement'], {
      queryParams: { _id: medicineId },
    });
  }

  async deletemedicine(medicineId: string): Promise<void> {
    const Swal = (await import('sweetalert2')).default;
    if (!medicineId) {
      console.error('Medicine ID is required for deletion');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This medicine will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
        cancelButton: 'hospital-swal-button',
      },
    });

    if (result.isConfirmed) {
      this.masterService.deleteMedicine(medicineId).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Medicine has been deleted successfully.',
            position: 'top-end',
            toast: true,
            timer: 3000,
            showConfirmButton: false,
          });

          // Refresh the list after deletion
          this.medicines = this.medicines.filter(
            (med: any) => med && med._id && med._id !== medicineId
          );
          // Also remove from allMedicines
          this.allMedicines = this.allMedicines.filter(
            (med: any) => med && med._id && med._id !== medicineId
          );
        },
        error: (err) => {
          console.error('❌ Error deleting medicine:', err);
          Swal.fire({
            icon: 'error',
            title: 'Deletion Failed',
            text: err?.error?.message || 'There was an error deleting the medicine.',
          });
        },
      });
    }
  }


  // Updated saveLocation method in your component
async saveLocation(medicine: any): Promise<void> {
  const newLocation = medicine.tempLocation?.trim() || '';

  if (newLocation === (medicine.location_in_pharmacy || '')) {
    this.cancelLocationEdit(medicine);
    return;
  }

  this.isSavingLocation = true;

  try {
    // *** USE DEDICATED LOCATION UPDATE METHOD ***
    const response = await this.masterService.updateMedicineLocation(medicine._id, newLocation).toPromise();

    console.log('✅ Location API Response:', response);

    // Update local data
    medicine.location_in_pharmacy = newLocation;
    medicine.isEditingLocation = false;
    medicine.tempLocation = '';
    this.editingLocationIndex = -1;

    // Update in allMedicines array too
    const allMedIndex = this.allMedicines.findIndex((m: any) => m._id === medicine._id);
    if (allMedIndex !== -1) {
      this.allMedicines[allMedIndex].location_in_pharmacy = newLocation;
    }

    // Show success message
    const Swal = (await import('sweetalert2')).default;
    Swal.fire({
      icon: 'success',
      title: 'Location Updated!',
      text: `Location updated to: ${newLocation || 'Not specified'}`,
      position: 'top-end',
      toast: true,
      timer: 3000,
      showConfirmButton: false,
    });

  } catch (error: any) {
    console.error('❌ Error saving location:', error);

    const Swal = (await import('sweetalert2')).default;
    Swal.fire({
      icon: 'error',
      title: 'Save Failed',
      text: error?.error?.message || 'Failed to update location. Please try again.',
      confirmButtonText: 'OK'
    });

    medicine.tempLocation = medicine.location_in_pharmacy || '';
  } finally {
    this.isSavingLocation = false;
  }
}


// Add this method to handle quick location setting
setQuickLocation(medicine: any, location: string): void {
  medicine.tempLocation = location;
  console.log(`🎯 Quick location set: ${location} for ${medicine.medicine_name}`);

  // Optional: Auto-focus input to allow further editing
  setTimeout(() => {
    const input = document.querySelector('.location-footer-input') as HTMLInputElement;
    if (input) {
      input.focus();
      // Move cursor to end
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, 100);
}

}
