// invoice-verificationlist.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { InvoiceverificationService } from '../../service/invoiceverification.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-invoice-verificationlist',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './invoice-verificationlist.component.html',
  styleUrl: './invoice-verificationlist.component.css'
})
export class InvoiceVerificationlistComponent implements OnInit {

  // List Data
  invoiceList: any[] = [];
  filteredInvoices: any[] = [];
  isLoading: boolean = false;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // Filters
  searchQuery: string = '';
  statusFilter: string = '';
  paymentStatusFilter: string = '';
  fromDate: string = '';
  toDate: string = '';

  // Modal
  selectedInvoice: any = null;
  isModalOpen: boolean = false;

  // ✅ Track if user manually changed dates (for UI feedback only)
  private userManuallyChangedDates = false;

  // Filter Options
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'verified', label: 'Verified' },
    { value: 'sent_to_accounts', label: 'Sent to Accounts' },
    { value: 'payment_pending', label: 'Payment Pending' },
    { value: 'payment_completed', label: 'Payment Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  paymentStatusOptions = [
    { value: '', label: 'All Payment Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(private invoiceService: InvoiceverificationService) { }

  ngOnInit() {
    // ✅ Set today's date as default AND load today's data
    this.setDefaultDates();
    this.loadInvoices();
  }

  // ✅ Set today's date as default
  setDefaultDates() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Set both from and to date to today
    this.fromDate = todayString;
    this.toDate = todayString;

    console.log('📅 Default date set to today:', todayString);
  }

  // ✅ Enhanced date change handler - when user manually changes dates
  onDateChange() {
    this.userManuallyChangedDates = true;
    console.log('📅 User manually changed dates:', this.fromDate, 'to', this.toDate);
    this.onFilterChange();
  }

  // ✅ Load verified invoices - ALWAYS send dates (including default today's date)
  loadInvoices() {
    this.isLoading = true;

    console.log('📋 Loading invoices with dates:', {
      fromDate: this.fromDate,
      toDate: this.toDate,
      page: this.currentPage,
      limit: this.itemsPerPage
    });

    this.invoiceService.getVerifiedInvoices(
      this.currentPage,
      this.itemsPerPage,
      undefined, // vendorId
      this.fromDate || undefined,  // Always send fromDate if set
      this.toDate || undefined,    // Always send toDate if set
      this.statusFilter || undefined,
      this.paymentStatusFilter || undefined
    ).subscribe({
      next: (response) => {
        this.isLoading = false;

        console.log('✅ Invoice response:', response);

        if (response.success && response.data) {
          this.invoiceList = response.data.invoices || [];
          this.filteredInvoices = [...this.invoiceList];

          if (response.data.pagination) {
            this.totalItems = response.data.pagination.total;
            this.totalPages = response.data.pagination.totalPages;
            this.currentPage = response.data.pagination.page;
          }

          console.log('✅ Invoices loaded:', this.invoiceList.length, 'of', this.totalItems, 'total');
          this.applyLocalFilters();
        } else {
          this.invoiceList = [];
          this.filteredInvoices = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error loading invoices:', error);

        // Show user-friendly error message
        Swal.fire({
          icon: 'error',
          title: 'Loading Failed',
          text: 'Failed to load invoices. Please try again.',
          toast: true,
          position: 'top-right',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }

  // ✅ Apply local search filter
  applyLocalFilters() {
    this.filteredInvoices = this.invoiceList.filter(invoice => {
      const matchesSearch = !this.searchQuery ||
        invoice.invoiceNo?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        invoice.grnNumber?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        invoice.vendor?.name?.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesSearch;
    });
  }

  // ✅ Handle search input
  onSearch() {
    this.applyLocalFilters();
  }

  // ✅ Handle filter changes
  onFilterChange() {
    this.currentPage = 1; // Reset to first page
    this.loadInvoices();
  }

  // ✅ Handle pagination
  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadInvoices();
    }
  }

  // ✅ Enhanced preset date options
  setDatePreset(preset: string) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    this.userManuallyChangedDates = true;

    switch (preset) {
      case 'today':
        this.fromDate = todayStr;
        this.toDate = todayStr;
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        this.fromDate = yesterdayStr;
        this.toDate = yesterdayStr;
        break;
      case 'last7days':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        this.fromDate = weekAgo.toISOString().split('T')[0];
        this.toDate = todayStr;
        break;
      case 'thisMonth':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.fromDate = monthStart.toISOString().split('T')[0];
        this.toDate = todayStr;
        break;
      case 'allTime':
        // Clear dates to show all records
        this.fromDate = '';
        this.toDate = '';
        break;
    }

    console.log('📅 Date preset applied:', preset, 'From:', this.fromDate, 'To:', this.toDate);
    this.onFilterChange();
  }

  // ✅ Clear filters - but keep today's date as default
  clearFilters() {
    this.searchQuery = '';
    this.statusFilter = '';
    this.paymentStatusFilter = '';

    // Reset to today's date instead of clearing completely
    this.setDefaultDates();
    this.userManuallyChangedDates = false;
    this.currentPage = 1;

    console.log('🔄 Filters cleared, reset to today:', this.fromDate);
    this.loadInvoices();
  }

  // ✅ Get current filter summary for display
  getFilterSummary(): string {
    if (this.fromDate && this.toDate) {
      const from = new Date(this.fromDate);
      const to = new Date(this.toDate);
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      if (this.fromDate === this.toDate && this.fromDate === todayStr) {
        return "Today's invoices";
      } else if (this.fromDate === this.toDate) {
        return `Invoices for ${from.toLocaleDateString('en-IN')}`;
      } else {
        return `Invoices from ${from.toLocaleDateString('en-IN')} to ${to.toLocaleDateString('en-IN')}`;
      }
    }
    return 'All invoices';
  }

  // ✅ Check if showing today's data
  isShowingTodayData(): boolean {
    const today = new Date().toISOString().split('T')[0];
    return this.fromDate === today && this.toDate === today;
  }

  // Existing methods...
  viewInvoiceDetails(invoice: any) {
    console.log('📋 Viewing invoice details:', invoice.invoiceNo);

    if (invoice._id) {
      this.invoiceService.getInvoiceById(invoice._id).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.selectedInvoice = response.data;
            this.isModalOpen = true;
          }
        },
        error: (error) => {
          console.error('❌ Error fetching invoice details:', error);
          this.selectedInvoice = invoice;
          this.isModalOpen = true;
        }
      });
    } else {
      this.selectedInvoice = invoice;
      this.isModalOpen = true;
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedInvoice = null;
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'verified': return 'bg-info';
      case 'sent_to_accounts': return 'bg-warning';
      case 'payment_pending': return 'bg-warning';
      case 'payment_completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getPaymentStatusBadgeClass(paymentStatus: string): string {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'processing': return 'bg-info';
      case 'failed': return 'bg-danger';
      case 'cancelled': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  refreshData() {
    console.log('🔄 Refreshing data...');
    this.loadInvoices();
  }

  exportData() {
    Swal.fire({
      icon: 'info',
      title: 'Export Feature',
      text: 'Export functionality will be implemented soon!',
      confirmButtonText: 'OK'
    });
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

  // Print and PDF methods remain the same...
  printOPDSheet() {
    const opdElement = document.getElementById('opd-sheet');
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

  async pdfOPDSheet(): Promise<void> {
    const DATA: HTMLElement | null = document.getElementById('invoicemodal');
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
      pdf.save(`INVOICE-${this.selectedInvoice?.invoiceNo || today}.pdf`);
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
}
