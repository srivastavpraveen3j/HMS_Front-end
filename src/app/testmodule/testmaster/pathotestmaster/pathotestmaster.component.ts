import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pathotestmaster',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './pathotestmaster.component.html',
  styleUrl: './pathotestmaster.component.css'
})
export class PathotestmasterComponent {

  testmaster : FormGroup

  constructor(private fb:FormBuilder){

    this.testmaster = fb.group({

      testname : ['', Validators.required],
      groupname : ['', Validators.required],
      parameter : ['', Validators.required],
      unit : ['', Validators.required]

    })
  }


  OnSubmit(){
    if(this.testmaster.invalid){
      console.log("🚀 ~ PathotestmasterComponent ~ OnSubmit ~ this.testmaster.invalid:", this.testmaster.invalid)

    }
    console.log("🚀 ~ PathotestmasterComponent ~ OnSubmit :", this.testmaster.value)
  }



}
