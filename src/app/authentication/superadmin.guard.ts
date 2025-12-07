import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from './authservice/auth.service';
import { inject } from '@angular/core';

export const superadminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1️⃣ Not logged in → redirect to login
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/digitalks']);
  }

  // 2️⃣ Logged in but not superadmin → block
  if (!authService.isSuperAdmin()) {
    return router.createUrlTree(['/hospitaladmin/hospitaladmin']);
  }

  // 3️⃣ Logged in AND superadmin → allow access
  return true;
  // 2. Check if user is SuperAdmin
  // if (authService.isSuperAdmin()) {
  //   return true;
  // }

  // 3. Unauthorized → show alert and redirect
  // Swal.fire({
  //   icon: 'error',
  //   title: 'Access Denied',
  //   text: 'Only Super Admins can access this module.',
  //   customClass: {
  //     popup: 'hospital-swal-popup',
  //     title: 'hospital-swal-title',
  //     htmlContainer: 'hospital-swal-text',
  //     confirmButton: 'hospital-swal-button',
  //   },
  // }),

  // router.navigate(['/digitalks']); // redirect back to login or safe route
  // return false;
};
