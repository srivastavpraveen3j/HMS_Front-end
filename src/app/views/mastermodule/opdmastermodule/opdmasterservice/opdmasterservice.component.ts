import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-opdmasterservice',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './opdmasterservice.component.html',
  styleUrl: './opdmasterservice.component.css'
})
export class OpdmasterserviceComponent implements OnInit {

  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  service: any[] = [];
  userPermissions: any = {};

  constructor(
    private masterService: MasterService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    // Load permissions from localStorage
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const serviceModule = allPermissions.find((perm: any) => perm.moduleName === 'service');
    this.userPermissions = serviceModule?.permissions || {};

    // Initialize form
    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: ['']
    });

    // Watch for changes in recordsPerPage
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadService();
    });

    // Watch for searchText changes
    this.filterForm.get('searchText')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadService();
      });

    // Initial load
    this.loadService();
  }

  loadService() {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';

    this.masterService.getService(this.currentPage, limit, search).subscribe(res => {
      this.service = res.services || res.data || [];
      this.totalPages = res.totalPages || 1;
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadService();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadService();
    }
  }

  editservice(serviceid: string) {
    this.router.navigate(['/master/opdservice'], {
      queryParams: { _id: serviceid }
    });
  }

  deleteservice(serviceid: string): void {
    if (!serviceid) {
      console.error("Service ID is required for deletion");
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This service will be permanently deleted.',
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
        this.masterService.deleteService(serviceid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Service has been deleted successfully.',
              position: 'top-end',
              toast: true,
              timer: 3000,
              showConfirmButton: false,
              customClass: {
                popup: 'hospital-toast-popup',
                title: 'hospital-toast-title',
                htmlContainer: 'hospital-toast-text'
              }
            });
            this.loadService();
          },
          error: (err) => {
            console.error("Error deleting service:", err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: 'There was an error deleting the service.',
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
