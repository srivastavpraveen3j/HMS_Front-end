import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-chemotherapylist',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './chemotherapylist.component.html',
  styleUrl: './chemotherapylist.component.css'
})
export class ChemotherapylistComponent {


  recordsPerPage: number = 25;
  searchText: string = '';

  patients = [
    { uhid: '0000001', name: 'CHETAN . PATEL', dor: '20-09-2023', dob: '', mobile: '6532589645' },
    { uhid: '0000002', name: 'DARSHAN . PATEL', dor: '05-02-2021', dob: '01-01-1971', mobile: '9007007007' },
    { uhid: '0000003', name: 'FENIL . PATEL', dor: '05-02-2021', dob: '', mobile: '' },
    { uhid: '0000004', name: 'HARDIK . PATEL', dor: '05-02-2021', dob: '', mobile: '' },
    { uhid: '0000005', name: 'HARSHIL . PATEL', dor: '05-02-2021', dob: '', mobile: '' },
    { uhid: '0000006', name: 'HIMANSHU . PATEL', dor: '05-02-2021', dob: '', mobile: '' },
    { uhid: '0000007', name: 'HIREN . PATEL', dor: '05-02-2021', dob: '', mobile: '' },
    { uhid: '0000008', name: 'SAGAR . SHAH', dor: '05-02-2021', dob: '', mobile: '' },
    { uhid: '0000009', name: 'NIKUL . SHAH', dor: '05-02-2021', dob: '', mobile: '' },
    { uhid: '0000010', name: 'JINESH . SHAH', dor: '05-02-2021', dob: '', mobile: '' }
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

}
