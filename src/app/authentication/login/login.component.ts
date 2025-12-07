import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { RoleService } from '../../views/mastermodule/usermaster/service/role.service';
import { SuperadminService } from '../superadminlogin/superadminloginservices/superadmin.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../authservice/auth.service';
import { Subscription } from 'rxjs';
import { LogoService } from '../../views/settingsmodule/logo/logo.service';
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
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  onLogin: FormGroup;
  router = inject(Router);
  logoUrl!: string;
     logoShapeConfig: ShapeConfig = {
      type: 'rectangular',
      borderRadius: '0px',
      customRadius: {
        topLeft: '0px',
        topRight: '0px',
        bottomLeft: '0px',
        bottomRight: '0px'
      }
    };

    private logoSubscription?: Subscription;
    private shapeSubscription?: Subscription;

  onLogoError(event: any) {
    event.target.src = 'DigiLogocropped-removebg-preview 1.jpg'; // fallback image
  }
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private roleservice: RoleService,
    private superadminservice: SuperadminService,
    private authservice: AuthService,
    private logoService: LogoService,

  ) {
    this.onLogin = fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      loginType: ['branch', Validators.required], // default selection
    });
  }

  // handleLogin(): void {
  //   const loginType = this.onLogin.get('loginType')?.value;
  //   if (loginType === 'branch') {
  //     this.Login();

  //   }else if (loginType === 'superadmin'){

  //     this.superadminlogin()

  //   }
  //   else {
  //     this.userlogin();
  //   }
  // }

  handleLogin(): void {
    const currentUrl = this.router.url;

    if (currentUrl.startsWith('/digitalks')) {
      // SuperAdmin login route
      this.superadminlogin();
    } else if (currentUrl.startsWith('/login')) {
      // Branch/Hospital Admin login route
      this.Login();
    } else {
      // Default user login (if needed)
      this.userlogin();
    }
  }

  Login(): void {
    if (this.onLogin.invalid) {
      this.onLogin.markAllAsTouched();
      return this.showWarningToast('Please enter both username and password.');
    }

    const loginPayload = {
      email: this.onLogin.get('username')?.value,
      password: this.onLogin.get('password')?.value,
    };

    this.roleservice.postLogin(loginPayload).subscribe({
      next: (response: any) => {
        if (response?.token) {
          localStorage.setItem('authToken', response.token);
          this.showSuccessToast(
            'Login Successful',
            'Redirecting to dashboard...'
          );

          this.router.navigateByUrl('/dashboard');
        } else {
          this.showErrorToast(
            'Login Failed',
            'No token received from the server.'
          );
        }
      },
      error: (err) => {
        console.error('Login Error:', err);
        this.showErrorToast(
          'Login Error',
          err?.error?.message || 'Invalid email or password!'
        );
      },
    });
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

  ngOnInit() {
    this.logoUrl;
    this.logoService.getLogoMeta().subscribe();

    // 🔥 Subscribe to live updates
    this.logoService.logoUrl$.subscribe((url) => {
      if (url) {
        this.logoUrl = url;
      }
    });
      // Load logo and shape configuration
        this.logoSubscription = this.logoService.logoUrl$.subscribe(url => {
      if (url) {
        this.logoUrl = url;
      }
    });

    // KEY: Subscribe to shape configuration changes
    this.shapeSubscription = this.logoService.shapeConfig$.subscribe(shapeConfig => {
      this.logoShapeConfig = shapeConfig;
      console.log('Shape config updated in sidebar:', shapeConfig);
    });

    // Load initial configuration
    this.loadLogoWithShape();
    this.loadLogoWithShape();

  }

  //   navigateBasedOnPermission(): void {
  //   const hasInpatientAccess = this.hasModuleAccess('inpatientCase');
  //   if (hasInpatientAccess) {
  //     this.router.navigate(['/dashboard']);
  //   } else {
  //     this.router.navigate(['/dashboard']);
  //   }
  // }

  superadminlogin(): void {
    if (this.onLogin.invalid) {
      this.onLogin.markAllAsTouched();
      return this.showWarningToast('Please enter both username and password.');
    }

    const loginPayload = {
      email: this.onLogin.get('username')?.value,
      password: this.onLogin.get('password')?.value,
    };

    this.superadminservice.postLogin(loginPayload).subscribe({
      next: (response: any) => {
        if (response?.token) {
          console.log("called");
          // Save token directly without checking roles
          localStorage.setItem('authToken', response.token);

          const payload = this.authservice.getUserRole();

          console.log("payload", payload);

          if (payload?.superAdmin) {
            this.router.navigate(['/superadmin/superadmin']);
          } else {
            this.router.navigate(['/hospitaladmin/hospitaladmin']);
          }
          // localStorage.setItem('refreshToken', response.refreshToken || '');
          // localStorage.setItem('authUser', JSON.stringify(response.user));
          // localStorage.setItem('permissions', JSON.stringify(response.user.permission || []));

          this.showSuccessToast(
            'User Login Successful',
            'Redirecting to dashboard...'
          );
          this.router.navigateByUrl('/superadmin/superadmin');
        } else {
          this.showErrorToast(
            'Login Failed',
            'No valid token or user information received.'
          );
        }
      },
      error: (err) => {
        console.error('User Login Error:', err);
        this.showErrorToast(
          'Login Error',
          err?.error?.message || 'Invalid email or password!'
        );
      },
    });
  }

  userlogin(): void {
    if (this.onLogin.invalid) {
      this.onLogin.markAllAsTouched();
      return this.showWarningToast('Please enter both username and password.');
    }

    const loginPayload = {
      email: this.onLogin.get('username')?.value,
      password: this.onLogin.get('password')?.value,
    };

    this.roleservice.postuserlogin(loginPayload).subscribe({
      next: (response: any) => {
        if (response?.token && response?.user) {
          // Save tokens & user
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('refreshToken', response.refreshToken || '');
          localStorage.setItem('authUser', JSON.stringify(response.user));
          localStorage.setItem(
            'permissions',
            JSON.stringify(response.user.permission || [])
          );

          this.showSuccessToast(
            'User Login Successful',
            `Welcome ${response.user.name}!`
          );

          // 🔹 Redirect based on role
          const userRole = response.user.role?.name?.toLowerCase();
          if (userRole === 'pharma' || userRole === 'pharmacist') {
            this.router.navigateByUrl('/pharmalayout/pharmacydashboard');
          } else if (userRole === 'doctor' || userRole === 'pharmacist') {
            this.router.navigateByUrl('/opd/ui');
          }
           else if (userRole === 'radiology' || userRole === 'radiologist') {
            this.router.navigateByUrl('/radiologylayout/radiologydashboard');
          }

          else {
            this.router.navigateByUrl('/dashboard');
          }
        } else {
          this.showErrorToast(
            'Login Failed',
            'No valid token or user information received.'
          );
        }
      },
      error: (err) => {
        console.error('User Login Error:', err);
        this.showErrorToast(
          'Login Error',
          err?.error?.message || 'Invalid email or password!'
        );
      },
    });
  }
  private showWarningToast(message: string) {
    Swal.fire({
      icon: 'warning',
      title: 'Incomplete Login',
      text: message,
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
      },
    });
  }

  private showSuccessToast(title: string, message: string) {
    Swal.fire({
      icon: 'success',
      title,
      text: message,
      position: 'top-end',
      toast: true,
      timer: 2500,
      showConfirmButton: false,
      customClass: {
        popup: 'hospital-toast-popup',
        title: 'hospital-toast-title',
        htmlContainer: 'hospital-toast-text',
      },
    });
  }

  private showErrorToast(title: string, message: string) {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
      },
    });
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
      }
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
        bottomRight: '0px'
      }
    };
  }

  getLogoStyleForSidebar() {
    return {
      'width': '100%',
      'height': 'auto',
      'border-radius': this.logoShapeConfig?.borderRadius || '0px',
      'transition': 'border-radius 0.3s ease',
      'object-fit': 'contain'
    };
  }

  getIconStyle() {
    return {
      'color': 'var(--sidebar-color)',
      'background-color': 'var(--sidebar-color)',
      'border-radius': this.logoShapeConfig?.borderRadius || '0px',
      'transition': 'border-radius 0.3s ease',
      'padding': '8px',
      'font-size': '1.5rem'
    };
  }


}
