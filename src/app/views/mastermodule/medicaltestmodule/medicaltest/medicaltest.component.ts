import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
// import Swal from 'sweetalert2';

@Component({
  selector: 'app-medicaltest',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './medicaltest.component.html',
  styleUrl: './medicaltest.component.css'
})
export class MedicaltestComponent {

  medicalTest : FormGroup

  constructor(private fb: FormBuilder, private masterService: MasterService , private route : ActivatedRoute , private router : Router){

    this.medicalTest = fb.group({

      test_name : ['', Validators.required],
      // parameters : ['', Validators.required],
      units : ['', Validators.required],
      // price : [0],
      shortname : ['',Validators.required],
      default :  ['',Validators.required],
        min : ['',Validators.required],
        max : ['',Validators.required],
        input : ['']

    })
  }


  userPermissions: any = {};
  ngOnInit(): void {
// load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'testParameter');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions
    this.route.queryParams.subscribe( params =>{
      const medicaltestId = params['_id'];
      if(medicaltestId){
        this.loadMedicaltest(medicaltestId);
      }else {
        console.log("not found anything");
      }
    });
  }


  loadMedicaltest(medicaltestId : string){
    this.masterService.getMedicaltestById(medicaltestId).subscribe((response : any)=>{
      console.log("🚀 ~ MedicaltestComponent ~ this.masterService.getMedicaltestById ~ response:", response)
      const medicaltest = response;
      // const medicaltest = medicaltests.find((medical: any)=> medical._id === medicaltestId);


      if(medicaltest){
        this.medicalTest.patchValue({

          test_name : medicaltest.test_name,
      min : medicaltest.min,
      max : medicaltest.max,
      default : medicaltest.default,
      units :medicaltest.units,
      shortname :medicaltest.shortname,
        })
      }else {
        console.log('NO medical Test Found')
      }

    })
  }

   async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;

  if (this.medicalTest.invalid) {
    this.medicalTest.markAllAsTouched();
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

  const formData = this.medicalTest.value;
  const medicaltestId = this.route.snapshot.queryParams['_id'];

  if (medicaltestId) {
    // Update existing medical test
    this.masterService.updateMedicaltest(medicaltestId, formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Medical Test Updated',
          text: 'Medical test has been updated successfully.',
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

        this.medicalTest.reset();
        this.router.navigateByUrl('/master/medicaltestlist');
      },
      error: (error) => {
        console.error("Error updating Medical Test:", error);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: error.error.message || 'Something went wrong while updating the medical test.',
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
    // Create new medical test
    this.masterService.postMedicaltest(formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Medical Test Created',
          text: 'New medical test has been added successfully.',
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

        this.medicalTest.reset();
        this.router.navigateByUrl('/master/medicaltestlist');
      },
      error: (error) => {
        console.error("Error creating Medical Test:", error);
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text:error.error.message || 'Something went wrong while creating the medical test.',
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
   }






}
