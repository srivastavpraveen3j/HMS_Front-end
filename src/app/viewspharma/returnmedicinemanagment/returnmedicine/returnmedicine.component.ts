import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PharmaService } from '../../pharma.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MasterService } from '../../../views/mastermodule/masterservice/master.service';
import { Router, RouterModule } from '@angular/router';

interface ReturnItem {
  packageId: string;
  medicineName: string;
  originalQuantity: number;
  returnedQuantity: number;
  charge: number;
  batchNumber: string;
  maxReturnQuantity: number;
  actualUnitPrice: number;
}

interface OriginalBill {
  _id: string;
  inwardSerialNumber: string;
  total: number;
  packages: any[];
  type: string;
  createdAt: Date;
  uniqueHealthIdentificationId?: any;
  walkInPatient?: any;
}

interface MedicineData {
  _id: string;
  medicine_name: string;
  batch_details: Array<{
    batch_no: string;
    quantity: number;
    expiry_date: Date;
    unit_price: number;
  }>;
}

@Component({
  selector: 'app-returnmedicine',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './returnmedicine.component.html',
  styleUrls: ['./returnmedicine.component.css']
})
export class ReturnmedicineComponent implements OnInit {

  // Form data
  searchBillNumber: string = '';
  returnReason: string = '';
  patientType: string = '';
  selectedPharmacyId: string = '68beb0b38066685ac24f8017';
  returnHistory: any[] = [];
  showReturnHistory: boolean = false;

  // Data arrays
  selectedBill: OriginalBill | null = null;
  returnItems: ReturnItem[] = [];
  medicineDataMap: Map<string, MedicineData> = new Map();

  // UI states
  loading: boolean = false;
  searchingBill: boolean = false;
  showReturnForm: boolean = false;
  billNotFound: boolean = false;

  // Search functionality
  private searchSubject = new Subject<string>();

  // Return reasons
  returnReasons = [
    { value: 'expired', label: 'Medicine Expired' },
    { value: 'wrong_medicine', label: 'Wrong Medicine Dispensed' },
    { value: 'patient_discharged', label: 'Patient Discharged Early' },
    { value: 'doctor_changed', label: 'Doctor Changed Prescription' },
    { value: 'excess_quantity', label: 'Excess Quantity Dispensed' },
    { value: 'other', label: 'Other Reason' }
  ];

  // Refund payment fields
  refundPaymentMode: string = 'cash';
  refundTransactionId: string = '';

  // Refund payment mode options
  refundPaymentModes = [
    { value: 'cash', label: 'Cash Refund' },
    { value: 'upi', label: 'UPI Transfer' },
    { value: 'cheque', label: 'Cheque Payment' },
    { value: 'card', label: 'Card Refund' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'other', label: 'Other Method' }
  ];

