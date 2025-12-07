import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RoleService } from '../../../../views/mastermodule/usermaster/service/role.service';

declare var bootstrap: any;

@Component({
  selector: 'app-employee',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})
export class EmployeeComponent implements OnInit {
  // Data Properties
  users: any[] = [];
  selectedUser: any = null;

  // Form Properties
  filterForm!: FormGroup;

  // Pagination Properties
  recordsPerPage = 25;
  currentPage = 1;
  totalPages = 1;
  totalRecords = 0;

  // State Properties
  isLoading = false;

  // Permission Properties
  userPermissions: any = {};

  constructor(
    private roleservice: RoleService,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadPermissions();
    this.initializeForm();
    this.setupFormWatchers();
    this.loadusercase();
  }

  // Load User Permissions
  private loadPermissions(): void {
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'user');
    this.userPermissions = uhidModule?.permissions || {};
    console.log('🔑 User Permissions:', this.userPermissions);
  }

  // Initialize Form
  private initializeForm(): void {
    this.filterForm = this.fb.group({
      recordsPerPage: [25],
      searchText: ['']
    });
  }

  // Setup Form Watchers
  private setupFormWatchers(): void {
    // Records per page watcher
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe((value) => {
      this.recordsPerPage = value;
      this.currentPage = 1;
      this.loadusercase();
    });

    // Search text watcher with debouncing
    this.filterForm.get('searchText')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadusercase();
      });
  }

  // Load Users Data
  loadusercase(): void {
    this.isLoading = true;
    const limit = this.filterForm.get('recordsPerPage')?.value || 25;
    const search = this.filterForm.get('searchText')?.value || '';

    this.roleservice.getusers(this.currentPage, limit, search).subscribe({
      next: (res: any) => {
        if (res && Array.isArray(res.data)) {
          this.users = res.data;
          this.totalPages = res.totalPages || 1;
          this.totalRecords = res.totalRecords || res.data.length;
        } else if (Array.isArray(res)) {
          // Handle case where response is directly an array
          this.users = res;
          this.totalPages = 1;
          this.totalRecords = res.length;
        } else {
          this.users = [];
          this.totalPages = 1;
          this.totalRecords = 0;
        }
        this.isLoading = false;
        console.log("🚀 ~ Users loaded:", this.users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.users = [];
        this.totalPages = 1;
        this.totalRecords = 0;
        this.isLoading = false;
        this.showErrorMessage('Failed to load employees');
      }
    });
  }

  // Pagination Methods
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadusercase();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadusercase();
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadusercase();
    }
  }

  // Generate page numbers for pagination
  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.totalPages, this.currentPage + 2);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < this.totalPages) {
        if (endPage < this.totalPages - 1) pages.push('...');
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  // User Actions
  edituser(userid: string): void {
    if (!this.userPermissions.update) {
      this.showErrorMessage('You do not have permission to edit employees');
      return;
    }

    this.router.navigate(['/master/usermaster'], {
      queryParams: { _id: userid }
    });
  }

  viewUserDetails(user: any): void {
    this.selectedUser = user;
    const modalElement = document.getElementById('userDetailsModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  async deleteuser(userid: string): Promise<void> {
    if (!this.userPermissions.delete) {
      this.showErrorMessage('You do not have permission to delete employees');
      return;
    }

    const Swal = (await import('sweetalert2')).default;

    if (!userid) {
      console.error("User ID is required for deletion");
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This employee will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
        cancelButton: 'hospital-swal-button'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.roleservice.deleteuser(userid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Employee has been deleted successfully.',
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

            // Remove from local array
            this.users = this.users.filter(user => user._id !== userid);

            // Reload if current page becomes empty and not on first page
            if (this.users.length === 0 && this.currentPage > 1) {
              this.currentPage--;
              this.loadusercase();
            }
          },
          error: (err) => {
            console.error("Error deleting employee:", err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: err?.error?.message || 'There was an error deleting the employee.',
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

  // Utility Methods
  getInitials(name: string): string {
    if (!name) return 'N/A';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  clearFilters(): void {
    this.filterForm.patchValue({
      searchText: '',
      recordsPerPage: 25
    });
    this.currentPage = 1;
  }

  // Message Methods
  private showErrorMessage(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: message,
      position: 'top-end',
      toast: true,
      timer: 4000,
      showConfirmButton: false,
      timerProgressBar: true
    });
  }

  private showSuccessMessage(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      position: 'top-end',
      toast: true,
      timer: 3000,
      showConfirmButton: false,
      timerProgressBar: true
    });
  }

  // Getter for Math object (used in template)
  get Math() {
    return Math;
  }

  // Responsive handling
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Handle responsive behavior if needed
  }


  getuserbyid(userid: string) {
  // Navigate with route parameter
  this.router.navigate(['/hrms/employee/employeecard', userid]);
}
}
