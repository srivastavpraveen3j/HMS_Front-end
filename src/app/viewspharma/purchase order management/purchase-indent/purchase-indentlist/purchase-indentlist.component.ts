// purchase-indentlist.component.ts
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { RoleService } from '../../../../views/mastermodule/usermaster/service/role.service';
import { PurchaseintendService } from '../service/purchaseintend.service';

@Component({
  selector: 'app-purchase-indentlist',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './purchase-indentlist.component.html',
  styleUrl: './purchase-indentlist.component.css'
})
export class PurchaseIndentlistComponent {
  recordsPerPage: number = 10;
  searchText: string = '';
  currentPage = 1;
  totalPages = 1;

  // ✅ Date filter properties
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';

  // ✅ Tab properties
  statuses: string[] = ['pending', 'processed'];
  selectedStatus: string = 'pending';
  activeTabIndex: number = 0;

  requisitions: any[] = [];
  selectedRequests: any[] = [];

  constructor(
    private purchaseintendservice: PurchaseintendService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  // ✅ Fixed permissions handling
  userPermissions: any = {};
  module: string = '';

  ngOnInit(): void {
    // ✅ Fix permissions access
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const purchaseIntendModule = allPermissions.find((perm: any) => perm.moduleName === 'purchaseIntend');

    this.userPermissions = purchaseIntendModule || { permissions: { read: 0, create: 0, update: 0, delete: 0 } };
    this.module = purchaseIntendModule?.moduleName || 'purchaseIntend';

    // ✅ Set today's date by default
    this.setTodayFilter();
    this.loadpurchaseintend();
  }

  // ✅ Set today's date filter
  setTodayFilter(): void {
    const today = new Date().toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;
  }

  // ✅ Updated load method with server-side filtering
  loadpurchaseintend() {
    let dateStart: string | undefined;
    let dateEnd: string | undefined;

    // Determine date range based on active filter
    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      dateStart = today;
      dateEnd = today;
    } else if (this.activeFilter === 'dateRange' && this.startDate && this.endDate) {
      dateStart = this.startDate;
      dateEnd = this.endDate;
    }

    this.purchaseintendservice
      .getmaterialrequest(
        this.currentPage,
        this.recordsPerPage,
        this.searchText,
        this.selectedStatus,
        dateStart,
        dateEnd
      )
      .subscribe(res => {
        this.requisitions = res.data || [];
        this.totalPages = res.totalPages || 1;
        this.currentPage = res.page || 1;
      });
  }

  // ✅ Updated filters method
  applyFilters(): void {
    this.currentPage = 1; // Reset to first page
    this.loadpurchaseintend(); // Load data from server with filters
  }

  // ✅ Tab click handler
  onTabClick(status: string, index: number) {
    this.selectedStatus = status;
    this.activeTabIndex = index;
    this.currentPage = 1;
    this.loadpurchaseintend(); // Reload with new status filter
  }

  // ✅ Computed property for filtered data
  get filteredRequisitions() {
    return this.requisitions; // Server already filtered
  }

  // Selection methods
  toggleSelection(pr: any) {
    const index = this.selectedRequests.findIndex(req => req._id === pr._id);
    if (index > -1) {
      this.selectedRequests.splice(index, 1);
    } else {
      this.selectedRequests.push(pr);
    }
  }

  isSelected(pr: any): boolean {
    return this.selectedRequests.some(req => req._id === pr._id);
  }

  sendforRFQ(intendid: string) {
    this.router.navigate(['/inventorylayout/requestquotation'], {
      queryParams: { _id: intendid },
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadpurchaseintend();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadpurchaseintend();
    }
  }
}
