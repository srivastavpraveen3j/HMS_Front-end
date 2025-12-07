import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';

@Component({
  selector: 'app-pathologyresult',
  imports: [CommonModule, FormsModule, CustomcalendarComponent, ReactiveFormsModule],
  templateUrl: './pathologyresult.component.html',
  styleUrl: './pathologyresult.component.css'
})
export class PathologyresultComponent {


pathologyresult : FormGroup


constructor(private fb: FormBuilder){

  this.pathologyresult = fb.group({

    ipdno : ['', Validators.required],
    doa : [''],
    patient_name : ['', Validators.required],
    age : ['', Validators.required],
    patient_type : ['', Validators.required],
    cnsdoc : ['', Validators.required],

  })
}


}
