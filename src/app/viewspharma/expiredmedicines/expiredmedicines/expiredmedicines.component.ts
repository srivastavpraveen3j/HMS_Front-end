import { CommonModule } from '@angular/common';
import { MasterService } from './../../../views/mastermodule/masterservice/master.service';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { IndianCurrencyPipe } from '../../../pipe/indian-currency.pipe';

// Define interfaces for better type safety
interface Medicine {
  _id: string;
  medicine_name: string;
  supplier?: {
    vendorName?: string;
    contactNumber?: string;
  };
  dose?: string;
  expiry_date: string;
  mfg_date?: string;
  stock: number;
  price: number;
  batch_no?: string;
}

interface ApiResponse {
  data: {
    count: string;
    medicines: Medicine[];
  };
  message: string;
}

@Component({
  selector: 'app-expiredmedicines',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, IndianCurrencyPipe],
  templateUrl: './expiredmedicines.component.html',
  styleUrls: ['./expiredmedicines.component.css']
})
export class ExpiredmedicinesComponent implements OnInit {
  recordsPerPage: number = 25;
  medicines: Medicine[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  countexpired: string = '';
  expireproducts: Medicine[] = []; // Initialize as empty array
  selectedMedicines: string[] = [];
  activeTab: string = 'expired';
  expiredMedicinesForDisplay: Medicine[] = [];
  message: string = '';
  isLoading: boolean = false;

  constructor(
    private masterService: MasterService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router : Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.expiredmedicine();
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
      this.expiredmedicine();
    });
  }

  expiredmedicine(): void {
    this.isLoading = true;
    const search = this.filterForm.get('searchText')?.value?.trim() || '';

    this.masterService.getexpiredmedicine().subscribe({
      next: (res: ApiResponse) => {
        this.countexpired = res.data?.count || '0';
        this.expireproducts = res.data?.medicines || [];
        this.expiredMedicinesForDisplay = res.data?.medicines || [];
        this.message = res.message || 'No expired medicines found';
        this.calculatePagination();
        this.isLoading = false;

        if (this.expireproducts.length > 0) {
          this.toastr.success('Expired medicines list loaded successfully', 'Data Loaded', {
            timeOut: 3000,
            progressBar: true,
            positionClass: 'toast-top-right'
          });
        } else {
          this.toastr.info('No expired medicines found', 'Information', {
            timeOut: 3000,
            progressBar: true,
            positionClass: 'toast-top-right'
          });
        }
      },
      error: (err) => {
        console.error("Error fetching expired medicines:", err);
        this.isLoading = false;
        this.expireproducts = []; // Ensure it's an empty array on error
        this.toastr.error('Failed to fetch expired medicines. Please try again.', 'Error Loading Data', {
          timeOut: 5000,
          progressBar: true,
          positionClass: 'toast-top-right'
        });
      }
    });
  }

  private calculatePagination(): void {
    this.totalPages = Math.ceil((this.expireproducts?.length || 0) / this.recordsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
  }

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
      this.toastr.info(`Selected ${this.selectedMedicines.length} medicines`, 'All Selected', {
        timeOut: 2000,
        progressBar: true,
        positionClass: 'toast-top-right'
      });
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

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.expiredmedicine();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.expiredmedicine();
    }
  }

  fetchLowStockMedicines(): void {
    console.log('Fetching low stock medicines...');
  }

  disposeSelectedMedicines(): void {
    if (this.selectedMedicines.length === 0) {
      this.toastr.warning('Please select at least one medicine to dispose', 'No Selection', {
        timeOut: 4000,
        progressBar: true,
        positionClass: 'toast-top-right'
      });
      return;
    }

    if (this.activeTab !== 'expired') {
      this.toastr.error('You can only dispose expired medicines', 'Invalid Operation', {
        timeOut: 4000,
        progressBar: true,
        positionClass: 'toast-top-right'
      });
      return;
    }

    Swal.fire({
      title: 'Confirm Disposal',
      html: `
        <div class="swal-custom-content">
          <p>Are you sure you want to dispose <strong>${this.selectedMedicines.length}</strong> expired medicine(s)?</p>
          <div class="alert alert-warning mt-2">
            <small><i class="fas fa-exclamation-triangle"></i> This action cannot be undone.</small>
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
        return this.masterService.disposeMedicines(this.selectedMedicines).toPromise()
          .then(response => response)
          .catch(error => {
            Swal.showValidationMessage(`Request failed: ${error.message || 'Unknown error'}`);
            this.toastr.error('Failed to dispose medicines', 'Disposal Error', {
              timeOut: 5000,
              progressBar: true,
              positionClass: 'toast-top-right'
            });
          });
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const disposedCount = result.value.count || this.selectedMedicines.length;

        Swal.fire({
          title: 'Success!',
          html: `
            <div class="swal-success-content">
              <i class="fas fa-check-circle text-success fa-3x mb-3"></i>
              <p>Successfully disposed <strong>${disposedCount}</strong> medicines</p>
            </div>
          `,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false,
          allowOutsideClick: true
        });

        this.toastr.success(
          `${disposedCount} medicines disposed successfully`,
          'Disposal Complete',
          {
            timeOut: 4000,
            progressBar: true,
            positionClass: 'toast-top-right'
          }
        );

        this.expiredmedicine();
        this.fetchLowStockMedicines();
        this.selectedMedicines = [];
        this.router.navigateByUrl('/inventorylayout/disposedexpiredmed')

      } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
        this.toastr.info('Medicine disposal was cancelled', 'Operation Cancelled', {
          timeOut: 3000,
          progressBar: true,
          positionClass: 'toast-top-right'
        });
      }
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

  // Additional helper methods
  calculateTotalLoss(): number {
    if (!this.expireproducts || this.expireproducts.length === 0) return 0;
    return this.expireproducts.reduce((total, medicine) => {
      return total + ((medicine?.price || 0) * (medicine?.stock || 0));
    }, 0);
  }

  clearSearch(): void {
    this.filterForm.patchValue({ searchText: '' });
    this.toastr.info('Search cleared', 'Filter Reset', {
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
    this.toastr.info('Refreshing data...', 'Loading', {
      timeOut: 1000,
      progressBar: true,
      positionClass: 'toast-top-right'
    });
    this.expiredmedicine();
  }

  exportToCSV(): void {
    this.toastr.success('CSV export initiated', 'Export', {
      timeOut: 3000,
      progressBar: true,
      positionClass: 'toast-top-right'
    });
  }

  // Track by function for better performance
  trackByMedicineId(index: number, medicine: Medicine): string {
    return medicine._id || index.toString();
  }
}
