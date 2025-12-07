import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-opdreport',
  imports: [CommonModule, RouterModule],
  templateUrl: './opdreport.component.html',
  styleUrl: './opdreport.component.css',
})
export class OpdreportComponent {
  selectedTitle: string = '';

  setTitle(title: string): void {
    this.selectedTitle = title;
  }

  // reports = [
  //   { title: 'UHID', icon: 'fa-solid fa-users' },
  //   { title: 'OPD CASE', icon: 'fa-solid fa-shuffle' },
  //   { title: 'OPD BILL', icon: 'fa-solid fa-file-invoice' },
  //   { title: 'OPD COLLECTION', icon: 'fa-solid fa-money-bill' },
  //   { title: 'SERVICE WISE COLLECTION', icon: 'fa-solid fa-wallet' },
  //   { title: 'PATIENT LEDGER SUMMARY', icon: 'fa-solid fa-chart-bar' },
  // { title: 'DOCTOR / SERVICE WISE INCOME', icon: 'fa-solid fa-user-md' },
  // { title: 'PATIENT LEDGER', icon: 'fa-solid fa-user' },
  // { title: 'RECEIPT/PAYMENT REGISTER', icon: 'fa-solid fa-money-check' },
  // { title: 'HEALTH CHECKUP BILL', icon: 'fa-solid fa-file-medical' },
  // { title: 'TRANSACTION OWNER', icon: 'fa-solid fa-handshake' },
  // { title: 'DATEWISE COLLECTION', icon: 'fa-solid fa-chart-line' },
  // ];
  userPermissions: any = {};
  useripdreportPermissions: any = {};
  module: string = '';

 ngOnInit() {
  const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');

  const opdreports = allPermissions.find(
    (perm: any) => perm.moduleName === 'outpatientCase'
  );

  const ipdreports = allPermissions.find(
    (perm: any) => perm.moduleName === 'inpatientCase'
  );

  this.userPermissions = opdreports?.permissions || {};
  this.useripdreportPermissions = ipdreports?.permissions || {};
}
}
