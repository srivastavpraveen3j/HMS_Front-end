import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
// import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MasterService } from '../../../../views/mastermodule/masterservice/master.service';
@Component({
  selector: 'app-subpharmaciesstocks',
    imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './subpharmaciesstocks.component.html',
  styleUrl: './subpharmaciesstocks.component.css'
})
export class SubpharmaciesstocksComponent {

    recordsPerPage: number = 25;
    searchText: string = '';
    medicines: any[] = [];
    filterForm!: FormGroup;
    currentPage = 1;
    totalPages = 1;
    totalRecords =1;
    perPage  = 1
    // medcine stock alert

    showingLowStock = false;
    lowStockMedicinesFullList: any[] = [];
    lowStockMedicines: any[] = [];
    lowStockCurrentPage = 1;
    lowStockTotalPages = 1;
    lowStockRecordsPerPage = 10; // You can make this dynamic also
  pharmacyId!: string;
    fetchLowStockMedicines(): void {
      const veryLargeLimit = 10000; // fetch all
      const search = this.filterForm.get('searchText')?.value || '';
      this.masterService
        .getSubPharmacyInventoryItems(this.pharmacyId, this.currentPage, search)
        .subscribe({
          next: (res) => {
            const filtered = res.data.filter(
              (med: any) => med.current_stock < 10 && !this.isExpired(med) // ✅ exclude expired
            );

            this.lowStockMedicinesFullList = filtered;
            this.lowStockTotalPages = Math.ceil(
              this.lowStockMedicinesFullList.length / this.lowStockRecordsPerPage
            );
            this.lowStockCurrentPage = 1;

            this.updateLowStockMedicinesPage();
          },

          error: (err) => {
            console.error('Error fetching medicines:', err);
          },
        });
    }

    isExpired(medicine: any): boolean {
      console.log(
        'Checking medicine:',
        medicine.medicine_name,
        'Expiry:',
        medicine?.batch_details[0]?.expiry_date
      );

      if (!medicine?.batch_details[0]?.expiry_date ) return false;

      try {
        const expiryDate = new Date(medicine?.batch_details[0]?.expiry_date );
        const today = new Date();

        console.log('Parsed expiry date:', expiryDate);
        console.log('Today:', today);
        console.log('Is expired:', expiryDate < today);

        return expiryDate < today;
      } catch (error) {
        console.error('Error parsing date:', error);
        return false;
      }
    }

    isNearExpiry(medicine: any, daysThreshold: number = 30): boolean {
      if (!medicine?.batch_details[0]?.expiry_date ) return false;

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

    updateLowStockMedicinesPage(): void {
      const startIndex =
        (this.lowStockCurrentPage - 1) * this.lowStockRecordsPerPage;
      const endIndex = startIndex + this.lowStockRecordsPerPage;

      this.lowStockMedicines = this.lowStockMedicinesFullList.slice(
        startIndex,
        endIndex
      );
    }

    toggleLowStockView(): void {
      this.showingLowStock = !this.showingLowStock;
      if (this.showingLowStock) {
        this.lowStockCurrentPage = 1;
        this.fetchLowStockMedicines();
      } else {
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

    // medcine stock alert

    constructor(
      private masterService: MasterService,
      private router: Router,
      private fb: FormBuilder,
      private route : ActivatedRoute
    ) {}

  ngOnInit(): void {
    // ✅ Get pharmacyId from route
    this.route.paramMap.subscribe(params => {
      this.pharmacyId = params.get('pharmacyId') || '';
      this.loadPharmacyDetails(this.pharmacyId);

      // Initialize form
      this.filterForm = this.fb.group({
        recordsPerPage: [10],
        searchText: [''],
      });

      // Fetch data once ID is available
      this.fetchMedicines();
      this.fetchLowStockMedicines();

      // Watch for search text changes
      this.filterForm
        .get('searchText')
        ?.valueChanges.pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(() => {
          this.currentPage = 1;
          this.fetchMedicines();
        });
    });
  }
  pharmacyDetails: any;
  loadPharmacyDetails(id: string): void {
    this.masterService.getSubPharmacyById(id).subscribe({
      next: (res) => {
        this.pharmacyDetails = res.data;
        console.log("Pharmacy details:", this.pharmacyDetails);
      },
      error: (err) => {
        console.error("Error loading pharmacy:", err);
      }
    });
  }

    fetchMedicines(): void {
      const limit = this.filterForm.get('recordsPerPage')?.value || 10;
      const search = this.filterForm.get('searchText')?.value || '';

      // const pharmacyId = '68beb0b38066685ac24f8017';

      this.masterService
        .getSubPharmacyInventoryItems(this.pharmacyId, this.currentPage, limit, search)
        .subscribe({
          next: (res) => {
            this.medicines = res.data;
     this.currentPage = res.pagination.current_page;   // update from API
        this.totalPages = res.pagination.total_pages;     // update from API
        this.totalRecords = res.pagination.total_records; // optional if you need
        this.perPage = res.pagination.per_page;
            console.log('Fetched medicines:', this.medicines);
          },

          error: (err) => {
            console.error('Error fetching medicines:', err);
          },
        });
    }

   nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchMedicines();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchMedicines();
    }
  }


    editmedicine(medicineId: string): void {
      this.router.navigate(['/pharmalayout/pharmamanagement'], {
        queryParams: { _id: medicineId },
      });
    }

    async deletemedicine(medicineId: string) {
      const Swal = (await import('sweetalert2')).default;
      if (!medicineId) {
        console.error('Medicine ID is required for deletion');
        return;
      }

      Swal.fire({
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
      }).then((result) => {
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
                customClass: {
                  popup: 'hospital-toast-popup',
                  title: 'hospital-toast-title',
                  htmlContainer: 'hospital-toast-text',
                },
              });

              // Refresh the list after deletion
              this.medicines = this.medicines.filter(
                (med) => med._id !== medicineId
              );
            },
            error: (err) => {
              console.error('Error deleting medicine:', err);
              Swal.fire({
                icon: 'error',
                title: 'Deletion Failed',
                text:
                  err?.error?.message ||
                  'There was an error deleting the medicine.',
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
      });
    }

}
