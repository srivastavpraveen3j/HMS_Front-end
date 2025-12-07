import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
// import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-packagelist',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './packagelist.component.html',
  styleUrl: './packagelist.component.css'
})
export class PackagelistComponent {

  recordsPerPage: number = 25;
  searchText: string = '';
  filterForm!: FormGroup;
  packages : any[] = [];
  currentPage = 1;
  totalPages = 1;


    constructor(private masterService : MasterService, private router : Router, private fb: FormBuilder){

    }


 userPermissions: any = {};
  ngOnInit(): void {
// load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'packages');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions
      this.filterForm = this.fb.group({
        recordsPerPage: [10],
        searchText: ['']
      });

      this.loadPackages();

      this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
        this.currentPage = 1;
        this.loadPackages();
      });

         // Optionally watch for searchText
     this.filterForm.get('searchText')?.valueChanges
       .pipe(
         debounceTime(300), // Wait 300ms after typing
         distinctUntilChanged()
       )
       .subscribe((searchText: string) => {
         this.currentPage = 1;
         this.loadPackages();
       });
    }

    loadPackages() {
      const limit = this.filterForm.get('recordsPerPage')?.value || 10;
      const search = this.filterForm.get('searchText')?.value || '';

      this.masterService.getPackage(this.currentPage, limit, search).subscribe(res => {
        this.packages = res ? res.pkg : res.data;
        this.totalPages = res.totalPages || Math.ceil(res.total / limit); // fallback if totalPages missing
      });
    }


  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPackages();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPackages();
    }
  }



  editPackage(packageid : string) {
    // alert(packageid)

      this.router.navigate(['/master/packagemaster'], {
        queryParams: { _id: packageid }
      });
  }


 async deletePackage(packageid: string) {
    const Swal = (await import('sweetalert2')).default;

  if (!packageid) {
    console.error("Package ID is required for deletion");
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'This package will be permanently deleted.',
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
      this.masterService.deletePackages(packageid).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Package has been deleted successfully.',
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
          this.packages = this.packages.filter(pkg => pkg._id !== packageid);
        },
        error: (err) => {
          console.error("Error deleting package:", err);
          Swal.fire({
            icon: 'error',
            title: 'Deletion Failed',
            text: err?.error?.message || 'There was an error deleting the package.',
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
