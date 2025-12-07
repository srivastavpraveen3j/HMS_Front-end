import { Routes } from '@angular/router';
import { authGuard } from '../authentication/authguard/auth.guard';

export const opdCaseRoutes: Routes = [
  { 
    path: '/opdbill',
    children: [
      {
        path: 'new:billId',
        loadComponent: () => import('../views/opdmodule/opdbills/opdbill/opdbill.component').then(m => m.OpdbillComponent),
        canActivate: [authGuard],
        data: { module: 'outpatientBill' },
      },
      {
        path: ':billId',
        loadComponent: () => import('../views/opdmodule/opdbills/opdbill/opdbill.component').then(m => m.OpdbillComponent),
        canActivate: [authGuard],
        data: { module: 'outpatientBill' },
      },
      {
        path: 'list',
        loadComponent: () => import('../views/opdmodule/opdbills/opdbilllist/opdbilllist.component').then(m => m.OpdbilllistComponent),
        canActivate: [authGuard],
        data: { module: 'outpatientBill' },
      },
    ],
  },
];
