import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RoleService } from '../../../../views/mastermodule/usermaster/service/role.service';

@Component({
  selector: 'app-permissionlist',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './permissionlist.component.html',
  styleUrl: './permissionlist.component.css'
})
export class PermissionlistComponent {

  recordsPerPage: number = 25;
  searchText: string = '';

  permissions : any [] = [];

  filterForm!: FormGroup;

    currentPage = 1;
    totalPages = 1;

    constructor(
      private roleservice: RoleService,
      private router: Router,
      private fb: FormBuilder,
    ) {}


   userPermissions: any = {};

ngOnInit(): void {

 // load permissions

         const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'permissions');
  this.userPermissions = uhidModule?.permissions || {};

// load permissions
  // ✅ Initialize form BEFORE using it
  this.filterForm = this.fb.group({
    recordsPerPage: [25],
    searchText: ['']
  });

  // ✅ Now it's safe to subscribe
  this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
    this.currentPage = 1;
    this.loadusercase();
  });

  this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
    this.currentPage = 1;
    this.loadusercase();
  });

  // ✅ Initial load
  this.loadusercase();
}

    loadusercase() {
  const limit = this.filterForm.get('recordsPerPage')?.value || 25;
  const search = this.filterForm.get('searchText')?.value || '';

  this.roleservice.getPermission(this.currentPage, limit, search).subscribe((res: any) => {
    this.permissions = res || [];
        this.currentPage = 1;
    console.log("🚀 ~ UsermasterlistComponent ~ roles loaded:", this.permissions); // ✅ Moved inside subscribe
  });
}

nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.loadusercase();
      }
    }

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadusercase();
      }
    }


}
