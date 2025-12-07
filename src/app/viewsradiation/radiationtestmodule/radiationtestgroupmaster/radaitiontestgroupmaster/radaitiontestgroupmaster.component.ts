import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { MasterService } from '../../../../views/mastermodule/masterservice/master.service';
@Component({
  selector: 'app-radaitiontestgroupmaster',
    imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './radaitiontestgroupmaster.component.html',
  styleUrl: './radaitiontestgroupmaster.component.css'
})
export class RadaitiontestgroupmasterComponent {

medicalTestGroup : FormGroup

Testgroup : any[] = [];
testParametersList: any[] = [];          // fetched list from API
selectedTestParameters: any[] = [];      // selected ones
dropdownOpenTestParams = false;

     constructor(private fb: FormBuilder, private masterService: MasterService , private route : ActivatedRoute , private router : Router){

       this.medicalTestGroup = fb.group({

         testGroup : ['', Validators.required],
          testParameters: [[], Validators.required],
         price : [0, Validators.required],
        description: ['']

       })
     }



     userPermissions: any = {};

ngOnInit(): void {

 // load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'testGroup');
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


       this.masterService.getMedicaltest().subscribe(res => {
  this.testParametersList = res;
  console.log("🚀 ~ MedicaltestgroupComponent ~ this.masterService.getMedicaltest ~  this.testParametersList:",  this.testParametersList)
});

       }


     loadMedicaltest(medicaltestId: string) {
  this.masterService.getMedicaltestGroup().subscribe((response: any) => {
    const medicaltests = response;
    const medicaltest = medicaltests.find((medical: any) => medical._id === medicaltestId);
    console.log("Loaded medical test:", medicaltest);

    if (medicaltest) {
      // Patch form values
      this.medicalTestGroup.patchValue({
        testGroup: medicaltest.testGroup,
        testParameters: medicaltest.testParameters.map((p: any) => p._id),
        price: medicaltest.price,
        description: medicaltest.description,
      });

      // Populate selectedTestParameters to reflect UI
      this.selectedTestParameters = this.testParametersList.filter((tp: any) =>
        medicaltest.testParameters.some((selected: any) => selected._id === tp._id)
      );
    } else {
      console.log('NO medical Test Found');
    }
  });
}

    //  OnSubmit() {
    //    if (this.medicalTestGroup.invalid) {
    //      this.medicalTestGroup.markAllAsTouched();
    //      Swal.fire({
    //        icon: 'warning',
    //        title: 'Incomplete Form',
    //        text: 'Please fill in all required fields before submitting.',
    //        customClass: {
    //          popup: 'hospital-swal-popup',
    //          title: 'hospital-swal-title',
    //          htmlContainer: 'hospital-swal-text',
    //          confirmButton: 'hospital-swal-button'
    //        }
    //      });
    //      return;
    //    }

    //    const formData = this.medicalTestGroup.value;
    //    const medicaltestId = this.route.snapshot.queryParams['_id'];

    //    if (medicaltestId) {
    //      // Update existing medical test
    //      this.masterService.updateMedicaltestGroup(medicaltestId, formData).subscribe({
    //        next: () => {
    //          Swal.fire({
    //            icon: 'success',
    //            title: 'Medical Test Updated',
    //            text: 'Medical test has been updated successfully.',
    //            position: 'top-end',
    //            toast: true,
    //            timer: 3000,
    //            showConfirmButton: false,
    //            customClass: {
    //              popup: 'hospital-toast-popup',
    //              title: 'hospital-toast-title',
    //              htmlContainer: 'hospital-toast-text',
    //            }
    //          });

    //          this.medicalTestGroup.reset();
    //          this.router.navigateByUrl('/radiationlayout/radiationtestgrouplist');
    //        },
    //        error: (error) => {
    //          console.error("Error updating Medical Test:", error);
    //          Swal.fire({
    //            icon: 'error',
    //            title: 'Update Failed',
    //            text: 'Something went wrong while updating the medical test.',
    //            customClass: {
    //              popup: 'hospital-swal-popup',
    //              title: 'hospital-swal-title',
    //              htmlContainer: 'hospital-swal-text',
    //              confirmButton: 'hospital-swal-button'
    //            }
    //          });
    //        }
    //      });
    //    } else {
    //      // Create new medical test
    //      this.masterService.postMedicaltestGroup(formData).subscribe({
    //        next: () => {
    //          Swal.fire({
    //            icon: 'success',
    //            title: 'Medical Test Created',
    //            text: 'New medical test has been added successfully.',
    //            position: 'top-end',
    //            toast: true,
    //            timer: 3000,
    //            showConfirmButton: false,
    //            customClass: {
    //              popup: 'hospital-toast-popup',
    //              title: 'hospital-toast-title',
    //              htmlContainer: 'hospital-toast-text',
    //            }
    //          });

    //          this.medicalTestGroup.reset();
    //          this.router.navigateByUrl('/radiationlayout/radiationtestgrouplist');
    //        },
    //        error: (error) => {
    //          console.error("Error creating Medical Test:", error);
    //          Swal.fire({
    //            icon: 'error',
    //            title: 'Creation Failed',
    //            text: 'Something went wrong while creating the medical test.',
    //            customClass: {
    //              popup: 'hospital-swal-popup',
    //              title: 'hospital-swal-title',
    //              htmlContainer: 'hospital-swal-text',
    //              confirmButton: 'hospital-swal-button'
    //            }
    //          });
    //        }
    //      });
    //    }
    //  }

OnSubmit() {
  if (this.medicalTestGroup.invalid) {
    this.medicalTestGroup.markAllAsTouched();
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

  const formData = this.medicalTestGroup.value;

  // Instead of sending only IDs, send full embedded objects
  formData.testParameters = this.selectedTestParameters;

  const medicaltestId = this.route.snapshot.queryParams['_id'];

  if (medicaltestId) {
    this.masterService.updateMedicaltestGroup(medicaltestId, formData).subscribe({
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

        this.medicalTestGroup.reset();
        this.router.navigateByUrl('/radiationlayout/radiationtestgrouplist');
      },
      error: (error) => {
        console.error("Error updating Medical Test:", error);
        Swal.fire({
               icon: 'error',
               title: 'Update Failed',
               text: 'Something went wrong while updating the medical test.',
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
    this.masterService.postMedicaltestGroup(formData).subscribe({
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
        this.medicalTestGroup.reset();
        this.router.navigateByUrl('/radiationlayout/radiationtestgrouplist');
      },
      error: (error) => {
        console.error("Error creating Medical Test:", error);
      Swal.fire({
               icon: 'error',
               title: 'Creation Failed',
               text: 'Something went wrong while creating the medical test.',
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



     toggleTestParamDropdown() {
  this.dropdownOpenTestParams = !this.dropdownOpenTestParams;
}

selectTestParameter(tp: any) {
  if (!this.isTestParameterSelected(tp)) {
    this.selectedTestParameters.push(tp);
    this.updateSelectedTestParameters();
  }
}

removeTestParameter(tp: any) {
  this.selectedTestParameters = this.selectedTestParameters.filter(t => t._id !== tp._id);
  this.updateSelectedTestParameters();
}

updateSelectedTestParameters() {
  const ids = this.selectedTestParameters.map(tp => tp._id);
  this.medicalTestGroup.patchValue({ testParameters: ids });
}

isTestParameterSelected(tp: any): boolean {
  return this.selectedTestParameters.some(t => t._id === tp._id);
}




}
