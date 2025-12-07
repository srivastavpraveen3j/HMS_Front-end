import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../../masterservice/master.service';
import { BedwardroomService } from '../../bedservice/bedwardroom.service';
// import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-roommasterlist',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './roommasterlist.component.html',
  styleUrl: './roommasterlist.component.css'
})
export class RoommasterlistComponent {



  wards: any[] = [];

  recordsPerPage: number = 25;
  searchText: string = '';

  filterForm!: FormGroup;

  currentPage = 1;
  totalPages = 1;



  constructor(private masterService: MasterService , private router: Router, private fb : FormBuilder, private bedwardroomservice : BedwardroomService) {}


 userPermissions: any = {};
  ngOnInit(): void {
// load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'room');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions
  this.filterForm = this.fb.group({
    recordsPerPage: [10], // smaller page size to test
    searchText: ['']
  });

  this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
    this.currentPage = 1;
    this.loadrooms();
  });


    // Optionally watch for searchText
this.filterForm.get('searchText')?.valueChanges
  .pipe(
    debounceTime(300), // Wait 300ms after typing
    distinctUntilChanged()
  )
  .subscribe((searchText: string) => {
    this.currentPage = 1;
    this.loadrooms();
  });

  this.loadrooms();
}

loadrooms(): void {
  const limit = this.filterForm.get('recordsPerPage')?.value || 10;
  const search = this.filterForm.get('searchText')?.value || '';

  console.log('Loading rooms:', this.currentPage, limit, search);

  this.bedwardroomservice.getRoom(this.currentPage, limit, search).subscribe(res => {
    this.wards = res.rooms;
    this.totalPages = res.totalPages;
    console.log('Total pages:', this.totalPages);
  });
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.loadrooms();
  }
}

previousPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.loadrooms();
  }
}

  editWard(wardId: string) {

    // console.log(medicalId, "medicalId");
    // alert(wardId)

    this.router.navigate(['/master/roommaster'], { queryParams: { _id: wardId } });
  }



 async deleteWard(wardId: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!wardId) {
      console.error("Room ID is required for deletion");
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This Room will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
        cancelButton: 'hospital-swal-button'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.bedwardroomservice.deleteroom(wardId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Room has been deleted successfully.',
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

            // Refresh the list after deletion
            this.wards = this.wards.filter(item => item._id !== wardId);
          },
          error: (err) => {
            console.error("Error deleting Room:", err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: err?.error?.message || 'There was an error deleting the Room.',
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
    });
  }




}
