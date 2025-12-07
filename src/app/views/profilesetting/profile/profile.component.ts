import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HmsService } from '../../../service/hms.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../authentication/authservice/auth.service';
@Component({
  selector: 'app-profile',
  imports: [RouterModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {


  constructor(private hmsService: HmsService, private router :Router, private authservice : AuthService){}
  userRole: any = {};
allowedModules: any[] = [];

ngOnInit(): void {
  const userRoleStr = localStorage.getItem('authUser');
  if (userRoleStr) {
    this.userRole = JSON.parse(userRoleStr);

    this.allowedModules = this.userRole.permission.filter((perm: any) =>
      perm.permissions.read || perm.permissions.create || perm.permissions.update || perm.permissions.delete
    );
  }
}


}
