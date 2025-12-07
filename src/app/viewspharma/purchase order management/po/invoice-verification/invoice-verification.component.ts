// invoice-verification.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GrnService } from '../../grn/service/grn.service';
import { VendorService } from '../../vendor management/service/vendor.service';
import { InvoiceverificationService } from './service/invoiceverification.service';
import Swal from 'sweetalert2';
import { IndianCurrencyPipe } from '../../../../pipe/indian-currency.pipe';

@Component({
  selector: 'app-invoice-verification',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, IndianCurrencyPipe],
  templateUrl: './invoice-verification.component.html',
  styleUrl: './invoice-verification.component.css'
})
export class InvoiceVerificationComponent implements OnInit, OnDestroy {

  approvedGRNs: any[] = [];
  selectedGRN: any = null;
  invoiceItems: any[] = [];
  userId: string = ''

  // ✅ Search functionality
  grnSearchQuery: string = '';
  isSearching: boolean = false;
  searchResults: any[] = [];
  showSearchResults: boolean = false;

  invoiceNo: string = '';
  invoiceDate: string = '';

  // ✅ Loading states
  isSubmitting: boolean = false;
  private searchTimeout: any;

  constructor(
    private grnService: GrnService,
    private vendorservice: VendorService,
    private router: Router,
    private invoiceService: InvoiceverificationService
  ) { }

