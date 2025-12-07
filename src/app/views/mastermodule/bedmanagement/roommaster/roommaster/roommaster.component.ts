import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BedwardroomService } from '../../bedservice/bedwardroom.service';
// import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { combineLatest } from 'rxjs';
@Component({
  selector: 'app-roommaster',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './roommaster.component.html',
  styleUrl: './roommaster.component.css'
})
export class RoommasterComponent {

 roomForm: FormGroup;

  beds: any[] = [];
  roomTypes: any[] = [];
  selectedBeds: any[] = [];
  dropdownOpenBeds = false;

  constructor(private fb: FormBuilder, private bedwardroomservice : BedwardroomService, private route: ActivatedRoute, private router : Router) {
    this.roomForm = this.fb.group({
      roomNumber: ['', Validators.required],
      bed_id: [[], Validators.required],
      room_type_id: ['', Validators.required],
      remarks: [''],
      isActive: [true],
      inpatientCaseId : [''],
      fromRoomId : [''],
      toRoomId : [''],
      transferDate : [''],
      reason: [''],
    });
  }

   userPermissions: any = {};
  ngOnInit(): void {
// load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'room');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions
  const beds$ = this.bedwardroomservice.getbed();
  const roomTypes$ = this.bedwardroomservice.getroomType();
  const params$ = this.route.queryParams;

  combineLatest([beds$, roomTypes$, params$]).subscribe(([bedsRes, roomTypesRes, params]) => {
    this.beds = bedsRes?.beds || [];
    this.roomTypes = roomTypesRes.roomTypes || [];

    const roomid = params['_id'];
    if (roomid) {
      this.loadRoom(roomid);
    }
  });
}

loadRoom(roomid: string) {
  this.bedwardroomservice.getRoomById(roomid).subscribe(room => {
    console.log('Loaded room:', room);
    console.log('Available beds:', this.beds);
    console.log('room.bed_id:', room.bed_id);

    if (room) {
      this.roomForm.patchValue({
        roomNumber: room.roomNumber,
        bed_id: room.bed_id, // array of string ids
        remarks: room.remarks,
        isActive: room.isActive ?? room.is_active,
        room_type_id: room.room_type_id // string id
      });

      this.selectedBeds = this.beds.filter(bed =>
        room.bed_id.includes(bed._id)
      );
      console.log('Selected beds after filter:', this.selectedBeds);
    } else {
      console.log('Room not found');
    }
  });
}




  toggleBedDropdown() {
    this.dropdownOpenBeds = !this.dropdownOpenBeds;
  }

  selectBed(bed: any) {
    if (!this.isBedSelected(bed)) {
      this.selectedBeds.push(bed);
      const ids = this.selectedBeds.map(b => b._id);
      this.roomForm.get('bed_id')?.setValue(ids);
    }
    this.dropdownOpenBeds = false;
  }

  removeBed(bed: any) {
    this.selectedBeds = this.selectedBeds.filter(b => b._id !== bed._id);
    const ids = this.selectedBeds.map(b => b._id);
    this.roomForm.get('bed_id')?.setValue(ids);
  }

  isBedSelected(bed: any) {
    return this.selectedBeds.some(b => b._id === bed._id);
  }


async  onSubmit() {
    const Swal = (await import('sweetalert2')).default;

  if (this.roomForm.valid) {
    const roomid = this.route.snapshot.queryParams['_id'];

    if (roomid) {
      // Update existing room
      this.bedwardroomservice.updateroom(roomid, this.roomForm.value).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Room Updated',
            text: 'Room has been updated successfully.',
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

          this.roomForm.reset();
          this.router.navigateByUrl('/master/roommasterlist');
        },
        error: (err) => {
          console.error("Error updating room:", err);
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text:err?.error?.message || 'Something went wrong while updating the room.',
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
      // Create new room
      this.bedwardroomservice.postroom(this.roomForm.value).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Room Created',
            text: 'New room has been added successfully.',
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

          this.roomForm.reset();
          this.router.navigateByUrl('/master/roommasterlist');
        },
        error: (err) => {
          console.error("Error creating room:", err);
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text:err?.error?.message || 'Something went wrong while creating the room.',
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
