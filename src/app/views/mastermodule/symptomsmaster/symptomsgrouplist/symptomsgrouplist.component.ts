import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
// import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-symptomsgrouplist',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './symptomsgrouplist.component.html',
  styleUrl: './symptomsgrouplist.component.css'
})
export class SymptomsgrouplistComponent implements OnInit {
  recordsPerPage: number = 10;
  currentPage = 1;
  totalPages = 1;
  searchText: string = '';
  filterForm!: FormGroup;

  symptoms: any[] = [];

  constructor(
    private masterService: MasterService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  userPermissions: any = {};
  ngOnInit(): void {
// load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'symptomGroup');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions
    this.filterForm = this.fb.group({
      recordsPerPage: [this.recordsPerPage],
      searchText: ['']
    });

    this.loadSymtpomsgroup();

    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadSymtpomsgroup();
    });

   this.filterForm.get('searchText')?.valueChanges
     .pipe(
       debounceTime(300), // Wait 300ms after typing
       distinctUntilChanged()
     )
     .subscribe((searchText: string) => {
       this.currentPage = 1;
       this.loadSymtpomsgroup();
     });
  }

  loadSymtpomsgroup() {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';

    this.masterService.getSymptomGroup(this.currentPage, limit, search).subscribe(res => {
      this.symptoms = res.data;
      this.totalPages = res.totalPages;
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSymtpomsgroup();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSymtpomsgroup();
    }
  }

  editsymptomsGroup(symptomsgroupid: string) {
    this.router.navigate(['/master/symptomsgroup'], {
      queryParams: { _id: symptomsgroupid }
    });
  }

async deletesymptomsGroup(symptomsgroupid: string) {
  const Swal = (await import('sweetalert2')).default;

  if (!symptomsgroupid) {
    console.error("Symptoms Group ID is required for deletion");
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'This Symptoms Group will be permanently deleted.',
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
      this.masterService.deleteSymptomsGroup(symptomsgroupid).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Symptoms Group has been deleted successfully.',
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
          this.symptoms = this.symptoms.filter(item => item._id !== symptomsgroupid);
        },
        error: (err) => {
          console.error("Error deleting Symptoms Group:", err);
          Swal.fire({
            icon: 'error',
            title: 'Deletion Failed',
            text:err.error.message || 'There was an error deleting the Symptoms Group.',
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
