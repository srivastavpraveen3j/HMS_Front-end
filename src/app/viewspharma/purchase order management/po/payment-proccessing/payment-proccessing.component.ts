// payment-processing.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { PaymentProcessingService, PaymentData } from './service/payment-processing.service';
import { InvoiceverificationService } from '../invoice-verification/service/invoiceverification.service';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { IndianCurrencyPipe } from '../../../../pipe/indian-currency.pipe';

@Component({
  selector: 'app-payment-processing',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, IndianCurrencyPipe],
  templateUrl: './payment-proccessing.component.html',
  styleUrl: './payment-proccessing.component.css'
})
export class PaymentProcessingComponent implements OnInit {

  // Data Properties
  pendingInvoices: any[] = [];
  filteredInvoices: any[] = [];
  selectedInvoices: any[] = [];
  isLoading: boolean = false;


  // Filter Properties
  searchQuery: string = '';
  vendorFilter: string = '';
  amountRangeMin: number = 0;
  amountRangeMax: number = 0;
  dueDateFilter: string = '';

  // Payment Form
  paymentForm: FormGroup;
  isProcessingPayment: boolean = false;

  // Modal States
  showPaymentModal: boolean = false;
  showBulkPaymentModal: boolean = false;
  selectedInvoice: any = null;

  // Statistics
  totalPendingAmount: number = 0;
  totalSelectedAmount: number = 0;
  overdueCount: number = 0;

  // ✅ UPDATED: Payment Methods with conditional logic
  paymentMethods = [
    { value: 'neft', label: 'NEFT (National Electronic Funds Transfer)', icon: 'fas fa-university', needsTransactionId: true, needsBankDetails: false },
    { value: 'rtgs', label: 'RTGS (Real Time Gross Settlement)', icon: 'fas fa-bolt', needsTransactionId: true, needsBankDetails: false },
    { value: 'upi', label: 'UPI (Unified Payments Interface)', icon: 'fas fa-mobile-alt', needsTransactionId: true, needsBankDetails: false },
    { value: 'cheque', label: 'Cheque', icon: 'fas fa-money-check', needsTransactionId: false, needsBankDetails: true },
    { value: 'cash', label: 'Cash Payment', icon: 'fas fa-money-bill-wave', needsTransactionId: false, needsBankDetails: false },
    { value: 'petipayment', label: 'Petty Cash Payment', icon: 'fas fa-coins', needsTransactionId: false, needsBankDetails: false },
    { value: 'other', label: 'Other', icon: 'fas fa-ellipsis-h', needsTransactionId: true, needsBankDetails: false }
  ];

  // Vendors for filtering
  vendorList: any[] = [];

