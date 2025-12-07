import { RequestquotationService } from './../service/requestquotation.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../../../../enviornment/env';
import { IndianCurrencyPipe } from '../../../../pipe/indian-currency.pipe';

interface VendorQuote {
  vendorId: string;
  vendorName: string;
  brand: string;
  strength: string;
  description: string;
  unitPrice: number;
  discount: number;
  netPrice: number;
  totalPrice: number;
  isLowest: boolean;
}

interface ItemComparison {
  itemId: string;
  itemName: string;
  category: string;
  quantityRequired: number;
  departmentName: string;
  vendorQuotes: VendorQuote[];
}

interface VendorSummary {
  vendorId: string;
  vendorName: string;
  email: string;
  phone: string;
  totalAmount: number;
  totalDiscount: number;
  itemCount: number;
  submittedAt: Date;
  quotationId: string;
  gstIncluded: boolean;
  gstPercentage: number;
  gstAmount: number;
  finalAmount: number; // ONLY THIS MATTERS - vendor's quoted total
}

@Component({
  selector: 'app-request-for-quotation-comparison',
  imports: [CommonModule, FormsModule, RouterModule, IndianCurrencyPipe],
  templateUrl: './request-for-quotation-comparison.component.html',
  styleUrl: './request-for-quotation-comparison.component.css',
})
export class RequestForQuotationComparisonComponent implements OnInit {
  rfqId = '';
  rfq: any = null;
  loading = true;

  vendors: VendorSummary[] = [];
  itemComparison: ItemComparison[] = [];
  vendorQuotationsMap = new Map<string, any>();

  selectedVendorId: string = '';
  selectedVendorData: VendorSummary | null = null;
  isSelecting = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private rfqservice: RequestquotationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.rfqId = this.route.snapshot.paramMap.get('rfqId') || '';
    if (this.rfqId) {
      this.loadComparisonData();
    }
  }

  loadComparisonData() {
    this.loading = true;

    this.rfqservice.getrequestquotationById(this.rfqId).subscribe({
      next: (rfq) => {
        this.rfq = rfq;
        this.loadVendorQuotations();
      },
      error: (error) => {
        console.error('Error loading RFQ:', error);
        this.showError('Failed to load RFQ details');
        this.loading = false;
      }
    });
  }

  loadVendorQuotations() {
    const url = `${environment.baseurl}/vendor-quotation/rfq/${this.rfqId}`;

    this.http.get<any[]>(url).subscribe({
      next: (quotations) => {
        this.processVendorQuotations(quotations);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading quotations:', error);
        this.showError('Failed to load vendor quotations');
        this.loading = false;
      }
    });
  }

