import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { RoleService } from '../../../views/mastermodule/usermaster/service/role.service';

@Component({
  selector: 'app-employeecard',
  imports: [CommonModule],
  templateUrl: './employeecard.component.html',
  styleUrls: ['./employeecard.component.css']
})
export class EmployeecardComponent implements OnInit {

  // Employee Data
  employee: any = null;
  isLoading = false;
  employeeId: string = '';

  // Active Section
  activeSection = 'profile';

  // Permission Check
  userPermissions: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.loadPermissions();
    this.getEmployeeId();
      this.activeSection = 'personal'; // ✅ Set default to permissions
  }

  // Load User Permissions
  private loadPermissions(): void {
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const userModule = allPermissions.find((perm: any) => perm.moduleName === 'user');
    this.userPermissions = userModule?.permissions || {};
  }

  // Get Employee ID from Route
  private getEmployeeId(): void {
    this.route.paramMap.subscribe(params => {
      this.employeeId = params.get('id') || '';
      if (this.employeeId) {
        this.loadEmployeeData();
      } else {
        this.showError('No employee ID provided');
        this.router.navigate(['/hrms/employee']);
      }
    });
  }

  // Load Employee Data
  loadEmployeeData(): void {
    if (!this.userPermissions.read) {
      this.showError('You do not have permission to view employee details');
      return;
    }

    this.isLoading = true;

    this.roleService.getuserById(this.employeeId).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.employee = Array.isArray(response.data) ? response.data[0] : response.data;
        } else if (response) {
          this.employee = response;
        }

        if (!this.employee) {
          this.showError('Employee not found');
          this.router.navigate(['/hrms/employee']);
        }

        this.isLoading = false;
        console.log('🚀 Employee Data:', this.employee);
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        this.showError('Failed to load employee data');
        this.isLoading = false;
      }
    });
  }

  // Set Active Section
  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  // Navigation Methods
  goBack(): void {
    this.router.navigate(['/hrms/employee']);
  }

  editEmployee(): void {
    if (!this.userPermissions.update) {
      this.showError('You do not have permission to edit employees');
      return;
    }
    this.router.navigate(['/hrms/usermaster'], { queryParams: { _id: this.employeeId } });
  }

  // Utility Methods
  getInitials(name: string): string {
    if (!name) return 'N/A';
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  getEmployeeCode(): string {
    return this.employee?.employeeCode || `EMP_${this.employee?._id?.substring(0, 6).toUpperCase()}`;
  }

  getJoinDate(): string {
    if (!this.employee?.createdAt) return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return new Date(this.employee.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Message Methods
  private showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: message,
      confirmButtonColor: '#dc3545'
    });
  }


   // Get unique module count
  getUniqueModules(): number {
    if (!this.employee?.role?.permission) return 0;
    const uniqueModules = new Set(this.employee.role.permission.map((p: any) => p.moduleName));
    return uniqueModules.size;
  }

  // Count permissions by type
  getCreatePermissionsCount(): number {
    if (!this.employee?.role?.permission) return 0;
    return this.employee.role.permission.filter((p: any) => p.create === 1).length;
  }

  getReadPermissionsCount(): number {
    if (!this.employee?.role?.permission) return 0;
    return this.employee.role.permission.filter((p: any) => p.read === 1).length;
  }

  getUpdatePermissionsCount(): number {
    if (!this.employee?.role?.permission) return 0;
    return this.employee.role.permission.filter((p: any) => p.update === 1).length;
  }

  getDeletePermissionsCount(): number {
    if (!this.employee?.role?.permission) return 0;
    return this.employee.role.permission.filter((p: any) => p.delete === 1).length;
  }





}
