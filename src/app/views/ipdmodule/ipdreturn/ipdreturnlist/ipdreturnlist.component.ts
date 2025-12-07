import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ipdreturnlist',
  imports: [RouterModule, CommonModule],
  templateUrl: './ipdreturnlist.component.html',
  styleUrl: './ipdreturnlist.component.css'
})
export class IpdreturnlistComponent {

  recordsPerPage: number = 25;
  searchText: string = '';

  patients = [
    { token: '0000001', caseno: '456',date: "22/03/2025 ", type:'N' , name: 'CHETAN . PATEL', paymenttype: 'cash', company: '', mobile: '6532589645' },
    { token: '0000002', caseno: '457',date: "22/03/2025 ",type:'N' ,  name: 'DARSHAN . PATEL', paymenttype: 'cash', company: 'Aditya Birla', mobile: '9007007007' },
    { token: '0000003',caseno: '458',date: "22/03/2025 ",type:'N' ,  name: 'FENIL . PATEL', paymenttype: 'cash', company: '', mobile: '' },
    { token: '0000004',caseno: '459',date: "22/03/2025 ",type:'N' ,  name: 'HARDIK . PATEL', paymenttype: 'cash', company: '', mobile: '' },
    { token: '0000005',caseno: '460',date: "22/03/2025 ",type:'N' ,  name: 'HARSHIL . PATEL', paymenttype: 'cash', company: '', mobile: '' },
    { token: '0000006',caseno: '461',date: "22/03/2025 ",type:'N' ,  name: 'HIMANSHU . PATEL', paymenttype: 'cash', company: '', mobile: '' },
    { token: '0000007',caseno: '462',date: "22/03/2025 ",type:'N' ,  name: 'HIREN . PATEL', paymenttype: 'cash', company: '', mobile: '' },
    { token: '0000008',caseno: '463',date: "22/03/2025 ",type:'N' ,  name: 'SAGAR . SHAH', paymenttype: 'cash', company: '', mobile: '' },
    { token: '0000009',caseno: '464',date: "22/03/2025 ",type:'N' ,  name: 'NIKUL . SHAH', paymenttype: 'cash', company: '', mobile: '' },
    { token: '0000010',caseno: '465',date: "22/03/2025 ",type:'N' ,  name: 'JINESH . SHAH', paymenttype: 'cash', company: '', mobile: '' }
  ];

  filteredPatients() {
    return this.patients
      .filter(patient => patient.name.toLowerCase().includes(this.searchText.toLowerCase()))
      .slice(0, this.recordsPerPage);
  }

  addNewUHID() {
    alert('Add New UHID functionality to be implemented');
  }

  viewPatient(patient: any) {
    alert(`Viewing details of ${patient.name}`);
  }

  editPatient(patient: any) {
    alert(`Editing details of ${patient.name}`);
  }
  deletPatient(patient: any) {
    alert(`Deleting details of ${patient.name}`);
  }

}
