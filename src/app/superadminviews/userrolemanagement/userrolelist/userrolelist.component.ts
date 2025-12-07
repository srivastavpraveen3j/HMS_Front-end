import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-userrolelist',
  imports: [CommonModule, RouterModule],
  templateUrl: './userrolelist.component.html',
  styleUrl: './userrolelist.component.css'
})
export class UserrolelistComponent {

  recordsPerPage: number = 25;
  searchText: string = '';

  patients = [
    { adminid: '0000001', himsapikey:'12321654' ,role: 'admin', adminimg: '', hospitalbranch: 'PP Maniya'  },
    { adminid: '0000002', himsapikey:'12321655' ,role: 'admin', adminimg: '', hospitalbranch: 'PP Savani'  },
    { adminid: '0000003', himsapikey:'12321656' ,role: 'admin', adminimg: '', hospitalbranch: 'Nirmal' },

  ];

  filteredPatients() {
    return this.patients
      .filter(patient => patient.adminid.toLowerCase().includes(this.searchText.toLowerCase()))
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
