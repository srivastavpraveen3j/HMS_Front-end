import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rolesetting',
  imports: [CommonModule, FormsModule],
  templateUrl: './rolesetting.component.html',
  styleUrl: './rolesetting.component.css'
})
export class RolesettingComponent {

  roleName = 'Cashier';

  permissionSections = [
    {
      title: 'USER',
      permissions: [
        { label: 'View User', checked: false },
        { label: 'Edit User', checked: false },
        { label: 'Reset User Password', checked: false },
        { label: 'Create User', checked: false },
        { label: 'Delete User', checked: false },
      ],
    },
    {
      title: 'ROLE',
      permissions: [
        { label: 'View Role', checked: false },
        { label: 'Edit Role', checked: false },
        { label: 'Create Role', checked: false },
        { label: 'Delete Role', checked: false },
      ],
    },
    {
      title: 'REPORTS',
      permissions: [{ label: 'View All Cash Reports', checked: false }],
    },
    {
      title: 'PATIENT',
      permissions: [
        { label: 'View Patient', checked: true },
        { label: 'Edit Patient', checked: true },
        { label: 'Create Patient', checked: false },
        { label: 'Delete Patient', checked: true },
      ],
    },
    {
      title: 'LAB REPORT',
      permissions: [
        { label: 'View Lab Report', checked: true },
        { label: 'Edit Lab Report', checked: false },
        { label: 'Create Lab Report', checked: false },
        { label: 'Delete Lab Report', checked: false },
        { label: 'View Unit', checked: false },
        { label: 'Edit Unit', checked: false },
        { label: 'Create Unit', checked: false },
        { label: 'Delete Unit', checked: false },
        { label: 'Edit Result Category', checked: false },
        { label: 'Delete Result Category', checked: false },
        { label: 'Create Result Category', checked: false },
        { label: 'View Test Data', checked: true },
        { label: 'Edit Test Data', checked: false },
        { label: 'Delete Test Data', checked: false },
        { label: 'Create Test Data Category', checked: false },
        { label: 'Delete Test Data Category', checked: false },
        { label: 'Update Patient Lab Report', checked: false },
      ],
    },
    {
      title: 'PHARMACY PRODUCT',
      permissions: [
        { label: 'View Product', checked: true },
        { label: 'Edit Product', checked: true },
        { label: 'Create Product', checked: true },
        { label: 'Delete Product', checked: true },
      ],
    },
    {
      title: 'OTHER SERVICE',
      permissions: [
        { label: 'View Service', checked: true },
        { label: 'Edit Service', checked: true },
        { label: 'Create Service', checked: true },
        { label: 'Delete Service', checked: true },
      ],
    },
    {
      title: 'BILL',
      permissions: [
        { label: 'View Bill', checked: false },
        { label: 'Create Bill', checked: false },
        { label: 'Edit Bill', checked: false },
        { label: 'Delete Bill', checked: false },
        { label: 'Discount Permission', checked: false },
        { label: 'Return Permission', checked: false },
        { label: 'Reverse Bill', checked: false },
      ],
    },
    {
      title: 'INVOICE',
      permissions: [
        { label: 'Create Invoice', checked: true },
        { label: 'Reverse Invoice', checked: false },
      ],
    },
    {
      title: 'DOCTOR',
      permissions: [
        { label: 'View Doctor', checked: true },
        { label: 'Edit Doctor', checked: true },
        { label: 'Create Doctor', checked: false },
        { label: 'Delete Doctor', checked: false },
      ],
    },
    {
      title: 'CHANEL SESSION',
      permissions: [
        { label: 'View Session', checked: true },
        { label: 'Edit Session', checked: true },
        { label: 'Create Session', checked: false },
        { label: 'Delete Session', checked: false },
      ],
    },
  ];
  toggleSelectAll(section: any) {
    const allChecked = section.permissions.every((p: { label: string; checked: boolean }) => p.checked);
    section.permissions.forEach((p: { label: string; checked: boolean }) => {
      p.checked = !allChecked;
    });
  }


  updateRole() {
    console.log('Updated role:', this.roleName);
    console.log('Permissions:', this.permissionSections);
  }

}
