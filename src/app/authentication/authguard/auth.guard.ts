import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../authservice/auth.service';
import Swal from 'sweetalert2';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredModule = route.data['module'];

  // ✅ BYPASS: Allow vendor quotation routes without authentication
  if (state.url.includes('/vendor-quotation/')) {
    return true;
  }

  // Alternative approach using route params
  // if (route.params['rfqId'] && route.params['vendorId']) {
  //   return true;
  // }

  // 1. Not logged in
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Has module permission
  if (requiredModule && authService.hasModulePermission(requiredModule)) {
    return true;
  }

  // 3. No permission – show Swal modal and redirect
  Swal.fire({
    icon: 'error',
    title: 'Access Denied',
    text: 'You are not authorized to access this module.',
    customClass: {
      popup: 'hospital-swal-popup',
      title: 'hospital-swal-title',
      htmlContainer: 'hospital-swal-text',
      confirmButton: 'hospital-swal-button'
    }
  }).then(() => {
    router.navigate(['/dashboard']); // or anywhere else like unauthorized page
  });

  return false;
};
