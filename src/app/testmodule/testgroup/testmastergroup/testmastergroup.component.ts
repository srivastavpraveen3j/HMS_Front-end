import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { MasterService } from '../../../views/mastermodule/masterservice/master.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-testmastergroup',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './testmastergroup.component.html',
  styleUrl: './testmastergroup.component.css'
})
export class TestmastergroupComponent {

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
testParameterSearchControl = new FormControl('');
filteredTestParameters: any[] = [];

testParameterPage = 1;
testParameterLimit = 10;
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


//        this.masterService.getMedicaltest().subscribe(res => {
//   this.testParametersList = res.data;
//   console.log("🚀 ~ MedicaltestgroupComponent ~ this.masterService.getMedicaltest ~  this.testParametersList:",  this.testParametersList)
// });


// test parameter
 this.testParameterSearchControl.valueChanges
    .pipe(debounceTime(300), distinctUntilChanged())
    .subscribe((query: string | null) => {
      if (query !== null) {
        this.searchTestParameters(query);
      } else {
        this.filteredTestParameters = [];
      }
    });

       }



      //  test parameter

     searchTestParameters(query: string) {
  const trimmedQuery = query.trim();
  this.masterService.getmedicaltest(this.testParameterPage, this.testParameterLimit, trimmedQuery)
    .subscribe((res: any) => {
      this.filteredTestParameters = res.data || [];
    });
}

selectTestParameter(tp: any) {
  if (!this.isTestParameterSelected(tp)) {
    this.selectedTestParameters.push(tp);
    this.updateSelectedTestParameters();
  }

  // Clear search input & dropdown
  this.testParameterSearchControl.setValue('');
  this.filteredTestParameters = [];
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



      //  test parameter


loadMedicaltest(medicaltestId: string) {
 this.masterService.getMedeicalTestgroupById(medicaltestId).subscribe((response: any) => {
  const medicaltest = response;

  if (medicaltest) {
    this.medicalTestGroup.patchValue({
      testGroup: medicaltest.testGroup,
      testParameters: medicaltest.testParameters.map((p: any) => p._id),
      price: medicaltest.price,
      description: medicaltest.description,
    });

    // Delay until testParametersList is available
    if (this.testParametersList?.length > 0) {
      this.selectedTestParameters = this.testParametersList.filter((tp: any) =>
        medicaltest.testParameters.some((selected: any) => selected._id === tp._id)
      );
    } else {
      // fallback: use raw from response
      this.selectedTestParameters = medicaltest.testParameters;
    }
  }
});

}


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

  // 💡 Transform testParameters from IDs to full objects
 formData.testParameters = this.selectedTestParameters;


  const medicaltestId = this.route.snapshot.queryParams['_id'];

  if (medicaltestId) {
    // Update

    // console.log(formData);


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
        this.router.navigateByUrl('/pathologylayout/testgrouplist');
      },
      error: (error) => {
        console.error("Error updating Medical Test:", error);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text:error.error.message || 'Something went wrong while updating the medical test.',
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
    // Create
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
        this.router.navigateByUrl('/pathologylayout/testgrouplist');
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
    console.log("🚀 ~ MedicaltestgroupComponent ~ OnSubmit ~ formData:", formData)
    console.log("🚀 ~ MedicaltestgroupComponent ~ OnSubmit ~ formData:", formData)
    console.log("🚀 ~ MedicaltestgroupComponent ~ OnSubmit ~ formData:", formData)
}





     toggleTestParamDropdown() {
  this.dropdownOpenTestParams = !this.dropdownOpenTestParams;
}

// selectTestParameter(tp: any) {
//   if (!this.isTestParameterSelected(tp)) {
//     this.selectedTestParameters.push(tp);
//     this.updateSelectedTestParameters();
//   }
// }


}
