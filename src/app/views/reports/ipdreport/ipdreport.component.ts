import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ipdreport',
  imports: [CommonModule, RouterModule],
  templateUrl: './ipdreport.component.html',
  styleUrl: './ipdreport.component.css'
})
export class IpdreportComponent {

  // reports = [
  //   { title: 'IPD SUMMARY ', icon: 'fa-solid fa-users' },
  //   { title: 'ADMISSION/DISCHARGE', icon: 'fa-solid fa-people-arrows' },
  //   { title: 'BED MASTER', icon: 'fa-solid fa-bed-pulse' },
  //   { title: 'ROOM WISE OCCUPANCY', icon: 'fa-solid fa-person-booth' },
  //   { title: 'PATIENT WISE OCCUPANCY', icon: 'fa-solid fa-person' },
  //   { title: 'PATIENT BALANCE REPORT', icon: 'fa-solid fa-file-invoice' },
  //   { title: 'FINAL BILL', icon: 'fa-solid fa-file-invoice' },
  //   { title: 'SERVICE WISE INCOME', icon: 'fa-solid fa-file-invoice' },
  //   { title: 'RECEPTIONIST/PAYMENT REGISTER', icon: 'fa-solid fa-file-invoice' },
    // { title: 'DOCTOR / SERVICE WISE INCOME', icon: 'fa-solid fa-user-md' },
    // { title: 'PATIENT LEDGER', icon: 'fa-solid fa-user' },
    // { title: 'RECEIPT/PAYMENT REGISTER', icon: 'fa-solid fa-money-check' },
    // { title: 'HEALTH CHECKUP BILL', icon: 'fa-solid fa-file-medical' },
    // { title: 'TRANSACTION OWNER', icon: 'fa-solid fa-handshake' },
    // { title: 'DATEWISE COLLECTION', icon: 'fa-solid fa-chart-line' },
  // ];

}
