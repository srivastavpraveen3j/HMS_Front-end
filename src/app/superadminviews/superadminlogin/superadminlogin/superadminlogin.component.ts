import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { SuperadminService } from '../../../authentication/superadminlogin/superadminloginservices/superadmin.service';
import { AuthService } from '../../../authentication/authservice/auth.service';

@Component({
  selector: 'app-superadminlogin',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './superadminlogin.component.html',
  styleUrl: './superadminlogin.component.css',
})
export class SuperadminloginComponent {
  onLogin: FormGroup;
  router = inject(Router);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private superadminservice: SuperadminService,
    private authservice: AuthService
  ) {
    this.onLogin = fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      loginType: ['branch', Validators.required], // default selection
    });
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

    this.superadminservice.postLogin(loginPayload).subscribe({
      next: (response: any) => {
        if (response?.token) {
          console.log('called');
          localStorage.setItem('authToken', response.token);

          const payload = this.authservice.getUserRole();

          console.log('superadmin payload', payload);

          if (payload.roles?.isSuperAdmin) {
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
          // this.router.navigateByUrl('/superadmin/superadmin');
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
}
