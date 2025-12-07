import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BedwardroomService } from '../../bedservice/bedwardroom.service';
// import Swal from 'sweetalert2';

@Component({
  selector: 'app-bedtypemaster',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './bedtypemaster.component.html',
  styleUrl: './bedtypemaster.component.css'
})
export class BedtypemasterComponent {


  bedTypeForm: FormGroup

bedTypes: any[] = [];


  constructor(private fb: FormBuilder, private bedwradroomservice : BedwardroomService, private router : Router, private route : ActivatedRoute) {

    // bed type starts here
    this.bedTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      isActive: [true],
      price_per_day : [0 ,Validators.required]

    });

  }



  userPermissions: any = {};
  ngOnInit(): void {
// load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'bedType');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions

     this.route.queryParams.subscribe(params => {
      const bedtypeid = params['_id'];
      if (bedtypeid) {
        this.loadBedtype(bedtypeid);
      } else {
        console.log("Bed Type Id not found in query params.");
      }
    });

  }

  loadBedtype(bedtypeid : string){

    this.bedwradroomservice.getbedtypes().subscribe((res :any)=>{
      const bedtypes = res?.data?.bedTypes || [];
      const bedtype = bedtypes.find((p: any) => p._id === bedtypeid);



       if(bedtype){

        this.bedTypeForm.patchValue({

              name: bedtype.name,
      description: bedtype.description,
      isActive: bedtype.isActive,
      price_per_day : bedtype.price_per_day

        })


    }else{
      console.log("Bed Id not Found")
    }
    })





  }

async onSubmit() {
  const Swal = (await import('sweetalert2')).default;

  if (this.bedTypeForm.invalid) {
    this.bedTypeForm.markAllAsTouched();
    Swal.fire({
      icon: 'warning',
      title: 'Incomplete Form',
      text: 'Please fill all required fields marked with *',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
      },
    });
    return;
  }

  const bedtypeid = this.route.snapshot.queryParams['_id'];
  const formData = { ...this.bedTypeForm.value };

  if (bedtypeid) {
    // 🔄 Update existing bed type
    this.bedwradroomservice.updatebedtype(bedtypeid, formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Bed Type Updated',
          text: 'Bed Type updated successfully!',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false,
          customClass: {
            popup: 'hospital-toast-popup',
            title: 'hospital-toast-title',
            htmlContainer: 'hospital-toast-text',
          },
        });
        this.bedTypeForm.reset();
        this.router.navigateByUrl('/master/bedtypemasterlist');
      },
      error: (err) => {
        console.error('Error updating bed type:', err);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text:err?.error?.message ||'There was an error updating the bed type.',
          customClass: {
            popup: 'hospital-swal-popup',
            title: 'hospital-swal-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-button',
          },
        });
      },
    });
  } else {
    // ➕ Create new bed type
    this.bedwradroomservice.postbedtype(formData).subscribe({
      next: (res) => {
        this.bedTypes = res;
        Swal.fire({
          icon: 'success',
          title: 'Bed Type Created',
          text: 'Bed Type created successfully!',
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false,
          customClass: {
            popup: 'hospital-toast-popup',
            title: 'hospital-toast-title',
            htmlContainer: 'hospital-toast-text',
          },
        });
        this.bedTypeForm.reset();
        this.router.navigateByUrl('/master/bedtypemasterlist');
      },
      error: (err) => {
        console.error('Error creating bed type:', err);
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text:err?.error?.message || 'There was an error creating the bed type.',
          customClass: {
            popup: 'hospital-swal-popup',
            title: 'hospital-swal-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-button',
          },
        });
      },
    });
  }
}


}
