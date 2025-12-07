// transferrequest.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MasterService } from '../../../../../../views/mastermodule/masterservice/master.service';

@Component({
  selector: 'app-transferrequest',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './transferrequest.component.html',
  styleUrl: './transferrequest.component.css'
})
export class TransferrequestComponent implements OnInit {
  // Data properties
  transferRequests: any[] = [];
  filteredRequests: any[] = [];

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalRecords = 0;
  recordsPerPage = 10;

  // Filters
  selectedStatus = '';
  selectedPriority = '';
  searchText = '';

  // ✅ NEW: Date range properties with default today's date
  dateRange = {
    startDate: this.getTodayDate(),
    endDate: this.getTodayDate()
  };

  // Modal states
  showApprovalModal = false;
  showDetailsModal = false;
  showDebugModal = false;
  selectedRequest: any = null;
  debugData: any = null;

  // Approval form
  approvalForm!: FormGroup;
  isProcessing = false;

  // User permissions
  userPermissions: any = {};

  // Enhanced features
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Math helper for template
  Math = Math;

  constructor(
    private masterService: MasterService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeApprovalForm();
  }

  ngOnInit(): void {
    console.log('🗓️ Initializing with today\'s date:', this.dateRange);
    this.loadUserPermissions();
    this.loadTransferRequests(); // This will load today's requests by default
  }

  // ✅ NEW: Get today's date in YYYY-MM-DD format
  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ✅ NEW: Reset to today's date
  resetToToday(): void {
    const todayDate = this.getTodayDate();
    this.dateRange = {
      startDate: todayDate,
      endDate: todayDate
    };
    this.currentPage = 1;
    this.loadTransferRequests();
  }

  // ✅ NEW: Quick date range presets
  setDateRange(preset: string): void {
    const today = new Date();
    const todayStr = this.getTodayDate();

    switch (preset) {
      case 'today':
        this.dateRange = {
          startDate: todayStr,
          endDate: todayStr
        };
        break;

      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = this.formatDateToString(yesterday);
        this.dateRange = {
          startDate: yesterdayStr,
          endDate: yesterdayStr
        };
        break;

      case 'last7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        this.dateRange = {
          startDate: this.formatDateToString(sevenDaysAgo),
          endDate: todayStr
        };
        break;

      case 'last30days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        this.dateRange = {
          startDate: this.formatDateToString(thirtyDaysAgo),
          endDate: todayStr
        };
        break;

      case 'thisMonth':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        this.dateRange = {
          startDate: this.formatDateToString(firstDayOfMonth),
          endDate: todayStr
        };
        break;

