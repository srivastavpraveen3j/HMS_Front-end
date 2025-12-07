import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
// import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-medicinemasterlist',
  standalone: true, // include this ONLY if using standalone component
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './medicinemasterlist.component.html',
  styleUrls: ['./medicinemasterlist.component.css']
})
export class MedicinemasterlistComponent implements OnInit {

  recordsPerPage: number = 25;
  searchText: string = '';
  medicines: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;


  // medcine stock alert

  showingLowStock = false;
lowStockMedicinesFullList: any[] = [];
lowStockMedicines: any[] = [];
lowStockCurrentPage = 1;
lowStockTotalPages = 1;
lowStockRecordsPerPage = 10;  // You can make this dynamic also


fetchLowStockMedicines(): void {
  const veryLargeLimit = 10000;  // fetch all
  const search = this.filterForm.get('searchText')?.value || '';

  this.masterService.getmedicine(1, veryLargeLimit, search).subscribe({
    next: (res) => {
      const filtered = res.data.filter((med: any) =>
        med.stock < 10 && !this.isExpired(med)   // ✅ exclude expired
      );

      this.lowStockMedicinesFullList = filtered;
      this.lowStockTotalPages = Math.ceil(this.lowStockMedicinesFullList.length / this.lowStockRecordsPerPage);
      this.lowStockCurrentPage = 1;

      this.updateLowStockMedicinesPage();
    },
    error: (err) => {
      console.error("Error fetching low stock medicines:", err);
    }
  });
}


isExpired(medicine: any): boolean {
  console.log('Checking medicine:', medicine.medicine_name, 'Expiry:', medicine.expiry_date);

  if (!medicine.expiry_date) return false;

  try {
    const expiryDate = new Date(medicine.expiry_date);
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


updateLowStockMedicinesPage(): void {
  const startIndex = (this.lowStockCurrentPage - 1) * this.lowStockRecordsPerPage;
  const endIndex = startIndex + this.lowStockRecordsPerPage;

  this.lowStockMedicines = this.lowStockMedicinesFullList.slice(startIndex, endIndex);
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
    private fb: FormBuilder
  ) {}


  userPermissions: any = {};

ngOnInit(): void {

// load permisison

     const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const medicineModule = allPermissions.find((perm: any) => perm.moduleName === 'medicine');
  this.userPermissions = medicineModule?.permissions || {};
// load permisison


  this.filterForm = this.fb.group({
    recordsPerPage: [10],
    searchText: [''],
  });

  this.fetchLowStockMedicines(); // prefetch for low stock count display
  this.fetchMedicines();

  this.filterForm.get('searchText')?.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe((searchText: string) => {
      this.currentPage = 1;
      this.fetchMedicines();
      this.fetchLowStockMedicines(); // keep low stock count in sync with search
    });



}


  fetchMedicines(): void {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';

    this.masterService.getmedicine(this.currentPage, limit, search).subscribe({
      next: (res) => {
        this.medicines = res.data;
        this.totalPages = res.total;

        console.log("Fetched medicines:", this.medicines);
      },
      error: (err) => {
        console.error("Error fetching medicines:", err);
      }
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
    this.router.navigate(['/master/medicinemaster'], {
      queryParams: { _id: medicineId }
    });
  }

  async deletemedicine(medicineId: string) {
    const Swal = (await import('sweetalert2')).default;

  if (!medicineId) {
    console.error("Medicine ID is required for deletion");
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
      cancelButton: 'hospital-swal-button'
    }
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
            }
          });

          // Refresh the list after deletion
          this.medicines = this.medicines.filter(med => med._id !== medicineId);
        },
      error: (err) => {
  console.error("Error deleting medicine:", err);
  Swal.fire({
    icon: 'error',
    title: 'Deletion Failed',
    text: err?.error?.error || err?.error?.message || 'There was an error deleting the medicine.',
    customClass: {
      popup: 'hospital-swal-popup',
      title: 'hospital-swal-title',
      htmlContainer: 'hospital-swal-text',
      confirmButton: 'hospital-swal-button'
    }
  });
}
      });
    }
  });
}

}
