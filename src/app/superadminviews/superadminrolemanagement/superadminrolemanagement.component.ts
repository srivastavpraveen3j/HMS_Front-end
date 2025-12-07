import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { SuperadminService } from '../superadminservice/superadmin.service';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-superadminrolemanagement',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './superadminrolemanagement.component.html',
  styleUrl: './superadminrolemanagement.component.css',
})
export class SuperadminrolemanagementComponent {
  roles: any[] = [];
  isEditing: boolean = false;
  formData: any = {};
  roleForm!: FormGroup;
  permissions: any[] = [];
  selectedPermissions: any[] = [];
  permissionSearch: string = '';
  allPermissions: any[] = [];
  dropdownOpen: boolean = false;

  constructor(
    private superadminService: SuperadminService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.roleForm = fb.group({
      name: [''],
      description: [''],
      PlatformPermission: [[]],
    });
  }

  ngOnInit(): void {
    this.fetchRoles();
    this.fetchPermissions();
  }

  fetchRoles() {
    this.superadminService.getPlatformRoles().subscribe((roles: any) => {
      console.log('roles', roles);
      this.roles = roles;
    });
  }

  fetchPermissions() {
    this.superadminService
      .getPlatformPermissions()
      .subscribe((permissions: any) => {
        console.log('permissions', permissions);
        this.permissions = permissions;
      });
  }

  onPermissionSearch(event: any) {
    this.permissionSearch = event.target.value;
    // console.log('permission search', this.permissionSearch);
    this.dropdownOpen = true;
  }

  filteredPermissions() {
    if (!this.permissionSearch || this.permissionSearch.length < 2) return [];

    const search = this.permissionSearch.toLowerCase();

    return this.permissions.filter((p: any) => {
      const actions = Array.isArray(p.action)
        ? p.action.join(', ')
        : p.action || '';

      return (
        p.name?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        actions.toLowerCase().includes(search)
      );
    });
  }

  selectPermission(permission: any) {
    const alreadySelected = this.selectedPermissions.find(
      (p) => p._id === permission._id
    );
    if (!alreadySelected) {
      this.selectedPermissions.push(permission);
      this.roleForm.patchValue({
        PlatformPermission: this.selectedPermissions.map((p) => p._id),
      });
    }
    this.permissionSearch = ''; // Clear input
    this.dropdownOpen = false; // Close dropdown
  }

  removePermission(permission: any) {
    this.selectedPermissions = this.selectedPermissions.filter(
      (p) => p._id !== permission._id
    );
    this.roleForm.patchValue({
      PlatformPermission: this.selectedPermissions.map((p) => p._id),
    });
  }

  saveRole() {
    if (this.isEditing) {
      this.superadminService
        .updatePlatformRole(this.formData.id, this.formData)
        .subscribe(() => {
          this.fetchRoles();
          this.resetForm();
        });
    } else {
      const formValue = this.roleForm.value;

      const payload = {
        ...formValue,
        isSuperAdmin: false,
      };

      this.superadminService.createPlatformRole(payload).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Role Created',
          text: 'The role has been created successfully.',
          customClass: {
            popup: 'hospital-swal-popup',
            title: 'hospital-swal-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-button',
          },
        });
        // this.fetchRoles();
        this.resetForm();
        this.router.navigate(['/superadmin/superadminrolelist']);
      });
    }
  }

  resetForm() {
    this.roleForm.reset({
      name: [''],
      description: [''],
      permissions: [],
    });
  }

  editRole(role: any) {
    this.formData = { ...role };
    this.isEditing = true;
  }

  deleteRole() {}

  togglePermission(event: any, permissionId: string) {
    const selected = this.roleForm.value.permissions;
    if (event.target.checked) {
      this.roleForm.patchValue({ permissions: [...selected, permissionId] });
    } else {
      this.roleForm.patchValue({
        permissions: selected.filter((id: string) => id !== permissionId),
      });
    }
  }
}
