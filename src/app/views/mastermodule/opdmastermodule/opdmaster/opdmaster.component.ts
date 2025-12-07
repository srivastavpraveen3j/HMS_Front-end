import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
import Swal from 'sweetalert2';
import { IndianCurrencyPipe } from '../../../../pipe/indian-currency.pipe';

@Component({
  selector: 'app-opdmaster',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, IndianCurrencyPipe],
  templateUrl: './opdmaster.component.html',
  styleUrl: './opdmaster.component.css',
})
export class OpdmasterComponent {
  doctors: any = [];
  serviceform: FormGroup;
  serviceId: string | null = null;
  editMode: boolean = false;
  uploadMode: 'single' | 'bulk' = 'single';
  selectedFile: File | null = null;
  showRatePerUnit: boolean = false;

  // Billing type configurations
  billingTypes = [
    { value: 'fixed', label: 'Fixed Charge', icon: '✅', defaultUnit: 'service' },
    { value: 'hourly', label: 'Per Hour', icon: '⏰', defaultUnit: 'hour' },
    { value: 'daily', label: 'Per Day', icon: '📅', defaultUnit: 'day' },
    { value: 'session', label: 'Per Session', icon: '🔄', defaultUnit: 'session' },
    { value: 'quantity', label: 'Per Quantity', icon: '📦', defaultUnit: 'unit' },
  ];

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.serviceform = this.fb.group({
      name: ['', Validators.required],
      charge: ['', [Validators.required, Validators.min(0)]],
      type: ['', Validators.required],

      // ✅ NEW FIELDS
      billingType: ['fixed', Validators.required],
      ratePerUnit: [0, [Validators.min(0)]],
      unitLabel: ['service'],
      minUnits: [1, [Validators.min(0)]],
      maxUnits: [null],
      description: [''],
      isActive: [true]
    });

    // Watch billing type changes
    this.serviceform.get('billingType')?.valueChanges.subscribe(() => {
      this.onBillingTypeChange();
    });
  }

  userPermissions: any = {};

  ngOnInit() {
    // Load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'service'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // Load doctors
    this.masterService.getDoctors().subscribe((res) => {
      this.doctors = res.data.data;
    });

    // Check for edit mode
    this.route.queryParams.subscribe((params) => {
      const serviceId = params['_id'];
      if (serviceId) {
        this.editMode = true;
        this.serviceId = serviceId;
        this.loadService(serviceId);
      } else {
        this.editMode = false;
        this.onBillingTypeChange(); // Initialize form state
      }
    });

     this.serviceform.get('charge')?.valueChanges.subscribe((charge) => {
    const billingType = this.serviceform.get('billingType')?.value;
    if (billingType === 'fixed') {
      this.serviceform.patchValue({ ratePerUnit: charge || 0 });
    } else if (!this.serviceform.get('ratePerUnit')?.value) {
      // Auto-fill rate per unit with base charge if empty
      this.serviceform.patchValue({ ratePerUnit: charge || 0 });
    }
  });
  }

  loadService(serviceId: string) {
    this.masterService.getServiceById(serviceId).subscribe((res: any) => {
      console.log("service", res);
      const service = res || res?.data;

      if (service) {
        this.serviceform.patchValue({
          name: service.name,
          charge: service.charge,
          type: service.type,
          billingType: service.billingType || 'fixed',
          ratePerUnit: service.ratePerUnit || service.charge,
          unitLabel: service.unitLabel || 'service',
          minUnits: service.minUnits || 1,
          maxUnits: service.maxUnits || null,
          description: service.description || '',
          isActive: service.isActive !== undefined ? service.isActive : true
        });
        this.onBillingTypeChange(); // Update form state
      }
    });
  }

  // ✅ NEW METHOD: Handle billing type changes
 // ✅ FIXED: Handle billing type changes properly
onBillingTypeChange() {
  const billingType = this.serviceform.get('billingType')?.value;
  console.log('🔄 Billing type changed to:', billingType); // Debug log

  this.showRatePerUnit = billingType !== 'fixed';

  if (billingType === 'fixed') {
    // For fixed billing, ratePerUnit should equal charge
    const charge = this.serviceform.get('charge')?.value;
    this.serviceform.patchValue({
      ratePerUnit: charge || 0,
      unitLabel: 'service',
      minUnits: 1
    });

    // Remove validators for rate per unit
    this.serviceform.get('ratePerUnit')?.clearValidators();
  } else {
    // For time-based billing, add validators
    this.serviceform.get('ratePerUnit')?.setValidators([Validators.required, Validators.min(0)]);

    // Set default unit label
    const defaultUnit = this.getDefaultUnitLabel();
    this.serviceform.patchValue({
      ratePerUnit: this.serviceform.get('charge')?.value || 0, // ✅ Use base charge as default
      unitLabel: defaultUnit
    });
  }

  this.serviceform.get('ratePerUnit')?.updateValueAndValidity();

  // ✅ Force change detection
  setTimeout(() => {
    this.serviceform.get('billingType')?.updateValueAndValidity();
  }, 0);
}

