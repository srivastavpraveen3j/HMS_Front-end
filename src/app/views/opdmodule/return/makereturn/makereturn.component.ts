import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OpdService } from '../../opdservice/opd.service';
import { UhidService } from '../../../uhid/service/uhid.service';
import {  distinctUntilChanged } from 'rxjs/operators';
import { debounceTime, switchMap } from 'rxjs';
@Component({
  selector: 'app-makereturn',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './makereturn.component.html',
  styleUrl: './makereturn.component.css'
})
export class MakereturnComponent {

  returnForm: FormGroup;
  filteredPatients: any[] = [];
  showSuggestions = false;
  manuallySelected = false;
  editMode = false;
  returnid: string | null = null;
  patientdetails : any[] = [];
    statusMessage: string = '';
  constructor(private fb: FormBuilder, private router: Router, private opdservice : OpdService, private uhidService: UhidService,
    private route: ActivatedRoute) {
    this.returnForm = this.fb.group({
      billnumber: ['', Validators.required],
      // billAmount: ['', [Validators.required, Validators.min(1)]],
      // amountReturn: ['', [Validators.required, Validators.min(1)]],
      patientUhidId: "662f542a2b3e2c4a8f0d9e1a",
  outpatientBillId: "662f54432b3e2c4a8f0d9e1b",
  outpatientDepositId: "662f545e2b3e2c4a8f0d9e1c",
      returnReceiverName: ['', Validators.required],
      returnPaymentMethod: ['cash', Validators.required]
    });
  }




  ngOnInit(){


    this.route.queryParams.subscribe(params => {
      this.returnid = params['_id'] || null;
      this.editMode = !!this.returnid;

      // If editing, load the package data
      if (this.editMode && this.returnid) {
        this.LoadReturn(this.returnid);
      }
    });



  this.returnForm.get('billnumber')?.valueChanges
  .pipe(
    debounceTime(500), // wait for 500ms after typing
    distinctUntilChanged() // only proceed if the value changed
  )
  .subscribe((billnumber: number) => {
    if (billnumber) {
      this.opdservice.getOPDBillByBillNumber(billnumber).subscribe({
        next: (billData) => {
          this.patientdetails = billData.data;
          console.log("🚀 ~ patientdetails:", this.patientdetails);

          // Reset the status message if bill is found
          this.statusMessage = '';

          // ✅ Patch the outpatientBillId from the returned bill data
          if (this.patientdetails && this.patientdetails.length > 0 && this.patientdetails[0]._id) {
            this.returnForm.patchValue({
              outpatientBillId: this.patientdetails[0]._id
            });
          } else {
            // Set message when no patient details are found
            this.statusMessage = 'No patient details found for this bill number';
          }
        },
        error: (err) => {
          console.error("Error fetching bill data:", err);
          // Set message in case of an error
          this.statusMessage = 'Error fetching bill data. Please try again.';
        }
      });
    }
  });

  }



  LoadReturn(returnid : string){

    this.opdservice.getopdreturnapis().subscribe((res : any) => {

       const opddreturn = res.outpatientReturns
       const opddreturns = opddreturn.find((p:any)=> p._id === returnid)
       console.log("🚀 ~ DepositComponent ~ this.opdservice.getopdopddepositapis ~ opddeposits:", opddreturns)


        if(returnid){

          const returnopdbill = opddreturns.outpatientBillId;


          this.returnForm.patchValue({

        //     patient_name :returnopdbill.patient_name ,
        // billNo: returnopdbill._id,
        // billAmount: returnopdbill.totalAmount,
        // amountDeposited: opddreturns.depositAmount,
        returnReceiverName: opddreturns.returnreturnReceiverName,
        returnPaymentMethod: opddreturns.returnPaymentMethod,

        patientUhidId: opddreturns.patientUhidId ,
        outpatientBillId: opddreturns.outpatientBillId,
        outpatientDepositId: opddreturns.outpatientDepositId

          })

        }else{
          console.warn("OPD Return not found for ID:", returnid)
        }





      })

  }



  onSubmit() {
    if (this.returnForm.valid) {
      // console.log('Return Form Submitted:', this.returnForm.value);
      const formData = this.returnForm.value;
      const returnId = this.route.snapshot.queryParams['_id']; // Check for doctor ID in query params

      if (returnId) {
        // UPDATE
        this.opdservice.updateopdreturnapis(returnId, formData).subscribe({
          next: (response) => {
            // console.log("Doctor updated successfully:", response);
            alert('OPD Return updated successfully!');
            this.returnForm.reset();
            this.router.navigateByUrl('/opd/returnlist')
          },
          error: (error) => {
            console.error("Error updating OPD Retrun:", error);
            alert('Failed to update OPD Return.');

          }
        });
      } else {
        // ADD
        this.opdservice.postopdreturnapis(formData).subscribe({
          next: (response) => {
            // console.log("Doctor added successfully:", response);
            alert('OPD Return added successfully!');
            this.returnForm.reset();
            this.router.navigateByUrl('/opd/returnlist')
          },
          error: (error) => {
            console.error("Error adding OPD Return:", error);
            alert('Failed to add OPD Return.');

          }
        });
      }

      // this.router.navigate(['/opd/returnlist']);
    } else {
      console.log('Form is invalid');
      this.returnForm.markAllAsTouched();
      return;
    }
  }

}
