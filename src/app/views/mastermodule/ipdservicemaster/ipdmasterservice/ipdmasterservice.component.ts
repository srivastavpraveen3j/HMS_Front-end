import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ipdmasterservice',
  imports: [RouterModule, CommonModule],
  templateUrl: './ipdmasterservice.component.html',
  styleUrl: './ipdmasterservice.component.css'
})
export class IpdmasterserviceComponent {

  roomChargesForm: FormGroup;

  roomFields = [
    'generalRoom', 'deluxe', 'icu', 'specialNonAc', 'specialAc',
    'akota', 'villa1', 'villa2', 'superDeluxe', 'deluxe2', 'femaleGeneralWard'
  ];

  get roomRatesFormGroup(): FormGroup {
    return this.roomChargesForm.get('roomRates') as FormGroup;
  }


  constructor(private fb: FormBuilder) {
    this.roomChargesForm = this.fb.group({
      serviceGroup: ['Room Charges'],
      serviceName: [''],
      extraDetails: [''],
      drRequired: ['no'],
      rate: [''],
      rateEditable: ['no'],
      status: ['active'],
      roomRates: this.fb.group({
        generalRoom: [''],
        deluxe: [''],
        icu: [''],
        specialNonAc: [''],
        specialAc: [''],
        akota: [''],
        villa1: [''],
        villa2: [''],
        superDeluxe: [''],
        deluxe2: [''],
        femaleGeneralWard: ['']
      })
    });
  }




  saveForm() {
    console.log(this.roomChargesForm.value);
  }
}
