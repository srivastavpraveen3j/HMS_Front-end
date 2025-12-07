import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { CommonModule } from '@angular/common';
import { CustomtimepickerComponent } from "../../../../component/customtimepicker/customtimepicker.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-chemotherapy',
  imports: [RouterModule, CustomcalendarComponent, CommonModule, CustomtimepickerComponent, ReactiveFormsModule],
  templateUrl: './chemotherapy.component.html',
  styleUrl: './chemotherapy.component.css'
})
export class ChemotherapyComponent {

  chemotherapy : FormGroup

  constructor(private fb: FormBuilder){

    this.chemotherapy = fb.group({

      uhid : ['', Validators.required],
      patient_name : ['', Validators.required],
      age : ['', Validators.required],
      ward : ['', Validators.required],
      doctor : ['', Validators.required],
      refdoc : [''],
      mobile : ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      address : [''],
      doa : [''],
      toa : [''],
      dod : [''],
      tod : [''],
      clinicalsummary : [''],
      clinicalnotes : [''],
      conditiondischarge : [''],
      rxtreatment : ['']



    })

  }



  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Block non-numeric keys
    }
  }


  OnSubmit(){
    if(this.chemotherapy.invalid){
      console.log("🚀 ~ ChemotherapyComponent ~ OnSubmit ~ this.chemotherapy.invalid):", this.chemotherapy.invalid)

    }
    console.log("🚀 ~ ChemotherapyComponent ~ OnSubmit:", this.chemotherapy.value)
  }

}
