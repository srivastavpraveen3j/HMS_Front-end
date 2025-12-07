import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpParams } from '@angular/common/http';
import { VendorService } from '../service/vendor.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-vendorlist',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './vendorlist.component.html',
  styleUrl: './vendorlist.component.css'
})
export class VendorlistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  vendors: any[] = [];
  filteredVendors: any[] = [];
  allVendors: any[] = []; // Store all vendors for local filtering
  modalOpen: boolean = false;
  patientData: any = {};
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  totalRecords = 0;
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  module: string = '';
  showNoDataMessage: boolean = false;
  isLoading: boolean = false;
  userPermissions: any = {};

  constructor(
    private vendorservice: VendorService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    this.startDate = todayString;
    this.endDate = todayString;

    // Load permissions
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'vendor');
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // Initialize filter form
    this.filterForm = this.fb.group({
      recordsPerPage: [this.recordsPerPage],
      searchText: [''],
    });

    // Setup search functionality
    this.setupSearchFunctionality();

    // Initial load
    this.loadVendor();
  }

  // ✅ ADDED: Setup real-time search functionality
  setupSearchFunctionality(): void {
    this.filterForm.get('searchText')?.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged() // Only emit when value actually changes
      )
      .subscribe((searchTerm: string) => {
        this.searchText = searchTerm?.trim() || '';
        this.currentPage = 1; // Reset to first page when searching
        this.loadVendor(); // Reload data with search term
      });

    // Handle records per page changes
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe((perPage: number) => {
      this.recordsPerPage = perPage;
      this.currentPage = 1;
      this.loadVendor();
    });
  }

  // ✅ UPDATED: Enhanced loadVendor with search and pagination
  loadVendor(): void {
    this.isLoading = true;
    this.showNoDataMessage = false;

    this.vendorservice.getvendor(this.currentPage, this.recordsPerPage, this.searchText)
      .subscribe({
        next: (res) => {
          console.log("🚀 Vendor API Response:", res);

          // Handle different response structures
          if (res.data) {
            this.vendors = res.data;
            this.totalRecords = res.totalRecords || res.total || res.data.length;
            this.totalPages = Math.ceil(this.totalRecords / this.recordsPerPage);
          } else if (Array.isArray(res)) {
            // If response is directly an array
            this.vendors = res;
            this.totalRecords = res.length;
            this.totalPages = 1;
          } else {
            this.vendors = [];
            this.totalRecords = 0;
            this.totalPages = 1;
          }

          this.filteredVendors = [...this.vendors];
          this.showNoDataMessage = this.vendors.length === 0;
          this.isLoading = false;

          console.log("🚀 Processed vendors:", this.vendors);
        },
        error: (err) => {
          console.error('Error loading vendors:', err);
          this.vendors = [];
          this.filteredVendors = [];
          this.showNoDataMessage = true;
          this.isLoading = false;
        }
      });
  }

  // ✅ ADDED: Manual search trigger (optional)
  onSearchSubmit(): void {
    const searchTerm = this.filterForm.get('searchText')?.value?.trim() || '';
    this.searchText = searchTerm;
    this.currentPage = 1;
    this.loadVendor();
  }

  // ✅ ADDED: Clear search functionality
  clearSearch(): void {
    this.filterForm.get('searchText')?.setValue('');
    this.searchText = '';
    this.currentPage = 1;
    this.loadVendor();
  }

  // ✅ UPDATED: Enhanced pagination with proper data handling
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadVendor();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadVendor();
    }
  }

  // ✅ ADDED: Jump to specific page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadVendor();
    }
  }

  openIndex: number | null = null;
  selectedPatient: any = null;

  edituhid(uhidid: string): void {
    this.router.navigate(['/inventorylayout/vendor'], {
      queryParams: { _id: uhidid },
    });
  }

  async deleteduhid(uhidid: string): Promise<void> {
    if (!uhidid) {
      console.error('Vendor ID is required for deletion');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This Vendor data will be permanently deleted.',
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
      this.vendorservice.deletevendor(uhidid).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Vendor Data has been deleted successfully.',
            position: 'top-end',
            toast: true,
            timer: 3000,
            showConfirmButton: false,
            customClass: {
              popup: 'hospital-toast-popup',
              title: 'hospital-toast-title',
              htmlContainer: 'hospital-toast-text',
            },
          });

          // Remove from local array and reload if needed
          this.vendors = this.vendors.filter((vendor) => vendor._id !== uhidid);
          this.filteredVendors = [...this.vendors];

          // If no vendors left on current page, go to previous page
          if (this.vendors.length === 0 && this.currentPage > 1) {
            this.currentPage--;
            this.loadVendor();
          } else if (this.vendors.length === 0) {
            this.showNoDataMessage = true;
          }
        },
        error: (err) => {
          console.error('Error deleting Vendor Data:', err);
          Swal.fire({
            icon: 'error',
            title: 'Deletion Failed',
            text: 'There was an error deleting the vendor.',
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button',
            },
          });
        },
      });
    }
  }
}
