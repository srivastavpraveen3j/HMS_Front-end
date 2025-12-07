import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
// import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-medicaltestlist',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './medicaltestlist.component.html',
  styleUrl: './medicaltestlist.component.css',
})
export class MedicaltestlistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';

  filterForm!: FormGroup;

  Medicaltest: any[] = [];
  currentPage = 1;
  totalPages = 1;

  constructor(
    private masterService: MasterService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  userPermissions: any = {};
  ngOnInit(): void {
    // 🔐 Load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const testParamModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'testParameter'
    );
    this.userPermissions = testParamModule?.permissions || {};

    // 📋 Initialize filter form (only once)
    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: [''],
    });

    // 📦 Initial data load
    this.loadMedicaltest();

    // 🔁 Watch for records per page changes
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadMedicaltest();
    });

    // 🔍 Watch for search text changes (THIS WAS MISSING)
    this.filterForm
      .get('searchText')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadMedicaltest(); // <- Call your API with search text
      });
  }

  loadMedicaltest(): void {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    let search = this.filterForm.get('searchText')?.value || '';
    search = search.trim(); // remove trailing spaces

    this.masterService
      .getmedicaltest(this.currentPage, limit, search)
      .subscribe({
        next: (res: any) => {
          this.Medicaltest = res ? res.data : res;
          this.totalPages = res.totalPages || 1;
        },
        error: (err) => {
          console.error('Failed to load medical test data:', err);
        },
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

    this.router.navigate(['/master/medicaltest'], {
      queryParams: { _id: medicalId },
    });
  }

  async deleteMedicaltest(medicalId: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!medicalId) {
      console.error('Medical Test ID is required for deletion');
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
        cancelButton: 'hospital-swal-button',
      },
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
              },
            });

            // Refresh the list after deletion
            this.Medicaltest = this.Medicaltest.filter(
              (item) => item._id !== medicalId
            );
          },
          error: (err) => {
            console.error('Error deleting Medical Test:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text:
                err.error.message ||
                'There was an error deleting the Medical Test.',
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