  constructor(
    private pharmaService: PharmaService,
    private toastr: ToastrService,
    private masterservcie: MasterService,
    private router: Router
  ) {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        if (searchTerm.trim()) {
          this.searchBill(searchTerm.trim());
        } else {
          this.resetForm();
        }
      });
  }

  ngOnInit(): void {
    this.loadMedicineData();
  }

  isValidRefundPayment(): boolean {
    const totalRefund = this.calculateTotalRefund();
    if (totalRefund === 0) return true;
    if (!this.refundPaymentMode) return false;
    return true;
  }

  getPaymentModeLabel(mode: string): string {
    const modeMap: { [key: string]: string } = {
      'cash': 'Cash',
      'upi': 'UPI',
      'cheque': 'Cheque',
      'card': 'Card',
      'bank_transfer': 'Bank Transfer',
      'other': 'Other Method'
    };
    return modeMap[mode] || mode;
  }

  getPaymentModeInfo(mode: string): string {
    const infoMap: { [key: string]: string } = {
      'cash': 'Cash will be refunded directly to the patient at the pharmacy counter.',
      'cheque': 'A refund cheque will be issued within 3-5 working days.',
      'card': 'Refund will be processed to the original payment card within 5-7 working days.',
      'bank_transfer': 'Amount will be transferred to patient\'s registered bank account.',
      'other': 'Please coordinate with accounts department for refund processing.'
    };
    return infoMap[mode] || '';
  }

  // Load medicine data for batch information
  loadMedicineData(): void {
    console.log('Loading medicine data for pharmacy:', this.selectedPharmacyId);

    this.masterservcie.getSubPharmacyInventoryItems(this.selectedPharmacyId).subscribe({
      next: (response) => {
        console.log('Raw medicine data response:', response);

        const medicines = response?.data || response || [];
        console.log('Processed medicines array:', medicines);

        this.medicineDataMap.clear();

        medicines.forEach((medicine: MedicineData) => {
          console.log(`Mapping medicine: "${medicine.medicine_name}" with ${medicine.batch_details?.length || 0} batches`);

          // Store with exact medicine name and variations
          const possibleKeys = [
            medicine.medicine_name,
            medicine.medicine_name?.trim(),
            medicine.medicine_name?.toLowerCase(),
            medicine.medicine_name?.toLowerCase()?.trim()
          ];

          possibleKeys.forEach(key => {
            if (key) {
              this.medicineDataMap.set(key, medicine);
            }
          });
        });

        console.log('Final medicine data map size:', this.medicineDataMap.size);
        console.log('Medicine map keys:', Array.from(this.medicineDataMap.keys()));
      },
      error: (error) => {
        console.error('Error loading medicine data:', error);
        this.toastr.error('Failed to load medicine inventory data');
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchBillNumber = searchTerm;
    this.billNotFound = false;
    this.searchSubject.next(searchTerm);
  }

  searchBill(billNumber: string): void {
    this.searchingBill = true;
    this.pharmaService.getPharmaceuticalInwardByBillNumber(billNumber).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.selectedBill = response.data;
          this.patientType = this.selectedBill!.type || '';
          this.initializeReturnItems();
          this.loadReturnHistory();
          this.showReturnForm = true;
          this.billNotFound = false;
          this.toastr.success('Bill found successfully');
        } else {
          this.billNotFound = true;
          this.showReturnForm = false;
          this.selectedBill = null;
          this.toastr.warning('Bill not found');
        }
        this.searchingBill = false;
      },
      error: (error) => {
        console.error('Error searching bill:', error);
        this.billNotFound = true;
        this.showReturnForm = false;
        this.selectedBill = null;
        this.searchingBill = false;

        if (error.status === 404) {
          this.toastr.error('Bill not found');
        } else {
          this.toastr.error('Error occurred while searching bill');
        }
      }
    });
  }

  // ✅ FIXED: Initialize return items with proper inventory unit prices
