import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SuperadminService } from '../superadminservice/superadmin.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-superadminpermissionlist',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './superadminpermissionlist.component.html',
  styleUrl: './superadminpermissionlist.component.css',
})
export class SuperadminpermissionlistComponent {
  permissions: any[] = [];

  constructor(private superadminService: SuperadminService) {}

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
}