processVendorQuotations(quotations: any[]) {
  if (!quotations || quotations.length === 0) {
    this.vendors = [];
    this.itemComparison = [];
    return;
  }

  quotations.forEach(quotation => {
    this.vendorQuotationsMap.set(quotation.vendor._id, quotation);
  });

  const vendorMap = new Map<string, VendorSummary>();

  quotations.forEach(quotation => {
    const vendor = quotation.vendor;
    if (!vendorMap.has(vendor._id)) {
      const totalDiscount = quotation.items.reduce((sum: number, item: any) => {
        const unitPrice = item.unitPrice || 0;
        const discount = item.discount || 0;
        const quantity = this.getItemQuantity(item.itemId);
        return sum + (unitPrice * discount / 100 * quantity);
      }, 0);

      vendorMap.set(vendor._id, {
        vendorId: vendor._id,
        vendorName: vendor.vendorName,
        email: vendor.email,
        phone: vendor.phone,
        totalAmount: quotation.totalAmount, // Vendor's final amount (with GST if included)
        totalDiscount: totalDiscount,
        itemCount: quotation.items.length,
        submittedAt: quotation.submittedAt,
        quotationId: quotation._id,
        gstIncluded: quotation.gstIncluded || false,
        gstPercentage: quotation.gstPercentage || 0,
        gstAmount: quotation.gstAmount || 0, // For display purpose only
        finalAmount: quotation.totalAmount // Same as totalAmount - vendor's final price
      });
    }
  });

  this.vendors = Array.from(vendorMap.values());

  // *** ITEM COMPARISON LOGIC - ये missing था! ***
  if (this.rfq?.items) {
    this.itemComparison = this.rfq.items.map((rfqItem: any) => {
      const itemComparison: ItemComparison = {
        itemId: rfqItem._id,
        itemName: rfqItem.itemName,
        category: rfqItem.category,
        quantityRequired: rfqItem.quantityRequired,
        departmentName: rfqItem.departmentName || '',
        vendorQuotes: []
      };

      // Find quotes for this item from each vendor
      quotations.forEach(quotation => {
        const vendorItem = quotation.items.find((item: any) =>
          item.itemId.toString() === rfqItem._id.toString()
        );

        if (vendorItem) {
          itemComparison.vendorQuotes.push({
            vendorId: quotation.vendor._id,
            vendorName: quotation.vendor.vendorName,
            brand: vendorItem.brand || '',
            strength: vendorItem.strength || '',
            description: vendorItem.description || '',
            unitPrice: vendorItem.unitPrice || 0,
            discount: vendorItem.discount || 0,
            netPrice: vendorItem.netPrice || 0,
            totalPrice: vendorItem.totalPrice || 0,
            isLowest: false
          });
        }
      });

      // Mark lowest price for each item
      if (itemComparison.vendorQuotes.length > 0) {
        const lowestTotalPrice = Math.min(...itemComparison.vendorQuotes.map(vq => vq.totalPrice));
        itemComparison.vendorQuotes.forEach(vq => {
          vq.isLowest = vq.totalPrice === lowestTotalPrice;
        });
      }

      return itemComparison;
    });
  }

  console.log('Processed comparison data:', {
    vendors: this.vendors,
    itemComparison: this.itemComparison
  });
}



  getItemQuantity(itemId: string): number {
    if (!this.rfq?.items) return 0;
    const item = this.rfq.items.find((i: any) => i._id === itemId);
    return item ? item.quantityRequired : 0;
  }

  getLowestTotalVendor(): VendorSummary | null {
    if (this.vendors.length === 0) return null;
    return this.vendors.reduce((lowest, current) =>
      current.finalAmount < lowest.finalAmount ? current : lowest
    );
  }

  isLowestTotalVendor(vendor: VendorSummary): boolean {
    const lowest = this.getLowestTotalVendor();
    return lowest ? lowest.vendorId === vendor.vendorId : false;
  }

  calculateSavings(): number {
    if (!this.selectedVendorData || this.vendors.length === 0) return 0;
    const highestAmount = Math.max(...this.vendors.map(v => v.finalAmount));
    return highestAmount - this.selectedVendorData.finalAmount;
  }

  onVendorSelect(vendorId: string) {
    this.selectedVendorId = vendorId;
    this.selectedVendorData = this.vendors.find(v => v.vendorId === vendorId) || null;
  }

  onVendorCardClick(vendorId: string) {
    this.selectedVendorId = vendorId;
    this.onVendorSelect(vendorId);
  }

  confirmVendorSelection() {
    if (!this.selectedVendorData) {
      this.showError('Please select a vendor first');
      return;
    }

    const savings = this.calculateSavings();
    const isRecommended = this.isLowestTotalVendor(this.selectedVendorData);

    Swal.fire({
      title: 'Confirm Vendor Selection',
      html: `
        <div class="text-start">
          <div class="card mb-3">
            <div class="card-body">
              <h6 class="card-title">${this.selectedVendorData.vendorName}</h6>
              <p class="card-text">
                <strong>Total Amount:</strong> ₹${this.selectedVendorData.finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}<br>
                <strong>Items Quoted:</strong> ${this.selectedVendorData.itemCount}<br>
                <strong>Total Discount:</strong> ₹${this.selectedVendorData.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}<br>
                ${savings > 0 ? `<strong>Savings:</strong> <span class="text-success">₹${savings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span><br>` : ''}
                ${isRecommended ? '<span class="badge bg-success">Recommended (Lowest Total)</span>' : ''}
                ${this.selectedVendorData.gstIncluded ? `<br><span class="badge bg-info">GST ${this.selectedVendorData.gstPercentage}% Included</span>` : '<br><span class="badge bg-secondary">GST Not Included</span>'}
              </p>
            </div>
          </div>
          <div class="alert alert-warning">
            <small><i class="fas fa-exclamation-triangle me-2"></i>This action cannot be undone. A purchase order will be generated for this vendor.</small>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Select This Vendor',
      cancelButtonText: 'Cancel',
      width: '600px'
    }).then((result) => {
      if (result.isConfirmed) {
        this.selectFinalVendor();
      }
    });
  }

 selectFinalVendor() {
  if (!this.selectedVendorData) return;

  this.isSelecting = true;

  const selectedQuotation = this.vendorQuotationsMap.get(this.selectedVendorData.vendorId);

  if (selectedQuotation) {
    const statusUpdate = { status: 'vendorselected' };

    this.rfqservice.updaterequestquotation(this.rfqId, statusUpdate).subscribe({
      next: () => {
        this.isSelecting = false;

        Swal.fire({
          icon: 'success',
          title: 'Vendor Selected!',
          text: `${this.selectedVendorData!.vendorName} has been selected. Redirecting to purchase order generation...`,
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          // Navigate to PO generation with complete quotation data
          this.router.navigate(['/inventorylayout/purchaseordergeneration'], {
            state: {
              vendorQuotation: selectedQuotation, // Complete quotation with all fields
              rfqData: this.rfq, // Complete RFQ data
              selectedVendor: this.selectedVendorData, // Selected vendor summary
              // *** ADD VENDOR'S GST INFO FOR PO ***
              gstDetails: {
                totalAmount: selectedQuotation.totalAmount,
                gstIncluded: selectedQuotation.gstIncluded,
                gstPercentage: selectedQuotation.gstPercentage,
                gstAmount: selectedQuotation.gstAmount,
                finalAmount: selectedQuotation.finalAmount || selectedQuotation.totalAmount
              }
            }
          });
        });
      },
      error: (error) => {
        console.error('Error updating RFQ status:', error);
        this.isSelecting = false;
        // Continue to PO generation even if status update fails
        this.router.navigate(['/inventorylayout/purchaseordergeneration'], {
          state: {
            vendorQuotation: selectedQuotation,
            rfqData: this.rfq,
            selectedVendor: this.selectedVendorData,
            gstDetails: {
              totalAmount: selectedQuotation.totalAmount,
              gstIncluded: selectedQuotation.gstIncluded,
              gstPercentage: selectedQuotation.gstPercentage,
              gstAmount: selectedQuotation.gstAmount,
              finalAmount: selectedQuotation.finalAmount || selectedQuotation.totalAmount
            }
          }
        });
      }
    });
  } else {
    this.isSelecting = false;
    this.showError('Quotation data not found for selected vendor');
  }
}


  goBack() {
    this.router.navigate(['/inventorylayout/request-for-quotation']);
  }

  private showError(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    });
  }

  printComparison() {
    window.print();
  }

  exportToCSV() {
    console.log('Export to CSV functionality');
  }
}