initializeReturnItems(): void {
  if (!this.selectedBill) return;

  this.returnItems = this.selectedBill.packages.map((pkg: any) => {
    console.log('=== Processing Package ===');
    console.log('Package:', pkg.medicineName, 'Original charge:', pkg.charge, 'Quantity:', pkg.quantity);

    let batchNumber = 'N/A';

    // ✅ FIXED: Use original charge as unit price (not divided by quantity)
    let actualUnitPrice = pkg.charge; // Use 100 directly, not 100/10=10

    // Try medicine lookup for batch info
    let medicineData = this.medicineDataMap.get(pkg.medicineName);

    if (!medicineData) {
      const searchKeys = [
        pkg.medicineName?.trim(),
        pkg.medicineName?.toLowerCase(),
        pkg.medicineName?.toLowerCase()?.trim()
      ];

      for (const key of searchKeys) {
        if (key && this.medicineDataMap.has(key)) {
          medicineData = this.medicineDataMap.get(key);
          break;
        }
      }
    }

    if (medicineData && medicineData.batch_details?.length > 0) {
      const availableBatches = medicineData.batch_details
        .filter(batch => batch.quantity > 0 && batch.batch_no)
        .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());

      if (availableBatches.length > 0) {
        const selectedBatch = availableBatches[0];
        batchNumber = selectedBatch.batch_no;

        // ✅ CHOICE: Use inventory price OR original bill price
        // Option 1: Use inventory price
        // actualUnitPrice = selectedBatch.unit_price;

        // Option 2: Keep original bill price (what you want)
        actualUnitPrice = pkg.charge; // Keep using original charge (100)

        console.log('Using batch:', selectedBatch.batch_no);
        console.log('Inventory price:', selectedBatch.unit_price);
        console.log('Using bill price:', actualUnitPrice);
      }
    }

    console.log('Final unit price:', actualUnitPrice); // Should be 100

    const returnItem: ReturnItem = {
      packageId: pkg._id,
      medicineName: pkg.medicineName,
      originalQuantity: pkg.quantity,
      returnedQuantity: 0,
      charge: pkg.charge,
      batchNumber: batchNumber,
      maxReturnQuantity: pkg.quantity,
      actualUnitPrice: actualUnitPrice // Should be 100, not 10
    };

    return returnItem;
  });
}



  onReturnQuantityChange(item: ReturnItem, value: number): void {
    if (value > item.maxReturnQuantity) {
      item.returnedQuantity = item.maxReturnQuantity;
      this.toastr.warning(`Maximum return quantity for ${item.medicineName} is ${item.maxReturnQuantity}`);
    } else if (value < 0) {
      item.returnedQuantity = 0;
    }
  }

  trackByPackageId(index: number, item: ReturnItem): string {
    return item.packageId;
  }

  validateReturnQuantities(): boolean {
    for (const item of this.returnItems) {
      if (item.returnedQuantity > 0) {
        if (item.returnedQuantity > item.maxReturnQuantity) {
          this.toastr.error(`Cannot return more than original quantity for ${item.medicineName}`);
          return false;
        }
        if (!item.batchNumber?.trim()) {
          this.toastr.error(`Batch number missing for ${item.medicineName}`);
          return false;
        }
      }
    }
    return true;
  }

  validateForm(): boolean {
    if (!this.searchBillNumber.trim()) {
      this.toastr.error('Please enter a bill number');
      return false;
    }

    if (!this.returnReason) {
      this.toastr.error('Please select a return reason');
      return false;
    }

    // Validate refund payment details
    const totalRefund = this.calculateTotalRefund();
    if (totalRefund > 0) {
      if (!this.refundPaymentMode) {
        this.toastr.error('Please select a refund payment mode');
        return false;
      }

      if (this.refundPaymentMode === 'upi' && (!this.refundTransactionId || !this.refundTransactionId.trim())) {
        this.toastr.error('UPI Transaction ID is required for UPI refunds');
        return false;
      }

      // Validate UPI transaction ID format
      if (this.refundPaymentMode === 'upi' && this.refundTransactionId) {
        const upiRegex = /^[A-Za-z0-9]{8,50}$/;
        if (!upiRegex.test(this.refundTransactionId.trim())) {
          this.toastr.error('Invalid UPI Transaction ID format');
          return false;
        }
      }
    }

    return this.validateReturnQuantities();
  }

  // ✅ FIXED: Use actualUnitPrice from inventory
  calculateTotalRefund(): number {
    return this.returnItems.reduce((total, item) => {
      if (item.returnedQuantity > 0) {
        const unitPrice = item.actualUnitPrice || (item.charge / item.originalQuantity);
        const refundAmount = unitPrice * item.returnedQuantity;

        console.log(`Refund calc for ${item.medicineName}:`, {
          actualUnitPrice: item.actualUnitPrice,
          returnedQuantity: item.returnedQuantity,
          refundAmount: refundAmount
        });

        return total + refundAmount;
      }
      return total;
    }, 0);
  }

  getReturnItemsForSubmission(): any[] {
    return this.returnItems
      .filter(item => item.returnedQuantity > 0)
      .map(item => ({
        packageId: item.packageId,
        quantity: item.returnedQuantity,
        batchNumber: item.batchNumber,
        actualUnitPrice: item.actualUnitPrice || (item.charge / item.originalQuantity),
        refundAmount: (item.actualUnitPrice || (item.charge / item.originalQuantity)) * item.returnedQuantity,
        medicineName: item.medicineName
      }));
  }

  onSubmitReturn(): void {
    if (!this.validateForm()) return;

    const returnItemsForSubmission = this.getReturnItemsForSubmission();

    if (returnItemsForSubmission.length === 0) {
      this.toastr.error('Please select at least one medicine to return');
      return;
    }

    const totalRefundAmount = this.calculateTotalRefund();

    const returnData = {
      originalBillNumber: this.searchBillNumber,
      returnedItems: returnItemsForSubmission,
      returnReason: this.returnReason,
      patientType: this.patientType,
      totalRefundAmount: totalRefundAmount,
      totalReturnedQuantity: returnItemsForSubmission.reduce((sum, item) => sum + item.quantity, 0),
      refundPaymentMode: this.refundPaymentMode,
      refundTransactionId: this.refundPaymentMode === 'upi' ? this.refundTransactionId.trim() : undefined
    };

    console.log('=== RETURN SUBMISSION DATA ===');
    console.log('Return Data:', returnData);

    this.loading = true;
    this.pharmaService.postPharmareturn(returnData).subscribe({
      next: (response) => {
        console.log('Return Response:', response);
        this.toastr.success(
          `Medicine return processed successfully. ₹${totalRefundAmount} refund via ${this.getPaymentModeLabel(this.refundPaymentMode)}`
        );
        this.resetForm();
        this.router.navigateByUrl('/pharmalayout/returnmedicinelist');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error processing return:', error);
        this.toastr.error(error.error?.message || 'Failed to process return');
        this.loading = false;
      }
    });
  }

  resetReturnQuantities(): void {
    this.returnItems.forEach(item => {
      item.returnedQuantity = 0;
    });
    this.refundPaymentMode = 'cash';
    this.refundTransactionId = '';
  }

  resetForm(): void {
    this.selectedBill = null;
    this.returnItems = [];
    this.returnHistory = [];
    this.returnReason = '';
    this.patientType = '';
    this.refundPaymentMode = 'cash';
    this.refundTransactionId = '';
    this.showReturnForm = false;
    this.billNotFound = false;
  }

  clearSearch(): void {
    this.searchBillNumber = '';
    this.resetForm();
  }

  getPatientInfo(): string {
    if (!this.selectedBill) return '';

    if (this.selectedBill.walkInPatient) {
      return `${this.selectedBill.walkInPatient.name} (Walk-in)`;
    }

    return this.selectedBill.uniqueHealthIdentificationId?.patient_name || 'N/A';
  }

  // Helper methods for return history
  getTotalReturnedQuantity(returnRecord: any): number {
    return returnRecord.returnDetails?.returnedPackages?.reduce((sum: number, pkg: any) => sum + pkg.returnedQuantity, 0) || 0;
  }

  getReturnReasonLabel(reason: string): string {
    const reasonMap: { [key: string]: string } = {
      'expired': 'Medicine Expired',
      'wrong_medicine': 'Wrong Medicine Dispensed',
      'patient_discharged': 'Patient Discharged Early',
      'doctor_changed': 'Doctor Changed Prescription',
      'excess_quantity': 'Excess Quantity Dispensed',
      'other': 'Other Reason'
    };
    return reasonMap[reason] || reason;
  }

  getReturnStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getTotalItemsReturned(): number {
    return this.returnHistory.reduce((sum, r) => sum + this.getTotalReturnedQuantity(r), 0);
  }

  getTotalRefundAmount(): number {
    return this.returnHistory.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
  }

  loadReturnHistory(): void {
    if (!this.searchBillNumber) return;

    console.log('Loading return history for bill:', this.searchBillNumber);

    this.pharmaService.getPharmareturnall(this.searchBillNumber).subscribe({
      next: (response) => {
        console.log('Return history response:', response);

        this.returnHistory = response?.data || response || [];
        this.showReturnHistory = this.returnHistory.length > 0;

        if (this.returnHistory.length > 0) {
          console.log(`Found ${this.returnHistory.length} return records for this bill`);
        }
      },
      error: (error) => {
        console.error('Error loading return history:', error);
        this.returnHistory = [];
        this.showReturnHistory = false;
      }
    });
  }
}
