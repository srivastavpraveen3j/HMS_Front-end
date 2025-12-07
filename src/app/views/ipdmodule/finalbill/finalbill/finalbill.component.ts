  import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { debounceTime, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { UhidService } from '../../../uhid/service/uhid.service';
@Component({
  selector: 'app-finalbill',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './finalbill.component.html',
  styleUrl: './finalbill.component.css'
})
export class FinalbillComponent {

//  finalbill : FormGroup
  manuallySelected = false;
//    filteredPatients: any[] = [];
//   showSuggestions = false;
//  constructor(private fb: FormBuilder, private masterService : MasterService, private uhidService: UhidService,     private router: Router,
//     private route: ActivatedRoute){
//   this.finalbill = this.fb.group({

//     patient_name : ['', Validators.required],
//     uhid : ['', Validators.required],
//     billamount : ['', Validators.required],
//     area: [''],
//     bedno : ['', Validators.required],
//     receied_amount : ['', Validators.required],
//     age: ['', Validators.required],
//     doa : ['', Validators.required],
//     dod : ['', Validators.required],
//     dueamount : ['', Validators.required],
//     mobile_no: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
//     cns_doc : [''],
//     ref_doc : [''],


//   })
//  }

// ngOnInit(){


//     // on inout of patient_name

//        this.finalbill
//           .get('patient_name')
//           ?.valueChanges.pipe(
//             debounceTime(300),
//             switchMap((patient_name: string) => {
//               if (this.manuallySelected) return of({ uhids: [] });
//               return patient_name && patient_name.length > 2
//                 ? this.uhidService.getPatientByName(patient_name)
//                 : of({ uhids: [] });
//             })
//           )
//           .subscribe((response: any) => {
//             if (this.manuallySelected) return;

//             this.filteredPatients = response?.uhids || [];
//             this.showSuggestions = this.filteredPatients.length > 0;
//           });

// }


//  selectPatient(patient: any): void {
//     this.manuallySelected = true;
//     this.finalbill.patchValue({
//       uhid: patient.uhid || '',
//       patient_name: patient.patient_name,
//       age: patient.age || '',
//       gender: patient.gender || '',
//       patientUhidId: patient._id,
//       mobile_no: patient.mobile_no,
//       area: patient.area,
//     });
//     this.showSuggestions = false;
//     this.filteredPatients = [];
//   }

//   onPatientInput() {
//     const searchTerm = this.finalbill.get('patient_name')?.value;

//     // Reset the flag if user starts editing the field again
//     if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
//       this.manuallySelected = false;
//     }

//     if (!searchTerm || searchTerm.length <= 2) {
//       this.filteredPatients = [];
//       this.showSuggestions = false;
//       return;
//     }

//     // Allow API call again once flag is reset
//     this.showSuggestions = true;
//     // <-- Add this function to call API
//   }

//   hideSuggestionsWithDelay(): void {
//     setTimeout(() => {
//       this.showSuggestions = false;
//     }, 200);
//   }



   finalbill!: FormGroup;
  showSuggestions = false;
  filteredPatients: any[] = [];
  allPatients = [
    { patient_name: 'Rajesh Patel', mobile_no: '9876543210', uhid: 'UHID001', age: 45, area: 'Rajkot', bedno: 'B101', doa: '2023-05-01', dod: '2023-05-05' },
    { patient_name: 'Meena Shah', mobile_no: '9865321098', uhid: 'UHID002', age: 38, area: 'Ahmedabad', bedno: 'B102', doa: '2023-05-02', dod: '2023-05-06' }
  ];

  serviceCharges = [
    { name: 'General Consultation', doctor: 'Dr. Joshi', chargePerUnit: 500, quantity: 1, discount: 0, totalCharge: 500, date: '2023-05-01' },
    { name: 'X-Ray', doctor: 'Dr. Mehta', chargePerUnit: 800, quantity: 1, discount: 0, totalCharge: 800, date: '2023-05-02' },
    { name: 'Blood Test', doctor: 'Dr. Raval', chargePerUnit: 300, quantity: 2, discount: 100, totalCharge: 500, date: '2023-05-03' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.finalbill = this.fb.group({
      patient_name: ['', Validators.required],
      uhid: [''],
      mobile_no: ['', [Validators.required, Validators.pattern('[6-9][0-9]{9}')]],
      age: ['', Validators.required],
      area: [''],
      bedno: ['', Validators.required],
      doa: [''],
      dod: [''],
      cns_doc: ['', Validators.required],
      ref_doc: [''],
      billamount: [0],
      receied_amount: [0],
      dueamount: [0]
    });
  }

  onPatientInput(): void {
    const value = this.finalbill.get('patient_name')?.value.toLowerCase();
    this.filteredPatients = this.allPatients.filter(p =>
      p.patient_name.toLowerCase().includes(value)
    );
  }

  selectPatient(patient: any): void {
    this.finalbill.patchValue({
      patient_name: patient.patient_name,
      uhid: patient.uhid,
      mobile_no: patient.mobile_no,
      age: patient.age,
      area: patient.area,
      bedno: patient.bedno,
      doa: patient.doa,
      dod: patient.dod
    });
    this.filteredPatients = [];
    this.showSuggestions = false;
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => this.showSuggestions = false, 200);
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  OnSubmit(): void {
    if (this.finalbill.valid) {
      console.log('Final Bill Data:', this.finalbill.value);
    }
  }

}
