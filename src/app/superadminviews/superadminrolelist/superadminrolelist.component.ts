import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SuperadminService } from '../superadminservice/superadmin.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-superadminrolelist',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './superadminrolelist.component.html',
  styleUrl: './superadminrolelist.component.css',
})
export class SuperadminrolelistComponent {
  roles: any[] = [];

  constructor(private superadminservice: SuperadminService) {}

  ngOnInit(): void {
    this.fetchRoles();
  }

  fetchRoles() {
    this.superadminservice.getPlatformRoles().subscribe((roles: any) => {
      console.log('roles', roles);
      this.roles = roles;
    });
  }
}
