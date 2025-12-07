import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-accesscontrollist',
  imports: [CommonModule, RouterModule],
  templateUrl: './accesscontrollist.component.html',
  styleUrl: './accesscontrollist.component.css'
})
export class AccesscontrollistComponent {


  roles = [
    {
      _id: '68039bd179654d490dd36498',
      name: 'support',
      description: 'Support staff with access to tickets and customer queries',
      permissions: [
        {
          _id: '68039b7279654d490dd36495',
          name: 'view_user',
          description: 'Allows viewing user details',
          action: 'view',
          resource: 'user',
          is_active: true,
          created_at: '2025-04-19T12:47:46.336Z',
          updated_at: '2025-04-19T12:47:46.340Z',
        }
      ],
      created_at: '2025-04-19T12:49:21.118Z',
      updated_at: '2025-04-19T12:49:21.118Z',
    }
  ];

  expandedRoleId: string | null = null;

  toggleExpand(roleId: string) {
    console.log('Toggling:', roleId);
    this.expandedRoleId = this.expandedRoleId === roleId ? null : roleId;
  }


}
