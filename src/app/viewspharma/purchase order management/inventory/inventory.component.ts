import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { MasterService } from '../../../views/mastermodule/masterservice/master.service';
import { InventoryitemService } from './service/inventoryitem.service';
import { VendorService } from '../vendor management/service/vendor.service';

@Component({
  selector: 'app-inventory',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {

  medicineform: FormGroup;
  medicineId: string | null = null;
  editMode: boolean = false;
  uploadMode: 'single' | 'bulk' = 'single';
  selectedFile: File | null = null;
  userPermissions: any = {};
  vendors: any[] = []; // Array to store vendor list

  constructor(
    private fb: FormBuilder,
    private inventoryservice: MasterService,
    private vendorservice : VendorService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.medicineform = this.fb.group({
      medicine_name: ['', Validators.required],
      supplier: ['', Validators.required], // This will store vendor _id
      dose: ['', [Validators.required, Validators.min(0)]],
      expiry_date: ['', Validators.required],
      mfg_date: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      maxStock: ['', [Validators.required, Validators.min(1)]],
      batch_no: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Load permissions
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'inventoryItem');
    this.userPermissions = uhidModule?.permissions || {};

    // Load vendors
    this.loadVendors();

    // Check for edit mode
    this.route.queryParams.subscribe(params => {
      const medicineId = params['_id'];
      if (medicineId) {
        this.editMode = true;
        this.medicineId = medicineId;
        this.loadMedicineData(medicineId);
      } else {
        this.editMode = false;
      }
    });

    // Add stock validation based on maxStock
    this.medicineform.get('stock')?.valueChanges.subscribe(stockValue => {
      const maxStockValue = this.medicineform.get('maxStock')?.value;
      if (stockValue && maxStockValue && stockValue > maxStockValue) {
        this.medicineform.get('stock')?.setErrors({ 'exceedsMaxStock': true });
      }
    });

    this.medicineform.get('maxStock')?.valueChanges.subscribe(maxStockValue => {
      const stockValue = this.medicineform.get('stock')?.value;
      if (stockValue && maxStockValue && stockValue > maxStockValue) {
        this.medicineform.get('stock')?.setErrors({ 'exceedsMaxStock': true });
      } else if (this.medicineform.get('stock')?.errors?.['exceedsMaxStock']) {
        this.medicineform.get('stock')?.setErrors(null);
      }
    });
  }

  // Load vendors from service
  loadVendors() {
    this.vendorservice.getvendor().subscribe({
      next: (res) => {
        this.vendors = res.data || res; // Handle different response structures
        console.log("🚀 ~ InventoryComponent ~ loadVendors ~ vendors:", this.vendors);
      },
      error: (err) => {
        console.error("Error loading vendors:", err);
        Swal.fire('Error', 'Failed to load vendor list', 'error');
      }
    });
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  }

  loadMedicineData(medicineId: string) {
    this.inventoryservice.getMedicineById(medicineId).subscribe({
      next: (medicine) => {
        if (medicine) {
          const expiryDate = this.formatDate(medicine.expiry_date);
          const mfgDate = this.formatDate(medicine.mfg_date);

          this.medicineform.patchValue({
            medicine_name: medicine.medicine_name,
            supplier: medicine.supplier, // This should be the vendor _id or object
            dose: medicine.dose,
            expiry_date: expiryDate,
            price: medicine.price,
            stock: medicine.stock,
            maxStock: medicine.maxStock,
            mfg_date: mfgDate,
            batch_no: medicine.batch_no,
          });
        }
      },
      error: (err) => {
        console.error("Error fetching medicine by ID:", err);
      }
    });
  }

  // Get vendor name for display
  getVendorName(vendorId: string): string {
    const vendor = this.vendors.find(v => v._id === vendorId);
    return vendor ? vendor.vendorName : 'Unknown Vendor';
  }

  onSubmit() {
    if (this.medicineform.invalid) {
      this.medicineform.markAllAsTouched();

      let errorMessage = 'Please fill in all required fields before submitting.';
      if (this.medicineform.get('stock')?.errors?.['exceedsMaxStock']) {
        errorMessage = 'Current stock cannot exceed maximum stock limit.';
      }

      Swal.fire({
        icon: 'warning',
        title: 'Form Validation Error',
        text: errorMessage,
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button'
        }
      });
      return;
    }

    const formData = { ...this.medicineform.value };

    // Format dates
    if (formData.expiry_date && !isNaN(new Date(formData.expiry_date).getTime())) {
      formData.expiry_date = new Date(formData.expiry_date).toISOString().split('T')[0];
    }

    if (formData.mfg_date && !isNaN(new Date(formData.mfg_date).getTime())) {
      formData.mfg_date = new Date(formData.mfg_date).toISOString().split('T')[0];
    }

    const request$ = this.editMode && this.medicineId
      ? this.inventoryservice.updateMedicine(this.medicineId, formData)
      : this.inventoryservice.postMedicine(formData);

    const isUpdate = this.editMode && this.medicineId;

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: isUpdate ? 'Medicine Updated' : 'Medicine Created',
          text: `Medicine has been ${isUpdate ? 'updated' : 'added'} successfully.`,
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false,
          customClass: {
            popup: 'hospital-toast-popup',
            title: 'hospital-toast-title',
            htmlContainer: 'hospital-toast-text',
          }
        });

        this.medicineform.reset();
        this.router.navigateByUrl('/inventorylayout/inventorystocklist');
      },
      error: (error) => {
        console.error("Error:", error);
        let errorMessage = `Failed to ${isUpdate ? 'update' : 'add'} medicine.`;
        if (error.error?.message) {
          errorMessage = error.error.message;
        }

        Swal.fire({
          icon: 'error',
          title: `${isUpdate ? 'Update' : 'Creation'} Failed`,
          text: errorMessage,
          customClass: {
            popup: 'hospital-swal-popup',
            title: 'hospital-swal-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-button'
          }
        });
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
    } else {
      Swal.fire('Invalid File', 'Please upload a valid CSV file.', 'error');
    }
  }

  async uploadCSV() {
    if (!this.selectedFile) {
      Swal.fire('No File', 'Please select a CSV file to upload.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.inventoryservice.uploadMedicineCSV(formData).subscribe({

      next: (response: any) => {
        const { uploaded, failed, sample } = response;

        if (uploaded > 0 && failed === 0) {
          Swal.fire('Success', `${uploaded} medicines uploaded successfully.`, 'success');
        } else if (uploaded > 0 && failed > 0) {
          Swal.fire('Partial Success', `${uploaded} uploaded, ${failed} failed. Example error: ${sample[0]?.error}`, 'warning');
        } else if (uploaded === 0 && failed > 0) {
          const shortError = sample[0]?.error?.split(',')?.[0] || 'Unknown validation error';
          Swal.fire({
            title: 'Upload Failed',
            html: `All ${failed} rows failed.<br><b>Error:</b> ${shortError}`,
            icon: 'error'
          });
        } else {
          Swal.fire('Unexpected Response', 'Could not determine upload result.', 'info');
        }

        this.selectedFile = null;
        this.router.navigateByUrl('/inventorylayout/inventorystocklist');
      },
      error: (error) => {
        console.error('Upload error:', error);
        Swal.fire('Upload Failed', 'Could not reach server or invalid file format.', 'error');
      }
    });
  }
}
