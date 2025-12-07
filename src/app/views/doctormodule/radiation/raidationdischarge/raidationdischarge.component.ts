import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';

@Component({
  selector: 'app-raidationdischarge',
  imports: [RouterModule,FormsModule, CommonModule, CustomcalendarComponent, ReactiveFormsModule],
  templateUrl: './raidationdischarge.component.html',
  styleUrl: './raidationdischarge.component.css'
})
export class RaidationdischargeComponent {

raditationdischarge : FormGroup


constructor(private fb: FormBuilder){

  this.raditationdischarge = fb.group({

    uhidno : ['', Validators.required],
    doa : [''],
    patient_name : ['', Validators.required],
    age : ['', Validators.required],
    birthdate : [Validators.required],
    startebrt : [''],
    endebrt : [''],
    date : [''],
    category : [''],
    referredfrom : [''],
    rtnumber : [''],
    finaldiagnosis : [''],
    icdnotes : [''],
    patientillness : [''],
    performancescore : [''],
    addiction : [''],
    biopsy : [''],
    familyhistory : [''],
    rttechnique : [''],
    genreralexamination : [''],
    systematicexamination : [''],
    localexamination : [''],
    ctstimulation: [''],
    advice : [''],
    folllowvisit : [''],
    folllowvisitdate : [''],
    folllowvisitdays : [''],



  })

}
  OnSubmit(){

    if(this.raditationdischarge.invalid){
      console.log("🚀 ~ RaidationdischargeComponent ~ OnSubmit ~ this.raditationdischarge.invalid:", this.raditationdischarge.invalid)

    }
    console.log("🚀 ~ RaidationdischargeComponent ~ OnSubmit:", this.raditationdischarge.value)

  }











}
