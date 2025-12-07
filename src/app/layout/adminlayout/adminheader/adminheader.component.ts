import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HmsService } from '../../../service/hms.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../authentication/authservice/auth.service';
import { LogoService } from '../../../views/settingsmodule/logo/logo.service';
import { OpdService } from '../../../views/opdmodule/opdservice/opd.service';
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
  selector: 'app-adminheader',
  imports: [RouterModule, CommonModule],
  templateUrl: './adminheader.component.html',
  styleUrl: './adminheader.component.css',
})
export class AdminheaderComponent {
  logoUrl!: string;
  doctorId: string = '';
  role: string = '';

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
    private logoService: LogoService,
    private opdservice: OpdService
  ) {}
  setHMS(role: string) {
    this.hmsService.setHMS(role);
  }

  get currentHMS() {
    return this.hmsService.getHMS();
  }

  userRole: string | null = null;

  logout(): void {
    if (this.role.toLowerCase() === 'doctor') {
      // Step 1: Load doctor’s remaining queue before logging out
      this.opdservice.getQueues(this.doctorId).subscribe((res: any) => {
        const remainingQueue = (res.queue || []).filter(
          (p: any) =>
            p.status?.toLowerCase() === 'waiting' ||
            p.status?.toLowerCase() === 'skipped'
        );

        if (remainingQueue.length > 0) {
          // Step 2: Move each patient back to appointment record
          remainingQueue.forEach((patient: any) => {
            const payload = {
              isCheckin: false,
            };

            this.opdservice
              .updateopdappointmentapis(patient.patientId?._id, payload) // <-- make sure you have this API
              .subscribe({
                next: () => console.log(`Moved patient ${patient.id} back`),
                error: (err: any) => console.error('Error moving patient', err),
              });
          });
        }

        // Step 3: End doctor session
        this.sessionStop(this.doctorId);

        // Step 4: Clear local storage + redirect
        this.clearAndRedirect();
      });
    } else {
      this.clearAndRedirect();
    }
  }
  clearAndRedirect() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('permissions');
    localStorage.removeItem('refreshToken');
    this.router.navigateByUrl('/login');
  }

  sessionStop(id: string) {
    this.opdservice.endSession(id).subscribe({
      next: (res) => console.log('Session ended successfully', res),
      error: (err) => console.error('Error ending session', err),
    });
  }

  allowedModules: string[] = [];
  ngOnInit() {
    this.onResize();
    this.userRole = localStorage.getItem('userRole');
    const userStr = localStorage.getItem('authUser');
    if (!userStr) {
      console.error('No user found in localStorage');
      return;
    }
    const user = JSON.parse(userStr);
    const id = user._id;
    this.doctorId = id;
    this.role = user.role?.name;

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

    // 🔥 Subscribe to live updates
    this.logoService.logoUrl$.subscribe((url) => {
      if (url) {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          this.logoUrl = url; // only set when fully loaded
        };
      }
    });

    // Load logo and shape configuration
    this.logoSubscription = this.logoService.logoUrl$.subscribe((url) => {
      if (url) {
        this.logoUrl = url;
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
  }

  ngOnDestroy() {
    if (this.logoSubscription) {
      this.logoSubscription.unsubscribe();
    }
    if (this.shapeSubscription) {
      this.shapeSubscription.unsubscribe();
    }
  }

  // navigateBasedOnPermission(): void {
  //   const hasInpatientAccess = this.hasModuleAccess('inpatientCase');
  //   if (hasInpatientAccess) {
  //     this.router.navigate(['/dashboard']);
  //   } else {
  //     this.router.navigate(['/dashboard']);
  //   }
  // }

  // hasModuleAccess(moduleName: string): boolean {
  //   return this.allowedModules.includes(moduleName);
  // }

  // hasModuleAccess(module: string): boolean {
  //   return this.authservice.hasModulePermission(module);
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
      this.hasModuleAccess('pharmaceuticalInward', 'create') ||
      this.hasModuleAccess('sharedPatientCases', 'create')
    );
  }
  hasAnyReportAccess(): boolean {
    return (
      this.hasModuleAccess('inpatientCase', 'create') ||
      this.hasModuleAccess('outpatientCase', 'create')
    );
  }
  hasAnyMasterDropdownAccess(): boolean {
    return (
      this.hasModuleAccess('doctor', 'create') ||
      this.hasModuleAccess('service', 'create') ||
      this.hasModuleAccess('serviceGroup', 'create') ||
      this.hasModuleAccess('surgeryService', 'create') ||
      this.hasModuleAccess('packages', 'create') ||
      this.hasModuleAccess('bedType', 'create') ||
      this.hasModuleAccess('bed', 'create') ||
      this.hasModuleAccess('roomType', 'create') ||
      this.hasModuleAccess('room', 'create') ||
      this.hasModuleAccess('wardMaster', 'create') ||
      this.hasModuleAccess('medicine', 'create') ||
      this.hasModuleAccess('testParameter', 'create') ||
      this.hasModuleAccess('testGroup', 'create') ||
      this.hasModuleAccess('symptoms', 'create') ||
      this.hasModuleAccess('symptomGroup', 'create') ||
      this.hasModuleAccess('slotMaster', 'create')
    );
  }
  hasAnyDoctorAccess(): boolean {
    return (
      this.hasModuleAccess('vitals', 'create') ||
      this.hasModuleAccess('diagnosisSheet', 'create') ||
      this.hasModuleAccess('operationTheatreNotes', 'create') ||
      this.hasModuleAccess('dischargeSummary', 'create') ||
      this.hasModuleAccess('pharmaceuticalRequestList', 'create') ||
      this.hasModuleAccess('departmentRequestList', 'create') ||
      this.hasModuleAccess('treatmentHistorySheet', 'create')
    );
  }

  // hasAnyMasterDropdownAccess(): boolean {
  //   const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');

  //   const check = (module: string) =>
  //     permissions.some((perm: any) =>
  //       perm.moduleName === module &&
  //       (perm.permissions?.create === 1 ||
  //        perm.permissions?.read === 1 ||
  //        perm.permissions?.update === 1 ||
  //        perm.permissions?.delete === 1)
  //     );

  //   return (
  //     check('doctor') ||
  //     check('service') ||
  //     check('serviceGroup') ||
  //     check('surgeryService') ||
  //     check('packages') ||
  //     check('bedType') ||
  //     check('bed') ||
  //     check('roomType') ||
  //     check('room') ||
  //     check('wardMaster') ||
  //     check('medicine') ||
  //     check('testParameter') ||
  //     check('testGroup') ||
  //     check('symptoms') ||
  //     check('symptomGroup')
  //   );
  // }

  dropdowns: {
    opd: boolean;
    master: boolean;
    ipd: boolean;
    doctor: boolean;
    user: boolean;
    layout: boolean;
    settings: boolean;
    report: boolean;
    // add all other dropdowns here
  } = {
    opd: false,
    master: false,
    ipd: false,
    doctor: false,
    user: false,
    layout: false,
    settings: false,
    report: false,
    // ...
  };

  // toggleDropdown(menu: keyof typeof this.dropdowns) {
  //   this.dropdowns[menu] = !this.dropdowns[menu];
  // }

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

  // In your sidebar component

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

      'font-size': '1.5rem',
       'border-radius': '50% ',

    };
  }
}
