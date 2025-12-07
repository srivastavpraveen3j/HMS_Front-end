import { PaymentData } from './../../service/payment-processing.service';
// paymentprocessinghistory.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { PaymentFilters, PaymentProcessingService } from '../../service/payment-processing.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-paymentprocessinghistory',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './paymentprocessinghistory.component.html',
  styleUrl: './paymentprocessinghistory.component.css'
})
export class PaymentprocessinghistoryComponent implements OnInit {

  // Data Properties
  paymentHistory: any[] = [];
  filteredPayments: any[] = [];
  vendorCards: any[] = [];
  selectedVendor: any = null;
  isLoading: boolean = false;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;

  // Filter Properties
  searchQuery: string = '';
  statusFilter: string = '';
  paymentModeFilter: string = '';
  selectedVendorId: string = '';
  fromDate: string = '';
  toDate: string = '';

  // Date Range Presets
  dateRangePresets = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'This Year', days: 365 },
    { label: 'All Time', days: -1 }
  ];

  // Modal States
  selectedPayment: any = null;
  showPaymentDetailsModal: boolean = false;
  showVendorDetailsModal: boolean = false;

  // Statistics
  totalPaymentAmount: number = 0;
  completedPayments: number = 0;
  processingPayments: number = 0;

  // Filter Options
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'processing', label: 'Processing' },
    { value: 'initiated', label: 'Initiated' },
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

  constructor(private paymentService: PaymentProcessingService ) { }

  ngOnInit() {
    this.setDefaultDateRange();
    this.loadPaymentHistory();
  }

  // ✅ Set default date range (last 30 days)
