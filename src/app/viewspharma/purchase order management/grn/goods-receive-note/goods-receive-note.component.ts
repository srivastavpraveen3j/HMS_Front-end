  import { CommonModule } from '@angular/common';
  import { Component, OnInit } from '@angular/core';
  import {
    FormArray,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
  } from '@angular/forms';
  import { ActivatedRoute, Router, RouterModule } from '@angular/router';
  import { PoService } from '../../po/service/po.service';
  import {
    debounceTime,
    switchMap,
    of,
    distinctUntilChanged,
    forkJoin,
  } from 'rxjs';
  import { GrnService } from '../service/grn.service';
  import Swal from 'sweetalert2';

  export interface ReturnPOItem {
    itemId: string;
    name: string;
    category: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    defectDetails: any[];
    returnReason: string;
    actionRequired: string;
    batchNo?: string;
    expiryDate?: string;
  }

  export interface ReturnPOData {
    _id: string;
    poNumber: string;
    originalPONumber: string;
    originalGRNNumber: string;
    vendor: {
      name: string;
      email: string;
      phone: string;
    };
    items: ReturnPOItem[];
    total: number;
    status: string;
    expectedResolutionDate: string;
    createdAt: string;
  }

  interface DefectDetail {
    serialNumber: string;
    defectReason: string;
    defectType:
      | 'damaged'
      | 'wrong_specification'
      | 'expired'
      | 'incomplete'
      | 'quality_issue'
      | 'packaging_issue'
      | 'other';
    defectSeverity: 'minor' | 'major' | 'critical';
  }

  @Component({
    selector: 'app-goods-receive-note',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './goods-receive-note.component.html',
    styleUrl: './goods-receive-note.component.css',
    standalone: true,
  })
  export class GoodsReceiveNoteComponent implements OnInit {
    // Form properties
    grnform: FormGroup;
    selectedPOData: any;
    poid: string = '';
    grnId: string | null = null;
    isQCMode: boolean = false;
    today: string = new Date().toISOString().split('T')[0];

    // Return PO tracking
    returnPOData: any = null;
    showReturnPOModal = false;
    hasReturnEligibleItems = false;

    // ✅ FIXED: Selection state management
    hasSelectedPO = false;
    selectedFromPOSearch = false;
    selectedFromVendorSearch = false;
    showPOSuggestions = false;
    showVendorSuggestions = false;
    manuallySelected = false;
    editMode = false;
    filteredPONumbers: any[] = [];
    filteredVendorNames: any[] = [];

    // Quality Control state
    qcMode = false;
    showDefectModal = false;
    currentItemIndex = -1;
    defectTypes = [
      { value: 'damaged', label: 'Damaged' },
      { value: 'wrong_specification', label: 'Wrong Specification' },
      { value: 'expired', label: 'Expired' },
      { value: 'incomplete', label: 'Incomplete' },
      { value: 'quality_issue', label: 'Quality Issue' },
      { value: 'packaging_issue', label: 'Packaging Issue' },
      { value: 'other', label: 'Other' },
    ];

    severityLevels = [
      { value: 'minor', label: 'Minor', class: 'text-warning' },
      { value: 'major', label: 'Major', class: 'text-danger' },
      { value: 'critical', label: 'Critical', class: 'text-danger fw-bold' },
    ];

    // Defect tracking
    rejectedDetailsMap: { [index: number]: DefectDetail[] } = {};

    constructor(
      private router: Router,
      private poservice: PoService,
      private fb: FormBuilder,
      private grnService: GrnService,
      private route: ActivatedRoute
    ) {
      this.grnform = this.fb.group({
        poNumber: ['', Validators.required],
        vendorName: [''],
        rfqNumber: [''],
        totalAmount: [''],
        qcPassed: [true],
        qcNotes: [''],
        items: this.fb.array([]),
      });
    }

    userPermissions: any = {};
    module: string = '';

    ngOnInit() {
      const allPermissions = JSON.parse(
        localStorage.getItem('permissions') || '[]'
      );
      const uhidModule = allPermissions.find(
        (perm: any) => perm.moduleName === 'goodreceivenote'
      );
      this.userPermissions = uhidModule?.permissions || {};
      this.module = uhidModule?.moduleName || '';

      // ✅ Setup search functionality only when no PO is selected
      this.setupPONumberSearch();
      this.setupVendorNameSearch();
      this.checkQCMode();
    }

    private checkQCMode() {
      this.route.paramMap.subscribe((params) => {
        this.grnId = params.get('grnId');

        if (this.grnId) {
          console.log('QC Mode detected for GRN:', this.grnId);
          this.isQCMode = true;
          this.qcMode = true;
          this.loadGRNForQC(this.grnId);
        }
      });
    }

    // ✅ UPDATED: PO Number search with selection state check
    private setupPONumberSearch() {
      this.grnform
        .get('poNumber')
        ?.valueChanges.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((poNumber: string) => {
            // ✅ Don't search if PO is already selected
            if (this.hasSelectedPO || this.manuallySelected) return of({ data: [] });

            return poNumber && poNumber.length > 2
              ? this.poservice.getpogeneration(1, 50, '', '', poNumber, '')
              : of({ data: [] });
          })
        )
        .subscribe((res: any) => {
          if (this.hasSelectedPO || this.manuallySelected) return;
          console.log('PO Number search results:', res);
          this.filteredPONumbers = res?.data || [];
          this.showPOSuggestions = this.filteredPONumbers.length > 0;
        });
    }

    // ✅ UPDATED: Vendor Name search with selection state check
    private setupVendorNameSearch() {
      this.grnform
        .get('vendorName')
        ?.valueChanges.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((vendorName: string) => {
            // ✅ Don't search if PO is already selected
            if (this.hasSelectedPO || this.manuallySelected) return of({ data: [] });

            return vendorName && vendorName.length > 2
              ? this.poservice.getpogeneration(1, 50, '', '', '', vendorName)
              : of({ data: [] });
          })
        )
        .subscribe((res: any) => {
          if (this.hasSelectedPO || this.manuallySelected) return;
          console.log('Vendor Name search results:', res);
          this.filteredVendorNames = res?.data || [];
          this.showVendorSuggestions = this.filteredVendorNames.length > 0;
        });
    }

    // ✅ UPDATED: PO Number input handler
    onPONumberInput(): void {
      if (this.hasSelectedPO || this.editMode) {
        this.filteredPONumbers = [];
        this.showPOSuggestions = false;
        return;
      }

      const value = this.grnform.get('poNumber')?.value;
      if (!value || value.length <= 2) {
        this.filteredPONumbers = [];
        this.showPOSuggestions = false;
      } else {
        this.showPOSuggestions = true;
      }
    }

    // ✅ NEW: PO focus handler
    onPOFocus(): void {
      if (!this.hasSelectedPO && this.filteredPONumbers.length > 0) {
        this.showPOSuggestions = true;
      }
    }

    // ✅ UPDATED: Vendor Name input handler
    onVendorNameInput(): void {
      if (this.hasSelectedPO || this.editMode) {
        this.filteredVendorNames = [];
        this.showVendorSuggestions = false;
        return;
      }

      const value = this.grnform.get('vendorName')?.value;
      if (!value || value.length <= 2) {
        this.filteredVendorNames = [];
        this.showVendorSuggestions = false;
      } else {
        this.showVendorSuggestions = true;
      }
    }

    // ✅ NEW: Vendor focus handler
    onVendorFocus(): void {
      if (!this.hasSelectedPO && this.filteredVendorNames.length > 0) {
        this.showVendorSuggestions = true;
      }
    }

    // ✅ UPDATED: Hide suggestion methods
    hidePOSuggestionsWithDelay(): void {
      setTimeout(() => (this.showPOSuggestions = false), 200);
    }

    hideVendorSuggestionsWithDelay(): void {
      setTimeout(() => (this.showVendorSuggestions = false), 200);
    }

    get itemsControls(): FormGroup[] {
      return (this.grnform.get('items') as FormArray).controls as FormGroup[];
    }

    // ✅ UPDATED: Enhanced selectPatient method
    selectPatient(patient: any) {
      console.log('✅ Selecting PO/Patient:', patient);

      this.selectedPOData = patient;
      this.poid = patient._id;
      this.manuallySelected = true;

      // ✅ Mark as selected and prevent further searches
      this.hasSelectedPO = true;
      this.selectedFromPOSearch = true;
      this.selectedFromVendorSearch = true;

      this.grnform.patchValue({
        poNumber: patient.poNumber,
        qcPassed: true,
        vendorName: patient.vendor?.name || '',
        rfqNumber: patient.rfq?.number || '',
        totalAmount: patient.total || '',
      });

      const itemsArray = this.grnform.get('items') as FormArray;
      itemsArray.clear();

      (patient.items || []).forEach((item: any, index: number) => {
        const group = this.fb.group({
          itemId: [item.itemId],
          item: [item.name],
          orderedQty: [item.quantity],
          receivedQty: [item.quantity],
          unitPrice: [item.unitPrice],
          totalPrice: [item.totalPrice],
          passQty: ['', [Validators.min(0)]],
          rejectedQty: [{ value: '', disabled: true }],
          batchNo: [''],
          expiryDate: [''],
          remarks: [''],
          qcStatus: ['pending'],
          hasDefects: [false],
        });
        itemsArray.push(group);

        // Initialize defect details
        this.rejectedDetailsMap[index] = [];
      });

      // ✅ Hide both suggestion dropdowns and clear arrays
      this.showPOSuggestions = false;
      this.showVendorSuggestions = false;
      this.filteredPONumbers = [];
      this.filteredVendorNames = [];

      console.log('✅ PO selected successfully, dropdowns hidden');
    }

    // ✅ NEW: Reset selection method
    resetSelection(): void {
      console.log('🔄 Resetting PO selection...');

      this.hasSelectedPO = false;
      this.selectedFromPOSearch = false;
      this.selectedFromVendorSearch = false;
      this.manuallySelected = false;
      this.selectedPOData = null;
      this.poid = '';

      // Reset form
      this.grnform.patchValue({
        poNumber: '',
        vendorName: '',
        rfqNumber: '',
        totalAmount: '',
      });

      // Clear items array
      const itemsArray = this.grnform.get('items') as FormArray;
      itemsArray.clear();

      // Clear suggestion arrays
      this.filteredPONumbers = [];
      this.filteredVendorNames = [];
      this.showPOSuggestions = false;
      this.showVendorSuggestions = false;

      console.log('✅ Selection reset, ready for new search');
    }

    // 🚀 Populate form with GRN data for QC
    private populateFormForQC(grn: any) {
      this.selectedPOData = grn;
      this.hasSelectedPO = true;  // ✅ Mark as selected for QC mode

      console.log('🔍 DEBUG: GRN Items from backend:', grn.items.map((item: any) => ({
        _id: item._id,
        itemId: item.itemId,
        name: item.name,
        quantityOrdered: item.quantityOrdered,
        quantityReceived: item.quantityReceived,
      })));

      this.grnform.patchValue({
        poNumber: grn.poNumber,
        vendorName: grn.vendor?.name || '',
        rfqNumber: grn.rfq?.number || '',
        totalAmount: grn.total || '',
        qcPassed: true,
        qcNotes: grn.qcSummary?.qcNotes || '',
      });

      const itemsArray = this.grnform.get('items') as FormArray;
      itemsArray.clear();

      (grn.items || []).forEach((item: any, index: number) => {
        console.log(`🔍 DEBUG: Processing item ${index + 1}:`, {
          _id: item._id,
          itemId: item.itemId,
          name: item.name,
        });

        const group = this.fb.group({
          itemId: [item._id],
          originalItemId: [item.itemId],
          item: [item.name],
          orderedQty: [item.quantityOrdered || item.quantityReceived],
          receivedQty: [item.quantityReceived],
          unitPrice: [item.unitPrice],
          totalPrice: [item.totalPrice],
          passQty: [item.quantityPassed || '', [Validators.min(0)]],
          rejectedQty: [{ value: item.quantityRejected || '', disabled: true }],
          batchNo: [item.batchNo || '', [Validators.required]],
          expiryDate: [item.expiryDate || '', [Validators.required]],
          remarks: [item.remarks || ''],
          qcStatus: [item.qcStatus || 'pending'],
          hasDefects: [item.defectDetails?.length > 0 || false],
        });
        itemsArray.push(group);

        this.rejectedDetailsMap[index] = item.defectDetails || [];
      });

      this.enableQCFields();
    }

    private enableQCFields() {
      this.itemsControls.forEach((control) => {
        control.get('passQty')?.enable();
        control.get('batchNo')?.enable();
        control.get('expiryDate')?.enable();
        control.get('remarks')?.enable();
      });
    }

    updateRejectedQty(index: number) {
      const itemsArray = this.grnform.get('items') as FormArray;
      const control = itemsArray.at(index);
      const ordered = Number(control.get('orderedQty')?.value || 0);
      let passed = Number(control.get('passQty')?.value || 0);

      // Ensure passed doesn't exceed ordered
      if (passed > ordered) {
        passed = ordered;
        control.get('passQty')?.setValue(ordered);
      }

      let rejected = 0;

      if (passed + rejected === ordered || passed === ordered) {
        rejected = ordered - passed;
      } else {
        rejected = Math.max(0, ordered - passed);
      }

      control.get('rejectedQty')?.setValue(rejected);

      const totalProcessed = passed + rejected;

      if (totalProcessed === 0) {
        control.get('qcStatus')?.setValue('pending');
        control.get('hasDefects')?.setValue(false);
      } else if (rejected === 0 && passed > 0) {
        control.get('qcStatus')?.setValue('passed');
        control.get('hasDefects')?.setValue(false);
        this.rejectedDetailsMap[index] = [];
      } else if (passed === 0 && rejected > 0) {
        control.get('qcStatus')?.setValue('full_reject');
        control.get('hasDefects')?.setValue(true);
      } else if (passed > 0 && rejected > 0) {
        control.get('qcStatus')?.setValue('partial_reject');
        control.get('hasDefects')?.setValue(true);
      }

      console.log(
        `Item ${index + 1}: Ordered=${ordered}, Passed=${passed}, Rejected=${rejected}, Total Processed=${totalProcessed}`
      );
    }

    // Check if rejected items need defect details
    isRejectedIncomplete(index: number): boolean {
      const item = this.itemsControls[index];
      const rejectedQty = item.get('rejectedQty')?.value || 0;
      const defectDetails = this.rejectedDetailsMap[index] || [];

      return rejectedQty > 0 && defectDetails.length === 0;
    }

    // Open defect details modal
    openDefectModal(index: number) {
      this.currentItemIndex = index;
      this.showDefectModal = true;
    }

    // Add defect detail
    addDefectDetail() {
      if (this.currentItemIndex === -1) return;

      const rejectedQty =
        this.itemsControls[this.currentItemIndex].get('rejectedQty')?.value || 0;

      if (rejectedQty > 0) {
        const newDefect: DefectDetail = {
          serialNumber: `DEF-${Date.now()}`,
          defectReason: '',
          defectType: 'quality_issue',
          defectSeverity: 'major',
        };

        if (!this.rejectedDetailsMap[this.currentItemIndex]) {
          this.rejectedDetailsMap[this.currentItemIndex] = [];
        }

        this.rejectedDetailsMap[this.currentItemIndex].push(newDefect);
      }
    }

    // Remove defect detail
    removeDefectDetail(index: number) {
      if (this.currentItemIndex === -1) return;
      this.rejectedDetailsMap[this.currentItemIndex].splice(index, 1);
    }

    // Get defect count for item
    getDefectCount(itemIndex: number): number {
      return this.rejectedDetailsMap[itemIndex]?.length || 0;
    }

    // Get QC status badge class
    getQCStatusBadgeClass(status: string): string {
      switch (status) {
        case 'passed':
          return 'badge bg-success';
        case 'partial_reject':
          return 'badge bg-warning';
        case 'full_reject':
          return 'badge bg-danger';
        case 'pending':
          return 'badge bg-secondary';
        default:
          return 'badge bg-light';
      }
    }

    // Toggle QC Mode
    toggleQCMode() {
      this.qcMode = !this.qcMode;
      if (this.qcMode) {
        // Enable QC fields
        this.itemsControls.forEach((control) => {
          control.get('passQty')?.enable();
          control.get('batchNo')?.enable();
          control.get('expiryDate')?.enable();
          control.get('remarks')?.enable();
        });
      }
    }

    // Submit GRN (Initial Receipt)
    submitGRN() {
      if (this.qcMode) {
        this.performQualityControl();
        return;
      }

      const formValue = this.grnform.value;
      const user = JSON.parse(localStorage.getItem('authUser') || '{}');

      const grnPayload = {
        poNumber: formValue.poNumber,
        poId: this.poid,
        vendor: {
          id: this.selectedPOData.vendor.id,
          name: this.selectedPOData.vendor.name,
          email: this.selectedPOData.vendor.email,
          phone: this.selectedPOData.vendor.phone,
        },
        rfq: {
          id: this.selectedPOData.rfq.id,
          number: this.selectedPOData.rfq.number,
        },
        items: formValue.items.map((item: any, index: number) => {
          const original = this.selectedPOData.items[index];
          return {
            itemId: original.itemId,
            name: original.name,
            category: original.category || '',
            quantityOrdered: item.orderedQty,
            unitPrice: item.unitPrice,
            totalPrice: original.totalPrice,
          };
        }),
        total: this.selectedPOData.total,
        createdBy: user._id,
      };

      // Show loading
      Swal.fire({
        title: 'Creating GRN & Updating PO...',
        text: 'Please wait while we process your request.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Create GRN and update PO status in parallel
      const grnCreation$ = this.grnService.postgrngeneration(grnPayload);
      const poUpdate$ = this.poservice.updatepogeneration(this.poid, {
        potogrn: 'grngiven',
      });

      // Execute both operations
      forkJoin({
        grn: grnCreation$,
        po: poUpdate$,
      }).subscribe({
        next: (results) => {
          console.log('✅ GRN Created & PO Updated:', results);

          Swal.fire({
            icon: 'success',
            title: 'GRN Created Successfully!',
            html: `
              <div class="text-start">
                <h6><strong>✅ Processing Complete:</strong></h6>
                <div class="alert alert-success">
                  <strong>📋 GRN:</strong> ${
                    results.grn.data?.grnNumber || 'Created successfully'
                  }<br>
                  <strong>🔄 PO Status:</strong> Updated to 'GRN Given'<br>
                  <strong>📦 Items:</strong> ${
                    formValue.items.length
                  } items processed
                </div>
                <p><em>Ready for quality control inspection.</em></p>
              </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Start QC Now',
            cancelButtonText: 'Go to List',
            width: '500px',
          }).then((result) => {
            if (result.isConfirmed) {
              const grnId = results.grn.data?._id || results.grn._id;
              if (grnId) {
                this.router.navigate([
                  '/inventorylayout/goodreceivenote',
                  grnId,
                  'quality-control',
                ]);
              }
            } else {
              this.router.navigateByUrl('/inventorylayout/goodreceivenotelist');
            }
          });

          this.grnform.reset();
          this.resetSelection(); // ✅ Reset selection after successful submission
        },
        error: (err) => {
          console.error('❌ Error in GRN/PO process:', err);

          // Handle partial failures
          if (err.grn && !err.po) {
            Swal.fire({
              icon: 'warning',
              title: 'GRN Created, PO Update Failed',
              text: 'GRN was created successfully but failed to update PO status. Please update manually.',
            });
          } else if (!err.grn && err.po) {
            Swal.fire({
              icon: 'warning',
              title: 'PO Updated, GRN Creation Failed',
              text: 'PO was updated but GRN creation failed. Please try creating GRN again.',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Operation Failed',
              text: 'Failed to create GRN and update PO. Please try again.',
            });
          }
        },
      });
    }

    // Perform Quality Control
    performQualityControl() {
      const formValue = this.grnform.value;
      const issuesFound: string[] = [];

      // Check each item for basic validation
      formValue.items.forEach((item: any, index: number) => {
        const orderedQty = parseInt(item.orderedQty) || 0;
        const passedQty = parseInt(item.passQty) || 0;
        const rejectedQty = parseInt(item.rejectedQty) || 0;
        const processedQty = passedQty + rejectedQty;

        if (processedQty > orderedQty) {
          issuesFound.push(
            `• ${item.item}: Processed quantity (${processedQty}) exceeds ordered quantity (${orderedQty})`
          );
        }
      });

      // Show validation errors if any
      if (issuesFound.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Quantity Validation Issues',
          html: `
          <div class="text-start">
            <p><strong>Please fix these issues:</strong></p>
            ${issuesFound.join('<br>')}
          </div>
        `,
          showConfirmButton: true,
        });
        return;
      }

      const processedItems = formValue.items.filter((item: any) => {
        const rejectedQty = parseInt(item.rejectedQty) || 0;
        return rejectedQty > 0;
      });

      const incompleteDefectItems = processedItems.filter(
        (item: any, originalIndex: number) => {
          const formIndex = formValue.items.findIndex(
            (fItem: any) => fItem.itemId === item.itemId
          );
          const defectDetails = this.rejectedDetailsMap[formIndex] || [];
          return defectDetails.length === 0;
        }
      );

      if (incompleteDefectItems.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Defect Details',
          html: `
          <div class="text-start">
            <p><strong>${
              incompleteDefectItems.length
            } rejected items need defect details:</strong></p>
            ${incompleteDefectItems
              .map((item: any) => `• ${item.item}`)
              .join('<br>')}
            <br><br>
            <p><em>Please click the "Defects" button for each rejected item to add defect details.</em></p>
          </div>
        `,
          showConfirmButton: true,
        });
        return;
      }

      const totalOrdered = formValue.items.reduce(
        (sum: number, item: any) => sum + (parseInt(item.orderedQty) || 0),
        0
      );
      const totalPassed = formValue.items.reduce(
        (sum: number, item: any) => sum + (parseInt(item.passQty) || 0),
        0
      );
      const totalRejected = formValue.items.reduce(
        (sum: number, item: any) => sum + (parseInt(item.rejectedQty) || 0),
        0
      );
      const totalProcessed = totalPassed + totalRejected;
      const remainingQty = totalOrdered - totalProcessed;

      const processingType =
        remainingQty === 0 ? 'Complete Processing' : 'Partial Processing';
      const statusClass = remainingQty === 0 ? 'success' : 'info';

      Swal.fire({
        icon: statusClass as any,
        title: `${processingType} - Quality Control`,
        html: `
        <div class="text-start">
          <h6><strong>📊 Processing Summary:</strong></h6>
          <div class="alert alert-${statusClass}">
            <strong>Total Ordered:</strong> ${totalOrdered} items<br>
            <strong>✅ Passed:</strong> ${totalPassed} items<br>
            <strong>❌ Rejected:</strong> ${totalRejected} items<br>
            <strong>📝 Processed:</strong> ${totalProcessed} items<br>
            ${
              remainingQty > 0
                ? `<strong>⏳ Remaining:</strong> ${remainingQty} items (can be processed later)`
                : ''
            }
          </div>

          ${
            remainingQty > 0
              ? `
          <div class="alert alert-warning">
            <strong>⚠️ Partial Processing:</strong><br>
            This will save current QC results. Remaining ${remainingQty} items can be processed later.
          </div>
          `
              : ''
          }

          <p><em>Do you want to continue with this ${processingType.toLowerCase()}?</em></p>
        </div>
      `,
        showCancelButton: true,
        confirmButtonText: `Continue ${processingType}`,
        cancelButtonText: 'Review Again',
        width: '600px',
      }).then((result) => {
        if (result.isConfirmed) {
          this.proceedWithQualityControl();
        }
      });
    }

    proceedWithQualityControl() {
      const qcData = this.debugQCPayload();

      // Proceed with QC
      if (this.grnId) {
        this.performExistingGRNQC(qcData);
      } else {
        this.createGRNWithQC(qcData);
      }
    }

    private performExistingGRNQC(qcData: any) {
      // Show loading
      Swal.fire({
        title: 'Processing Quality Control...',
        text: 'Please wait while we process the quality inspection.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Call QC API
      this.grnService.performQualityControl(this.grnId!, qcData).subscribe({
        next: (qcResponse) => {
          console.log('✅ QC Response:', qcResponse);

          const grnStatus = qcResponse.data?.grnStatus;
          const isAlreadyApproved = grnStatus === 'approved';

          if (isAlreadyApproved) {
            // GRN was auto-approved, show completion message
            Swal.fire({
              icon: 'success',
              title: 'Quality Control & Approval Complete! 🎉',
              html: `
              <div class="text-start">
                <h6><strong>✅ Processing Complete:</strong></h6>

                <div class="alert alert-success">
                  <strong>📋 Quality Control:</strong><br>
                  • Passed Items: ${qcResponse.qcSummary?.passedItems || 0}<br>
                  • Rejected Items: ${
                    qcResponse.qcSummary?.rejectedItems || 0
                  }<br>
                  • Defects Recorded: ${qcResponse.qcSummary?.defectiveItems || 0}
                </div>

                <div class="alert alert-info">
                  <strong>🚀 Status:</strong> ${grnStatus}<br>
                  <strong>💰 Approved Value:</strong> ₹${
                    qcResponse.data?.approvedTotal || 0
                  }
                </div>

                <p><em>GRN has been automatically approved after quality control.</em></p>
              </div>
            `,
              width: '600px',
              confirmButtonText: 'View Inventory Updates',
              showCancelButton: true,
              cancelButtonText: 'Go to GRN List',
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('/inventorylayout/inventorystocklist');
              } else {
                this.router.navigateByUrl('/inventorylayout/goodreceivenotelist');
              }
            });
          } else {
            // Normal flow - QC done, needs manual approval
            Swal.fire({
              icon: 'success',
              title: 'Quality Control Complete',
              html: `
              <div class="text-start">
                <strong>QC Summary:</strong><br>
                • Passed Items: ${qcResponse.qcSummary?.passedItems || 0}<br>
                • Rejected Items: ${qcResponse.qcSummary?.rejectedItems || 0}<br>
                • Defects Recorded: ${
                  qcResponse.qcSummary?.defectiveItems || 0
                }<br>
                • Status: ${grnStatus || 'Updated'}
              </div>
            `,
              showCancelButton: true,
              confirmButtonText: 'Approve & Update Inventory',
              cancelButtonText: 'Save QC Only',
            }).then((result) => {
              if (result.isConfirmed) {
                this.approveAndUpdateInventory();
              } else {
                this.router.navigateByUrl('/inventorylayout/goodreceivenotelist');
              }
            });
          }
        },
        error: (err) => {
          console.error('❌ QC Error:', err);
          Swal.fire({
            icon: 'error',
            title: 'Quality Control Failed',
            text:
              err.error?.message ||
              'Failed to complete quality control. Please try again.',
          });
        },
      });
    }

    private createGRNWithQC(qcData: any) {
      // First create the GRN
      const formValue = this.grnform.value;
      const user = JSON.parse(localStorage.getItem('authUser') || '{}');

      const grnPayload = {
        poNumber: formValue.poNumber,
        vendor: {
          id: this.selectedPOData.vendor.id,
          name: this.selectedPOData.vendor.name,
          email: this.selectedPOData.vendor.email,
          phone: this.selectedPOData.vendor.phone,
        },
        rfq: {
          id: this.selectedPOData.rfq.id,
          number: this.selectedPOData.rfq.number,
        },
        items: formValue.items.map((item: any, index: number) => {
          const original = this.selectedPOData.items[index];
          return {
            itemId: original.itemId,
            name: original.name,
            category: original.category || '',
            quantityOrdered: item.orderedQty,
            unitPrice: item.unitPrice,
            totalPrice: original.totalPrice,
          };
        }),
        total: this.selectedPOData.total,
        createdBy: user._id,
      };

      // Show loading
      Swal.fire({
        title: 'Creating GRN and Processing QC...',
        text: 'Please wait while we create the GRN and process quality control.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Create GRN first
      this.grnService.postgrngeneration(grnPayload).subscribe({
        next: (grnResponse) => {
          console.log('✅ GRN Created:', grnResponse);

          const newGrnId = grnResponse.data?._id || grnResponse._id;

          if (newGrnId) {
            // Now perform QC on the newly created GRN
            this.grnService.performQualityControl(newGrnId, qcData).subscribe({
              next: (qcResponse) => {
                console.log('✅ QC Completed on new GRN:', qcResponse);

                Swal.fire({
                  icon: 'success',
                  title: 'GRN Created & QC Complete',
                  html: `
                  <div class="text-start">
                    <strong>GRN:</strong> ${
                      grnResponse.data?.grnNumber || 'Created'
                    }<br>
                    <strong>QC Summary:</strong><br>
                    • Passed Items: ${qcResponse.qcSummary?.passedItems || 0}<br>
                    • Rejected Items: ${
                      qcResponse.qcSummary?.rejectedItems || 0
                    }<br>
                    • Defects Recorded: ${
                      qcResponse.qcSummary?.defectiveItems || 0
                    }
                  </div>
                `,
                  showCancelButton: true,
                  confirmButtonText: 'Approve & Update Inventory',
                  cancelButtonText: 'Go to List',
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.grnId = newGrnId; // Set for approval
                    this.approveAndUpdateInventory();
                  } else {
                    this.router.navigateByUrl(
                      '/inventorylayout/goodreceivenotelist'
                    );
                  }
                });
              },
              error: (err) => {
                console.error('❌ QC Error on new GRN:', err);
                Swal.fire({
                  icon: 'warning',
                  title: 'GRN Created but QC Failed',
                  text: 'GRN was created but quality control failed. You can retry QC from the GRN list.',
                  confirmButtonText: 'Go to GRN List',
                }).then(() => {
                  this.router.navigateByUrl(
                    '/inventorylayout/goodreceivenotelist'
                  );
                });
              },
            });
          }
        },
        error: (err) => {
          console.error('❌ GRN Creation Error:', err);
          Swal.fire({
            icon: 'error',
            title: 'GRN Creation Failed',
            text: 'Failed to create GRN. Please try again.',
          });
        },
      });
    }

    getSeverityClass(severity: string): string {
      const severityLevel = this.severityLevels.find((s) => s.value === severity);
      return severityLevel?.class || '';
    }

    getSeverityLabel(severity: string): string {
      const severityLevel = this.severityLevels.find((s) => s.value === severity);
      return severityLevel?.label || severity;
    }

    debugQCPayload() {
      const formValue = this.grnform.value;
      const qcData = {
        items: formValue.items.map((item: any, index: number) => ({
          itemId: item.itemId,
          quantityPassed: parseInt(item.passQty) || 0,
          quantityRejected: parseInt(item.rejectedQty) || 0,
          defectDetails: this.rejectedDetailsMap[index] || [],
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,
          remarks: item.remarks,
        })),
        qcNotes: formValue.qcNotes,
        partialProcessing: true,
      };

      console.log('🚀 Final QC Payload:', JSON.stringify(qcData, null, 2));
      console.log('🚀 GRN ID:', this.grnId);

      return qcData;
    }

    private loadGRNForQC(grnId: string) {
      this.grnService.getgrngenerationById(grnId).subscribe({
        next: (response) => {
          console.log('Loaded GRN for QC:', response);
          const grn = response.data || response;
          this.populateFormForQC(grn);

          // Check for existing return POs and eligibility
          if (grn.grnStatus === 'approved') {
            this.loadReturnPOs();
            this.checkReturnEligibility();
          }
        },
        error: (err) => {
          console.error('Error loading GRN for QC:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load GRN for quality control.',
          });
          this.router.navigateByUrl('/inventorylayout/goodreceivenotelist');
        },
      });
    }

    private checkReturnEligibility() {
      if (!this.grnId) return;

      this.grnService.checkReturnEligibility(this.grnId).subscribe({
        next: (response) => {
          this.hasReturnEligibleItems = response.eligible;
          console.log('Return eligibility:', response);
        },
        error: (error) => {
          console.error('Error checking return eligibility:', error);
        },
      });
    }

    private loadReturnPOs() {
      if (!this.grnId) return;

      this.grnService.getReturnPOsByGRN(this.grnId).subscribe({
        next: (response) => {
          this.returnPOData = response.data;
          console.log('Return POs loaded:', response);
        },
        error: (error) => {
          console.error('Error loading return POs:', error);
        },
      });
    }

  // In your goods-receive-note.component.ts
// In your goods-receive-note.component.ts
private approveAndUpdateInventory() {
  if (!this.grnId) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No GRN ID available for approval.',
    });
    return;
  }

  console.log('🚀 Starting approval process for GRN:', this.grnId);

  // Show comprehensive loading
  Swal.fire({
    title: 'Processing Final Approval...',
    html: `
      <div class="text-start">
        <p>📋 Approving quality control results...</p>
        <p>💊 Adding approved items to medicine inventory...</p>
        <p>🔍 Checking for defective items...</p>
        <p>↩️ Auto-generating return PO if needed...</p>
        <p>🔄 Updating PO status...</p>
      </div>
    `,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  // Step 1: Approve GRN (with auto Return PO generation)
  this.grnService.approveGRN(this.grnId, this.grnform.value.qcNotes).subscribe({
    next: (approvalResponse) => {
      console.log('✅ GRN Approved:', approvalResponse);

      // Check if Return PO was auto-generated
      const returnPOInfo = approvalResponse.results?.returnPOGenerated;

      let successHtml = `
        <div class="text-start">
          <h6><strong>✅ Processing Summary:</strong></h6>
          <div class="alert alert-success">
            <strong>💊 Inventory Updates:</strong><br>
            • Items Added to Inventory: ${approvalResponse.results?.inventoryUpdated?.length || 0}<br>
            • Items Returned: ${approvalResponse.results?.returnsGenerated?.length || 0}<br>
            • Approved Value: ₹${approvalResponse.data?.approvedTotal || 0}<br>
            • Rejected Value: ₹${approvalResponse.data?.rejectedTotal || 0}
          </div>`;

      // Add Return PO information if generated
      if (returnPOInfo) {
        successHtml += `
          <div class="alert alert-warning">
            <strong>↩️ Return PO Auto-Generated:</strong><br>
            • Return PO Number: ${returnPOInfo.rpoNumber}<br>
            • Defective Items: ${returnPOInfo.defectiveItems} items<br>
            • Return Value: ₹${returnPOInfo.totalValue}<br>
            • Status: Auto-generated and sent to vendor
          </div>`;
      }

      successHtml += `</div>`;

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'GRN Processing Complete! 🎉',
        html: successHtml,
        width: '700px',
        confirmButtonText: 'View Inventory',
        showCancelButton: true,
        cancelButtonText: 'Back to GRN List',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigateByUrl('/inventorylayout/inventorystocklist');
        } else {
          this.router.navigateByUrl('/inventorylayout/goodreceivenotelist');
        }
      });
    },
    error: (err) => {
      console.error('❌ Approval Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: err.error?.message || 'Failed to approve GRN.',
      });
    },
  });
}


    generateReturnPOManually() {
      if (!this.grnId) {
        console.error('❌ No GRN ID available for manual return PO generation');
        return;
      }

      console.log(
        '🚀 Manual Return PO generation requested for GRN:',
        this.grnId
      );

      Swal.fire({
        title: 'Generate Return PO?',
        html: `
        <div class="text-start">
          <p>This will generate a Return Purchase Order for all defective items in this GRN.</p>
          <p><strong>Actions:</strong></p>
          <ul>
            <li>Create Return PO document</li>
            <li>Send notification to vendor</li>
            <li>Track return process</li>
          </ul>
          <p><em>GRN ID: ${this.grnId}</em></p>
        </div>
      `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Generate Return PO',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Generating Return PO...',
            text: 'Please wait while we create the return purchase order.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });

          console.log('🚀 Calling generateReturnPO API...');

          this.grnService.generateReturnPO(this.grnId!).subscribe({
            next: (response) => {
              console.log(
                '✅ Manual Return PO Generated Successfully:',
                response
              );
              this.returnPOData = response.data;

              Swal.fire({
                icon: 'success',
                title: 'Return PO Generated!',
                html: `
                <div class="text-start">
                  <strong>Return PO Number:</strong> ${
                    response.data.returnPO?.rpoNumber || 'Generated'
                  }<br>
                  <strong>Defective Items:</strong> ${
                    response.data.returnPO?.defectiveItems || 'N/A'
                  }<br>
                  <strong>Total Value:</strong> ₹${
                    response.data.returnPO?.totalValue || '0'
                  }<br>
                  <strong>Email Status:</strong> ${
                    response.emailResult?.status || 'N/A'
                  }<br>
                  <strong>Vendor:</strong> ${
                    response.data.returnPO?.vendor?.name || 'N/A'
                  }
                </div>
              `,
                showCancelButton: true,
                confirmButtonText: 'View Return PO',
                cancelButtonText: 'Continue',
              });
            },
            error: (error) => {
              console.error('❌ Manual Return PO Generation Error:', error);

              let errorMessage = 'Failed to generate Return PO.';
              if (error.error?.message) {
                errorMessage = error.error.message;
              } else if (error.message) {
                errorMessage = error.message;
              }

              Swal.fire({
                icon: 'error',
                title: 'Return PO Generation Failed',
                html: `
                <div class="text-start">
                  <p><strong>Error:</strong> ${errorMessage}</p>
                  <p><strong>GRN ID:</strong> ${this.grnId}</p>
                </div>
              `,
                width: '500px',
              });
            },
          });
        }
      });
    }
  }
