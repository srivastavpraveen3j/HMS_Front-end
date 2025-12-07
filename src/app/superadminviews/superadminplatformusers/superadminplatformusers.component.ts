import { Component } from '@angular/core';
import { SuperadminService } from '../superadminservice/superadmin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-superadminplatformusers',
  imports: [CommonModule, FormsModule],
  templateUrl: './superadminplatformusers.component.html',
  styleUrl: './superadminplatformusers.component.css',
})
export class SuperadminplatformusersComponent {
  platformUsers: any[] = [];

  constructor(private superadminservice: SuperadminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.superadminservice.getPlatformUsers().subscribe({
      next: (res: any) => {
        const users = res?.users || [];
        this.platformUsers = users;
        console.log('Users', this.platformUsers);
      },
      error: (error) => {
        console.error('Error fetching platform users:', error);
      },
    });
  }
}