// ✅ UPDATED: Set default to show today's data only
setDefaultDateRange() {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // Set both from and to date to today to show only today's data
  this.fromDate = todayString;
  this.toDate = todayString;
}


  // ✅ Load payment history
  loadPaymentHistory() {
    this.isLoading = true;

    const filters: PaymentFilters = {
      status: this.statusFilter || undefined,
      paymentMode: this.paymentModeFilter || undefined,
      vendorId: this.selectedVendorId || undefined,
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

            // Handle pagination
            if (response.data.pagination) {
              this.totalItems = response.data.pagination.total;
              this.totalPages = response.data.pagination.totalPages;
              this.currentPage = response.data.pagination.page;
            }

            this.generateVendorCards();
            this.calculateStatistics();

            console.log('✅ Payment history loaded:', this.paymentHistory.length);
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

  // ✅ Generate vendor cards from payment data
  generateVendorCards() {
    const vendorMap = new Map();

    this.paymentHistory.forEach(payment => {
      if (payment.vendor && payment.vendor.id) {
        const vendorId = payment.vendor.id;

        if (vendorMap.has(vendorId)) {
          const existing = vendorMap.get(vendorId);
          existing.totalPayments += 1;
          existing.totalAmount += payment.amount;
          existing.lastPaymentDate = new Date(Math.max(
            new Date(existing.lastPaymentDate).getTime(),
            new Date(payment.paymentDate).getTime()
          ));

          // Count by status
          if (payment.status === 'completed') existing.completedCount++;
          else if (payment.status === 'processing') existing.processingCount++;
          else if (payment.status === 'failed') existing.failedCount++;

        } else {
          vendorMap.set(vendorId, {
            id: vendorId,
            name: payment.vendor.name,
            email: payment.vendor.email,
            totalPayments: 1,
            totalAmount: payment.amount,
            lastPaymentDate: new Date(payment.paymentDate),
            completedCount: payment.status === 'completed' ? 1 : 0,
            processingCount: payment.status === 'processing' ? 1 : 0,
            failedCount: payment.status === 'failed' ? 1 : 0,
            payments: []
          });
        }

        // Add payment to vendor's payment list
        vendorMap.get(vendorId).payments.push(payment);
      }
    });

    this.vendorCards = Array.from(vendorMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount); // Sort by total amount

    console.log('✅ Vendor cards generated:', this.vendorCards.length);
  }

  // ✅ Calculate statistics
  calculateStatistics() {
    this.totalPaymentAmount = this.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    this.completedPayments = this.paymentHistory.filter(p => p.status === 'completed').length;
    this.processingPayments = this.paymentHistory.filter(p => p.status === 'processing').length;
  }

  // ✅ Select vendor and filter payments
  selectVendor(vendor: any) {
    this.selectedVendor = vendor;
    this.selectedVendorId = vendor.id;
    this.currentPage = 1;
    this.loadPaymentHistory();
  }

  // ✅ Clear vendor selection
  clearVendorSelection() {
    this.selectedVendor = null;
    this.selectedVendorId = '';
    this.currentPage = 1;
    this.loadPaymentHistory();
  }

  // ✅ Apply date range preset
  applyDateRangePreset(preset: any) {
    const today = new Date();
    this.toDate = today.toISOString().split('T')[0];

    if (preset.days === -1) {
      // All time
      this.fromDate = '';
      this.toDate = '';
    } else if (preset.days === 0) {
      // Today
      this.fromDate = today.toISOString().split('T')[0];
    } else {
      // Days ago
      const startDate = new Date(today.getTime() - (preset.days * 24 * 60 * 60 * 1000));
      this.fromDate = startDate.toISOString().split('T')[0];
    }

    this.currentPage = 1;
    this.loadPaymentHistory();
  }

  // ✅ Handle search
  onSearch() {
    this.currentPage = 1;
    this.loadPaymentHistory();
  }

  // ✅ Handle filter changes
  onFilterChange() {
    this.currentPage = 1;
    this.loadPaymentHistory();
  }

  // ✅ Handle pagination
  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPaymentHistory();
    }
  }

  // ✅ View payment details
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

  // ✅ View vendor details modal
  viewVendorDetails(vendor: any) {
    this.selectedVendor = vendor;
    this.showVendorDetailsModal = true;
  }

  // ✅ Close modals
  closePaymentDetailsModal() {
    this.showPaymentDetailsModal = false;
    this.selectedPayment = null;
  }

  closeVendorDetailsModal() {
    this.showVendorDetailsModal = false;
  }

  // ✅ Get status badge class
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

  // ✅ Get payment mode icon
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

  // ✅ Get days since payment
  getDaysSincePayment(paymentDate: string): number {
    const diffTime = Math.abs(new Date().getTime() - new Date(paymentDate).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // ✅ Refresh data
  refreshData() {
    this.loadPaymentHistory();
  }

  // ✅ Clear all filters
  clearAllFilters() {
    this.searchQuery = '';
    this.statusFilter = '';
    this.paymentModeFilter = '';
    this.selectedVendorId = '';
    this.selectedVendor = null;
    this.setDefaultDateRange();
    this.currentPage = 1;
    this.loadPaymentHistory();
  }

  // ✅ Export payment data
  // exportPaymentData() {
  //   Swal.fire({
  //     title: 'Export Payment History',
  //     html: `
  //       <div class="text-center">
  //         <p class="mb-4">Select the format for exporting payment history:</p>
  //         <div class="d-grid gap-2">
  //           <button id="exportExcel" class="btn btn-success btn-lg">
  //             <i class="fas fa-file-excel me-2"></i> Export as Excel
  //           </button>
  //           <button id="exportPDF" class="btn btn-danger btn-lg">
  //             <i class="fas fa-file-pdf me-2"></i> Export as PDF
  //           </button>
  //         </div>
  //       </div>
  //     `,
  //     showConfirmButton: false,
  //     showCancelButton: true,
  //     cancelButtonText: '<i class="fas fa-times"></i> Cancel',
  //     didOpen: () => {
  //       const excelBtn = document.getElementById('exportExcel');
  //       const pdfBtn = document.getElementById('exportPDF');

  //       if (excelBtn) {
  //         excelBtn.addEventListener('click', () => {
  //           Swal.close();
  //           this.downloadReport('excel');
  //         });
  //       }

  //       if (pdfBtn) {
  //         pdfBtn.addEventListener('click', () => {
  //           Swal.close();
  //           this.downloadReport('pdf');
  //         });
  //       }
  //     }
  //   });
  // }

  // ✅ Download report
  private downloadReport(format: 'excel' | 'pdf') {
    const filters: PaymentFilters = {
      status: this.statusFilter || undefined,
      paymentMode: this.paymentModeFilter || undefined,
      vendorId: this.selectedVendorId || undefined,
      fromDate: this.fromDate || undefined,
      toDate: this.toDate || undefined,
      search: this.searchQuery || undefined
    };

    this.paymentService.generatePaymentReport(format, filters)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `payment-history-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('❌ Error downloading report:', error);
          Swal.fire('Error', 'Failed to download report', 'error');
        }
      });
  }

  // ✅ Get pagination array
  getPaginationArray(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }


  // print section

print() {
  if (!this.selectedPayment) return;

  const payment = this.selectedPayment;
  const vendor = payment.vendor || {};
  const createdAt = new Date(payment.paymentDate || Date.now()).toLocaleString();

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Payment Receipt - ${payment.paymentId}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { font-family: Arial, sans-serif; font-size: 10px; line-height: 1.4; margin: 0; }
          .header { text-align: center; border-bottom: 2px solid #007bff; padding: 10px; }
          .title { background: #007bff; color: white; text-align: center; padding: 5px; font-size: 14px; font-weight: bold; margin-top: 10px; }
          .section { margin: 10px 0; }
          .row { display: flex; flex-wrap: wrap; }
          .col-50 { width: 50%; padding: 5px; box-sizing: border-box; }
          .col-100 { width: 100%; padding: 5px; box-sizing: border-box; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9px; }
          th, td { border: 1px solid #000; padding: 4px; text-align: left; }
          th { background: #f0f0f0; }
          .footer { text-align: center; font-size: 8px; margin-top: 15px; }
        </style>
      </head>
      <body>

        <div class="header">
          <h2 style="margin: 0;">P. P. Maniya Children's Super Speciality Hospital</h2>
          <div>And Maternity Home, Laparoscopy & Test Tube Baby Centre</div>
        </div>

        <div class="title">PAYMENT RECEIPT</div>

        <div class="section row">
          <div class="col-50">
            <strong>Payment ID:</strong> ${payment.paymentId}<br>
            <strong>Transaction ID:</strong> ${payment.transactionId || 'N/A'}<br>
            <strong>Payment Date:</strong> ${createdAt}<br>
            <strong>Status:</strong> ${payment.status?.toUpperCase()}
          </div>
          <div class="col-50">
            <strong>Vendor:</strong> ${vendor.name || 'N/A'}<br>
            <strong>Email:</strong> ${vendor.email || 'N/A'}<br>
            <strong>GRN No:</strong> ${payment.grnNumber || 'N/A'}<br>
            <strong>Invoice No:</strong> ${payment.invoiceNo || 'N/A'}
          </div>
        </div>

        <div class="section">
          <table>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Payment Mode</th>
            </tr>
            <tr>
              <td>Payment against Invoice</td>
              <td>₹ ${payment.amount.toFixed(2)}</td>
              <td>${payment.paymentMode?.toUpperCase()}</td>
            </tr>
            <tr>
              <th colspan="2">Total Amount</th>
              <th>₹ ${payment.amount.toFixed(2)}</th>
            </tr>
          </table>
        </div>

        ${payment.remarks ? `
        <div class="section">
          <strong>Remarks:</strong><br>
          <div>${payment.remarks}</div>
        </div>
        ` : ''}

        <div class="footer">
          Receipt generated on ${new Date().toLocaleString()} | System Generated | PP Maniya Hospital
        </div>

      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 500);
  };
}



async printpaymenthistory(): Promise<void> {
  const printContent = document.getElementById('po-sheet');
  const modalFooter = printContent?.querySelector('.modal-footer') as HTMLElement;

  if (!printContent) {
    console.error('❌ Could not find payment details content.');
    return;
  }

  try {
    // Temporarily hide footer
    if (modalFooter) {
      modalFooter.style.display = 'none';
    }

    const html2canvas = (await import('html2canvas')).default;
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;

    const canvas: HTMLCanvasElement = await html2canvas(printContent, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const filename = `Payment-${this.selectedPayment?.paymentId || 'Receipt'}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    console.log('✅ Payment PDF generated successfully:', filename);
  } catch (error) {
    console.error('❌ Error generating Payment PDF:', error);
  } finally {
    // Restore footer visibility
    if (modalFooter) {
      modalFooter.style.display = '';
    }
  }
}


}
