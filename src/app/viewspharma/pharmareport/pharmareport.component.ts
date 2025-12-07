import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pharmareport',
  imports: [CommonModule, RouterModule],
  templateUrl: './pharmareport.component.html',
  styleUrl: './pharmareport.component.css'
})
export class PharmareportComponent {

pharmapermission : any = {}
ipdpharmapermission : any = {}
centeralstorepermission  : any = {}

ngOnInit(){

      const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
      const pharmareqModule = allPermissions.find((perm: any) => perm.moduleName === 'pharmaceuticalRequestList');
      const centralstorereqModule = allPermissions.find((perm: any) => perm.moduleName === 'centeralstorereq');
      const ipdpharmareqModule = allPermissions.find((perm: any) => perm.moduleName === 'ipdpharmaceuticalRequestList');
      this.pharmapermission = pharmareqModule?.permissions?.read
      this.centeralstorepermission = centralstorereqModule?.permissions?.read
      this.ipdpharmapermission = ipdpharmareqModule?.permissions?.read

}

}
