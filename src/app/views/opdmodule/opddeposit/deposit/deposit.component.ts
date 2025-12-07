import { OpdService } from './../../opdservice/opd.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { UhidService } from '../../../uhid/service/uhid.service';
import {  distinctUntilChanged } from 'rxjs/operators';
// import Swal from 'sweetalert2';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent {
  depositForm: FormGroup;
  filteredPatients: any[] = [];
  showSuggestions = false;
  manuallySelected = false;
  editMode = false;
  depositid: string | null = null;
  patientdetails : any[] = [];
  statusMessage: string = '';
depositamount : string = '';
  constructor(private fb: FormBuilder, private router: Router, private opdservice : OpdService, private uhidService: UhidService,
    private route: ActivatedRoute) {
      this.depositForm = this.fb.group({
        outpatientBillId: [''],
        depositAmount: [0, [Validators.required, Validators.min(1)]],
        depositorName: ['', Validators.required],
        depositPaymentMethod: ['cash', Validators.required],
        billnumber : [''],
      transactionId: ['']

      });

  }



  userPermissions: any = {};

ngOnInit(): void {

 // load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'outpatientDeposit');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions



  this.route.queryParams.subscribe(params => {
    this.depositid = params['_id'] || null;
    this.editMode = !!this.depositid;

    // If editing, load the deposit data
    if (this.editMode && this.depositid) {
      this.LoadDeposit(this.depositid);
    }
  });

 // Track status messages
this.depositForm.get('billnumber')?.valueChanges
  .pipe(
    debounceTime(1000),
    distinctUntilChanged()
  )
  .subscribe((billnumber: number) => {
    if (billnumber) {
      this.opdservice.getOPDBillByBillNumber(billnumber).subscribe({
        next: (billData) => {
          this.patientdetails = billData.data.data;
          console.log("🚀 ~ patientdetails:", this.patientdetails);

          this.statusMessage = '';

          if (this.patientdetails && this.patientdetails.length > 0 && this.patientdetails[0]._id) {
            const outpatientBillId = this.patientdetails[0]._id;

            this.depositForm.patchValue({ outpatientBillId });

            // ✅ Now call OPD bill by ID using the fetched _id
            this.opdservice.getOPDBillById(outpatientBillId).subscribe({
              next: (fullOPDBill) => {
                console.log("✅ Full OPD Bill Data by ID:", fullOPDBill);
                this.loadopdbillbyid(fullOPDBill); // <- pass the data
              },
              error: (err) => {
                console.error("Error fetching OPD bill by ID:", err);
                this.statusMessage = 'Failed to load detailed bill data.';
              }
            });

          } else {
            this.statusMessage = 'No patient details found for this bill number';
          }
        },
        error: (err) => {
          console.error("Error fetching bill data:", err);
          this.statusMessage = 'Error fetching bill data. Please try again.';
        }
      });
    }
  });



// opayemnt mode opt
this.depositForm.get('depositPaymentMethod')?.valueChanges.subscribe(value => {
  const txnControl = this.depositForm.get('transactionId');
  if (value === 'upi') {
    txnControl?.setValidators([Validators.required]);
  } else {
    txnControl?.clearValidators();
    txnControl?.setValue('');
  }
  txnControl?.updateValueAndValidity();
});



}




loadopdbillbyid(fullBillData: any) {
  const billId = fullBillData?._id || fullBillData;
  this.opdservice.getOPDBillById(billId).subscribe(res => {
    console.log("🚀 ~ DepositComponent ~ this.opdservice.getOPDBillById ~ res:", res)
  });
  console.log('🎯 Loaded OPD Bill by ID:', billId);
}





LoadDeposit(depositid : string){

  this.opdservice.getopdopddepositapis().subscribe((res : any) => {

     const opddeposit = res
     const opddeposits = opddeposit.find((p:any)=> p._id === depositid)
     console.log("🚀 ~ DepositComponent ~ this.opdservice.getopdopddepositapis ~ opddeposits:", opddeposits)


      if(depositid){

        const depositopdbill = opddeposits.outpatientBillId;


        this.depositForm.patchValue({
          outpatientBillId: opddeposits.outpatientBillId._id || opddeposits.outpatientBillId,
          depositAmount: opddeposits.depositAmount,
          depositorName: opddeposits.depositorName,
          depositPaymentMethod: opddeposits.depositPaymentMethod,
          billnumber : opddeposits?.outpatientBillId?.billnumber
        });


      }else{
        console.warn("OPD Deposit not found for ID:", depositid)
      }





    })

}


  selectPatient(patient: any) {
    this.manuallySelected = true;

    this.depositForm.patchValue({
      mobile_no: patient.mobile_no,
      gender: patient.gender || '',
      age: patient.age || '',
      area: patient.area || '',
      city: patient.city || '',
      pincode: patient.pincode || '',
      emailAddress: patient.emailAddress || '',
      aadharNumber: patient.aadharNumber || '',
      panCardNumber: patient.panCardNumber || '',
      dob: patient.dob || '',
      uhid: patient.uhid || '',
      uniqueHealthIdentificationId: patient._id,
    });

    this.showSuggestions = false;
    this.filteredPatients = [];
  }





  // Submit function to handle form submission
async onSubmit() {
    const Swal = (await import('sweetalert2')).default;

  if (this.depositForm.valid) {
    const formData = this.depositForm.value;
    const depositId = this.route.snapshot.queryParams['_id'];
    const outpatientBillId = this.depositForm.get('outpatientBillId')?.value;

    console.log('Payload to Submit:', formData);

    if (depositId) {
      // Update existing deposit
      this.opdservice.updateopdopddepositapis(depositId, formData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Deposit Updated',
            text: 'OPD Deposit updated successfully.',
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
          this.depositForm.reset();
          this.router.navigateByUrl('/opd/depositlist');
        },
        error: (error) => {
          console.error("Error updating OPD deposit:", error);
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            // text: 'Failed to update OPD deposit.',
            text: error?.error?.message || 'Failed to update OPD deposit.',

            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button'
            }
          });
        }
      });

    } else {
      // Add new deposit
      this.opdservice.postopdopddepositapis(formData).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Deposit Created',
            text: 'OPD Deposit added successfully.',
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

          this.depositForm.reset();
          this.router.navigateByUrl('/opd/depositlist');

          const depositId = response?._id;
          const outpatientBillId = response?.outpatientBillId;
          this.depositamount = response.depositAmount;

          console.log("🚀 ~ Deposit Amount:", this.depositamount);

          if (depositId && outpatientBillId) {
            this.updateOpdBillWithDeposit(depositId, outpatientBillId);
          } else {
            console.warn('Deposit _id or outpatientBillId not found in response:', response);
          }
        },
        error: (error) => {
          console.error("Error adding deposit:", error);
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text: error?.error?.message || 'Failed to create OPD deposit.',
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

  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Form Incomplete',
      text: 'Please fill in all required fields before submitting.',
        customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button'
      }
    });
  }
}

updateOpdBillWithDeposit(depositId: string, outpatientBillId: string) {
  const updatePayload = {
    depositId: [depositId], // make sure it's an array
  };

  this.opdservice.updateOPDbill(outpatientBillId, updatePayload).subscribe({
    next: () => {
      console.log('Outpatient bill updated with deposit ID successfully.');
    },
    error: (error) => {
      console.error('Failed to update outpatient bill with deposit ID:', error);
    }
  });
}





}
