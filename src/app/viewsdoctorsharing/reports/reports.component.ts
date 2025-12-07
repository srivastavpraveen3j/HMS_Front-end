import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, RouterModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
})
export class ReportsComponent {
  activeTab: 'OPD' | 'IPD' = 'OPD';

  constructor() {}

  setActiveTab(tab: 'OPD' | 'IPD') {
    this.activeTab = tab;
  }

  opdReports = [
    { title: 'UHID', icon: 'fa fa-users', route: '/reports/opd/uhid' },
    { title: 'OPD CASE', icon: 'fa fa-random', route: '/reports/opd/case' },
    {
      title: 'OPD BILL',
      icon: 'fa fa-file-invoice',
      route: '/reports/opd/bill',
    },
    // {
    //   title: 'OPD COLLECTION',
    //   icon: 'fa fa-money-bill',
    //   route: '/reports/opd/collection',
    // },
    {
      title: 'SERVICE WISE COLLECTION',
      icon: 'fa fa-credit-card',
      route: '/reports/opd/service-wise',
    },
    {
      title: 'PATIENT LEDGER SUMMARY',
      icon: 'fa fa-clipboard-list',
      route: '/reports/opd/ledger',
    },
  ];

  ipdReports = [
    { title: 'IPD CASE', icon: 'fa fa-bed', route: '/reports/ipd/case' },
    {
      title: 'IPD BILL',
      icon: 'fa fa-file-invoice-dollar',
      route: '/reports/ipd/bill',
    },
    {
      title: 'DISCHARGE SUMMARY',
      icon: 'fa fa-file-medical',
      route: '/reports/ipd/discharge-summary',
    },
    {
      title: 'IPD CHARGES',
      icon: 'fa fa-notes-medical',
      route: '/reports/ipd/charges',
    },
    {
      title: 'LEDGER SUMMARY',
      icon: 'fa fa-file-alt',
      route: '/reports/ipd/ledger',
    },
  ];
}
