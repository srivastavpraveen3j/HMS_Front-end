import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { MasterService } from '../../../../views/mastermodule/masterservice/master.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-radaitiontestparameterlist',
    imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './radaitiontestparameterlist.component.html',
  styleUrl: './radaitiontestparameterlist.component.css'
})
export class RadaitiontestparameterlistComponent {


  recordsPerPage: number = 25;
  searchText: string = '';

  filterForm!: FormGroup;

  Medicaltest: any[] = [];
  currentPage = 1;
  totalPages = 1;



  constructor(private masterService: MasterService , private router: Router, private fb : FormBuilder) {}


     userPermissions: any = {};

ngOnInit(): void {

 // load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'testParameter');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions
    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: ['']
    });

    this.loadMedicaltest();

    // Watch for changes in dropdown
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadMedicaltest();
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
    this.loadMedicaltest();
  });
  }

  loadMedicaltest(): void {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';

    this.masterService.getmedicaltest(this.currentPage, limit, search).subscribe(res => {
      this.Medicaltest = res.data;
      this.totalPages = res.totalPages;
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadMedicaltest();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMedicaltest();
    }
  }
  editMedicaltest(medicalId: string) {

    // console.log(medicalId, "medicalId");
    // alert(medicalId)

    this.router.navigate(['/radiationlayout/radiationtestparameter'], { queryParams: { _id: medicalId } });
  }



  deleteMedicaltest(medicalId: string): void {
  if (!medicalId) {
    console.error("Medical Test ID is required for deletion");
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'This Medical Test will be permanently deleted.',
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
      this.masterService.deleteMedicaltest(medicalId).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Medical Test has been deleted successfully.',
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
          this.Medicaltest = this.Medicaltest.filter(item => item._id !== medicalId);
        },
        error: (err) => {
          console.error("Error deleting Medical Test:", err);
          Swal.fire({
            icon: 'error',
            title: 'Deletion Failed',
            text:err.error.message || 'There was an error deleting the Medical Test.',
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