  // User data
  userId: string = '';

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentProcessingService,
    private invoiceService: InvoiceverificationService,
    private router: Router,
  ) {
    this.paymentForm = this.fb.group({
      paymentMode: ['neft', Validators.required],
      transactionId: ['', []], // Dynamic validation will be added
      paymentDate: [new Date().toISOString().split('T')[0], Validators.required],
      remarks: [''],
      bankDetails: this.fb.group({
        bankName: [''],
        accountNumber: [''],
        ifscCode: ['', [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
        branchName: ['']
      })
    });
  }

  ngOnInit() {
    this.loadUserData();
    this.loadPendingInvoices();
    this.setupConditionalValidation();
  }

  // ✅ Load user data from localStorage
  loadUserData() {
    const userData = localStorage.getItem('authUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userId = user?._id || '';
        console.log('👤 Logged in user:', user.name, 'ID:', this.userId);
      } catch (e) {
        console.error('Error parsing authUser from localStorage:', e);
        Swal.fire('Error', 'User session invalid. Please login again.', 'error');
      }
    }
  }

  // ✅ ENHANCED: Setup conditional validation based on payment mode
  setupConditionalValidation() {
    this.paymentForm.get('paymentMode')?.valueChanges.subscribe(paymentMode => {
      this.updateValidationForPaymentMode(paymentMode);
    });

    // Initial validation setup
    this.updateValidationForPaymentMode(this.paymentForm.get('paymentMode')?.value);
  }

  // ✅ NEW: Update validation based on payment mode
  private updateValidationForPaymentMode(paymentMode: string) {
    const transactionIdControl = this.paymentForm.get('transactionId');
    const bankDetailsGroup = this.paymentForm.get('bankDetails') as FormGroup;

    console.log('🔄 Updating validation for payment mode:', paymentMode);

    // Clear all validators first
    transactionIdControl?.clearValidators();
    bankDetailsGroup.get('bankName')?.clearValidators();
    bankDetailsGroup.get('branchName')?.clearValidators();
    bankDetailsGroup.get('accountNumber')?.clearValidators();
    bankDetailsGroup.get('ifscCode')?.clearValidators();

    if (this.needsTransactionId(paymentMode)) {
      // RTGS, UPI, NEFT - Need Transaction ID
      transactionIdControl?.setValidators([Validators.required, Validators.minLength(6)]);
      console.log('✅ Transaction ID required for:', paymentMode);
    } else if (this.isChequePayment(paymentMode)) {
      // Cheque - Need Bank Details, no Transaction ID
      bankDetailsGroup.get('bankName')?.setValidators([Validators.required]);
      bankDetailsGroup.get('branchName')?.setValidators([Validators.required]);
      bankDetailsGroup.get('accountNumber')?.setValidators([Validators.required]);
      bankDetailsGroup.get('ifscCode')?.setValidators([Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]);

      // Auto-generate transaction ID for cheque
      transactionIdControl?.setValue('CHQ-' + Date.now().toString().slice(-8));
      console.log('✅ Bank details required for cheque payment');
    } else {
      // Cash, Petty Cash - Neither Transaction ID nor Bank Details
      transactionIdControl?.setValue('REF-' + paymentMode.toUpperCase() + '-' + Date.now().toString().slice(-6));
      console.log('✅ Auto-generated reference for:', paymentMode);
    }

    // Update validity
    transactionIdControl?.updateValueAndValidity();
    bankDetailsGroup.get('bankName')?.updateValueAndValidity();
    bankDetailsGroup.get('branchName')?.updateValueAndValidity();
    bankDetailsGroup.get('accountNumber')?.updateValueAndValidity();
    bankDetailsGroup.get('ifscCode')?.updateValueAndValidity();
  }

  // ✅ ENHANCED: Payment mode checking methods
  needsTransactionId(paymentMode: string): boolean {
    return ['rtgs', 'upi', 'neft'].includes(paymentMode?.toLowerCase());
  }

  isChequePayment(paymentMode: string): boolean {
    return paymentMode?.toLowerCase() === 'cheque';
  }

  isCashOrPettyPayment(paymentMode: string): boolean {
    return ['cash', 'petipayment'].includes(paymentMode?.toLowerCase());
  }

  needsBankDetails(paymentMode: string): boolean {
    return this.isChequePayment(paymentMode);
  }

  // ✅ Get payment method details
  getPaymentMethodDetails(paymentMode: string): any {
    return this.paymentMethods.find(m => m.value === paymentMode) || this.paymentMethods[0];
  }

  // ✅ Check if current payment mode needs transaction ID
  get currentPaymentModeNeedsTransactionId(): boolean {
    return this.needsTransactionId(this.paymentForm.get('paymentMode')?.value);
  }

  // ✅ Load pending invoices for payment
  loadPendingInvoices() {
    this.isLoading = true;

    this.paymentService.getPendingInvoicesForPayment()
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if (response.success && response.data) {
            this.pendingInvoices = response.data.invoices || response.data.data || [];
            this.filteredInvoices = [...this.pendingInvoices];
            this.loadVendorList();
            this.calculateStatistics();
            this.applyFilters();

            console.log('✅ Pending invoices loaded:', this.pendingInvoices.length);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Error loading pending invoices:', error);
        }
      });
  }

  // ✅ Load vendor list for filtering
  loadVendorList() {
    const uniqueVendors = this.pendingInvoices
      .map(invoice => invoice.vendor)
      .filter((vendor, index, self) =>
        vendor && self.findIndex(v => v.id === vendor.id) === index
      );

    this.vendorList = uniqueVendors;
  }

  // ✅ Calculate statistics
  calculateStatistics() {
    this.totalPendingAmount = this.pendingInvoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);
    this.totalSelectedAmount = this.selectedInvoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);

    // Calculate overdue invoices (more than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.overdueCount = this.pendingInvoices.filter(invoice =>
      new Date(invoice.verificationDate) < thirtyDaysAgo
    ).length;
  }

  // ✅ Apply filters
  applyFilters() {
    this.filteredInvoices = this.pendingInvoices.filter(invoice => {
      const matchesSearch = !this.searchQuery ||
        invoice.invoiceNo?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        invoice.grnNumber?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        invoice.vendor?.name?.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesVendor = !this.vendorFilter || invoice.vendor?.id === this.vendorFilter;

      const matchesAmountRange = (!this.amountRangeMin || invoice.grandTotal >= this.amountRangeMin) &&
                                (!this.amountRangeMax || invoice.grandTotal <= this.amountRangeMax);

      return matchesSearch && matchesVendor && matchesAmountRange;
    });
  }

  // ✅ Handle search
  onSearch() {
    this.applyFilters();
  }

  // ✅ Handle filter changes
  onFilterChange() {
    this.applyFilters();
  }

  // ✅ Toggle invoice selection
  toggleInvoiceSelection(invoice: any) {
    const index = this.selectedInvoices.findIndex(inv => inv._id === invoice._id);

    if (index > -1) {
      this.selectedInvoices.splice(index, 1);
    } else {
      this.selectedInvoices.push(invoice);
    }

    this.calculateStatistics();
  }

  // ✅ Check if invoice is selected
  isInvoiceSelected(invoice: any): boolean {
    return this.selectedInvoices.some(inv => inv._id === invoice._id);
  }

  // ✅ Select all visible invoices
  selectAllVisible() {
    this.filteredInvoices.forEach(invoice => {
      if (!this.isInvoiceSelected(invoice)) {
        this.selectedInvoices.push(invoice);
      }
    });
    this.calculateStatistics();
  }

  // ✅ Clear all selections
  clearAllSelections() {
    this.selectedInvoices = [];
    this.calculateStatistics();
  }

  // ✅ Open single payment modal
  openPaymentModal(invoice: any) {
    this.selectedInvoice = invoice;
    this.showPaymentModal = true;

    // Reset form and setup conditional validation
    this.paymentForm.patchValue({
      paymentMode: 'neft',
      paymentDate: new Date().toISOString().split('T')[0],
      remarks: `Payment for Invoice ${invoice.invoiceNo} - GRN ${invoice.grnNumber}`
    });

    // Trigger validation update
    this.updateValidationForPaymentMode('neft');
  }

  // ✅ Open bulk payment modal
  openBulkPaymentModal() {
    if (this.selectedInvoices.length === 0) {
      Swal.fire('Warning', 'Please select at least one invoice for bulk payment', 'warning');
      return;
    }

    this.showBulkPaymentModal = true;

    // Reset form and setup conditional validation
    this.paymentForm.patchValue({
      paymentMode: 'neft',
      paymentDate: new Date().toISOString().split('T')[0],
      remarks: `Bulk payment for ${this.selectedInvoices.length} invoices`
    });

    // Trigger validation update
    this.updateValidationForPaymentMode('neft');
  }

  // ✅ ENHANCED: Process single payment with better validation
  processSinglePayment() {
    // Force update validation before checking
    this.paymentForm.updateValueAndValidity();

    console.log('📋 Form validation status:', this.paymentForm.valid);
    console.log('📋 Form errors:', this.paymentForm.errors);
    console.log('📋 Payment mode:', this.paymentForm.get('paymentMode')?.value);
    console.log('📋 Transaction ID:', this.paymentForm.get('transactionId')?.value);

    if (this.paymentForm.invalid) {
      console.log('❌ Form is invalid');

      // Show specific error messages
      if (this.needsTransactionId(this.paymentForm.get('paymentMode')?.value) &&
          this.paymentForm.get('transactionId')?.invalid) {
        Swal.fire('Error', 'Transaction ID is required for this payment method', 'error');
      } else if (this.isChequePayment(this.paymentForm.get('paymentMode')?.value) &&
                 this.paymentForm.get('bankDetails')?.invalid) {
        Swal.fire('Error', 'Bank details are required for cheque payments', 'error');
      } else {
        Swal.fire('Error', 'Please fill all required fields correctly', 'error');
      }
      return;
    }

    if (!this.userId) {
      Swal.fire('Error', 'User session invalid. Please login again.', 'error');
      return;
    }

    this.isProcessingPayment = true;
    const paymentData: PaymentData = this.paymentForm.value;

    console.log('💰 Processing single payment for invoice:', this.selectedInvoice.invoiceNo);
    console.log('💳 Payment data:', paymentData);

    this.paymentService.processPayment(this.selectedInvoice._id, paymentData)
      .subscribe({
        next: (response) => {
          this.isProcessingPayment = false;

          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Payment Processed Successfully! ✅',
              html: `
                <div class="text-start">
                  <p><strong>Payment ID:</strong> ${response.summary.paymentId}</p>
                  <p><strong>Invoice Number:</strong> ${response.summary.invoiceNo}</p>
                  <p><strong>Amount:</strong> ₹${response.summary.amount.toFixed(2)}</p>
                  <p><strong>Payment Mode:</strong> ${paymentData.paymentMode.toUpperCase()}</p>
                  <p><strong>Transaction ID:</strong> ${response.summary.transactionId}</p>
                  <hr>
                  <p><strong>Status:</strong> <span class="badge bg-success">${response.summary.status}</span></p>
                </div>
              `,
              confirmButtonText: 'View Payment History',
              cancelButtonText: 'Process Another Payment',
              showCancelButton: true
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('/inventorylayout/paymentproccessinghistory');
              }

              this.closePaymentModal();
              this.loadPendingInvoices();
            });
          }
        },
        error: (error) => {
          this.isProcessingPayment = false;
          console.error('❌ Payment processing failed:', error);

          const errorMessage = error.error?.message || error.message || 'Payment processing failed';

          Swal.fire({
            icon: 'error',
            title: 'Payment Processing Failed',
            text: errorMessage,
            confirmButtonText: 'Try Again'
          });
        }
      });
  }

  // ✅ ENHANCED: Process bulk payment with better validation
  processBulkPayment() {
    this.paymentForm.updateValueAndValidity();

    if (this.paymentForm.invalid) {
      if (this.needsTransactionId(this.paymentForm.get('paymentMode')?.value) &&
          this.paymentForm.get('transactionId')?.invalid) {
        Swal.fire('Error', 'Transaction ID is required for this payment method', 'error');
      } else if (this.isChequePayment(this.paymentForm.get('paymentMode')?.value) &&
                 this.paymentForm.get('bankDetails')?.invalid) {
        Swal.fire('Error', 'Bank details are required for cheque payments', 'error');
      } else {
        Swal.fire('Error', 'Please fill all required fields correctly', 'error');
      }
      return;
    }

    if (this.selectedInvoices.length === 0) {
      Swal.fire('Error', 'No invoices selected for bulk payment', 'error');
      return;
    }

    if (!this.userId) {
      Swal.fire('Error', 'User session invalid. Please login again.', 'error');
      return;
    }

    // Show confirmation dialog
    Swal.fire({
      title: 'Confirm Bulk Payment',
      html: `
        <div class="text-start">
          <p><strong>Selected Invoices:</strong> ${this.selectedInvoices.length}</p>
          <p><strong>Total Amount:</strong> ₹${this.totalSelectedAmount.toFixed(2)}</p>
          <p><strong>Payment Mode:</strong> ${this.paymentForm.value.paymentMode.toUpperCase()}</p>
          <hr>
          <p class="text-warning"><small>This action cannot be undone. Please verify all details before proceeding.</small></p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm & Process',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745'
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeBulkPayment();
      }
    });
  }

  // ✅ Execute bulk payment
  private executeBulkPayment() {
    this.isProcessingPayment = true;
    const paymentData: PaymentData = this.paymentForm.value;
    const invoiceIds = this.selectedInvoices.map(inv => inv._id);

    console.log('💰 Processing bulk payment for invoices:', invoiceIds);

    this.paymentService.processBulkPayment(invoiceIds, paymentData)
      .subscribe({
        next: (response) => {
          this.isProcessingPayment = false;

          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Bulk Payment Processed Successfully! ✅',
              html: `
                <div class="text-start">
                  <p><strong>Invoices Processed:</strong> ${response.summary.processedCount}</p>
                  <p><strong>Total Amount:</strong> ₹${response.summary.totalAmount.toFixed(2)}</p>
                  <p><strong>Payment Mode:</strong> ${paymentData.paymentMode.toUpperCase()}</p>
                  <p><strong>Base Transaction ID:</strong> ${response.summary.transactionId}</p>
                  <hr>
                  <p><strong>Status:</strong> <span class="badge bg-success">${response.summary.status}</span></p>
                  <p><small class="text-muted">Individual transaction IDs have been generated for each invoice.</small></p>
                </div>
              `,
              confirmButtonText: 'View Payment History',
              cancelButtonText: 'Continue Processing',
              showCancelButton: true
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('/inventorylayout/paymentproccessinghistory');
              }

              this.closeBulkPaymentModal();
              this.loadPendingInvoices();
            });
          }
        },
        error: (error) => {
          this.isProcessingPayment = false;
          console.error('❌ Bulk payment processing failed:', error);

          const errorMessage = error.error?.message || error.message || 'Bulk payment processing failed';

          Swal.fire({
            icon: 'error',
            title: 'Bulk Payment Processing Failed',
            text: errorMessage,
            confirmButtonText: 'Try Again'
          });
        }
      });
  }

  // ✅ NEW: Get unique vendors count for bulk payment
  getUniqueVendorsCount(): number {
    const uniqueVendorIds = new Set(this.selectedInvoices.map(inv => inv.vendor?.id));
    return uniqueVendorIds.size;
  }

  // ✅ Close modals
  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedInvoice = null;
  }

  closeBulkPaymentModal() {
    this.showBulkPaymentModal = false;
  }

  // ✅ Get days since verification
  getDaysSinceVerification(verificationDate: string): number {
    const diffTime = Math.abs(new Date().getTime() - new Date(verificationDate).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // ✅ Check if invoice is overdue
  isOverdue(verificationDate: string): boolean {
    return this.getDaysSinceVerification(verificationDate) > 30;
  }

  // ✅ Get priority class for invoice
  getPriorityClass(verificationDate: string): string {
    const days = this.getDaysSinceVerification(verificationDate);
    if (days > 45) return 'table-danger';
    if (days > 30) return 'table-warning';
    if (days > 15) return 'table-info';
    return '';
  }

  // ✅ Refresh data
  refreshData() {
    this.clearAllSelections();
    this.loadPendingInvoices();
  }

  // ✅ Clear filters
  clearFilters() {
    this.searchQuery = '';
    this.vendorFilter = '';
    this.amountRangeMin = 0;
    this.amountRangeMax = 0;
    this.dueDateFilter = '';
    this.applyFilters();
  }

  // ✅ Export payment data
  exportPaymentData() {
    Swal.fire({
      title: 'Export Payment Data',
      html: `
        <div class="text-center">
          <p class="mb-4">Select the format for exporting payment data:</p>
          <div class="d-grid gap-2">
            <button id="exportExcel" class="btn btn-success btn-lg">
              <i class="fas fa-file-excel me-2"></i> Export as Excel
            </button>
            <button id="exportPDF" class="btn btn-danger btn-lg">
              <i class="fas fa-file-pdf me-2"></i> Export as PDF
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: '<i class="fas fa-times"></i> Cancel',
      didOpen: () => {
        const excelBtn = document.getElementById('exportExcel');
        const pdfBtn = document.getElementById('exportPDF');

        if (excelBtn) {
          excelBtn.addEventListener('click', () => {
            Swal.close();
            this.downloadReport('excel');
          });
        }

        if (pdfBtn) {
          pdfBtn.addEventListener('click', () => {
            Swal.close();
            this.downloadReport('pdf');
          });
        }
      }
    });
  }

  // ✅ Download report
  private downloadReport(format: 'excel' | 'pdf') {
    const filters = {
      status: 'pending',
      search: this.searchQuery || undefined,
      vendorId: this.vendorFilter || undefined,
      amountMin: this.amountRangeMin || undefined,
      amountMax: this.amountRangeMax || undefined
    };

    this.paymentService.generatePaymentReport(format, filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payment-report-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('❌ Error downloading report:', error);
        Swal.fire('Error', 'Failed to download report', 'error');
      }
    });
  }

  // ✅ Get payment method icon
  getPaymentMethodIcon(method: string): string {
    const found = this.paymentMethods.find(pm => pm.value === method);
    return found ? found.icon : 'fas fa-credit-card';
  }
}