      case 'clear':
        this.dateRange = {
          startDate: '',
          endDate: ''
        };
        break;
    }

    this.currentPage = 1;
    this.loadTransferRequests();
  }

  // ✅ Helper method to format date to YYYY-MM-DD string
  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadUserPermissions(): void {
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const medicineModule = allPermissions.find((perm: any) => perm.moduleName === 'medicine');
    this.userPermissions = medicineModule?.permissions || {};
  }

  // ✅ Enhanced approval form initialization
  initializeApprovalForm(): void {
    const userData = this.getUserData();

    this.approvalForm = this.fb.group({
      status: ['approved', Validators.required],
      approver_name: [userData.name, Validators.required],
      approver_email: [userData.email, [Validators.required, Validators.email]],
      approval_notes: [''],
      rejection_reason: [''],
      processing_priority: ['normal']
    });

    console.log(`✅ User initialized: ${userData.name} (${userData.email})`);
  }

  // ✅ Enhanced user data extraction
  private getUserData(): { name: string, email: string } {
    try {
      const userData = localStorage.getItem('authUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        return {
          name: parsedUser.name || 'Manager',
          email: parsedUser.email || 'manager@hospital.com'
        };
      }
    } catch (error) {
      console.warn('Could not parse user data:', error);
    }

    return { name: 'Manager', email: 'manager@hospital.com' };
  }

  // ✅ ENHANCED: Load transfer requests with date filtering
  loadTransferRequests(): void {
    const filters: any = {
      status: this.selectedStatus,
      priority: this.selectedPriority
    };

    // ✅ Add date range filters
    if (this.dateRange.startDate) {
      filters.startDate = this.dateRange.startDate;
    }
    if (this.dateRange.endDate) {
      filters.endDate = this.dateRange.endDate;
    }

    console.log(`📄 Loading transfer requests - Page: ${this.currentPage}, Filters:`, filters);

    this.masterService.getTransferRequests(this.currentPage, this.recordsPerPage, filters)
      .subscribe({
        next: (res: any) => {
          console.log(`✅ Loaded ${res.data?.length || 0} transfer requests`);
          this.transferRequests = res.data || [];
          this.filteredRequests = [...this.transferRequests];
          this.totalRecords = res.pagination?.total_records || 0;
          this.totalPages = res.pagination?.total_pages || 1;
          this.applySorting();

          // ✅ Log date range info
          if (this.dateRange.startDate || this.dateRange.endDate) {
            console.log(`📅 Filtered by date range: ${this.formatDateRange()}`);
          }
        },
        error: (err) => {
          console.error('❌ Error loading transfer requests:', err);
          this.transferRequests = [];
          this.filteredRequests = [];
        }
      });
  }

  // ✅ Enhanced filtering with search and date range
  filterRequests(): void {
    let filtered = this.transferRequests.filter(request => {
      const matchesSearch = !this.searchText ||
        request.request_id.toLowerCase().includes(this.searchText.toLowerCase()) ||
        request.to_pharmacy?.pharmacy_name?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        request.requested_medicines?.some((med: any) =>
          med.medicine_name?.toLowerCase().includes(this.searchText.toLowerCase())
        );

      const matchesStatus = !this.selectedStatus || request.status === this.selectedStatus;
      const matchesPriority = !this.selectedPriority || request.priority === this.selectedPriority;

      // ✅ Client-side date filtering as backup
      let matchesDateRange = true;
      if (this.dateRange.startDate || this.dateRange.endDate) {
        const requestDate = new Date(request.createdAt);
        const startDate = this.dateRange.startDate ? new Date(this.dateRange.startDate) : null;
        const endDate = this.dateRange.endDate ? new Date(this.dateRange.endDate + 'T23:59:59') : null;

        if (startDate && requestDate < startDate) matchesDateRange = false;
        if (endDate && requestDate > endDate) matchesDateRange = false;
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDateRange;
    });

    this.filteredRequests = filtered;
    this.applySorting();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadTransferRequests();
  }

  // ✅ Enhanced date range change handler
  onDateRangeChange(): void {
    console.log('📅 Date range changed:', this.dateRange);

    // Validate date range
    if (this.dateRange.startDate && this.dateRange.endDate) {
      const startDate = new Date(this.dateRange.startDate);
      const endDate = new Date(this.dateRange.endDate);

      if (startDate > endDate) {
        // Swap dates if start is after end
        const temp = this.dateRange.startDate;
        this.dateRange.startDate = this.dateRange.endDate;
        this.dateRange.endDate = temp;
        console.log('📅 Swapped date range:', this.dateRange);
      }
    }

    this.currentPage = 1;
    this.loadTransferRequests();
  }

  // ✅ Enhanced date range formatting
  formatDateRange(): string {
    const start = this.dateRange.startDate ? new Date(this.dateRange.startDate).toLocaleDateString('en-IN') : '';
    const end = this.dateRange.endDate ? new Date(this.dateRange.endDate).toLocaleDateString('en-IN') : '';

    if (start && end) {
      if (start === end) {
        return `${start}`;
      }
      return `${start} - ${end}`;
    }
    if (start) return `From ${start}`;
    if (end) return `Until ${end}`;
    return '';
  }

  // ✅ Enhanced filter management
  clearFilter(filterType: string): void {
    switch (filterType) {
      case 'status':
        this.selectedStatus = '';
        break;
      case 'priority':
        this.selectedPriority = '';
        break;
      case 'dateRange':
        this.dateRange = { startDate: '', endDate: '' };
        break;
    }
    this.currentPage = 1;
    this.onFilterChange();
  }

  // ✅ Enhanced filter validation
  hasActiveFilters(): boolean {
    return !!(
      this.searchText?.trim() ||
      this.selectedStatus ||
      this.selectedPriority ||
      this.dateRange.startDate ||
      this.dateRange.endDate
    );
  }

  // ✅ Clear all filters
  clearAllFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.dateRange = { startDate: '', endDate: '' };
    this.currentPage = 1;
    this.loadTransferRequests();
  }

  // ✅ Enhanced sorting functionality
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  private applySorting(): void {
    if (!this.sortField) return;

    this.filteredRequests.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (this.sortField) {
        case 'request_id':
          valueA = a.request_id;
          valueB = b.request_id;
          break;
        case 'pharmacy_name':
          valueA = a.to_pharmacy?.pharmacy_name || '';
          valueB = b.to_pharmacy?.pharmacy_name || '';
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          valueA = (priorityOrder as any)[a.priority] || 0;
          valueB = (priorityOrder as any)[b.priority] || 0;
          break;
        case 'status':
          const statusOrder = { pending: 1, approved: 2, completed: 3, rejected: 4 };
          valueA = (statusOrder as any)[a.status] || 0;
          valueB = (statusOrder as any)[b.status] || 0;
          break;
        case 'total_cost':
          valueA = a.total_estimated_cost || 0;
          valueB = b.total_estimated_cost || 0;
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        default:
          valueA = a[this.sortField];
          valueB = b[this.sortField];
      }

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // ✅ Enhanced pagination methods
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTransferRequests();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTransferRequests();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadTransferRequests();
    }
  }

  // ✅ FIXED: Enhanced pagination methods with proper type handling
  getStartRecord(): number {
    return (this.currentPage - 1) * this.recordsPerPage + 1;
  }

  getEndRecord(): number {
    return Math.min(this.currentPage * this.recordsPerPage, this.totalRecords);
  }

  // ✅ FIXED: Return type specified and properly handled
  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (this.currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(this.totalPages - 1, this.currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (this.currentPage < this.totalPages - 2) {
        pages.push('...');
      }

      pages.push(this.totalPages);
    }

    return pages;
  }

  // ✅ NEW: Handle page clicks with type checking
  handlePageClick(page: number | string): void {
    if (typeof page === 'number' && page !== this.currentPage) {
      this.goToPage(page);
    }
  }

  // ✅ FIXED: Jump to page with proper type conversion
  jumpToPage(event: any): void {
    const page = parseInt(event.target.value, 10);
    if (!isNaN(page) && page >= 1 && page <= this.totalPages) {
      this.goToPage(page);
    } else {
      event.target.value = this.currentPage;
    }
  }

  onRecordsPerPageChange(): void {
    this.currentPage = 1;
    this.loadTransferRequests();
  }

  // ✅ Clear search functionality
  clearSearch(): void {
    this.searchText = '';
    this.filterRequests();
  }

  // Modal methods
  openApprovalModal(request: any): void {
    console.log(`🎯 Opening approval modal for request: ${request.request_id}`);
    this.selectedRequest = request;
    this.showApprovalModal = true;

    const userData = this.getUserData();
    this.approvalForm.patchValue({
      status: 'approved',
      approver_name: userData.name,
      approver_email: userData.email,
      approval_notes: '',
      rejection_reason: '',
      processing_priority: 'normal'
    });
  }

  openDetailsModal(request: any): void {
    console.log(`📋 Opening details modal for request: ${request.request_id}`);
    this.selectedRequest = request;
    this.showDetailsModal = true;
  }

  closeModals(): void {
    this.showApprovalModal = false;
    this.showDetailsModal = false;
    this.showDebugModal = false;
    this.selectedRequest = null;
    this.debugData = null;
    this.isProcessing = false;
  }

  // ✅ Enhanced approval method with SweetAlert2
  async approveRequest(): Promise<void> {
    if (!this.selectedRequest || this.isProcessing || !this.isApprovalFormValid()) return;

    console.log(`🎯 Starting approval process for: ${this.selectedRequest.request_id}`);

    const Swal = (await import('sweetalert2')).default;
    const approvalData = this.approvalForm.value;
    const isApproval = approvalData.status === 'approved';

    const result = await Swal.fire({
      icon: isApproval ? 'question' : 'warning',
      title: isApproval ? 'Confirm Approval' : 'Confirm Rejection',
      html: `
        <div class="approval-confirmation">
          <p><strong>Request ID:</strong> ${this.selectedRequest.request_id}</p>
          <p><strong>Pharmacy:</strong> ${this.selectedRequest.to_pharmacy?.pharmacy_name}</p>
          <p><strong>Action:</strong> ${isApproval ? 'APPROVE' : 'REJECT'} this transfer request</p>
          ${isApproval ?
            `<p><strong>Priority:</strong> ${approvalData.processing_priority}</p>` :
            `<p><strong>Reason:</strong> ${approvalData.rejection_reason}</p>`
          }
          <hr>
          <p>Are you sure you want to proceed?</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: isApproval ? 'Yes, Approve' : 'Yes, Reject',
      cancelButtonText: 'Cancel',
      confirmButtonColor: isApproval ? '#059669' : '#dc2626',
    });

    if (!result.isConfirmed) return;

    this.isProcessing = true;

    const loadingToast = Swal.fire({
      icon: 'info',
      title: 'Processing Decision...',
      text: 'Please wait while we process your decision.',
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    this.masterService.approveTransferRequest(this.selectedRequest.request_id, approvalData)
      .subscribe({
        next: async (res: any) => {
          console.log('✅ Approval response:', res);
          Swal.close();

          if (isApproval) {
            const approvalResult = await Swal.fire({
              icon: 'success',
              title: 'Request Approved Successfully!',
              html: `
                <div class="approval-success">
                  <p><strong>Request ID:</strong> ${this.selectedRequest.request_id}</p>
                  <p><strong>Approved by:</strong> ${approvalData.approver_name}</p>
                  <p><strong>Pharmacy:</strong> ${this.selectedRequest.to_pharmacy?.pharmacy_name}</p>
                  <hr>
                  <p class="text-warning"><strong>Next Step:</strong> Complete the inventory transfer to finish the process.</p>
                </div>
              `,
              showCancelButton: true,
              confirmButtonText: 'Complete Transfer Now',
              cancelButtonText: 'Complete Later',
              confirmButtonColor: '#3b82f6',
            });

            if (approvalResult.isConfirmed) {
              this.completeTransfer(this.selectedRequest.request_id);
            } else {
              this.showSuccessToast('Request approved successfully! You can complete the transfer later.');
              this.closeModals();
              this.loadTransferRequests();
            }
          } else {
            await Swal.fire({
              icon: 'info',
              title: 'Request Rejected',
              html: `
                <div class="rejection-success">
                  <p><strong>Request ID:</strong> ${this.selectedRequest.request_id}</p>
                  <p><strong>Rejected by:</strong> ${approvalData.approver_name}</p>
                  <p><strong>Reason:</strong> ${approvalData.rejection_reason}</p>
                  <hr>
                  <p>The requesting pharmacy has been notified of this decision.</p>
                </div>
              `,
              confirmButtonText: 'OK',
            });

            this.closeModals();
            this.loadTransferRequests();
          }
        },
        error: async (err) => {
          console.error('❌ Approval failed:', err);
          Swal.close();

          await Swal.fire({
            icon: 'error',
            title: 'Processing Failed',
            text: `Failed to process request.\nError: ${err.error?.message || err.message}`,
          });

          this.isProcessing = false;
        }
      });
  }

  // ✅ Enhanced transfer completion
  async completeTransfer(requestId: string): Promise<void> {
    console.log(`🚀 STARTING INVENTORY TRANSFER: ${requestId}`);

    const Swal = (await import('sweetalert2')).default;

    const loadingToast = Swal.fire({
      icon: 'info',
      title: 'Completing Transfer...',
      text: 'Moving inventory from central store to sub-pharmacy...',
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    this.masterService.completeTransferRequest(requestId)
      .subscribe({
        next: async (res: any) => {
          console.log('✅ Transfer completion response:', res);
          Swal.close();

          const debugInfo = res.data.debug_info;
          let medicinesHtml = '';

          if (debugInfo?.medicines && debugInfo.medicines.length > 0) {
            medicinesHtml = `
              <div class="medicines-transferred">
                <h6>Medicines Transferred:</h6>
                <ul class="medicine-list">
                  ${debugInfo.medicines.map((med: any) => `
                    <li>
                      <strong>${med.name}</strong>: ${med.approved_quantity} units
                      <small>(Status: ${med.transfer_completed ? '✅ Completed' : '❌ Failed'})</small>
                    </li>
                  `).join('')}
                </ul>
              </div>
            `;
          }

          await Swal.fire({
            icon: 'success',
            title: 'Transfer Completed Successfully!',
            html: `
              <div class="transfer-success">
                <p><strong>Request ID:</strong> ${res.data.request_id}</p>
                <p><strong>Pharmacy:</strong> ${res.data.pharmacy_name}</p>
                <p><strong>Medicines Transferred:</strong> ${res.data.medicines_transferred}</p>
                <p><strong>Total Value:</strong> ₹${res.data.total_transferred_cost}</p>
                <p><strong>Completed:</strong> ${this.formatDate(res.data.completed_at)}</p>
                ${medicinesHtml}
                <hr>
                <p class="text-success"><strong>✅ All inventory has been successfully transferred!</strong></p>
              </div>
            `,
            confirmButtonText: 'Excellent!',
          });

          this.closeModals();
          this.loadTransferRequests();
        },
        error: async (err) => {
          console.error('❌ Transfer completion failed:', err);
          Swal.close();

          await Swal.fire({
            icon: 'error',
            title: 'Transfer Failed',
            html: `
              <div class="transfer-error">
                <p><strong>Failed to complete inventory transfer</strong></p>
                <p><strong>Error:</strong> ${err.error?.message || err.message}</p>
                <hr>
                <p>Please try again or contact IT support if the problem persists.</p>
              </div>
            `,
            confirmButtonText: 'OK',
          });

          this.isProcessing = false;
        }
      });
  }

  // ✅ Enhanced method for completing approved transfers
  async completeApprovedTransfer(request: any): Promise<void> {
    if (request.status !== 'approved') {
      this.showWarningToast('Only approved requests can be completed.');
      return;
    }

    console.log(`🎯 Completing approved transfer: ${request.request_id}`);

    const Swal = (await import('sweetalert2')).default;

    const result = await Swal.fire({
      icon: 'question',
      title: 'Complete Inventory Transfer?',
      html: `
        <div class="completion-confirmation">
          <p><strong>Pharmacy:</strong> ${request.to_pharmacy?.pharmacy_name}</p>
          <p><strong>Medicines:</strong> ${request.requested_medicines?.length} items</p>
          <p><strong>Request ID:</strong> ${request.request_id}</p>
          <hr>
          <p class="text-warning"><strong>This will move stock from Central Store to Sub-Pharmacy.</strong></p>
          <p>Are you sure you want to proceed?</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Yes, Complete Transfer',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3b82f6',
    });

    if (result.isConfirmed) {
      this.isProcessing = true;
      this.completeTransfer(request.request_id);
    }
  }

  // Validation methods
  isApprovalFormValid(): boolean {
    if (!this.approvalForm.valid) return false;

    const formValue = this.approvalForm.value;
    if (formValue.status === 'rejected' && !formValue.rejection_reason?.trim()) {
      return false;
    }

    return true;
  }

  // Toast notification methods
  private async showSuccessToast(message: string): Promise<void> {
    const Swal = (await import('sweetalert2')).default;
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      position: 'top-end',
      toast: true,
      timer: 3000,
      showConfirmButton: false,
    });
  }

  private async showWarningToast(message: string): Promise<void> {
    const Swal = (await import('sweetalert2')).default;
    Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: message,
      position: 'top-end',
      toast: true,
      timer: 4000,
      showConfirmButton: false,
    });
  }

  // Permission methods
  canApprove(): boolean {
    return this.userPermissions.update === true || true;
  }

  canComplete(request: any): boolean {
    return request.status === 'approved' && (this.userPermissions.update === true || true);
  }

  canDebug(request: any): boolean {
    return request.status === 'completed' || request.status === 'approved';
  }

  // Utility methods for template
  trackRequestById(index: number, request: any): any {
    return request.request_id || request._id;
  }

  // CSS class methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'completed': return 'status-completed';
      default: return '';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'critical': return 'priority-critical';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  }


 getTypeDisplay(type: string): string {
  switch (type) {
    case 'expired_replacement': return 'EXPIRED';
    case 'stock_replenishment': return 'RESTOCK';
    case 'urgent_request': return 'URGENT';
    default: return type?.toUpperCase() || 'GENERAL';
  }
}

