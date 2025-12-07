import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import Swal from 'sweetalert2';
import { MasterService } from '../../../views/mastermodule/masterservice/master.service';

@Component({
  selector: 'app-pharmamanagement',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './pharmamanagement.component.html',
  styleUrl: './pharmamanagement.component.css'
})
export class PharmamanagementComponent {

 medicineform: FormGroup;
  medicineId: string | null = null;
  editMode: boolean = false;
uploadMode: 'single' | 'bulk' = 'single';
selectedFile: File | null = null;



  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.medicineform = this.fb.group({
      medicine_name: ['', Validators.required],
      supplier: ['', Validators.required],
      dose: ['', Validators.required],
      expiry_date: ['', Validators.required],
      mfg_date: ['', Validators.required],
      price: ['', Validators.required],
      stock: ['', Validators.required],
      batch_no : ['', Validators.required],

    });
  }
userPermissions: any = {};

  ngOnInit() {

    // load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'medicine');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions
    this.route.queryParams.subscribe(params => {
      const medicineId = params['_id'];
      if (medicineId) {
        this.editMode = true;
        this.medicineId = medicineId;
        this.loadMedicineData(medicineId);
      } else {
        console.log("not found anything");
        this.editMode = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  loadMedicineData(medicineId: string) {
    this.masterService.getMedicine().subscribe((res: any) => {
      const medicines = res.data; // Assuming res.data is the actual array
      const medicine = medicines.find((med: any) => med._id === medicineId);

      if (medicine) {
        const expiryDate = this.formatDate(medicine.expiry_date);
        const mfgDate = this.formatDate(medicine.mfg_date);

        this.medicineform.patchValue({
          medicine_name: medicine.medicine_name,
          supplier: medicine.supplier, // <-- Make sure this field is correct
          dose: medicine.dose,
          expiry_date: expiryDate,
          price: medicine.price,
          stock: medicine.stock,
          mfg_date: mfgDate
        });
      } else {
        console.log("Medicine not found");
      }
    });
  }


 async onSubmit() {
    const Swal = (await import('sweetalert2')).default;
  if (this.medicineform.invalid) {
    console.log("Form is invalid:", this.medicineform.errors);
    this.medicineform.markAllAsTouched();

    Swal.fire({
      icon: 'warning',
      title: 'Incomplete Form',
      text: 'Please fill in all required fields before submitting.',
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

  if (formData.expiry_date) {
    formData.expiry_date = new Date(formData.expiry_date).toISOString().split('T')[0];
  }

  if (formData.mfg_date) {
    formData.mfg_date = new Date(formData.mfg_date).toISOString().split('T')[0];
  }

  const request$ = this.editMode && this.medicineId
    ? this.masterService.updateMedicine(this.medicineId, formData)
    : this.masterService.postMedicine(formData);

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
      this.router.navigateByUrl('/pharmalayout/pharmamanagementlist');
    },
    error: (error) => {
      console.error("Full error details:", error);
      let errorMessage = `Failed to ${isUpdate ? 'update' : 'add'} medicine.`;
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
          confirmButton: 'hospital-swal-button'
        }
      });
    }
  });
}


// bulkupload


// buljk upload


 async onFileSelected(event: any) {
    const Swal = (await import('sweetalert2')).default;

    const file: File = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
    } else {
      Swal.fire('Invalid File', 'Please upload a valid CSV file.', 'error');
    }
  }

async uploadCSV() {
  const Swal = (await import('sweetalert2')).default;

  if (!this.selectedFile) {
    Swal.fire('No File', 'Please select a CSV file to upload.', 'warning');
    return;
  }

  const formData = new FormData();
  formData.append('file', this.selectedFile);

  this.masterService.uploadMedicineCSV(formData).subscribe({
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
       this.router.navigateByUrl('/master/medicinemasterlist');
    },
    error: (error) => {
      console.error('Upload error:', error);
      Swal.fire('Upload Failed', 'Could not reach server or invalid file format.', 'error');
    }
  });
}


}
