import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GrnService } from '../service/grn.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from '../../../../views/loader/loader.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-goods-receive-note-list',
  imports: [CommonModule, RouterModule, FormsModule, LoaderComponent, ReactiveFormsModule],
  templateUrl: './goods-receive-note-list.component.html',
  styleUrl: './goods-receive-note-list.component.css',
})
export class GoodsReceiveNoteListComponent {
  goodreceivenotes: any[] = [];
  allgrn: any[] = [];
  recordsPerPage = 10;

  currentPage = 1;
  totalPages = 1;
  module: string = '';
    searchText: string = '';
      filterForm!: FormGroup;
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  userPermissions: any = {};

  constructor(private grnservice: GrnService, private fb: FormBuilder) {

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
      (perm: any) => perm.moduleName === 'goodreceivenote'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';
    this.loadgrn();


    this.setupSearchFunctionality();
  }

     setupSearchFunctionality(): void {
          this.filterForm.get('searchText')?.valueChanges
            .pipe(
              debounceTime(300), // Wait 300ms after user stops typing
              distinctUntilChanged() // Only emit when value actually changes
            )
            .subscribe((searchTerm: string) => {
              this.searchText = searchTerm?.trim() || '';
              this.currentPage = 1; // Reset to first page when searching
              this.loadgrn(); // Reload data with search term
            });

          // Handle records per page changes
          this.filterForm.get('recordsPerPage')?.valueChanges.subscribe((perPage: number) => {
            this.recordsPerPage = perPage;
            this.currentPage = 1;
            this.loadgrn();
          });
        }

loadgrn() {
  let poNumber = '';
  let vendorName = '';
  let grnNumber = '';

  // ✅ Get search text from form control properly
  const searchText = this.filterForm.get('searchText')?.value?.trim() || '';

  if (searchText) {
    // Check GRN patterns first (more specific patterns should come first)
    if (searchText.includes('GRN/') ||
        searchText.includes('grn/') ||
        searchText.match(/^GRN\d+/i)) {
      grnNumber = searchText;
    }
    // Check PO patterns
    else if (searchText.includes('PO/') ||
             searchText.includes('po/') ||
             searchText.match(/^PO\d+/i)) {
      poNumber = searchText;
    }
    // Check for pure numeric patterns (could be either PO or GRN)
    else if (searchText.match(/^\d{4,}$/)) {
      // You might want to search both PO and GRN for numeric patterns
      // or have a way to distinguish them
      poNumber = searchText; // Default to PO for numeric
    }
    // ✅ Fixed: Added 'else' keyword
    else {
      vendorName = searchText;
    }
  }

  const veryLargeLimit = 10000;
  this.grnservice.getgrngeneration(
    1,
    veryLargeLimit,
    '', // general search (empty)
    '', // status filter
    poNumber,
    vendorName,
    grnNumber
  ).subscribe((res) => {
    this.allgrn = res.data.data || [];
    this.applyFilters();
  });
}



  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  applyFilters() {
    let baseList = [...this.allgrn]; // 🔹 always filter from master list

    // helper for parsing yyyy-MM-dd from <input type="date">
    const parseDate = (input: string): Date | null => {
      if (!input) return null;
      return new Date(input); // browser gives yyyy-MM-dd
    };

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      baseList = baseList.filter((po) => {
        const createdAt = po?.createdAt || po?.created_at;
        return (
          createdAt && new Date(createdAt).toISOString().split('T')[0] === today
        );
      });
    } else if (this.activeFilter === 'dateRange') {
      const start = parseDate(this.startDate);
      const end = parseDate(this.endDate);
      if (end) end.setHours(23, 59, 59, 999);

      baseList = baseList.filter((po) => {
        const createdAt = po?.createdAt || po?.created_at;
        if (!createdAt || !start || !end) return false;

        const date = new Date(createdAt);
        return date >= start && date <= end;
      });
    }

    // pagination
    this.totalPages = Math.ceil(baseList.length / this.recordsPerPage) || 1;
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    this.goodreceivenotes = baseList.slice(startIndex, endIndex);

    console.log('filtered data', this.goodreceivenotes);
  }
}
