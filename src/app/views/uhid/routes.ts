import { Routes } from "@angular/router";

export const routes: Routes = [

  {
    path: 'uhid',
    loadComponent : () => import('./uhid/uhid.component').then(m => m.UhidComponent)
  }
]
