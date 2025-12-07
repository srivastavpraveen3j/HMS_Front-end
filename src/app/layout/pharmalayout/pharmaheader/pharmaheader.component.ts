import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HmsService } from '../../../service/hms.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../authentication/authservice/auth.service';
import { NotificationComponent } from '../../../component/notification/notification.component';
import { LogoService } from '../../../views/settingsmodule/logo/logo.service';
import { Subscription } from 'rxjs';
export interface ShapeConfig {
  type: 'rectangular' | 'rounded' | 'circular' | 'custom';
  borderRadius: string;
  customRadius: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
}

@Component({
  selector: 'app-pharmaheader',
  imports: [
    RouterModule,
    CommonModule,
    NotificationComponent,
    NotificationComponent,
  ],
  templateUrl: './pharmaheader.component.html',
  styleUrl: './pharmaheader.component.css',
})
export class PharmaheaderComponent {
  logoUrl!: string;
  isCollapsed = false;
  logoShapeConfig: ShapeConfig = {
    type: 'rectangular',
    borderRadius: '0px',
    customRadius: {
      topLeft: '0px',
      topRight: '0px',
      bottomLeft: '0px',
      bottomRight: '0px',
    },
  };

  private logoSubscription?: Subscription;
  private shapeSubscription?: Subscription;

 onLogoError(event: any) {
    event.target.src = 'DigiLogocropped-removebg-preview 1.jpg'; // fallback image
  }

  constructor(
    private hmsService: HmsService,
    private router: Router,
    private authservice: AuthService,
    private logoService: LogoService
  ) {}

  setHMS(role: string) {
    this.hmsService.setHMS(role);
  }

  get currentHMS() {
    return this.hmsService.getHMS();
  }

  userRole: string | null = null;

  logout(): void {
    localStorage.removeItem('authToken'); // Delete token from localStorage
    localStorage.removeItem('authUser'); // Delete token from localStorage
    localStorage.removeItem('permissions'); // Delete token from localStorage
    localStorage.removeItem('refreshToken'); // Delete token from localStorage
    this.router.navigateByUrl('/login'); // Redirect to login page
  }

  allowedModules: string[] = [];
  pharmapermission: any = {};
  ngOnInit() {
    this.userRole = localStorage.getItem('userRole');

    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    this.allowedModules = permissions
      .filter(
        (perm: any) =>
          perm.read === 1 ||
          perm.create === 1 ||
          perm.update === 1 ||
          perm.delete === 1
      )
      .map((perm: any) => perm.moduleName);

    this.logoService.getLogoMeta().subscribe();
    this.logoService.logoUrl$.subscribe((url) => {
      if (url) {
        this.logoUrl = url;
      }
    });
    // Load logo and shape configuration
    this.logoService.logoUrl$.subscribe((url) => {
      if (url) {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          this.logoUrl = url; // only set when fully loaded
        };
      }
    });
    // KEY: Subscribe to shape configuration changes
    this.shapeSubscription = this.logoService.shapeConfig$.subscribe(
      (shapeConfig) => {
        this.logoShapeConfig = shapeConfig;
        console.log('Shape config updated in sidebar:', shapeConfig);
      }
    );

    // Load initial configuration
    this.loadLogoWithShape();
    this.loadLogoWithShape();

    const uhidModule = permissions.find(
      (perm: any) => perm.moduleName === 'pharmaceuticalRequestList'
    );

    this.pharmapermission = uhidModule?.permissions?.create === 1;

    // 🔥 Subscribe to live updates
    this.logoService.logoUrl$.subscribe((url) => {
      if (url) {
        this.logoUrl = url;
      }
    });
  }

  // hasModuleAccess(moduleName: string): boolean {
  //   return this.allowedModules.includes(moduleName);
  // }

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
  hasAnyDropdownAccess(): boolean {
  return (
    this.hasModuleAccess('inward', 'create') ||
    this.hasModuleAccess('sharedPatientCases', 'create') ||
    this.hasModuleAccess('inventoryItem', 'read') ||
    this.hasModuleAccess('hims', 'read')
  );
}


  dropdowns: {
    opd: boolean;
    master: boolean;
    ipd: boolean;
    doctor: boolean;
    user: boolean;
    layout: boolean;
    settings: boolean;
    // add all other dropdowns here
  } = {
    opd: false,
    master: false,
    ipd: false,
    doctor: false,
    user: false,
    layout: false,
    settings: false,
    // ...
  };

  toggleDropdown(menu: keyof typeof this.dropdowns) {
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

  sidebarCollapsed = false;

  isSidebarOpen = false;
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isSidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
      // Optionally, also close dropdowns
      Object.keys(this.dropdowns).forEach(
        (key) => (this.dropdowns[key as keyof typeof this.dropdowns] = false)
      );
    }
  }
  screenIsSmall = false;
  @HostListener('window:resize')
  onResize() {
    this.screenIsSmall = window.innerWidth <= 600;
  }

  // logo shape

  private loadLogoWithShape() {
    this.logoService.getLogoMeta().subscribe({
      next: (response: any) => {
        // The service already handles updating the streams via tap operator
        console.log('Logo meta loaded');
      },
      error: (error) => {
        console.error('Failed to load logo configuration:', error);
        this.setDefaultShapeConfig();
      },
    });
  }

  private setDefaultShapeConfig() {
    this.logoShapeConfig = {
      type: 'rectangular',
      borderRadius: '0px',
      customRadius: {
        topLeft: '0px',
        topRight: '0px',
        bottomLeft: '0px',
        bottomRight: '0px',
      },
    };
  }

  getLogoStyleForSidebar() {
    return {
      width: '100%',
      height: 'auto',
      'border-radius': this.logoShapeConfig?.borderRadius || '0px',
      transition: 'border-radius 0.3s ease',
      'object-fit': 'contain',
    };
  }

  getIconStyle() {
    return {
      color: 'var(--sidebar-color)',
      'background-color': 'var(--sidebar-color)',
      'border-radius': this.logoShapeConfig?.borderRadius || '0px',
      transition: 'border-radius 0.3s ease',
      padding: '8px',
      'font-size': '1.5rem',
    };
  }
}
