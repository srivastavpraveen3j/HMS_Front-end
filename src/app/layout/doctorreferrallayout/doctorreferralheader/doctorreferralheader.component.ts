import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { HmsService } from '../../../service/hms.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../authentication/authservice/auth.service';
import { NotificationComponent } from "../../../component/notification/notification.component";
import { LogoService } from '../../../views/settingsmodule/logo/logo.service';

@Component({
  selector: 'app-doctorreferralheader',
  imports: [CommonModule, RouterModule, NotificationComponent],
  templateUrl: './doctorreferralheader.component.html',
  styleUrl: './doctorreferralheader.component.css',
})
export class DoctorreferralheaderComponent {

 logoUrl!: string;
 isCollapsed = false;

  onLogoError(event: any) {
  event.target.src = 'DigiLogocropped-removebg-preview 1.png'; // fallback image
}
  constructor(
    private hmsService: HmsService,
    private router: Router,
    private authservice: AuthService,
    private logoService : LogoService
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
        (perm: any) => perm.read === 1
        || perm.create === 1 ||
        perm.update === 1 ||
        perm.delete === 1
      )
      .map((perm: any) => perm.moduleName);

        this.logoService.getLogoMeta().subscribe();

  // 🔥 Subscribe to live updates
  this.logoService.logoUrl$.subscribe(url => {
    if (url) {
      this.logoUrl = url;
    }
  });
  }

 hasModuleAccess(module: string, action: 'read' | 'create' | 'update' | 'delete' = 'read'): boolean {
  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  return permissions.some(
    (perm: any) =>
      perm.moduleName === module && perm.permissions?.[action] === 1
  );
}
hasAnyDropdownAccess(): boolean {
  return (
    this.hasModuleAccess('inward', 'create') ||
    this.hasModuleAccess('pharmaceuticalInward',  'create') ||
    this.hasModuleAccess('sharedPatientCases',  'create')
  );
}

dropdowns: {
  opd: boolean;
  master: boolean;
  report: boolean;
  doctor: boolean;
  user: boolean;
  layout: boolean;
  settings: boolean;
  // add all other dropdowns here
} = {
  opd: false,
  master: false,
  report: false,
  doctor: false,
  user: false,
  layout: false,
  settings: false
  // ...
};



 @Output() collapseChange = new EventEmitter<boolean>();


  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;

    // Emit the change to parent component
    this.collapseChange.emit(this.isCollapsed);

    // Close all dropdowns when collapsing
    if (this.isCollapsed) {
      Object.keys(this.dropdowns).forEach(key =>
        this.dropdowns[key as keyof typeof this.dropdowns] = false
      );
    }
  }
// Keep your existing toggleDropdown function
toggleDropdown(menu: keyof typeof this.dropdowns) {
  // Don't allow dropdowns in collapsed mode
  if (this.isCollapsed) return;

  // Close all dropdowns first
  for (const key in this.dropdowns) {
    if (key !== menu) {
      this.dropdowns[key as keyof typeof this.dropdowns] = false;
    }
  }
  // Toggle only the clicked one
  this.dropdowns[menu] = !this.dropdowns[menu];
}


}