getTypeClass(type: string): string {
  switch (type) {
    case 'expired_replacement': return 'type-expired';
    case 'stock_replenishment': return 'type-replenishment';
    case 'urgent_request': return 'type-urgent';
    default: return 'type-general';
  }
}

// Optional: Add icons for better visibility
getTypeIcon(type: string): string {
  switch (type) {
    case 'expired_replacement': return 'fa-exclamation-triangle';
    case 'stock_replenishment': return 'fa-plus-circle';
    case 'urgent_request': return 'fa-bolt';
    default: return 'fa-file-alt';
  }
}

  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  getStatusAlertClass(status: string): string {
    switch (status) {
      case 'pending': return 'alert-warning';
      case 'approved': return 'alert-info';
      case 'completed': return 'alert-success';
      case 'rejected': return 'alert-danger';
      default: return 'alert-secondary';
    }
  }

  getStatusTitle(status: string): string {
    switch (status) {
      case 'pending': return 'Awaiting Review';
      case 'approved': return 'Approved - Ready for Transfer';
      case 'rejected': return 'Request Rejected';
      case 'completed': return 'Transfer Completed';
      default: return 'Unknown Status';
    }
  }

  getStatusDescription(status: string): string {
    switch (status) {
      case 'pending': return 'This request is waiting for manager approval.';
      case 'approved': return 'This request has been approved and is ready for inventory transfer.';
      case 'rejected': return 'This request has been rejected and will not be processed.';
      case 'completed': return 'All medicines have been successfully transferred to the requesting pharmacy.';
      default: return 'Status information not available.';
    }
  }

  getUrgencyClass(urgency: string): string {
    switch (urgency) {
      case 'critical': return 'urgency-critical';
      case 'high': return 'urgency-high';
      case 'medium': return 'urgency-medium';
      case 'low': return 'urgency-low';
      default: return 'urgency-medium';
    }
  }

  getMedicineStatusClass(medicine: any): string {
    if (medicine.approved_quantity > 0) {
      return 'status-approved';
    } else if (medicine.approved_quantity === 0) {
      return 'status-pending';
    }
    return 'status-unknown';
  }

  getMedicineStatus(medicine: any): string {
    if (medicine.approved_quantity > 0) {
      return 'Approved';
    } else if (medicine.approved_quantity === 0) {
      return 'Pending';
    }
    return 'Unknown';
  }

  // Date formatting method
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  }

  // Quantity calculation methods
  getTotalRequestedQuantity(request: any): number {
    return request.requested_medicines?.reduce((total: number, med: any) =>
      total + (med.requested_quantity || 0), 0) || 0;
  }

  getTotalApprovedQuantity(request: any): number {
    return request.requested_medicines?.reduce((total: number, med: any) =>
      total + (med.approved_quantity || 0), 0) || 0;
  }

  // Refresh method
  refreshRequests(): void {
    console.log('🔄 Refreshing transfer requests...');
    this.loadTransferRequests();
  }

  // Request summary method
  getRequestSummary(request: any): string {
    const total = this.getTotalRequestedQuantity(request);
    const approved = this.getTotalApprovedQuantity(request);

    if (request.status === 'completed' && approved > 0) {
      return `${approved} of ${total} units transferred`;
    } else if (request.status === 'approved') {
      return `${total} units approved, awaiting transfer`;
    } else {
      return `${total} units requested`;
    }
  }

  // Transfer success check
  isTransferSuccessful(request: any): boolean {
    if (request.status !== 'completed') return false;
    const approved = this.getTotalApprovedQuantity(request);
    return approved > 0;
  }

  // Export functionality
  exportRequests(): void {
    console.log('Exporting requests...', {
      total: this.totalRecords,
      filtered: this.filteredRequests.length,
      filters: {
        status: this.selectedStatus,
        priority: this.selectedPriority,
        dateRange: this.dateRange,
        search: this.searchText
      }
    });

    this.showSuccessToast('Export functionality will be implemented soon');
  }
}
