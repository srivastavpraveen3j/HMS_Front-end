import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { MasterService } from '../../../../views/mastermodule/masterservice/master.service';
import { MaterialrequestService } from '../service/materialrequest.service';
import { RoleService } from '../../../../views/mastermodule/usermaster/service/role.service';
@Component({
  selector: 'app-purchaserequest',
    imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './purchaserequest.component.html',
  styleUrl: './purchaserequest.component.css'
})
export class PurchaserequestComponent {

  uploadMode: 'single' | 'bulk' = 'single';
  selectedFile: File | null = null;
  prForm!: FormGroup;
editMode : boolean = false
materialreqid : string = ''
  manuallySelected = false;
    isSubmitting = false;
  // 🔹 Hardcoded RFQ and Vendor list
  rfqList = [
    { _id: 'rfq001', name: 'RFQ for Antibiotics' },
    { _id: 'rfq002', name: 'RFQ for Surgical Equipment' }
  ];

  vendorList = [
    { _id: 'vendor001', name: 'MediPlus Suppliers' },
    { _id: 'vendor002', name: 'HealthCare Hub' }
  ];

  constructor(private fb: FormBuilder, private masterService : MaterialrequestService, private routes : ActivatedRoute, private router : Router, private userservice : RoleService) {
 const user = JSON.parse(localStorage.getItem('authUser') || '{}');
    this.prForm = this.fb.group({
  departmentName: ['Pharmacy', Validators.required],
  itemName: ['', Validators.required],
  category: ['drug', Validators.required],
  quantityRequired: ['', Validators.required],
  remarks: [''],
  status: ['Submitted'],
    createdBy: [user._id || ''],
    raisedByUser: [user._id],
    isIntended: [false]


});

  }

  userPermissions: any = {};
  userMaterialreApproval: any = {};
  module : string = '';

  ngOnInit(): void {


      // Permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );


        const materialreqModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'materialRequestList',
    );
        const materialreqApproval = allPermissions.find(
      (perm: any) => perm.moduleName === 'materialRequestApproval',
    );

    this.userPermissions = materialreqModule?.permissions|| {};
    this.userMaterialreApproval = materialreqModule?.permissions|| {};
         this.module = this.userPermissions?.moduleName || this.userMaterialreApproval;

      // Permissions

       this.routes.queryParams.subscribe((params) => {
      this.materialreqid = params['_id'];
      // this.patientId = this.opdcaseId;
      // console.log("id", this.opdcaseId);
      this.editMode = !!this.materialreqid;
      if (this.editMode && this.materialreqid) {
        this.manuallySelected = true;
        this.loadMaterialreq(this.materialreqid);
      }
    });





  }



loadMaterialreq(reqid : string){
  this.masterService.getmaterialrequestById(reqid).subscribe( res =>{
  // console.log("🚀 ~ PurchaserequestComponent ~ this.masterService.getmaterialrequestById ~ res:", res)

  const reqdata = res;

  this.prForm.patchValue({

     departmentName: reqdata.departmentName,
  itemName:  reqdata.itemName,
  category:reqdata.category,
  quantityRequired: reqdata.quantityRequired,
  remarks: reqdata.remarks,
  status: reqdata.status,
  createdBy: reqdata.createdBy

  })

  })

}

  getTodayDate(): string {
    return new Date().toISOString().substring(0, 10);
  }

  // onSubmit(): void {
  //   if (this.purchaseOrderForm.valid) {
  //     const purchaseOrderData = this.purchaseOrderForm.value;
  //     console.log('✅ Purchase Order Submitted:', purchaseOrderData);
  //     alert('Purchase Order submitted successfully!');
  //     this.purchaseOrderForm.reset({
  //       orderDate: this.getTodayDate(),
  //       status: 'issued'
  //     });
  //   } else {
  //     alert('Please fill in all required fields.');
  //   }
  // }


  // onSubmit(){

  //   console.log("🚀 ~ PurchaserequestComponent ~ onSubmit ~ value:", this.prForm.value)
  // }

    onSubmit() {
  // Prevent submission if already submitting
  if (this.isSubmitting) {
    return;
  }

  if (this.prForm.invalid) {
    console.log("Form is invalid:", this.prForm.errors);
    this.prForm.markAllAsTouched();

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

  // Set loading state to prevent multiple submissions
  this.isSubmitting = true;

  const formData = { ...this.prForm.value };
  const request$ = this.editMode && this.materialreqid
    ? this.masterService.updatematerialrequest(this.materialreqid, formData)
    : this.masterService.postmaterialrequest(formData);

  const isUpdate = this.editMode && this.materialreqid;

  request$.subscribe({
    next: () => {
      this.isSubmitting = false; // Reset loading state

      Swal.fire({
        icon: 'success',
        title: isUpdate ? 'Material Request Updated' : 'Material Request Created',
        text: `Material Request has been ${isUpdate ? 'updated' : 'added'} successfully.`,
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

      this.prForm.reset();
      this.router.navigateByUrl('/inventorylayout/purchaserequestlist');
    },
    error: (error) => {
      this.isSubmitting = false; // Reset loading state on error

      console.error("Full error details:", error);
      let errorMessage = `Failed to ${isUpdate ? 'update' : 'add'} material request.`;
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



    // buljk upload


    onFileSelected(event: any): void {
      const file: File = event.target.files[0];
      if (file && file.type === 'text/csv') {
        this.selectedFile = file;
      } else {
        Swal.fire('Invalid File', 'Please upload a valid CSV file.', 'error');
      }
    }

  // uploadCSV(): void {
  //   if (!this.selectedFile) {
  //     Swal.fire('No File', 'Please select a CSV file to upload.', 'warning');
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append('file', this.selectedFile);

  //   this.masterService.uploadMedicineCSV(formData).subscribe({
  //     next: (response: any) => {
  //       const { uploaded, failed, sample } = response;

  //       if (uploaded > 0 && failed === 0) {
  //         Swal.fire('Success', `${uploaded} medicines uploaded successfully.`, 'success');
  //       } else if (uploaded > 0 && failed > 0) {
  //         Swal.fire('Partial Success', `${uploaded} uploaded, ${failed} failed. Example error: ${sample[0]?.error}`, 'warning');
  //       } else if (uploaded === 0 && failed > 0) {
  //         const shortError = sample[0]?.error?.split(',')?.[0] || 'Unknown validation error';
  //         Swal.fire({
  //           title: 'Upload Failed',
  //           html: `All ${failed} rows failed.<br><b>Error:</b> ${shortError}`,
  //           icon: 'error'
  //         });
  //       } else {
  //         Swal.fire('Unexpected Response', 'Could not determine upload result.', 'info');
  //       }

  //       this.selectedFile = null;
  //        this.router.navigateByUrl('/master/medicinemasterlist');
  //     },
  //     error: (error) => {
  //       console.error('Upload error:', error);
  //       Swal.fire('Upload Failed', 'Could not reach server or invalid file format.', 'error');
  //     }
  //   });
  // }


}