  ngOnInit() {
    this.loadApprovedGRNs();
    this.loadUserData()
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

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
    } else {
      console.error('No user data found in localStorage');
      Swal.fire('Error', 'Please login to continue', 'error');
    }
  }

  // ✅ Load approved GRNs using your service method
  loadApprovedGRNs() {
    this.grnService.getApprovedGRNsForInvoicing(1, 1000, '').subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.data) {
          this.approvedGRNs = response.data.data
          console.log('✅ Approved GRNs loaded for invoicing:', this.approvedGRNs.length);
        }
      },
      error: (error) => {
        console.error('❌ Error loading approved GRNs:', error);
      }
    });
  }

  // ✅ Search GRN using your service method with search parameter
  searchGRN() {
    if (!this.grnSearchQuery.trim()) {
      this.showSearchResults = false;
      this.searchResults = [];
      return;
    }

    this.isSearching = true;

    this.grnService.getgrngeneration(1, 1000, this.grnSearchQuery).subscribe({
      next: (response) => {
        this.isSearching = false;

        if (response.success && response.data && response.data.data) {
          this.searchResults = response.data.data
          this.showSearchResults = true;
          console.log('✅ Search results:', this.searchResults.length);

          if (this.searchResults.length === 0) {
            Swal.fire({
              icon: 'warning',
              title: 'No Results',
              text: 'No approved GRNs found for invoice verification with the given search criteria.',
              toast: true,
              position: 'top-right',
              showConfirmButton: false,
              timer: 3000
            });
          }
        } else {
          this.searchResults = [];
          this.showSearchResults = false;
        }
      },
      error: (error) => {
        this.isSearching = false;
        console.error('❌ Error searching GRN:', error);
        Swal.fire('Error', 'Failed to search GRN', 'error');
      }
    });
  }

  // ✅ Handle search input with debouncing
  onSearchInput() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.searchGRN();
    }, 500);
  }

  // ✅ Select GRN from search results
  selectGRNFromSearch(grn: any) {
    console.log('🔍 Selected GRN from search:', grn);

    this.selectedGRN = grn;
    this.grnSearchQuery = grn.grnNumber;
    this.showSearchResults = false;

    // Populate invoice items from selected GRN
    this.populateInvoiceItems();
  }

  // ✅ Clear search and selection
  clearSearch() {
    this.grnSearchQuery = '';
    this.selectedGRN = null;
    this.invoiceItems = [];
    this.showSearchResults = false;
    this.searchResults = [];

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  // *** CORRECTED: Populate invoice items with GST breakdown ***
  // *** CORRECTED: Populate invoice items with GST breakdown ***
populateInvoiceItems() {
  if (!this.selectedGRN) return;

  const passedItems = this.selectedGRN.items.filter((item: any) => item.quantityPassed > 0);

  if (passedItems.length === 0) {
    this.invoiceItems = [];
    return;
  }

  // *** GET GST INFO FROM GRN/PO DATA ***
  const grnApprovedTotal = this.selectedGRN.approvedTotal || this.selectedGRN.total || 0;
  const gstIncluded = this.selectedGRN.gstIncluded || false;
  const gstPercentage = this.selectedGRN.gstPercentage || 0;
  const gstAmount = this.selectedGRN.gstAmount || 0;

  console.log('📊 GRN GST Info:', { grnApprovedTotal, gstIncluded, gstPercentage, gstAmount });

  if (gstIncluded && gstPercentage > 0 && gstAmount > 0) {
    // *** GST ALREADY INCLUDED - SHOW BREAKDOWN ***
    const subtotalAmount = grnApprovedTotal - gstAmount;

    console.log('💰 GST Breakdown:', {
      subtotal: subtotalAmount,
      gst: gstAmount,
      total: grnApprovedTotal
    });

    this.invoiceItems = passedItems.map((item: any) => {
      // *** FIX: Add explicit types to reduce parameters ***
      const totalItemValue = passedItems.reduce((sum: number, i: any) => sum + (i.quantityPassed * i.unitPrice), 0);
      const itemShare = totalItemValue > 0 ? (item.quantityPassed * item.unitPrice) / totalItemValue : 0;

      const itemSubtotal = subtotalAmount * itemShare;
      const itemGstAmount = gstAmount * itemShare;
      const itemTotal = itemSubtotal + itemGstAmount;

      return {
        itemId: item.itemId,
        name: item.name,
        category: item.category,
        quantityPassed: item.quantityPassed,
        unitPrice: item.unitPrice,

        // *** GST BREAKDOWN FROM ORIGINAL ***
        baseAmount: Math.round(itemSubtotal * 100) / 100,
        gstPercent: gstPercentage,
        gstAmount: Math.round(itemGstAmount * 100) / 100,
        totalAmount: Math.round(itemTotal * 100) / 100,

        // *** FLAGS ***
        gstIncluded: true,
        isGstBreakdown: true
      };
    });
  } else {
    // *** NO GST IN ORIGINAL - USE GRN APPROVED TOTAL AS BASE ***
    this.invoiceItems = passedItems.map((item: any) => {
      // *** FIX: Add explicit types to reduce parameters ***
      const totalItemValue = passedItems.reduce((sum: number, i: any) => sum + (i.quantityPassed * i.unitPrice), 0);
      const itemShare = totalItemValue > 0 ? (item.quantityPassed * item.unitPrice) / totalItemValue : 0;
      const itemBaseAmount = grnApprovedTotal * itemShare;

      return {
        itemId: item.itemId,
        name: item.name,
        category: item.category,
        quantityPassed: item.quantityPassed,
        unitPrice: item.unitPrice,
        baseAmount: Math.round(itemBaseAmount * 100) / 100,
        gstPercent: 0, // Can be modified by user if needed
        gstAmount: 0,
        totalAmount: Math.round(itemBaseAmount * 100) / 100,
        gstIncluded: false,
        isGstBreakdown: false
      };
    });
  }

  console.log('📋 Invoice items populated:', this.invoiceItems);
  console.log('💰 Totals check:', {
    subtotal: this.getSubtotal(),
    gst: this.getTotalGST(),
    final: this.getFinalTotal(),
    originalGRN: grnApprovedTotal
  });
}

// *** UPDATED CALCULATION METHODS WITH EXPLICIT TYPES ***
getSubtotal(): number {
  return this.invoiceItems.reduce((sum: number, item: any) => sum + (item.baseAmount || 0), 0);
}

getTotalGST(): number {
  return this.invoiceItems.reduce((sum: number, item: any) => {
    return sum + (item.gstIncluded ? (item.gstAmount || 0) : this.getGstAmount(item));
  }, 0);
}

getFinalTotal(): number {
  return this.invoiceItems.reduce((sum: number, item: any) => {
    return sum + (item.gstIncluded ? (item.totalAmount || 0) : this.getTotalAmount(item));
  }, 0);
}

  // *** HELPER METHODS FOR GST INFO ***
  hasGSTInfo(): boolean {
    return !!(this.selectedGRN?.gstIncluded || this.selectedGRN?.gstPercentage);
  }

  hasIncludedGST(): boolean {
    return this.invoiceItems.some(item => item.gstIncluded);
  }

  // *** UPDATED CALCULATION METHODS ***


  // Get GST amount for item (for items without included GST)
  getGstAmount(item: any): number {
    if (item.gstIncluded) return item.gstAmount || 0;
    return ((item.baseAmount || 0) * (item.gstPercent || 0)) / 100;
  }

  getTotalAmount(item: any): number {
    if (item.gstIncluded) return item.totalAmount || 0;
    return (item.baseAmount || 0) + this.getGstAmount(item);
  }

  // *** LEGACY METHODS FOR COMPATIBILITY ***
  getBaseTotal(): number {
    return this.getSubtotal();
  }

  getGrandTotal(): number {
    return this.getFinalTotal();
  }

  // ✅ Verify invoice using actual API call
  verifyInvoice() {
    if (!this.selectedGRN || !this.invoiceNo || !this.invoiceDate) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    if (this.invoiceItems.length === 0) {
      Swal.fire('Error', 'No items available for invoicing', 'error');
      return;
    }

    if (!this.userId) {
      Swal.fire('Error', 'User session invalid. Please login again.', 'error');
      return;
    }

    const invoiceData = {
      grnId: this.selectedGRN._id,
      poNumber: this.selectedGRN.poNumber,
      grnNumber: this.selectedGRN.grnNumber,
      vendor: {
        id: this.selectedGRN.vendor.id || this.selectedGRN.vendor._id,
        name: this.selectedGRN.vendor.name,
        email: this.selectedGRN.vendor.email,
        phone: this.selectedGRN.vendor.phone
      },
      invoiceNo: this.invoiceNo,
      invoiceDate: this.invoiceDate,
      items: this.invoiceItems,
      baseTotal: this.getSubtotal(),
      gstTotal: this.getTotalGST(),
      grandTotal: this.getFinalTotal(),
      verifiedBy: this.userId,

      // *** ADD GST BREAKDOWN INFO ***
      gstBreakdown: {
        hasIncludedGST: this.hasIncludedGST(),
        originalGRNTotal: this.selectedGRN.approvedTotal,
        gstIncluded: this.selectedGRN.gstIncluded || false,
        gstPercentage: this.selectedGRN.gstPercentage || 0,
        gstAmount: this.selectedGRN.gstAmount || 0
      }
    };

    console.log('📄 Verifying invoice with GST breakdown:', invoiceData);

    // Show loading
    this.isSubmitting = true;
    Swal.fire({
      title: 'Processing...',
      text: 'Verifying invoice and sending to accounts',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // ✅ Make actual API call
    this.invoiceService.verifyInvoice(invoiceData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        Swal.close();

        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Invoice Verified! ✅',
            html: `
              <div class="text-start">
                <p><strong>Invoice Number:</strong> ${response.summary.invoiceNo}</p>
                <p><strong>GRN Number:</strong> ${response.summary.grnNumber}</p>
                <p><strong>Vendor:</strong> ${response.summary.vendorName}</p>
                <p><strong>Total Amount:</strong> <strong>₹${response.summary.totalAmount.toFixed(2)}</strong></p>
                <p><strong>Items Count:</strong> ${response.summary.itemsCount}</p>
                <hr>
                <p><strong>Status:</strong> <span class="badge bg-success">${response.summary.status}</span></p>
                <p><small class="text-muted">Invoice has been sent to accounts for payment processing.</small></p>
              </div>
            `,
            confirmButtonText: 'View Payment Processing',
            cancelButtonText: 'Create Another Invoice',
            showCancelButton: true
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/inventorylayout/paymentproccessing']);
            } else {
              this.resetForm();
              this.loadApprovedGRNs();
            }
          });
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        Swal.close();

        console.error('❌ Invoice verification failed:', error);
        const errorMessage = error.error?.message || error.message || 'Invoice verification failed';

        Swal.fire({
          icon: 'error',
          title: 'Invoice Verification Failed',
          text: errorMessage,
          confirmButtonText: 'Try Again'
        });
      }
    });
  }

  resetForm() {
    this.grnSearchQuery = '';
    this.selectedGRN = null;
    this.invoiceNo = '';
    this.invoiceDate = '';
    this.invoiceItems = [];
    this.showSearchResults = false;
    this.searchResults = [];
    this.isSubmitting = false;

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}
