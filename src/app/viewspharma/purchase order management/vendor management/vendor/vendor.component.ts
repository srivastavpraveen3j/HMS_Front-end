import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { InventoryitemService } from '../../inventory/service/inventoryitem.service';
import { VendorService } from '../service/vendor.service';

@Component({
  selector: 'app-vendor',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './vendor.component.html',
  styleUrl: './vendor.component.css',
})
export class VendorComponent {
  vendorForm: FormGroup;
  vendorId: string | null = null;
  editMode: boolean = false;
  uploadMode: 'single' | 'bulk' = 'single';
  selectedFile: File | null = null;
  constructor(
    private fb: FormBuilder,
    private vendorservice: VendorService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.vendorForm = this.fb.group({
      vendorName: ['', Validators.required],

      contactPerson: ['', Validators.required],

      email: [
        '',
        [Validators.required, Validators.email], // ✅ must be email format
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[6-9][0-9]{9}$/),
        ],
      ],

      address: ['', Validators.required],

      gstNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
          ),
           Validators.maxLength(15)

          // ✅ GSTIN format: 15 chars → 22ABCDE1234F1Z5
        ],
      ],

      isFavourite: ['false'],
    });
  }

  userPermissions: any = {};
  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'vendor'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions
    this.route.queryParams.subscribe((params) => {
      const vendorId = params['_id'];
      if (vendorId) {
        this.editMode = true;
        this.vendorId = vendorId;
        this.loadVendor(vendorId);
      } else {
        console.log('not found anything');
        this.editMode = false;
      }
    });
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  formatDate(dateString: string | null | undefined): string {
    if (!dateString) {
      return '';
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().split('T')[0];
  }

  loadVendor(vendorId: string) {
    this.vendorservice.getvendorById(vendorId).subscribe({
      next: (vendor) => {
        if (vendor) {
          this.vendorForm.patchValue({
            vendorName: vendor.vendorName,
            contactPerson: vendor.contactPerson,
            phone: vendor.phone,
            email: vendor.email,
            address: vendor.address,
            gstNumber: vendor.gstNumber,
            isFavourite: vendor.isFavourite,
          });
        } else {
          console.log('Vendor not found');
        }
      },
      error: (err) => {
        console.error('Error fetching Vendor by ID:', err);
      },
    });
  }

  onSubmit() {
    if (this.vendorForm.invalid) {
      console.log('Form is invalid:', this.vendorForm.errors);
      this.vendorForm.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields before submitting.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
      return;
    }

    const formData = { ...this.vendorForm.value };

    const request$ =
      this.editMode && this.vendorId
        ? this.vendorservice.updatevendor(this.vendorId, formData)
        : this.vendorservice.postvendor(formData);

    const isUpdate = this.editMode && this.vendorId;

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: isUpdate ? 'Vendor  Updated' : 'Vendor Created',
          text: `Vendor has been ${
            isUpdate ? 'updated' : 'added'
          } successfully.`,
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

        this.vendorForm.reset();
        this.router.navigateByUrl('/inventorylayout/vendorlist');
      },
      error: (error) => {
        console.error('Full error details:', error);
        let errorMessage = `Failed to ${isUpdate ? 'update' : 'add'}vendor.`;
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        }

        Swal.fire({
          icon: 'error',
          title: `${isUpdate ? 'Update' : 'Creation'} Failed`,
          text: errorMessage,
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

  // buljk upload

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

    this.vendorservice.uploadVendorCSV(formData).subscribe({
      next: (response: any) => {
        const { uploaded, failed, sample } = response;

        if (uploaded > 0 && failed === 0) {
          Swal.fire(
            'Success',
            `${uploaded} inventory items uploaded successfully.`,
            'success'
          );
        } else if (uploaded > 0 && failed > 0) {
          Swal.fire(
            'Partial Success',
            `${uploaded} uploaded, ${failed} failed. Example error: ${sample[0]?.error}`,
            'warning'
          );
        } else if (uploaded === 0 && failed > 0) {
          const shortError =
            sample[0]?.error?.split(',')?.[0] || 'Unknown validation error';
          Swal.fire({
            title: 'Upload Failed',
            html: `All ${failed} rows failed.<br><b>Error:</b> ${shortError}`,
            icon: 'error',
          });
        } else {
          Swal.fire(
            'Unexpected Response',
            'Could not determine upload result.',
            'info'
          );
        }

        this.selectedFile = null;
        this.router.navigateByUrl('/inventorylayout/inventorystocklist');
      },
      error: (error) => {
        console.error('Upload error:', error);
        Swal.fire(
          'Upload Failed',
          'Could not reach server or invalid file format.',
          'error'
        );
      },
    });
  }
}
