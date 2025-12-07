import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
// import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-doctorlist',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './doctorlist.component.html',
  styleUrl: './doctorlist.component.css',
})
export class DoctorlistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  expandedDoctorId: string | null = null;
  filterForm!: FormGroup;

  doctors: any[] = [];
  currentPage = 1;
  totalPages = 1;

  constructor(
    private masterService: MasterService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  get isArray() {
    return Array;
  }
  userPermissions: any = {};

  ngOnInit() {
    //  loadpermission

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'uhid'
    );
    this.userPermissions = uhidModule?.permissions || {};

    //  loadpermission

    this.filterForm = this.fb.group({
      recordsPerPage: [50],
      searchText: [''],
    });

    this.loadDoctors();

    // Watch for changes in dropdown
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadDoctors();
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
        this.loadDoctors();
      });
  }

  loadDoctors(): void {
    const limit = this.filterForm.get('recordsPerPage')?.value || 50;
    const search = this.filterForm.get('searchText')?.value || '';

    this.masterService
      .getDoctor(this.currentPage, limit, search)
      .subscribe((res) => {
          console.log(res.data);
          this.doctors = res.data;
          this.totalPages = res.data.totalPages;
        console.log('🚀 ~ this.doctors:', this.doctors);
      });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadDoctors();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDoctors();
    }
  }
  editdoctor(doctorId: string) {
    console.log(doctorId, 'doctorid');

    this.router.navigate(['/master/doctormaster'], {
      queryParams: { _id: doctorId },
    });
  }

  async deletedoctor(doctorId: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!doctorId) {
      console.error('Doctor ID is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This doctor will be permanently deleted.',
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
        this.masterService.deleteDoctor(doctorId).subscribe({
          next: (res: any) => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Doctor has been deleted successfully.',
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

            // Refresh doctor list
            this.doctors = this.doctors.filter((doc) => doc._id !== doctorId);
          },
          error: (err) => {
            console.error('Error deleting doctor:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: 'There was an error deleting the doctor.',
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

  toggleExpand(id: string): void {
    this.expandedDoctorId = this.expandedDoctorId === id ? null : id;
  }
}
