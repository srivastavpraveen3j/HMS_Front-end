import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { RequestquotationService } from '../../rfq/service/requestquotation.service';
import { environment } from '../../../../../../enviornment/env';
import { IndianCurrencyPipe } from '../../../../pipe/indian-currency.pipe';

interface QuotationItem {
  _id: string;
  itemName: string;
  brand?: string;
  strength?: string;
  description?: string;
  category: string;
  quantityRequired: number;
  unitPrice: number;
  discount: number;
  netPrice: number;
  totalPrice: number;
}

@Component({
  selector: 'app-vendorquotation',
  imports: [CommonModule, RouterModule, FormsModule, IndianCurrencyPipe],
  templateUrl: './vendorquotation.component.html',
  styleUrl: './vendorquotation.component.css',
})
export class VendorquotationComponent implements OnInit {
  rfqId!: string;
  vendorId!: string;
  rfq: any = null;
  gstIncluded: boolean = false;
  gstPercentage: number = 18; // Default GST percentage

  // Form state
  quotationSubmitted = false;
  isSubmitting = false;
  submissionDate: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private rfqservice: RequestquotationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.rfqId = this.route.snapshot.paramMap.get('rfqId')!;
    this.vendorId = this.route.snapshot.paramMap.get('vendorId')!;
    this.loadRFQ();
  }

  loadRFQ() {
    const url = `${environment.baseurl}/vendor-quotation/${this.rfqId}/vendor/${this.vendorId}`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        this.rfq = data;

        // Find correct vendor
        const vendor = data.sentToVendors.find(
          (v: any) => v._id === this.vendorId
        );

        if (vendor) {
          this.rfq.vendorName = vendor.vendorName;
          this.rfq.vendor = vendor;
        } else {
          this.rfq.vendorName = 'Unknown Vendor';
        }

        // Initialize item properties
        if (this.rfq.items) {
          this.rfq.items.forEach((item: QuotationItem) => {
            if (!item.unitPrice) item.unitPrice = 0;
            if (!item.discount) item.discount = 0;
            if (!item.brand) item.brand = '';
            if (!item.strength) item.strength = '';
            if (!item.description) item.description = '';

            this.calculateItemPrices(item);
          });
        }

        console.log('RFQ loaded:', this.rfq);
      },
      error: (err) => {
        console.error('Error loading RFQ:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load RFQ details. Please try again.',
        });
      },
    });
  }

  // Handle GST toggle
  onGSTToggle() {
    // If GST is enabled and percentage is 0, set default to 18%
    if (this.gstIncluded && this.gstPercentage === 0) {
      this.gstPercentage = 18;
    }
  }

  // Handle GST percentage change
  onGSTPercentageChange() {
    // Ensure percentage is within valid range
    if (this.gstPercentage < 0) this.gstPercentage = 0;
    if (this.gstPercentage > 50) this.gstPercentage = 50;
  }

  // Calculate net price and total price for an item
  calculateItemPrices(item: QuotationItem) {
    const unitPrice = parseFloat(item.unitPrice?.toString()) || 0;
    const discount = parseFloat(item.discount?.toString()) || 0;
    const quantity = parseFloat(item.quantityRequired?.toString()) || 0;

    // Calculate net price after discount
    item.netPrice = unitPrice - (unitPrice * discount / 100);

    // Calculate total price
    item.totalPrice = item.netPrice * quantity;
  }

  // Handle unit price change
  onUnitPriceChange(item: QuotationItem) {
    this.calculateItemPrices(item);
  }

  // Handle discount change
  onDiscountChange(item: QuotationItem) {
    // Ensure discount is between 0 and 100
    if (item.discount < 0) item.discount = 0;
    if (item.discount > 100) item.discount = 100;

    this.calculateItemPrices(item);
  }

  // Check if form is valid
  isFormValid(): boolean {
    if (!this.rfq?.items) return false;

    return this.rfq.items.every((item: QuotationItem) =>
      item.unitPrice && item.unitPrice > 0 &&
      item.itemName && item.itemName.trim() !== ''
    );
  }

  // Calculate subtotal (before GST)
  getSubtotal(): number {
    if (!this.rfq?.items) return 0;

    return this.rfq.items.reduce((total: number, item: QuotationItem) => {
      return total + (item.totalPrice || 0);
    }, 0);
  }

  // Updated GST amount calculation with dynamic percentage
  getGSTAmount(): number {
    if (!this.gstIncluded || this.gstPercentage <= 0) return 0;
    return this.getSubtotal() * (this.gstPercentage / 100);
  }

  // Calculate grand total
  getGrandTotal(): number {
    return this.getSubtotal() + this.getGSTAmount();
  }

  // Calculate total discount amount
  getTotalDiscountAmount(): number {
    if (!this.rfq?.items) return 0;

    return this.rfq.items.reduce((total: number, item: QuotationItem) => {
      const unitPrice = parseFloat(item.unitPrice?.toString()) || 0;
      const discount = parseFloat(item.discount?.toString()) || 0;
      const quantity = parseFloat(item.quantityRequired?.toString()) || 0;

      return total + (unitPrice * discount / 100 * quantity);
    }, 0);
  }

  submitQuote(): void {
    if (!this.rfqId || !this.vendorId || !this.rfq?.items) {
      console.error('Missing data to submit quotation');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Missing required data. Please refresh and try again.',
      });
      return;
    }

    if (!this.isFormValid()) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields before submitting.',
      });
      return;
    }

    // Show confirmation dialog with dynamic GST percentage
    Swal.fire({
      title: 'Submit Quotation?',
      html: `
        <div class="text-start">
          <p><strong>RFQ:</strong> ${this.rfq.rfqNumber}</p>
          <p><strong>Items:</strong> ${this.rfq.items.length}</p>
          <p><strong>Subtotal:</strong> ₹${this.getSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          ${this.gstIncluded ? `<p><strong>GST (${this.gstPercentage}%):</strong> ₹${this.getGSTAmount().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>` : ''}
          <p><strong>Grand Total:</strong> ₹${this.getGrandTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p class="text-muted mt-3">Once submitted, you cannot modify this quotation.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Submit',
      cancelButtonText: 'Review Again'
    }).then((result) => {
      if (result.isConfirmed) {
        this.processSubmission();
      }
    });
  }

  private processSubmission(): void {
    this.isSubmitting = true;

    const items = this.rfq.items.map((item: QuotationItem) => ({
      itemId: item._id,
      itemName: item.itemName,
      brand: item.brand || '',
      strength: item.strength || '',
      description: item.description || '',
      quantityRequired: item.quantityRequired,
      unitPrice: parseFloat(item.unitPrice?.toString()) || 0,
      discount: parseFloat(item.discount?.toString()) || 0,
      netPrice: item.netPrice,
      totalPrice: item.totalPrice,
    }));

    const payload = {
      rfq: this.rfqId,
      vendor: this.vendorId,
      items,
      totalAmount: this.getGrandTotal(),
      gstIncluded: this.gstIncluded,
      gstPercentage: this.gstPercentage, // Include GST percentage
      submittedAt: new Date().toISOString()
    };

    console.log('Submitting quotation:', payload);

    const url = `${environment.baseurl}/vendor-quotation`;

    this.http.post(url, payload).subscribe({
      next: (res) => {
        console.log('Quotation submitted successfully:', res);

        this.submissionDate = new Date();
        this.quotationSubmitted = true;
        this.isSubmitting = false;

        // Update RFQ status
        const status = { status: 'quotagiven' };
        this.rfqservice
          .updaterequestquotation(this.rfqId, status)
          .subscribe({
            next: (updateRes) => {
              console.log('RFQ status updated:', updateRes);
            },
            error: (updateErr) => {
              console.error('Error updating RFQ status:', updateErr);
            }
          });

        Swal.fire({
          icon: 'success',
          title: 'Submitted!',
          text: 'Your quotation has been submitted successfully.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error submitting quotation:', err);
        this.isSubmitting = false;

        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Failed to submit quotation. Please try again.',
          confirmButtonText: 'Retry'
        });
      },
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/vendor-dashboard']);
  }

  resetForm(): void {
    this.quotationSubmitted = false;
    this.isSubmitting = false;
    this.loadRFQ();
  }
}
