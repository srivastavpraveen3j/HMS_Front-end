// payment-processinglist.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { PaymentFilters, PaymentProcessingService } from '../../service/payment-processing.service';
import { Router, RouterModule } from '@angular/router';
import { IndianCurrencyPipe } from '../../../../../../pipe/indian-currency.pipe';
import { InvoiceverificationService } from '../../../invoice-verification/service/invoiceverification.service';

@Component({
  selector: 'app-payment-processinglist',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, IndianCurrencyPipe],
  templateUrl: './payment-processinglist.component.html',
  styleUrl: './payment-processinglist.component.css'
})
export class PaymentProcessinglistComponent implements OnInit {

  // ✅ NEW: Main Tab Management
  mainActiveTab: string = 'payment-history';

  // Existing properties for payment history...
  paymentHistory: any[] = [];
  filteredPayments: any[] = [];
  overduePayments: any[] = [];
  paymentStatistics: any = {};
  isLoading: boolean = false;

  // ✅ NEW: Pending Invoices Properties
  pendingInvoices: any[] = [];
  filteredPendingInvoices: any[] = [];
  selectedInvoices: any[] = [];
  isLoadingPending: boolean = false;

  // ✅ NEW: Pending Invoice Statistics
  totalPendingAmount: number = 0;
  totalSelectedAmount: number = 0;
  overdueInvoicesCount: number = 0;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // Filter Properties
  searchQuery: string = '';
  statusFilter: string = '';
  paymentModeFilter: string = '';
  vendorFilter: string = '';
  fromDate: string = '';
  toDate: string = '';

  // ✅ NEW: Pending Invoice Filters
  pendingSearchQuery: string = '';
  pendingVendorFilter: string = '';
  pendingAmountRangeMin: number = 0;
  pendingAmountRangeMax: number = 0;

  // Modal States
  selectedPayment: any = null;
  showPaymentDetailsModal: boolean = false;
  showStatisticsModal: boolean = false;
  showOverdueModal: boolean = false;

  // Cheque Preview Modal
  showChequePreviewModal: boolean = false;
  selectedChequePayment: any = null;

  // Tab Management for Payment History
  activeTab: string = 'all';

  // Filter Options
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'initiated', label: 'Initiated' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  paymentModeOptions = [
    { value: '', label: 'All Payment Modes' },
    { value: 'neft', label: 'NEFT' },
    { value: 'rtgs', label: 'RTGS' },
    { value: 'upi', label: 'UPI' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'cash', label: 'Cash' },
    { value: 'petipayment', label: 'Petty Cash' },
    { value: 'other', label: 'Other' }
  ];

  vendorList: any[] = [];

  constructor(
    private paymentService: PaymentProcessingService,
    private invoiceService: InvoiceverificationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.setDefaultDateRange();
    this.loadInitialData();
  }

  setMainActiveTab(tab: string) {
    this.mainActiveTab = tab;

    if (tab === 'payment-history') {
      this.loadPaymentHistory();
    } else if (tab === 'pending-invoices') {
      this.loadPendingInvoices();
    }
  }

  setDefaultDateRange() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    this.fromDate = todayString;
    this.toDate = todayString;

