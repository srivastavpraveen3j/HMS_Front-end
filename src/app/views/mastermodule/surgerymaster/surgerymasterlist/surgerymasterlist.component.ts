import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
// import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-surgerymasterlist',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './surgerymasterlist.component.html',
  styleUrl: './surgerymasterlist.component.css'
})
export class SurgerymasterlistComponent {

  recordsPerPage: number = 25;
  searchText: string = '';
  filterForm!: FormGroup;
  surgery : any[] = [];
  currentPage = 1;
  totalPages = 1;


  constructor(private masterService : MasterService, private router : Router, private fb: FormBuilder){

  }


   userPermissions: any = {};
  ngOnInit(): void {
// load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'surgeryService');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions



    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: ['']
    });

    this.loadSurgerymaster();

    // Watch for changes in dropdown
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadSurgerymaster();
    });

    // Optionally watch for searchText
        // Optionally watch for searchText
this.filterForm.get('searchText')?.valueChanges
  .pipe(
    debounceTime(300), // Wait 300ms after typing
    distinctUntilChanged()
  )
  .subscribe((searchText: string) => {
    this.currentPage = 1;
    this.loadSurgerymaster();
  });
  }

  loadSurgerymaster(): void {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';

    this.masterService.getSurgerymaster(this.currentPage, limit, search).subscribe(res => {
      this.surgery = res.services ? res.services : res.data;
      // console.log("🚀 ~ SurgerymasterlistComponent ~ this.masterService.getsurgerymaster ~ this.surgery:", this.surgery)
      this.totalPages = res.totalPages;
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSurgerymaster();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSurgerymaster();
    }
  }
  editSurgery(wardId: string) {

    // console.log(medicalId, "medicalId");
    // alert(wardId)

    this.router.navigate(['/master/surgerymaster'], { queryParams: { _id: wardId } });
  }



 async deleteSurgery(surgeryId: string){
  const Swal = (await import('sweetalert2')).default;

  if (!surgeryId) {
    console.error("Surgery ID is required for deletion");
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'This surgery package will be permanently deleted.',
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
      this.masterService.deletesurgerymaster(surgeryId).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Surgery package has been deleted successfully.',
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
          this.surgery = this.surgery.filter(item => item._id !== surgeryId);
        },
        error: (err) => {
          console.error("Error deleting surgery:", err);
          Swal.fire({
            icon: 'error',
            title: 'Deletion Failed',
            text: err?.error?.message || 'There was an error deleting the surgery package.',
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


parseCategory(value: any): string {
  try {
    const arr = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(arr) ? arr.join(', ') : value;
  } catch {
    return value;
  }
}


}
