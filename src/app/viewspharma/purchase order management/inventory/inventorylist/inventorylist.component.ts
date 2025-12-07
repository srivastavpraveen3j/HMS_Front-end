import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { InventoryitemService } from '../service/inventoryitem.service';
import { MasterService } from '../../../../views/mastermodule/masterservice/master.service';

@Component({
  selector: 'app-inventorylist',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './inventorylist.component.html',
  styleUrl: './inventorylist.component.css',
})
export class InventorylistComponent implements OnInit {
  recordsPerPage: number = 10;
  searchText: string = '';
  medicines: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  showTableView = true;

  // Medicine stock alert
  showingLowStock = false;
  lowStockMedicinesFullList: any[] = [];
  lowStockMedicines: any[] = [];
  lowStockCurrentPage = 1;
  lowStockTotalPages = 1;
  lowStockRecordsPerPage = 10;

  userPermissions: any = {};

  constructor(
    private masterService: MasterService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const medicineModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inventoryItem'
    );
    this.userPermissions = medicineModule?.permissions || {};

    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: [''],
    });

    this.fetchLowStockMedicines();
    this.fetchMedicines();

    this.filterForm
      .get('searchText')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchText: string) => {
        this.currentPage = 1;
        this.fetchMedicines();
        this.fetchLowStockMedicines();
      });

    // Subscribe to recordsPerPage changes
    this.filterForm
      .get('recordsPerPage')
      ?.valueChanges.subscribe(() => {
        this.currentPage = 1;
        this.fetchMedicines();
      });
  }

  fetchMedicines(): void {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';

    this.masterService.getmedicine(this.currentPage, limit, search).subscribe({
      next: (res) => {
        console.log('API Response:', res);

        // ✅ Fixed: Access nested data structure
        this.medicines = res.data || [];
        this.totalPages = res.pagination?.totalPages || 1;

        console.log('Fetched medicines:', this.medicines);
        console.log('Total pages:', this.totalPages);
        console.log('Current page:', this.currentPage);
      },
      error: (err) => {
        console.error('Error fetching medicines:', err);
        this.medicines = [];
        this.totalPages = 1;
      }
    });
  }

  fetchLowStockMedicines(): void {
    const veryLargeLimit = 10000;
    const search = this.filterForm.get('searchText')?.value || '';

    this.masterService.getmedicine(1, veryLargeLimit, search).subscribe({
      next: (res) => {
        // ✅ Fixed: Access nested data structure
        const allMedicines = res.data || [];

        // ✅ Apply filters (low stock, not expired)
        const filtered = allMedicines.filter((med: any) =>
          med.stock < 10 && !this.isExpired(med)
        );

        this.lowStockMedicinesFullList = filtered;
        this.lowStockTotalPages = Math.ceil(filtered.length / this.lowStockRecordsPerPage);
        this.lowStockCurrentPage = 1;

        this.updateLowStockMedicinesPage();
      },
      error: (err) => {
        console.error('Error fetching low stock medicines:', err);
        this.lowStockMedicinesFullList = [];
      }
    });
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

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchMedicines();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchMedicines();
    }
  }

  toggleView(): void {
    this.showTableView = !this.showTableView;
  }

  isExpired(medicine: any): boolean {
    if (!medicine.expiry_date) return false;

    try {
      const expiryDate = new Date(medicine.expiry_date);
      const today = new Date();
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

  editmedicine(medicineId: string): void {
    this.router.navigate(['/inventorylayout/inventorystock'], {
      queryParams: { _id: medicineId },
    });
  }
}
