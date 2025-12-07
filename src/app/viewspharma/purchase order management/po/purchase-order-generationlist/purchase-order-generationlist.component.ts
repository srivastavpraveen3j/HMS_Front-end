import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PoService } from '../service/po.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from '../../../../views/loader/loader.component';
import { IndianCurrencyPipe } from '../../../../pipe/indian-currency.pipe';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-purchase-order-generationlist',
  imports: [CommonModule, RouterModule, FormsModule, LoaderComponent, IndianCurrencyPipe, ReactiveFormsModule],
  templateUrl: './purchase-order-generationlist.component.html',
  styleUrl: './purchase-order-generationlist.component.css',
})
export class PurchaseOrderGenerationlistComponent {
  allPurchaseOrders: any[] = [];
  purchaseOrders: any[] = [];
  searchText: string = '';
  filterForm!: FormGroup;
  recordsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  totalRecords = 1;
  isLoading: boolean = false
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  userPermissions: any = {};
  module: string = '';

  constructor(private poservice: PoService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      recordsPerPage: [this.recordsPerPage],
      searchText: [''],
    });
  }

  ngOnInit() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    this.startDate = todayString;
    this.endDate = todayString;

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'purchaseorder',
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    this.loadpo();
    this.setupSearchFunctionality();
  }

  setupSearchFunctionality(): void {
    this.filterForm.get('searchText')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((searchTerm: string) => {
        this.searchText = searchTerm?.trim() || '';
        this.currentPage = 1;
        this.loadpo();
      });

    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe((perPage: number) => {
      this.recordsPerPage = perPage;
      this.currentPage = 1;
      this.loadpo();
    });
  }

  loadpo(): void {
    this.isLoading = true;

    let poNumber = '';
    let vendorName = '';

    if (this.searchText.trim()) {
      if (this.searchText.includes('PO/') ||
          this.searchText.includes('po/') ||
          this.searchText.match(/^PO\d+/i) ||
          this.searchText.match(/^\d{4}/)) {
        poNumber = this.searchText;
      } else {
        vendorName = this.searchText;
      }
    }

    this.poservice
      .getpogeneration(
        this.currentPage,
        this.recordsPerPage,
        '',
        '',
        poNumber,
        vendorName
      )
      .subscribe({
        next: (res) => {
          console.log('✅ API Response:', res);
          this.allPurchaseOrders = res.data || [];
          this.totalRecords = res.total || 0;
          this.totalPages = res.totalPages || 1;

          // Apply filters after getting data
          this.applyFilters();

          this.isLoading = false;
          console.log(`✅ Loaded ${this.purchaseOrders.length} POs (Total: ${this.totalRecords})`);
        },
        error: (error) => {
          console.error('❌ Error loading POs:', error);
          this.isLoading = false;
          this.purchaseOrders = [];
          this.totalRecords = 0;
          this.totalPages = 1;
        }
      });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadpo();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadpo();
    }
  }

  applyFilters(): void {
    let baseList = [...this.allPurchaseOrders];

    const parseDate = (input: string): Date | null => {
      if (!input) return null;
      return new Date(input);
    };

    if (this.activeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      baseList = baseList.filter((po: any) => {
        const createdAt = po?.createdAt || po?.created_at;
        if (!createdAt) return false;

        const poDate = new Date(createdAt);
        return poDate >= today && poDate < tomorrow;
      });

    } else if (this.activeFilter === 'dateRange') {
      const start = parseDate(this.startDate);
      const end = parseDate(this.endDate);
      if (end) end.setHours(23, 59, 59, 999);

      baseList = baseList.filter((po: any) => {
        const createdAt = po?.createdAt || po?.created_at;
        if (!createdAt || !start || !end) return false;

        const date = new Date(createdAt);
        return date >= start && date <= end;
      });
    }

    // Update display list
    this.purchaseOrders = baseList;

    // Update pagination info based on filtered data
    const filteredTotal = baseList.length;
    this.totalPages = Math.ceil(filteredTotal / this.recordsPerPage) || 1;

    console.log('📊 Filtered data:', this.purchaseOrders);
  }
}
