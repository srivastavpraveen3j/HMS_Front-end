import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterService } from '../../../masterservice/master.service';
import { BedwardroomService } from '../../bedservice/bedwardroom.service';
// import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-wardmaster',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './wardmaster.component.html',
  styleUrl: './wardmaster.component.css',
})
export class WardmasterComponent {
  wardForm: FormGroup;
  rooms: any[] = [];
  selectedRooms: any[] = [];
  dropdownOpenRooms: boolean = false;
  totalPages: number = 0;
  currentPage: number = 1;
  constructor(
    private fb: FormBuilder,
    private masterservice: MasterService,
    private route: ActivatedRoute,
    private router: Router,
    private bedwardroomservice: BedwardroomService
  ) {
    this.wardForm = this.fb.group({
      ward_name: ['', Validators.required],
      remarks: [''],
      is_active: [true],
      room_id: [[], Validators.required],
    });
  }

  userPermissions: any = {};
  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'wardMaster'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    this.fetchAllRooms();

    // this.bedwardroomservice.getroom().subscribe((res)=>{
    //   console.log("🚀 ~ WardmasterComponent ~ this.bedwardroomservice.getroom ~ res:", res);
    //   this.rooms = res.rooms

    //   console.log("🚀 ~ WardmasterComponent ~ this.bedwardroomservice.getroom ~ this.rooms:", this.rooms);
    // })

    this.route.queryParams.subscribe((params) => {
      const wardid = params['_id'];
      if (wardid) {
        this.fetchAllRooms(wardid);
      } else {
        this.fetchAllRooms();
        console.log('wardid Id not found in query params.');
      }
    });
  }

  fetchAllRooms(wardid?: string) {
    this.bedwardroomservice.getroom(1).subscribe((firstRes: any) => {
      const totalPages = firstRes.totalPages;
      const requests = [];

      for (let page = 2; page <= totalPages; page++) {
        requests.push(this.bedwardroomservice.getroom(page));
      }

      forkJoin(requests).subscribe((otherResults: any[]) => {
        //==> combine the first response with the rest
        this.rooms = firstRes.rooms.concat(
          ...otherResults.map((res) => res.rooms)
        );

        console.log('✅ All Rooms Loaded:', this.rooms);

        if (wardid) {
          this.loadWardmaster(wardid);
        }
      });
    });
  }

  loadWardmaster(wardid: string) {
    this.masterservice.getWardmasterUrl().subscribe((res: any) => {
      const wards = res.wardMasters || [];
      console.log(
        '🚀 ~ WardmasterComponent ~ this.masterservice.getWardmasterUrl ~ wards:',
        wards
      );
      const ward = wards.find((p: any) => p._id === wardid);
      console.log(
        '🚀 ~ WardmasterComponent ~ this.masterservice.getWardmasterUrl ~ ward:',
        ward
      );

      if (ward) {
        this.wardForm.patchValue({
          ward_name: ward.ward_name,
          room_id: ward.room_id.map((room: any) => room._id), // ✅ fixed here
          is_active: ward.is_active,
          remarks: ward.remarks,
        });

        const selectedRoomIds = ward.room_id.map((room: any) => room._id);
        this.selectedRooms = this.rooms.filter(
          (room) => selectedRoomIds.includes(room._id) // ✅ fixed here
        );
      } else {
        console.log('Ward Id not Found');
      }
    });
  }

  toggleRoomDropdown() {
    this.dropdownOpenRooms = !this.dropdownOpenRooms;
  }

  selectRoom(room: any) {
    const alreadySelected = this.selectedRooms.find((b) => b._id === room._id);
    if (!alreadySelected) {
      this.selectedRooms.push(room);
      const ids = this.selectedRooms.map((b) => b._id);
      this.wardForm.get('room_id')?.setValue(ids);
    }
  }

  removeRoom(room: any) {
    this.selectedRooms = this.selectedRooms.filter((r) => r._id !== room._id);
    const ids = this.selectedRooms.map((b) => b._id);
    this.wardForm.get('room_id')?.setValue(ids); // <-- update the form
  }

  isRoomSelected(room: any): boolean {
    return this.selectedRooms.some((r) => r._id === room._id);
  }

 async onSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.wardForm.valid) {
      const wardid = this.route.snapshot.queryParams['_id'];

      if (wardid) {
        // Update existing ward
        this.masterservice
          .updateWardmasterUrl(wardid, this.wardForm.value)
          .subscribe({
            next: (res) => {
              Swal.fire({
                icon: 'success',
                title: 'Ward Updated',
                text: 'Ward has been updated successfully.',
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

              this.wardForm.reset();
              this.router.navigateByUrl('/master/wardmasterlist');
            },
            error: (err) => {
              console.error('Error updating ward:', err);
              Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text:
                  err?.error?.message ||
                  'Something went wrong while updating the ward.',
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
        // Create new ward
        this.masterservice.postWardmasterUrl(this.wardForm.value).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Ward Created',
              text: 'New ward has been added successfully.',
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

            this.wardForm.reset();
            this.router.navigateByUrl('/master/wardmasterlist');
          },
          error: (err) => {
            console.error('Error creating ward:', err);
            Swal.fire({
              icon: 'error',
              title: 'Creation Failed',
              text:
                err?.error?.message ||
                'Something went wrong while creating the ward.',
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
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields before submitting.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
    }
  }
}
