import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../../masterservice/master.service';
import { BedwardroomService } from '../../bedservice/bedwardroom.service';
// import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { LoaderComponent } from '../../../../loader/loader.component';

@Component({
  selector: 'app-bedmasterlist',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, LoaderComponent],
  templateUrl: './bedmasterlist.component.html',
  styleUrl: './bedmasterlist.component.css',
})
export class BedmasterlistComponent {
  wards: any[] = [];
  searchText: string = '';
  filterForm!: FormGroup;
  totalPages: number = 1;
  currentPage: number = 1;
  recordsPerPage: number = 10;
  module: string = '';

  constructor(
    private masterService: MasterService,
    private router: Router,
    private fb: FormBuilder,
    private bedwardroomservice: BedwardroomService
  ) {}

  userPermissions: any = {};
  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'bed'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // load permissions
    this.filterForm = this.fb.group({
      recordsPerPage: [50],
      searchText: [''],
    });

    this.loadbeds();

    // Watch for changes in dropdown
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadbeds();
    });

    // Optionally watch for searchText
    this.filterForm
      .get('searchText')
      ?.valueChanges.pipe(
        debounceTime(300), // Wait 300ms after typing
        distinctUntilChanged()
      )
      .subscribe((searchText: string) => {
        this.currentPage = 1;
        this.loadbeds();
      });
  }

  // pagination handled by backend
  loadbeds(): void {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';

    this.bedwardroomservice.getBed(this.currentPage, limit, search).subscribe(res => {
      this.wards = res?.beds ? res.beds : res.data;
      // console.log("🚀 ~ BedmasterlistComponent ~ this.bedwardroomservice.getbed ~ this.wards :", this.wards )
      this.totalPages = res?.totalPages || res.data?.totalPages;
    });
  }

  allBeds = []; // store all beds here

  // pagination handled by frontend
  // loadbeds(): void {
  //   const limit = this.filterForm.get('recordsPerPage')?.value || 10;
  //   const search = this.filterForm.get('searchText')?.value || '';

  //   this.bedwardroomservice
  //     .getBed(this.currentPage, limit, search)
  //     .subscribe((res) => {
  //       this.allBeds = res?.beds || [];

  //       const start = (this.currentPage - 1) * limit;
  //       const end = start + limit;
  //       this.wards = this.allBeds.slice(start, end);

  //       this.totalPages = Math.ceil(this.allBeds.length / limit);
  //     });
  // }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadbeds();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadbeds();
    }
  }
  
  editWard(wardId: string) {
    // console.log(medicalId, "medicalId");
    // alert(wardId)

    this.router.navigate(['/master/bedmaster'], {
      queryParams: { _id: wardId },
    });
  }

  async deleteWard(wardId: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!wardId) {
      console.error('Ward ID is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This Bed will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
        cancelButton: 'hospital-swal-button',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.bedwardroomservice.deletebed(wardId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Bed has been deleted successfully.',
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

            // Refresh list
            this.wards = this.wards.filter((ward) => ward._id !== wardId);
          },
          error: (err) => {
            console.error('Error deleting ward:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text:
                err.error.message || 'There was an error deleting the ward.',
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
    });
  }
}
