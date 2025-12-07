import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RoleService } from '../service/role.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-usermasterlist',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './usermasterlist.component.html',
  styleUrls: ['./usermasterlist.component.css'], // Fixed property name from styleUrl to styleUrls
})
export class UsermasterlistComponent {

  // roles = [
  //   {
  //     name: 'Doctor',
  //     permissions: 'View Patients, Write Prescriptions, Update Medical Records, View Lab Reports',
  //     status: 'Active',
  //   },
  //   {
  //     name: 'Nurse',
  //     permissions: 'View Patients, Update Vitals, Assist in Procedures, Manage Inventory',
  //     status: 'Active',
  //   },
  //   {
  //     name: 'Receptionist',
  //     permissions: 'Register Patients, Schedule Appointments, Manage Billing, View Patients',
  //     status: 'Active',
  //   },
  //   {
  //     name: 'Pharmacist',
  //     permissions: 'View Prescriptions, Dispense Medication, Manage Pharma Inventory',
  //     status: 'Active',
  //   },
  //   {
  //     name: 'Lab Technician',
  //     permissions: 'View Test Requests, Upload Lab Reports, Manage Lab Inventory',
  //     status: 'Active',
  //   },
  //   {
  //     name: 'Radiologist',
  //     permissions: 'View Radiology Requests, Upload Scans, Report Imaging Results',
  //     status: 'Active',
  //   },

  // ];

  users: any[] = [];
  filterForm!: FormGroup;

  recordsPerPage = 25;
  currentPage = 1;
  totalPages = 1;

  userPermissions: any = {};

  showPermissionModal = false; // control for permission modal display
  selectedUser: any = null; // selected user for permission modal

  constructor(
    private roleservice: RoleService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'user'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // Initialize form
    this.filterForm = this.fb.group({
      recordsPerPage: [this.recordsPerPage],
      searchText: [''],
    });

    // Subscriptions for reactive changes
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadusercase();
    });
    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadusercase();
    });

    // Initial load
    this.loadusercase();
  }

  loadusercase() {
    const limit = this.filterForm.get('recordsPerPage')?.value || 25;
    const search = this.filterForm.get('searchText')?.value || '';
    this.roleservice.getuser(this.currentPage, limit, search).subscribe({
      next: (res: any) => {
        this.users = res || [];
        console.log('✅ Users loaded:', this.users);
      },
      error: (err) => {
        console.error('❌ Error fetching users:', err);
      },
    });
  }

  edituser(userid: string) {
    this.router.navigate(['/master/usermaster'], {
      queryParams: { _id: userid },
    });
  }

  async deleteuser(userid: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!userid) {
      console.error('User case ID is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This User case will be permanently deleted.',
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
        this.roleservice.deleteuser(userid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'User case has been deleted successfully.',
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

            // Refresh the list removing deleted user
            this.users = this.users.filter((symp) => symp._id !== userid);
          },
          error: (err) => {
            console.error('Error deleting User case:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text:
                err?.error?.message ||
                'There was an error deleting the User case.',
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

  // Open permission modal to show details of selected user role permissions
  openPermissionModal(user: any) {
    this.selectedUser = user;
    this.showPermissionModal = true;
  }

  // Close permission modal
  closePermissionModal() {
    this.showPermissionModal = false;
    this.selectedUser = null;
  }
}
