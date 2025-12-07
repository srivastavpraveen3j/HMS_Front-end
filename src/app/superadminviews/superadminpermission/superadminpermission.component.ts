import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SuperadminService } from '../superadminservice/superadmin.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-superadminpermission',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './superadminpermission.component.html',
  styleUrl: './superadminpermission.component.css',
})
export class SuperadminpermissionComponent {
  permissionForm!: FormGroup;
  permissions: any[] = [];
  isEditing: boolean = false;
  formData: any = {};
  actions: string[] = ['view', 'create', 'edit', 'delete', 'approve', 'manage'];

  constructor(
    private fb: FormBuilder,
    private superadminService: SuperadminService,
    private router: Router
  ) {
    this.permissionForm = this.fb.group({
      name: [''],
      action: this.fb.array([]),
      description: [''],
    });
  }

  ngOnInit(): void {
    this.fetchPermissions();
  }

  fetchPermissions() {
    this.superadminService
      .getPlatformPermissions()
      .subscribe((permissions: any) => {
        console.log('permissions', permissions);
        this.permissions = permissions;
      });
  }

  get actionFormArray(): FormArray {
    return this.permissionForm.get('action') as FormArray;
  }

  selectedActions: string[] = [];

  // ✅ Toggle checkbox values
  onActionChange(event: any) {
    const value = event.target.value;
    if (event.target.checked) {
      this.actionFormArray.push(this.fb.control(value));
    } else {
      const index = this.actionFormArray.controls.findIndex(
        (ctrl) => ctrl.value === value
      );
      this.actionFormArray.removeAt(index);
    }
  }

  async savePermission(): Promise<void> {
    try {
      const formData = this.permissionForm.value;
      console.log('Submitting Form Data:', formData);

      const response = await firstValueFrom(
        this.superadminService.createPlatformPermission(formData)
      );

      const Swal = (await import('sweetalert2')).default;

      Swal.fire({
        icon: 'success',
        title: 'Permission Created',
        text: 'Permission has been successfully created.',
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
      this.resetForm();
      this.router.navigate(['/superadmin/superadminpermissionlist']);
    } catch (error: any) {
      console.error('Error during submission:', error);
      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text:
          error?.error?.message ||
          'An error occurred during Permission creation.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
    }
  }
  resetForm() {
    this.permissionForm.reset({
      name: '',
      action: [],
      description: '',
    });
    this.actionFormArray.clear(); // ✅ clear selected checkboxes
  }
}