    console.log('✅ Default date range set to today:', todayString);
  }

  loadInitialData() {
    this.loadPaymentHistory();
    this.loadPaymentStatistics();
    this.loadOverduePayments();
    this.loadPendingInvoices();
  }

  // ✅ Enhanced showChequePreview method with debug logs
  showChequePreview(payment: any) {
    console.log('🔍 Showing cheque preview for:', payment);

    if (payment.paymentMode !== 'cheque') {
      console.warn('❌ Payment mode is not cheque:', payment.paymentMode);
      Swal.fire('Error', 'Cheque preview is only available for cheque payments', 'error');
      return;
    }

    console.log('📋 Fetching payment details for cheque preview...');

    this.paymentService.getPaymentById(payment._id)
      .subscribe({
        next: (response) => {
          console.log('✅ Payment details fetched:', response);

          if (response.success && response.data) {
            this.selectedChequePayment = response.data;
            this.showChequePreviewModal = true;

            console.log('✅ Cheque modal should be visible now');
            console.log('Modal state:', this.showChequePreviewModal);
            console.log('Selected cheque payment:', this.selectedChequePayment);
          } else {
            console.warn('⚠️ No data in response, using original payment object');
            this.selectedChequePayment = payment;
            this.showChequePreviewModal = true;
          }
        },
        error: (error) => {
          console.error('❌ Error fetching payment details:', error);
          console.log('🔄 Fallback: using original payment object');
          this.selectedChequePayment = payment;
          this.showChequePreviewModal = true;
        }
      });
  }

  // All your existing methods...
  loadPendingInvoices() {
    this.isLoadingPending = true;

    this.paymentService.getPendingInvoicesForPayment()
      .subscribe({
        next: (response) => {
          this.isLoadingPending = false;

          if (response.success && response.data) {
            this.pendingInvoices = response.data.invoices || response.data.data || [];
            this.filteredPendingInvoices = [...this.pendingInvoices];
            this.calculatePendingStatistics();
            this.applyPendingFilters();

            console.log('✅ Pending invoices loaded:', this.pendingInvoices.length);
          }
        },
        error: (error) => {
          this.isLoadingPending = false;
          console.error('❌ Error loading pending invoices:', error);

          Swal.fire({
            icon: 'error',
            title: 'Loading Failed',
            text: 'Failed to load pending invoices',
            toast: true,
            position: 'top-right',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
  }

  calculatePendingStatistics() {
    this.totalPendingAmount = this.pendingInvoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);
    this.totalSelectedAmount = this.selectedInvoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.overdueInvoicesCount = this.pendingInvoices.filter(invoice =>
      new Date(invoice.verificationDate) < thirtyDaysAgo
    ).length;
  }

  applyPendingFilters() {
    this.filteredPendingInvoices = this.pendingInvoices.filter(invoice => {
      const matchesSearch = !this.pendingSearchQuery ||
        invoice.invoiceNo?.toLowerCase().includes(this.pendingSearchQuery.toLowerCase()) ||
        invoice.grnNumber?.toLowerCase().includes(this.pendingSearchQuery.toLowerCase()) ||
        invoice.vendor?.name?.toLowerCase().includes(this.pendingSearchQuery.toLowerCase());

      const matchesVendor = !this.pendingVendorFilter || invoice.vendor?.id === this.pendingVendorFilter;

      const matchesAmountRange = (!this.pendingAmountRangeMin || invoice.grandTotal >= this.pendingAmountRangeMin) &&
                                (!this.pendingAmountRangeMax || invoice.grandTotal <= this.pendingAmountRangeMax);

      return matchesSearch && matchesVendor && matchesAmountRange;
    });
  }

  onPendingSearch() {
    this.applyPendingFilters();
  }

  onPendingFilterChange() {
    this.applyPendingFilters();
  }

  toggleInvoiceSelection(invoice: any) {
    const index = this.selectedInvoices.findIndex(inv => inv._id === invoice._id);

    if (index > -1) {
      this.selectedInvoices.splice(index, 1);
    } else {
      this.selectedInvoices.push(invoice);
    }

    this.calculatePendingStatistics();
  }

  isInvoiceSelected(invoice: any): boolean {
    return this.selectedInvoices.some(inv => inv._id === invoice._id);
  }

  selectAllVisibleInvoices() {
    this.filteredPendingInvoices.forEach(invoice => {
      if (!this.isInvoiceSelected(invoice)) {
        this.selectedInvoices.push(invoice);
      }
    });
    this.calculatePendingStatistics();
  }

  clearAllInvoiceSelections() {
    this.selectedInvoices = [];
    this.calculatePendingStatistics();
  }

  getDaysSinceVerification(verificationDate: string): number {
    const diffTime = Math.abs(new Date().getTime() - new Date(verificationDate).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isInvoiceOverdue(verificationDate: string): boolean {
    return this.getDaysSinceVerification(verificationDate) > 30;
  }

  getInvoicePriorityClass(verificationDate: string): string {
    const days = this.getDaysSinceVerification(verificationDate);
    if (days > 45) return 'table-danger';
    if (days > 30) return 'table-warning';
    if (days > 15) return 'table-info';
    return '';
  }

  clearPendingFilters() {
    this.pendingSearchQuery = '';
    this.pendingVendorFilter = '';
    this.pendingAmountRangeMin = 0;
    this.pendingAmountRangeMax = 0;
    this.applyPendingFilters();
  }

  // ✅ Navigation method for bulk payment
  navigateToPaymentProcessing() {
    if (this.selectedInvoices.length === 0) {
      Swal.fire('Warning', 'Please select at least one invoice to process payment', 'warning');
      return;
    }

    const queryParams = {
      selectedInvoices: this.selectedInvoices.map(inv => inv._id).join(','),
      totalAmount: this.totalSelectedAmount,
      count: this.selectedInvoices.length
    };

    this.router.navigate(['/inventorylayout/paymentproccessing'], {
      queryParams: queryParams
    });
  }

  // All existing methods (loadPaymentHistory, loadPaymentStatistics, etc.)...
  loadPaymentHistory() {
    this.isLoading = true;

    const filters: PaymentFilters = {
      status: this.statusFilter || undefined,
      paymentMode: this.paymentModeFilter || undefined,
      vendorId: this.vendorFilter || undefined,
      fromDate: this.fromDate || undefined,
      toDate: this.toDate || undefined,
      search: this.searchQuery || undefined
    };

    this.paymentService.getPaymentHistory(this.currentPage, this.itemsPerPage, filters)
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if (response.success && response.data) {
            this.paymentHistory = response.data.payments || [];
            this.filteredPayments = [...this.paymentHistory];

            if (response.data.pagination) {
              this.totalItems = response.data.pagination.total;
              this.totalPages = response.data.pagination.totalPages;
              this.currentPage = response.data.pagination.page;
            }

            this.loadVendorList();
            this.applyTabFilter();
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Error loading payment history:', error);

          Swal.fire({
            icon: 'error',
            title: 'Loading Failed',
            text: 'Failed to load payment history',
            toast: true,
            position: 'top-right',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
  }

  loadPaymentStatistics() {
    this.paymentService.getPaymentStatistics(this.fromDate, this.toDate)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.paymentStatistics = response.data;
          } else {
            this.paymentStatistics = {
              summary: {
                totalPayments: 0,
                totalAmount: 0,
                completedPayments: 0,
                completedAmount: 0,
                processingPayments: 0,
                processingAmount: 0,
                failedPayments: 0
              },
              paymentModes: []
            };
          }
        },
        error: (error) => {
          console.error('❌ Error loading payment statistics:', error);
          this.paymentStatistics = {
            summary: {
              totalPayments: 0,
              totalAmount: 0,
              completedPayments: 0,
              completedAmount: 0,
              processingPayments: 0,
              processingAmount: 0,
              failedPayments: 0
            },
            paymentModes: []
          };
        }
      });
  }

  // Date filter methods
  onDateChange() {
    this.onFilterChange();
  }

  setTodayFilter() {
    const today = new Date().toISOString().split('T')[0];
    this.fromDate = today;
    this.toDate = today;
    this.onFilterChange();
  }

  setYesterdayFilter() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    this.fromDate = yesterdayString;
    this.toDate = yesterdayString;
    this.onFilterChange();
  }

  setThisWeekFilter() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);

    this.fromDate = monday.toISOString().split('T')[0];
    this.toDate = today.toISOString().split('T')[0];
    this.onFilterChange();
  }

  setThisMonthFilter() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    this.fromDate = firstDay.toISOString().split('T')[0];
    this.toDate = today.toISOString().split('T')[0];
    this.onFilterChange();
  }

  clearAllDates() {
    this.fromDate = '';
    this.toDate = '';
    this.onFilterChange();
  }

  getFilterSummary(): string {
    if (this.fromDate && this.toDate) {
      const from = new Date(this.fromDate);
      const to = new Date(this.toDate);
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      if (this.fromDate === this.toDate && this.fromDate === todayStr) {
        return "Today's payments";
      } else if (this.fromDate === this.toDate) {
        return `Payments for ${from.toLocaleDateString('en-IN')}`;
      } else {
        return `Payments from ${from.toLocaleDateString('en-IN')} to ${to.toLocaleDateString('en-IN')}`;
      }
    }
    return 'All payments';
  }

  isShowingTodayData(): boolean {
    const today = new Date().toISOString().split('T')[0];
    return this.fromDate === today && this.toDate === today;
  }

  clearFilters() {
    this.searchQuery = '';
    this.statusFilter = '';
    this.paymentModeFilter = '';
    this.vendorFilter = '';

    this.setDefaultDateRange();

    this.activeTab = 'all';
    this.currentPage = 1;
    this.loadPaymentHistory();
  }

  refreshData() {
    if (this.mainActiveTab === 'payment-history') {
      this.loadInitialData();
    } else {
      this.loadPendingInvoices();
    }
  }

  onSearch() {
    this.currentPage = 1;
    this.loadPaymentHistory();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadPaymentHistory();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPaymentHistory();
    }
  }

  onTabChange(tab: string) {
    this.activeTab = tab;
    this.applyTabFilter();
  }

  loadOverduePayments() {
    this.paymentService.getOverduePayments()
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.overduePayments = response.data;
          } else {
            this.overduePayments = [];
          }
        },
        error: (error) => {
          console.error('❌ Error loading overdue payments:', error);
          this.overduePayments = [];
        }
      });
  }

  loadVendorList() {
    const uniqueVendors = this.paymentHistory
      .map(payment => payment.vendor)
      .filter((vendor, index, self) =>
        vendor && self.findIndex(v => v.id === vendor.id) === index
      );

    this.vendorList = uniqueVendors;
  }

  applyTabFilter() {
    switch (this.activeTab) {
      case 'completed':
        this.filteredPayments = this.paymentHistory.filter(p => p.status === 'completed');
        break;
      case 'processing':
        this.filteredPayments = this.paymentHistory.filter(p =>
          p.status === 'processing' || p.status === 'initiated'
        );
        break;
      case 'overdue':
        this.filteredPayments = this.overduePayments;
        break;
      case 'all':
      default:
        this.filteredPayments = [...this.paymentHistory];
        break;
    }

    this.applyFilters();
  }

  applyFilters() {
    this.filteredPayments = this.filteredPayments.filter(payment => {
      const matchesSearch = !this.searchQuery ||
        payment.paymentId?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        payment.invoiceNo?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        payment.vendor?.name?.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesSearch;
    });
  }

  viewPaymentDetails(payment: any) {
    this.paymentService.getPaymentById(payment._id)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.selectedPayment = response.data;
            this.showPaymentDetailsModal = true;
          }
        },
        error: (error) => {
          console.error('❌ Error fetching payment details:', error);
          this.selectedPayment = payment;
          this.showPaymentDetailsModal = true;
        }
      });
  }

  showStatistics() {
    this.loadPaymentStatistics();
    this.showStatisticsModal = true;
  }

  showOverduePayments() {
    this.loadOverduePayments();
    this.showOverdueModal = true;
  }

  // Close methods
  closePaymentDetailsModal() {
    this.showPaymentDetailsModal = false;
    this.selectedPayment = null;
  }

  closeStatisticsModal() {
    this.showStatisticsModal = false;
  }

  closeOverdueModal() {
    this.showOverdueModal = false;
  }

  closeChequePreviewModal() {
    console.log('🔒 Closing cheque preview modal');
    this.showChequePreviewModal = false;
    this.selectedChequePayment = null;
  }

  closeAllModals() {
    if (this.showPaymentDetailsModal) {
      this.closePaymentDetailsModal();
    } else if (this.showStatisticsModal) {
      this.closeStatisticsModal();
    } else if (this.showOverdueModal) {
      this.closeOverdueModal();
    } else if (this.showChequePreviewModal) {
      this.closeChequePreviewModal();
    }
  }

  // CSS class methods
  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-success';
      case 'processing': return 'bg-warning';
      case 'initiated': return 'bg-info';
      case 'failed': return 'bg-danger';
      case 'cancelled': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  getPaymentModeIcon(mode: string): string {
    switch (mode?.toLowerCase()) {
      case 'neft': return 'fas fa-university';
      case 'rtgs': return 'fas fa-bolt';
      case 'upi': return 'fas fa-mobile-alt';
      case 'cheque': return 'fas fa-money-check';
      case 'cash': return 'fas fa-money-bill-wave';
      case 'petipayment': return 'fas fa-coins';
      default: return 'fas fa-credit-card';
    }
  }

  getDaysSincePayment(paymentDate: string): number {
    const diffTime = Math.abs(new Date().getTime() - new Date(paymentDate).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getPaginationArray(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  get totalOverdueAmount(): number {
    return this.overduePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  }

  get oldestOverdueDays(): number {
    if (this.overduePayments.length === 0) return 0;

    const oldestPayment = this.overduePayments.reduce((oldest, current) => {
      const oldestDate = new Date(oldest.initiatedDate).getTime();
      const currentDate = new Date(current.initiatedDate).getTime();
      return currentDate < oldestDate ? current : oldest;
    });

    return this.getDaysSincePayment(oldestPayment.initiatedDate);
  }

  // Export methods and other utility methods...
  exportPaymentData() {
    Swal.fire({
      title: 'Export Payment Data',
      html: `
        <div class="text-center">
          <p class="mb-4">Select the format for exporting payment data:</p>
          <div class="d-grid gap-2">
            <button id="exportCSV" class="btn btn-primary btn-lg">
              <i class="fas fa-file-csv me-2"></i> Export as CSV
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: '<i class="fas fa-times"></i> Cancel',
      didOpen: () => {
        const csvBtn = document.getElementById('exportCSV');
        if (csvBtn) {
          csvBtn.addEventListener('click', () => {
            Swal.close();
            this.exportToCSV();
          });
        }
      }
    });
  }

  exportToCSV() {
    try {
      const dataToExport = this.filteredPayments.map(payment => ({
        'Payment ID': payment.paymentId || '',
        'Invoice Number': payment.invoiceNo || '',
        'GRN Number': payment.grnNumber || '',
        'Vendor Name': payment.vendor?.name || '',
        'Vendor Email': payment.vendor?.email || '',
        'Amount': payment.amount || 0,
        'Payment Mode': payment.paymentMode || '',
        'Status': payment.status || '',
        'Payment Date': payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '',
        'Transaction ID': payment.transactionId || '',
        'Remarks': payment.remarks || ''
      }));

      if (dataToExport.length === 0) {
        Swal.fire('Warning', 'No data available to export', 'warning');
        return;
      }

      const csvContent = this.convertToCSV(dataToExport);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `payment-history-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({
        icon: 'success',
        title: 'Export Successful!',
        text: `Exported ${dataToExport.length} payment records to CSV`,
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('❌ CSV Export Error:', error);
      Swal.fire('Error', 'Failed to export CSV file', 'error');
    }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    const csvRows = data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  }

  // Cheque related methods
printCheque(): void {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  // Create simple cheque content based on your image
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cheque - ${this.selectedChequePayment?.transactionId || 'N/A'}</title>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Times New Roman', serif;
            background: white;
            padding: 20mm;
            color: #000;
          }

          .cheque-container {
            width: 100%;
            border: 2px solid #000;
            padding: 30px;
            min-height: 300px;
            background: white;
          }

          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            border-bottom: 1px solid #000;
            padding-bottom: 15px;
          }

          .ac-pay {
            font-size: 16px;
            font-weight: bold;
          }

          .cheque-number {
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 3px;
          }

          .payee-section {
            margin: 50px 0;
            text-align: left;
          }

          .payee-name {
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .amount-words-section {
            margin: 60px 0;
            text-align: left;
          }

          .amount-words {
            font-size: 18px;
            font-weight: bold;
            text-transform: capitalize;
          }

          .amount-number-section {
            text-align: right;
            margin: 40px 0;
          }

          .amount-number {
            font-size: 22px;
            font-weight: bold;
            border: 2px solid #000;
            padding: 10px 20px;
            display: inline-block;
            min-width: 150px;
            text-align: center;
          }

          .signature-area {
            height: 80px;
            margin-top: 60px;
          }

          @page {
            size: A4 landscape;
            margin: 15mm;
          }

          @media print {
            body {
              padding: 10mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="cheque-container">
          <!-- Header with A/C Pay and Number -->
          <div class="header-row">
            <div class="ac-pay">A/C Pay</div>
            <div class="cheque-number">${this.selectedChequePayment?.transactionId?.slice(-8) || '19072025'}</div>
          </div>

          <!-- Payee Name -->
          <div class="payee-section">
            <div class="payee-name">${this.selectedChequePayment?.vendor?.name?.toUpperCase() || 'SS ENTERPRISE'}</div>
          </div>

          <!-- Amount in Words -->
          <div class="amount-words-section">
            <div class="amount-words">${this.getAmountInWords()}</div>
          </div>

          <!-- Amount in Numbers -->
          <div class="amount-number-section">
            <div class="amount-number">${this.getAmountValue().toFixed(2)}</div>
          </div>

          <!-- Signature Area -->
          <div class="signature-area"></div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };

          window.onafterprint = function() {
            window.close();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
}

  formatChequeDate(date: string | Date): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  getAmountValue(): number {
    return this.selectedChequePayment?.amount || 0;
  }

  getAmountInWords(): string {
    try {
      const amount = this.selectedChequePayment?.amount;
      if (!amount || amount <= 0) {
        return 'Zero Only';
      }

      const result = this.numberToWords(amount);
      return result || 'Zero Only';

    } catch (error) {
      console.error('Error converting amount to words:', error);
      return 'Zero Only';
    }
  }

  numberToWords(amount: number): string {
    try {
      if (!amount || amount <= 0) return 'Zero Only';

      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const thousands = ['', 'Thousand', 'Million', 'Billion'];

      const parts = amount.toString().split('.');
      const rupees = parseInt(parts[0]);
      const paisa = parts[1] ? parseInt(parts[1].padEnd(2, '0').substring(0, 2)) : 0;

      let result = '';

      if (rupees > 0) {
        result = this.convertToWords(rupees, ones, teens, tens, thousands);
        result += rupees === 1 ? ' Rupee' : ' Rupees';
      }

      if (paisa > 0) {
        if (result) result += ' and ';
        result += this.convertToWords(paisa, ones, teens, tens, thousands);
        result += paisa === 1 ? ' Paisa' : ' Paisa';
      }

      if (!result.trim()) {
        result = 'Zero Rupees';
      }

      return result.trim() + ' Only';

    } catch (error) {
      console.error('Error in numberToWords:', error);
      return 'Zero Only';
    }
  }

  private convertToWords(num: number, ones: string[], teens: string[], tens: string[], thousands: string[]): string {
    if (num === 0) return '';

    function convertHundreds(n: number): string {
      let result = '';

      if (n > 99) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }

      if (n > 19) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n > 9) {
        result += teens[n - 10] + ' ';
        return result;
      }

      if (n > 0) {
        result += ones[n] + ' ';
      }

      return result;
    }

    const parts = [];
    let thousandCounter = 0;

    while (num > 0) {
      if (num % 1000 !== 0) {
        parts.push(convertHundreds(num % 1000) + thousands[thousandCounter]);
      }
      num = Math.floor(num / 1000);
      thousandCounter++;
    }

    return parts.reverse().join(' ').trim();
  }

  getBankDisplayInfo() {
    const bankName = this.selectedChequePayment?.vendor?.accountDetails?.bankName || 'STATE BANK OF INDIA';

    const bankDatabase: { [key: string]: { hindi?: string, country?: string } } = {
      'STATE BANK OF INDIA': { hindi: 'भारतीय स्टेट बैंक' },
      'PUNJAB NATIONAL BANK': { hindi: 'पंजाब नेशनल बैंक' },
      'BANK OF INDIA': { hindi: 'बैंक ऑफ इंडिया' },
      'CANARA BANK': { hindi: 'केनरा बैंक' },
      'HDFC BANK': { hindi: 'एचडीएफसी बैंक' },
      'ICICI BANK': { hindi: 'आईसीआईसीआई बैंक' },
      'KOTAK MAHINDRA BANK': { hindi: 'कोटक महिंद्रा बैंक' }
    };

    const bankInfo = bankDatabase[bankName.toUpperCase()] || {};

    return {
      english: bankName,
      hindi: bankInfo.hindi || null,
      country: bankInfo.country || null,
      isIndian: !!bankInfo.hindi
    };
  }

  cancelPayment(payment: any) {
    if (payment.status === 'completed') {
      Swal.fire('Error', 'Cannot cancel completed payment', 'error');
      return;
    }

    Swal.fire({
      title: 'Cancel Payment',
      html: `
        <p>Are you sure you want to cancel this payment?</p>
        <div class="text-start mt-3">
          <strong>Payment ID:</strong> ${payment.paymentId}<br>
          <strong>Invoice:</strong> ${payment.invoiceNo}<br>
          <strong>Amount:</strong> ₹${payment.amount ? payment.amount.toFixed(2) : '0.00'}
        </div>
        <div class="mt-3">
          <textarea id="cancelReason" class="form-control" placeholder="Reason for cancellation (required)" rows="3"></textarea>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel Payment',
      cancelButtonText: 'No, Keep Payment',
      confirmButtonColor: '#dc3545',
      preConfirm: () => {
        const reason = (document.getElementById('cancelReason') as HTMLTextAreaElement)?.value;
        if (!reason || reason.trim().length < 10) {
          Swal.showValidationMessage('Please provide a reason (minimum 10 characters)');
          return false;
        }
        return reason.trim();
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeCancelPayment(payment._id, result.value);
      }
    });
  }

  private executeCancelPayment(paymentId: string, reason: string) {
    this.paymentService.cancelPayment(paymentId, reason)
      .subscribe({
        next: (response) => {
          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Payment Cancelled',
              text: 'Payment has been cancelled successfully',
              timer: 2000,
              showConfirmButton: false
            });

            this.loadPaymentHistory();
          }
        },
        error: (error) => {
          console.error('❌ Error cancelling payment:', error);
          Swal.fire('Error', 'Failed to cancel payment', 'error');
        }
      });
  }

  // Helper methods
  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  Math = Math;

  getCurrentDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  isValidDate(dateString: string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  getMaxSelectableDate(): string {
    return this.getTodayString();
  }

  formatDateForDisplay(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch (error) {
      return 'Invalid Date';
    }
  }

  print() {
    const opdElement = document.getElementById('payment-sheet');
    if (!opdElement) return;

    const opdClone = opdElement.cloneNode(true) as HTMLElement;

    const images = opdClone.querySelectorAll('img');
    const convertImageToBase64 = (img: HTMLImageElement) => {
      return new Promise<void>((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = img.src;
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          img.src = canvas.toDataURL('image/png');
          resolve();
        };
        image.onerror = () => resolve();
      });
    };

    Promise.all(
      Array.from(images).map((img) => convertImageToBase64(img))
    ).then(() => {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) return;

      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((style) => style.outerHTML)
        .join('\n');

      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice Verification List</title>
            ${styles}
            <style>
              .no-print { display: none !important; }
            </style>
          </head>
          <body>
            <div>${opdClone.outerHTML}</div>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      };
    });
  }

  hasBankDetails(payment: any): boolean {
    if (!payment?.bankDetails) return false;

    const bankDetails = payment.bankDetails;

    return !!(
      bankDetails.payerBank ||
      bankDetails.payeeBank ||
      bankDetails.chequenNumber ||
      bankDetails.bankCharges ||
      bankDetails.accountNumber ||
      bankDetails.ifscCode ||
      bankDetails.bankName
    );
  }

  hasMeaningfulBankData(payment: any): boolean {
    const bankDetails = payment?.bankDetails;

    return !!(
      (bankDetails?.payerBank && bankDetails.payerBank.trim()) ||
      (bankDetails?.payeeBank && bankDetails.payeeBank.trim()) ||
      (bankDetails?.chequenNumber && bankDetails.chequenNumber.trim()) ||
      (bankDetails?.bankCharges && bankDetails.bankCharges > 0)
    );
  }

  async pdfOPDSheet(): Promise<void> {
    const DATA: HTMLElement | null = document.getElementById('payment-sheet');
    if (!DATA) {
      console.error('Invoice modal element not found.');
      return;
    }

    const clone = DATA.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.no-print').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;

      const canvas: HTMLCanvasElement = await html2canvas(clone, { scale: 2 });
      const imgData: string = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      let heightLeft = pdfHeight;
      let position = 0;

      while (heightLeft > pdf.internal.pageSize.getHeight()) {
        position = heightLeft - pdf.internal.pageSize.getHeight();
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      const today = new Date().toISOString().slice(0, 10);
      pdf.save(`INVOICE-${this.selectedPayment?.invoiceNo || today}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'PDF Generation Failed',
        text: 'Failed to generate PDF. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      document.body.removeChild(clone);
    }
  }

  // ✅ Query params methods
  getSelectedInvoiceIds(): string {
    return this.selectedInvoices.map(inv => inv._id).join(',');
  }

  get bulkPaymentQueryParams(): any {
    return {
      selectedInvoices: this.selectedInvoices.map(inv => inv._id).join(',')
    };
  }

  getBulkPaymentQueryParams(): any {
    if (this.selectedInvoices.length === 0) {
      return {};
    }

    return {
      selectedInvoices: this.selectedInvoices.map(inv => inv._id).join(','),
      totalAmount: this.totalSelectedAmount,
      count: this.selectedInvoices.length
    };
  }
}
