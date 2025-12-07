import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HmsService } from '../../../service/hms.service';
import { AuthService } from '../../../authentication/authservice/auth.service';

@Component({
  selector: 'app-doctorsharingheader',
  imports: [CommonModule, RouterModule],

  templateUrl: './doctorsharingheader.component.html',
  styleUrl: './doctorsharingheader.component.css',
})
export class DoctorsharingheaderComponent {
  constructor(
    private hmsService: HmsService,
    private router: Router,
    private authservice: AuthService
  ) {}
  setHMS(role: string) {
    this.hmsService.setHMS(role);
  }

  get currentHMS() {
    return this.hmsService.getHMS();
  }

  userRole: string | null = null;

  // ngOnInit() {
  //   this.userRole = localStorage.getItem('userRole');
  // }

  logout(): void {
    localStorage.removeItem('authToken'); // Delete token from localStorage
    localStorage.removeItem('authUser'); // Delete token from localStorage
    localStorage.removeItem('permissions'); // Delete token from localStorage
    localStorage.removeItem('refreshToken'); // Delete token from localStorage
    this.router.navigateByUrl('/login'); // Redirect to login page
  }

  allowedModules: string[] = [];
  ngOnInit() {
    this.userRole = localStorage.getItem('userRole');

    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    this.allowedModules = permissions
      .filter(
        (perm: any) =>
          perm.read === 1 
          // || perm.create === 1 ||
          // perm.update === 1 ||
          // perm.delete === 1
      )
      .map((perm: any) => perm.moduleName);
  }

  hasModuleAccess(module: string): boolean {
    return this.authservice.hasModulePermission(module);
  }
}
