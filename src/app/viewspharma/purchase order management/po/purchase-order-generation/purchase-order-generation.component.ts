import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RequestquotationService } from '../../rfq/service/requestquotation.service';
import { PoService } from '../service/po.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-purchase-order-generation',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './purchase-order-generation.component.html',
  styleUrl: './purchase-order-generation.component.css',
})
export class PurchaseOrderGenerationComponent implements OnInit {
  // Data Properties
  selectedVendor: any = {};
  selectedRFQ: any = {};
  items: any[] = [];

  // Permission Properties
  userPermissions: any = {};
  module: string = '';

  // Terms Form
  termsForm: FormGroup;

  // Loading and Submission States
  isLoadingRFQ: boolean = false;
  isSubmitting: boolean = false;
  hasSubmitted: boolean = false;
  submissionAttempts: number = 0;
  lastSubmissionTime: number = 0;

  constructor(
    private router: Router,
    private rfqService: RequestquotationService,
    private poService: PoService,
    private fb: FormBuilder
  ) {
    this.termsForm = this.fb.group({
      paymentTerms: ['30 days from invoice date', Validators.required],
      customPaymentTerms: [''],
      deliveryTerms: ['FOB destination', Validators.required],
      customDeliveryTerms: [''],
      deliveryDate: ['', Validators.required],
      warrantyPeriod: [''],
      qualityStandards: [true],
      lateDeliveryPenalty: [true],
      returnPolicy: [true],
      inspectionRights: [false],
      specialInstructions: [
        'Please ensure all items are packed securely and delivered to the specified address during business hours.',
        Validators.maxLength(500),
      ],
      customTerms: ['', Validators.maxLength(1000)],
    });

    // Set default delivery date (30 days from today)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    this.termsForm.patchValue({
      deliveryDate: futureDate.toISOString().split('T')[0],
    });
  }

  ngOnInit() {
    this.loadUserPermissions();
    this.loadVendorQuotationData();
  }

  // Load Vendor Quotation Data from Router State
  loadVendorQuotationData() {
    // Try to get data from router state first
    const navigationState = history.state;

    console.log('Navigation state:', navigationState);

    if (
      navigationState &&
      (navigationState.vendorQuotation || navigationState.selectedVendor)
    ) {
      this.processNavigationData(navigationState);
    } else {
      // Fallback: try to get from current navigation
      const nav = this.router.getCurrentNavigation();
      const state = nav?.extras?.state;

      if (state) {
        this.processNavigationData(state);
      } else {
        this.showMissingDataError();
      }
    }
  }

  // Process navigation data from different sources
  private processNavigationData(state: any) {
    console.log('Processing navigation data:', state);

    // Handle data from RFQ comparison
    if (state.vendorQuotation && state.rfqData && state.selectedVendor) {
      const quotation = state.vendorQuotation;
      const rfqData = state.rfqData;
      const selectedVendor = state.selectedVendor;

      // Set vendor information
      this.selectedVendor = {
        id: quotation.vendor?._id || selectedVendor.vendorId,
        name: quotation.vendor?.vendorName || selectedVendor.vendorName,
        email: quotation.vendor?.email || selectedVendor.email,
        phone: quotation.vendor?.phone || selectedVendor.phone,
      };

      // Set RFQ information
      this.selectedRFQ = {
        id: rfqData._id,
        number: rfqData.rfqNumber,
      };

      // Process items with proper mapping
      this.items = this.mapQuotationItems(quotation.items, rfqData.items);

      console.log('✅ Data loaded from RFQ comparison:', {
        vendor: this.selectedVendor,
        rfq: this.selectedRFQ,
        items: this.items,
      });
    }
    // Handle legacy data format
    else if (state.vendorQuotation) {
      const quotation = state.vendorQuotation;

      this.selectedVendor = {
        id: quotation.vendor?._id,
        name: quotation.vendor?.vendorName,
        email: quotation.vendor?.email,
        phone: quotation.vendor?.phone,
      };

      this.selectedRFQ = {
        id: quotation.rfq?._id,
        number: quotation.rfq?.rfqNumber,
      };

      // Map items with fallback
      this.items =
        quotation.items?.map((item: any) => ({
          itemId: item.itemId || item._id,
          name: item.itemName || item.name || 'Unknown Item',
          category: item.category || 'General',
          quantity: item.quantityRequired || item.quantity || 0,
          unitPrice: item.unitPrice || 0,
          totalPrice: item.totalPrice || item.unitPrice * item.quantity || 0,
        })) || [];

      console.log('✅ Data loaded from legacy format:', {
        vendor: this.selectedVendor,
        rfq: this.selectedRFQ,
        items: this.items,
      });
    } else {
      this.showMissingDataError();
    }
  }

  // Map quotation items with RFQ item details
  // Map quotation items with RFQ item details
  private mapQuotationItems(quotationItems: any[], rfqItems: any[]): any[] {
    const rfqItemMap = new Map(rfqItems.map((item) => [item._id, item]));

    return quotationItems.map((qItem: any) => {
      const rfqItem = rfqItemMap.get(qItem.itemId);

      return {
        itemId: qItem.itemId,
        name: qItem.itemName || rfqItem?.itemName || 'Unknown Item',
        category: qItem.category || rfqItem?.category || 'General',
        quantity: rfqItem?.quantityRequired || qItem.quantity || 0,
        unitPrice: qItem.unitPrice || 0,
        totalPrice: qItem.totalPrice || 0,
        // *** ADD THESE REQUIRED FIELDS ***
        discount: qItem.discount || 0,
        netPrice: qItem.netPrice || qItem.unitPrice || 0, // Required field
        brand: qItem.brand || '',
        strength: qItem.strength || '',
      };
    });
  }

  // Show error when data is missing
  private showMissingDataError() {
    console.error('❌ No vendor quotation found in router state.');
    Swal.fire({
      icon: 'error',
      title: 'Missing Data',
      text: 'Vendor, RFQ, or items data is missing. Please try again.',
      confirmButtonText: 'Go Back',
    }).then(() => {
      this.router.navigateByUrl('/inventorylayout/request-for-quotation');
    });
  }

  // Load User Permissions
  loadUserPermissions() {
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const poModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'purchaseorder'
    );
    this.userPermissions = poModule?.permissions || { create: true }; // Default to true for demo
    this.module = poModule?.moduleName || 'Purchase Order';
  }

  // Get Total Amount
  getTotal(): number {
    return this.items.reduce(
      (total, item) => total + (item.totalPrice || 0),
      0
    );
  }

  // Get Formatted Terms for PO Generation
  getFormattedTerms(): string[] {
    const formValues = this.termsForm.value;
    const terms: string[] = [];

    // Payment Terms
    const paymentTerm =
      formValues.paymentTerms === 'custom'
        ? formValues.customPaymentTerms
        : formValues.paymentTerms;
    if (paymentTerm) terms.push(`Payment terms: ${paymentTerm}`);

    // Delivery Terms
    const deliveryTerm =
      formValues.deliveryTerms === 'custom'
        ? formValues.customDeliveryTerms
        : formValues.deliveryTerms;
    if (deliveryTerm) terms.push(`Delivery terms: ${deliveryTerm}`);

    // Warranty
    if (formValues.warrantyPeriod) {
      terms.push(`Warranty: ${formValues.warrantyPeriod}`);
    }

    // Additional terms based on checkboxes
    if (formValues.qualityStandards) {
      terms.push(
        'Quality standards: All items must meet specified quality requirements'
      );
    }
    if (formValues.lateDeliveryPenalty) {
      terms.push('Late delivery: Penalties may apply for delayed deliveries');
    }
    if (formValues.returnPolicy) {
      terms.push(
        'Returns: Damaged or non-conforming items will be returned at supplier cost'
      );
    }
    if (formValues.inspectionRights) {
      terms.push(
        'Inspection: Buyer reserves the right to inspect goods before acceptance'
      );
    }

    // Custom terms
    if (formValues.customTerms) {
      terms.push(formValues.customTerms);
    }

    return terms;
  }

  // Preview Purchase Order
  previewPurchaseOrder() {
    if (this.isSubmitting) return;

    if (!this.termsForm.valid) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Information',
        text: 'Please fill in all required terms and conditions before previewing.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const formValues = this.termsForm.value;
    const poPreview = {
      vendor: this.selectedVendor,
      rfq: this.selectedRFQ,
      items: this.items,
      total: this.getTotal(),
      paymentTerms:
        formValues.paymentTerms === 'custom'
          ? formValues.customPaymentTerms
          : formValues.paymentTerms,
      deliveryTerms:
        formValues.deliveryTerms === 'custom'
          ? formValues.customDeliveryTerms
          : formValues.deliveryTerms,
      deliveryDate: formValues.deliveryDate,
      warrantyPeriod: formValues.warrantyPeriod,
      specialInstructions: formValues.specialInstructions,
      terms: this.getFormattedTerms(),
    };

    // Show preview in modal
    Swal.fire({
      title: 'Purchase Order Preview',
      html: `
        <div class="text-start">
          <h6><strong>Vendor:</strong> ${poPreview.vendor.name}</h6>
          <h6><strong>RFQ:</strong> ${poPreview.rfq.number}</h6>
          <h6><strong>Total Amount:</strong> ₹${poPreview.total.toFixed(2)}</h6>
          <h6><strong>Items:</strong> ${poPreview.items.length} items</h6>
          <h6><strong>Delivery Date:</strong> ${new Date(
            poPreview.deliveryDate
          ).toLocaleDateString()}</h6>
          <hr>
          <h6><strong>Terms & Conditions:</strong></h6>
          <ul style="font-size: 12px; text-align: left;">
            ${poPreview.terms.map((term) => `<li>${term}</li>`).join('')}
          </ul>
        </div>
      `,
      confirmButtonText: 'Generate PO',
      cancelButtonText: 'Edit Terms',
      showCancelButton: true,
      width: '600px',
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.submitPurchaseOrder();
      }
    });
  }

  // Submit Purchase Order with Enhanced Protection
  async submitPurchaseOrder() {
    const currentTime = Date.now();

    // Validation checks
    if (this.hasSubmitted) {
      await Swal.fire({
        icon: 'info',
        title: 'Already Submitted',
        text: 'This Purchase Order has already been generated successfully.',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (this.isSubmitting) {
      await Swal.fire({
        icon: 'info',
        title: 'Processing...',
        text: 'Purchase Order generation is already in progress. Please wait.',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (currentTime - this.lastSubmissionTime < 2000) {
      await Swal.fire({
        icon: 'warning',
        title: 'Please Wait',
        text: 'Please wait a moment before trying again.',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (this.submissionAttempts >= 3) {
      await Swal.fire({
        icon: 'error',
        title: 'Too Many Attempts',
        text: 'Too many submission attempts. Please refresh the page and try again.',
        confirmButtonText: 'Refresh Page',
      }).then(() => {
        window.location.reload();
      });
      return;
    }

    if (!this.termsForm.valid) {
      await Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields before submitting.',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Enhanced data validation
    if (
      !this.selectedVendor.id ||
      !this.selectedRFQ.id ||
      this.items.length === 0
    ) {
      console.error('Missing data:', {
        vendor: this.selectedVendor,
        rfq: this.selectedRFQ,
        items: this.items,
      });

      await Swal.fire({
        icon: 'error',
        title: 'Missing Data',
        text: 'Vendor, RFQ, or items data is missing. Please try again.',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Show confirmation
    const confirmResult = await Swal.fire({
      title: 'Confirm Submission',
      text: 'Are you sure you want to generate this Purchase Order? This action cannot be undone.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Generate PO',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    if (!confirmResult.isConfirmed) return;

    // Set submission states
    this.isSubmitting = true;
    this.submissionAttempts++;
    this.lastSubmissionTime = currentTime;
    this.termsForm.disable();

    // Show loading indicator
    Swal.fire({
      title: 'Generating Purchase Order...',
      text: 'Please wait while we process your request.',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const user = JSON.parse(localStorage.getItem('authUser') || '{}');
    const formValues = this.termsForm.value;

    // Build payload with proper structure for your backend
    // Build payload with proper structure for your backend
    const payload = {
      vendor: {
        id: this.selectedVendor.id,
        name: this.selectedVendor.name,
        email: this.selectedVendor.email,
        phone: this.selectedVendor.phone,
      },
      rfq: {
        id: this.selectedRFQ.id,
        number: this.selectedRFQ.number,
      },
      // *** FIX ITEMS MAPPING - ADD ALL REQUIRED FIELDS ***
      items: this.items.map((item) => ({
        itemId: item.itemId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0, // Add discount
        netPrice: item.netPrice || item.unitPrice, // Add netPrice (REQUIRED)
        totalPrice: item.totalPrice,
      })),
      // total: this.getTotal(),
      createdBy: user._id || '',

      // User-defined terms
      paymentTerms:
        formValues.paymentTerms === 'custom'
          ? formValues.customPaymentTerms
          : formValues.paymentTerms,
      deliveryTerms:
        formValues.deliveryTerms === 'custom'
          ? formValues.customDeliveryTerms
          : formValues.deliveryTerms,
      deliveryDate: formValues.deliveryDate,
      warrantyPeriod: formValues.warrantyPeriod,
      specialInstructions: formValues.specialInstructions,
      customTerms: formValues.customTerms,

      // Terms flags
      qualityStandards: formValues.qualityStandards,
      lateDeliveryPenalty: formValues.lateDeliveryPenalty,
      returnPolicy: formValues.returnPolicy,
      inspectionRights: formValues.inspectionRights,

      // Generated terms list for email/display
      termsAndConditions: this.getFormattedTerms(),

      subtotal: this.selectedVendor.gstDetails?.totalAmount || this.getTotal(),
  gstIncluded: this.selectedVendor.gstDetails?.gstIncluded || false,
  gstPercentage: this.selectedVendor.gstDetails?.gstPercentage || 0,
  gstAmount: this.selectedVendor.gstDetails?.gstAmount || 0,
  total: this.selectedVendor.gstDetails?.finalAmount || this.getTotal(),
  totalDiscount: this.getTotalDiscount(),
    };

    console.log('🚀 Enhanced PO Payload:', payload);

    try {
      const res = await this.poService.postpogeneration(payload).toPromise();

      // Mark as successfully submitted
      this.hasSubmitted = true;
      this.isSubmitting = false;

      Swal.close();
      console.log('✅ PO generated successfully:', res);

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Purchase Order has been generated successfully.',
        confirmButtonText: 'View PO List',
        allowOutsideClick: false,
      });

      // Update RFQ status (optional - in background)
      try {
        const status = { status: 'pogenerated' };
        await this.rfqService
          .updaterequestquotation(this.selectedRFQ.id, status)
          .toPromise();
        console.log('✅ RFQ status updated');
      } catch (updateErr) {
        console.error('❌ Failed to update RFQ status:', updateErr);
      }

      // Navigate to list
      this.router.navigateByUrl('/inventorylayout/purchaseordergenerationlist');
    } catch (err: any) {
      this.isSubmitting = false;
      this.termsForm.enable();

      Swal.close();
      console.error('❌ PO generation failed:', err);

      const errorMessage =
        err?.error?.message || err?.message || 'Unknown error occurred';

      await Swal.fire({
        icon: 'error',
        title: 'Submission Failed!',
        text: `Failed to generate Purchase Order: ${errorMessage}`,
        confirmButtonText: 'Retry',
      });
    }
  }

  // Helper methods for form validation and UI
  get needsCustomPaymentTerms(): boolean {
    return this.termsForm.get('paymentTerms')?.value === 'custom';
  }

  get needsCustomDeliveryTerms(): boolean {
    return this.termsForm.get('deliveryTerms')?.value === 'custom';
  }

  get minDeliveryDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  get canSubmit(): boolean {
    return (
      !this.isSubmitting &&
      !this.hasSubmitted &&
      this.termsForm.valid &&
      this.submissionAttempts < 3 &&
      this.selectedVendor.id &&
      this.selectedRFQ.id &&
      this.items.length > 0
    );
  }

  get submitButtonText(): string {
    if (this.hasSubmitted) return 'Already Generated';
    if (this.isSubmitting) return 'Generating...';
    return 'Generate Purchase Order';
  }

  get submitButtonIcon(): string {
    if (this.hasSubmitted) return 'fas fa-check';
    if (this.isSubmitting) return 'fas fa-spinner fa-spin';
    return 'fas fa-file-contract';
  }

  getTotalDiscount(): number {
  return this.items.reduce((total, item) => {
    return total + ((item.unitPrice * (item.discount || 0) / 100) * item.quantity);
  }, 0);
}
}
