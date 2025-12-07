// roles.component.ts

import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoleService } from '../../../../views/mastermodule/usermaster/service/role.service';
// import Swal from 'sweetalert2';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css',
})
export class RolesComponent {
  roleform: FormGroup;
  allPermissions: any[] = [];
  selectedPermissions: any[] = [];
  dropdownOpen: boolean = false;
  editMode = false;
  roleId: string | null = null;
  permissionSearch: string = '';

  constructor(
    private fb: FormBuilder,
    private roleservice: RoleService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.roleform = this.fb.group({
      name: ['', Validators.required],
      permission: [[]], // store permission IDs here
    });
  }

  userPermissions: any = {};

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-multiselect')) {
      this.dropdownOpen = false;
    }
  }

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'roles'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    this.roleservice.getPermission().subscribe((res) => {
      console.log('🚀 Permissions loaded:', res);
      this.allPermissions = res;
    });

    this.route.queryParams.subscribe((params) => {
      this.roleId = params['_id'] || null;
      this.editMode = !!this.roleId;
      if (this.editMode && this.roleId) {
        // this.manuallySelected = true;
        this.loadRoles(this.roleId);
      }
    });
  }

  loadRoles(roleId: string) {
    this.roleservice.getRoles().subscribe((res: any) => {
      const roles = res || [];
      const role = roles.find((p: any) => p._id === roleId);
      console.log('🚀 ~ Loaded Role:', role);

      if (role) {
        // Extract just permission IDs
        const permissionIds = role.permission?.map((p: any) => p._id) || [];

        // Patch form
        this.roleform.patchValue({
          name: role.name,
          permission: permissionIds,
        });

        // Set selectedPermissions for tag display
        this.selectedPermissions = role.permission || [];
      }
    });
  }

  selectPermission(permission: any) {
    const alreadySelected = this.selectedPermissions.find(
      (p) => p._id === permission._id
    );
    if (!alreadySelected) {
      this.selectedPermissions.push(permission);
      this.roleform.patchValue({
        permission: this.selectedPermissions.map((p) => p._id),
      });
    }
    this.permissionSearch = ''; // Clear search after selection
  }

  removePermission(permission: any) {
    this.selectedPermissions = this.selectedPermissions.filter(
      (p) => p._id !== permission._id
    );
    this.roleform.patchValue({
      permission: this.selectedPermissions.map((p) => p._id),
    });
  }

  filteredPermissions() {
    const searchTerm = this.permissionSearch.toLowerCase();
    return this.allPermissions.filter(
      (perm) =>
        perm.name.toLowerCase().includes(searchTerm) &&
        !this.selectedPermissions.find((p) => p._id === perm._id)
    );
  }

 async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.roleform.invalid) {
      console.log(
        '🚀 ~ UsermasterComponent ~ OnSubmit ~ this.userform.invalid:',
        this.roleform.invalid
      );
    }

    // this.route.queryParams.subscribe((params)=>{

    // const roleid = params['_id'] || null;

    // })

    if (this.roleId) {
      // Update OPD case
      this.roleservice.updateRoles(this.roleId, this.roleform.value).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Role  Updated',
            text: 'Role has been updated successfully.',
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
          this.router.navigateByUrl('setting/roleslist');
        },
        error: (err) => {
          console.error('Error updating Roles:', err);
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text:
              err?.error?.message ||
              'Something went wrong while updating the Roles.',
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button',
            },
          });
        },
      });
    } else {
      this.roleservice.postRoles(this.roleform.value).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Role Created',
            text: 'New Role has been generated and saved.',
            position: 'top-end',
            toast: true,
            timer: 3500,
            showConfirmButton: false,
            customClass: {
              popup: 'hospital-toast-popup',
              title: 'hospital-toast-title',
              htmlContainer: 'hospital-toast-text',
            },
          });
          this.roleform.reset();
          this.router.navigate(['/setting/roleslist']);
        },
        error: (err) => {
          console.error('Error creating User:', err);
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            position: 'top-end',
            toast: true,
            timer: 3500,
            text:
              err?.error?.message ||
              'An error occurred while creating the Role.',
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
  }
}