// ✅ Also watch charge changes to auto-fill ratePerUnit


  // ✅ NEW METHOD: Get default unit label based on billing type
  getDefaultUnitLabel(): string {
    const billingType = this.serviceform.get('billingType')?.value;
    const config = this.billingTypes.find(bt => bt.value === billingType);
    return config?.defaultUnit || 'unit';
  }

  // ✅ NEW METHOD: Get unit display name
  getUnitDisplayName(): string {
    const unitLabel = this.serviceform.get('unitLabel')?.value || this.getDefaultUnitLabel();
    return unitLabel.charAt(0).toUpperCase() + unitLabel.slice(1);
  }

  // ✅ NEW METHOD: Get billing type label
  getBillingTypeLabel(): string {
    const billingType = this.serviceform.get('billingType')?.value;
    const config = this.billingTypes.find(bt => bt.value === billingType);
    return config?.label || 'Fixed Charge';
  }

  // ✅ NEW METHOD: Get billing type icon
  getBillingTypeIcon(): string {
    const billingType = this.serviceform.get('billingType')?.value;
    const config = this.billingTypes.find(bt => bt.value === billingType);
    return config?.icon || '✅';
  }

  // ✅ NEW METHOD: Get billing type CSS class
  getBillingTypeClass(): string {
    const billingType = this.serviceform.get('billingType')?.value;
    return `billing-badge ${billingType}`;
  }

  // ✅ NEW METHOD: Get example quantity for preview
  getExampleQuantity(): number {
    const billingType = this.serviceform.get('billingType')?.value;
    switch (billingType) {
      case 'hourly': return 4;
      case 'daily': return 2;
      case 'session': return 3;
      case 'quantity': return 5;
      default: return 1;
    }
  }

  // ✅ NEW METHOD: Get example total for preview
  getExampleTotal(): number {
    const ratePerUnit = this.serviceform.get('ratePerUnit')?.value || 0;
    const quantity = this.getExampleQuantity();
    return quantity * ratePerUnit;
  }

  // ✅ NEW METHOD: Reset form
  resetForm() {
    this.serviceform.reset({
      billingType: 'fixed',
      minUnits: 1,
      isActive: true
    });
    this.onBillingTypeChange();
  }

  OnSubmit() {
    if (this.serviceform.invalid) {
      this.serviceform.markAllAsTouched();
      return;
    }

    const formData = { ...this.serviceform.value };

    // ✅ ENHANCED: Process form data for time-based billing
    if (formData.billingType === 'fixed') {
      formData.ratePerUnit = formData.charge;
      formData.unitLabel = 'service';
    }

    // Convert string booleans to actual booleans
    if (typeof formData.isActive === 'string') {
      formData.isActive = formData.isActive === 'true';
    }

    // Handle null/undefined maxUnits
    if (!formData.maxUnits || formData.maxUnits === '') {
      formData.maxUnits = null;
    }

    console.log('📝 Submitting service data:', formData);

    if (this.editMode && this.serviceId) {
      // 🔄 Update existing service
      this.masterService.updateService(this.serviceId, formData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Service Updated',
            text: 'Service updated successfully!',
            position: 'top-end',
            toast: true,
            timer: 3000,
            showConfirmButton: false,
            customClass: {
              popup: 'hospital-toast-popup',
              title: 'hospital-toast-title',
              htmlContainer: 'hospital-toast-text',
            },
          });
          this.router.navigateByUrl('/master/opdmasterservice');
        },
        error: (error) => {
          console.error('Error updating service:', error);
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: error?.error?.message || 'Service Update Failed',
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button',
            },
          });
        },
      });
    } else {
      // ➕ Create new service
      this.masterService.postService(formData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Service Added',
            text: 'Service added successfully!',
            position: 'top-end',
            toast: true,
            timer: 3000,
            showConfirmButton: false,
            customClass: {
              popup: 'hospital-toast-popup',
              title: 'hospital-toast-title',
              htmlContainer: 'hospital-toast-text',
            },
          });
          this.resetForm();
          this.router.navigateByUrl('/master/opdmasterservice');
        },
        error: (error) => {
          console.error('Error adding service:', error);
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text: error?.error?.message || 'Service Creation Failed',
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button',
            },
          });
        },
      });
    }
  }

  // Bulk upload methods (unchanged)
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
    } else {
      Swal.fire('Invalid File', 'Please upload a valid CSV file.', 'error');
    }
  }

  uploadCSV(): void {
    if (!this.selectedFile) {
      Swal.fire('No File', 'Please select a CSV file to upload.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.masterService.uploadServciesCSV(formData).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Bulk Upload Successful',
          text: 'Bulk Upload of Services completed successfully!',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false,
          customClass: {
            popup: 'hospital-toast-popup',
            title: 'hospital-toast-title',
            htmlContainer: 'hospital-toast-text',
          },
        });
        this.router.navigateByUrl('/master/opdmasterservice');
        this.selectedFile = null;
      },
      error: (error) => {
        console.error('Bulk Upload error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: error?.error?.message || 'Service Bulk Upload Failed',
          customClass: {
            popup: 'hospital-swal-popup',
            title: 'hospital-swal-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-button',
          },
        });
      },
    });
  }
}
