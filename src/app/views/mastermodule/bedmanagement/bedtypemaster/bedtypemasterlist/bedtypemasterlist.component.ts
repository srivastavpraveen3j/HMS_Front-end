import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../../masterservice/master.service';
import { BedwardroomService } from '../../bedservice/bedwardroom.service';
// import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-bedtypemasterlist',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './bedtypemasterlist.component.html',
  styleUrl: './bedtypemasterlist.component.css'
})
export class BedtypemasterlistComponent {



  bedtypes: any[] = [];

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
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'bedType');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions
    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: ['']
    });

    this.loadBedtype();

    // Watch for changes in dropdown
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadBedtype();
    });

      // Optionally watch for searchText
  this.filterForm.get('searchText')?.valueChanges
    .pipe(
      debounceTime(300), // Wait 300ms after typing
      distinctUntilChanged()
    )
    .subscribe((searchText: string) => {
      this.currentPage = 1;
      this.loadBedtype();
    });
  }

 loadBedtype(): void {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';

    this.bedwardroomservice.getbedtype(this.currentPage, limit, search).subscribe(res => {
      console.log("🚀 ~ BedtypemasterlistComponent ~ this.bedwardroomservice.getbedtypes ~ res:", res)
      this.bedtypes = res?.data?.bedTypes;
      this.totalPages = res?.data?.totalPages;
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadBedtype();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadBedtype();
    }
  }
  editWard(wardId: string) {

    // console.log(medicalId, "medicalId");
    // alert(wardId)
     this.router.navigate(['/master/bedtypemaster'], {
        queryParams: { _id: wardId }
      });

  }



async deleteWard(wardId: string) {
  const Swal = (await import('sweetalert2')).default;

  if (!wardId) {
    console.error("Ward ID is required for deletion");
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'This Ward will be permanently deleted.',
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
      this.bedwardroomservice.deletebedtype(wardId).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Ward has been deleted successfully.',
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

          this.bedtypes = this.bedtypes.filter(item => item._id !== wardId);
        },
        error: (err) => {
          console.error("Error deleting Ward:", err);
          Swal.fire({
            icon: 'error',
            title: 'Deletion Failed',
            text: 'There was an error deleting the Ward.',
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
