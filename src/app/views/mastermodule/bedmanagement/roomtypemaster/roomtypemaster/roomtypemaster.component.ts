import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BedwardroomService } from '../../bedservice/bedwardroom.service';
// import Swal from 'sweetalert2';

@Component({
  selector: 'app-roomtypemaster',
   imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './roomtypemaster.component.html',
  styleUrl: './roomtypemaster.component.css'
})
export class RoomtypemasterComponent {



  roomTypeForm: FormGroup;


 constructor(private fb: FormBuilder, private bedwardroomservice : BedwardroomService, private router : Router, private route : ActivatedRoute) {

    this.roomTypeForm = this.fb.group({
        name: ['', Validators.required],
      description: [''],
      isActive: [true],
      price_per_day: [0, Validators.required]
    });

  }


 userPermissions: any = {};
  ngOnInit(): void {
// load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'roomType');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions

   this.route.queryParams.subscribe(params => {
      const roomtypeid = params['_id'];
      if (roomtypeid) {
        this.loadRoomtype(roomtypeid);
      } else {
        console.log("Room Type Id not found in query params.");
      }
    });

}


loadRoomtype(roomtypeid : string){

  this.bedwardroomservice.getroomType().subscribe((res :any)=>{
      const roomtypes = res.roomTypes || [];
      const roomtype = roomtypes.find((p: any) => p._id === roomtypeid);

       if(roomtype){

        this.roomTypeForm.patchValue({

              name: roomtype.name,
      description: roomtype.description,
      isActive: roomtype.isActive,
      price_per_day: roomtype.price_per_day,
      // price_per_day : bedtype.price_per_day

        })


    }else{
      console.log("Room Type Id not Found")
    }
    })

}



async onSubmit() {
    const Swal = (await import('sweetalert2')).default;

  if (this.roomTypeForm.valid) {
    const roomtypeid = this.route.snapshot.queryParams['_id'];

    if (roomtypeid) {
      // Update Room Type
      this.bedwardroomservice.updateroomType(roomtypeid, this.roomTypeForm.value).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Room Type Updated',
            text: 'Room type has been updated successfully.',
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

          this.roomTypeForm.reset();
          this.router.navigateByUrl('/master/roomtypemasterlist');
        },
        error: (err) => {
          console.error("Error updating room type:", err);
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text:err?.error?.message || 'Something went wrong while updating the room type.',
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
      // Create Room Type
      this.bedwardroomservice.postroomType(this.roomTypeForm.value).subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Room Type Created',
            text: 'New room type has been added successfully.',
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

          this.roomTypeForm.reset();
          this.router.navigateByUrl('/master/roomtypemasterlist');
        },
        error: (err) => {
          console.error("Error creating room type:", err);
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text:err?.error?.message || 'Something went wrong while creating the room type.',
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
  } else {
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
  }
}


}
