import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../authservice/auth.service';
import { inject } from '@angular/core';
import Swal from 'sweetalert2';

export const hospitaladminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // allow access to dashboard
  }

  // ❌ Not logged in → redirect to login
  router.navigate(['/digitalks']);
  return false;

  // Swal.fire({
  //     icon: 'error',
  //     title: 'Access Denied',
  //     text: 'You are not authorized to access this module.',
  //     customClass: {
  //       popup: 'hospital-swal-popup',
  //       title: 'hospital-swal-title',
  //       htmlContainer: 'hospital-swal-text',
  //       confirmButton: 'hospital-swal-button'
  //     }
  //   }).then(() => {
  //     router.navigate(['/hospitaladmin/hospitaladmin']);
  //   });
  // return true;
};
