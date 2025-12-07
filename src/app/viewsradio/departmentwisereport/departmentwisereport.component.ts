import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-departmentwisereport',
  imports: [CommonModule, RouterModule],
  templateUrl: './departmentwisereport.component.html',
  styleUrl: './departmentwisereport.component.css'
})
export class DepartmentwisereportComponent {

  opdradiopermission : any = {}
ipdopdradiopermission : any = {}
centeralstorepermission  : any = {}

ngOnInit(){

      const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
      const opdradioreqModule = allPermissions.find((perm: any) => perm.moduleName === 'inward');
      const centralstorereqModule = allPermissions.find((perm: any) => perm.moduleName === 'centeralstorereq');
      const ipdradioreqModule = allPermissions.find((perm: any) => perm.moduleName === 'ipdinward');
      this.opdradiopermission = opdradioreqModule?.permissions?.read
      this.centeralstorepermission = centralstorereqModule?.permissions?.read
      this.ipdopdradiopermission = ipdradioreqModule?.permissions?.read

}

}
