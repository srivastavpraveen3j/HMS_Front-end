import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LogoService } from '../../../views/settingsmodule/logo/logo.service';

@Component({
  selector: 'app-superadminheader',
  imports: [CommonModule, RouterModule],
  templateUrl: './superadminheader.component.html',
  styleUrl: './superadminheader.component.css',
})
export class SuperadminheaderComponent {
  isCollapsed = false;
  logoUrl!: string;

  constructor(private router: Router, private logoService: LogoService) {}

  ngOnInit(): void{
    this.logoService.getLogoMeta().subscribe();

    // 🔥 Subscribe to live updates
    this.logoService.logoUrl$.subscribe((url) => {
      if (url) {
        this.logoUrl = url;
      }
    });
  }

  dropdowns: {
    system: boolean;
    security: boolean;
    modules: boolean;
    profile: boolean;
    // add all other dropdowns here
  } = {
    system: false,
    security: false,
    modules: false,
    profile: false,
    // ...
  };

 onLogoError(event: any) {
    event.target.src = 'DigiLogocropped-removebg-preview 1.jpg'; // fallback image
  }

  navigateBasedOnPermission(): void {
    const hasInpatientAccess = this.hasModuleAccess('inpatientCase');
    if (hasInpatientAccess) {
      this.router.navigate(['/opddashboard']);
    } else {
      this.router.navigate(['/opddashboard']);
    }
  }

  hasModuleAccess(
    module: string,
    action: 'read' | 'create' | 'update' | 'delete' = 'read'
  ): boolean {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    return permissions.some(
      (perm: any) =>
        perm.moduleName === module && perm.permissions?.[action] === 1
    );
  }

  // Keep your existing toggleDropdown function
  toggleDropdown(menu: keyof typeof this.dropdowns) {
    // Close all others first
    for (const key in this.dropdowns) {
      if (key !== menu) {
        this.dropdowns[key as keyof typeof this.dropdowns] = false;
      }
    }
    // Toggle the clicked one (open/close)
    this.dropdowns[menu] = !this.dropdowns[menu];
  }

  @Output() collapseChange = new EventEmitter<boolean>();

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;

    // Emit the change to parent component
    this.collapseChange.emit(this.isCollapsed);

    // Close all dropdowns when collapsing
    if (this.isCollapsed) {
      Object.keys(this.dropdowns).forEach(
        (key) => (this.dropdowns[key as keyof typeof this.dropdowns] = false)
      );
    }
  }

  logOut(){
    localStorage.removeItem('authToken');
    this.router.navigateByUrl('/digitalks');

  }
}
