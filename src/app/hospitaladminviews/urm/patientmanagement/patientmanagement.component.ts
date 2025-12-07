import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
interface Patient {
  name: string;
  age: number;
  gender: string;
  caseType: string;
  status: string;
}
@Component({
  selector: 'app-patientmanagement',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patientmanagement.component.html',
  styleUrl: './patientmanagement.component.css'
})
export class PatientmanagementComponent {


  selectedFilters: { [key: string]: string } = {};

  hospital = {
    name: 'PP Maniya Hospital',
    branches: [
      {
        name: 'PP Maniya Piplod',
        patients: this.generatePatients('PP Maniya Piplod')
      },
      {
        name: 'PP Maniya Adajan',
        patients: this.generatePatients('PP Maniya Adajan')
      },
      {
        name: 'PP Maniya City Varcha',
        patients: this.generatePatients('PP Maniya City Varcha')
      }
    ]
  };

  generatePatients(branch: string): Patient[] {
    const caseTypes: ('OPD' | 'IPD' | 'Surgery')[] = ['OPD', 'IPD', 'Surgery'];
    const statuses: Record<'OPD' | 'IPD' | 'Surgery', string> = {
      OPD: 'Active',
      IPD: 'Admitted',
      Surgery: 'Scheduled'
    };

    let patients: Patient[] = [];
    let count = 1;

    caseTypes.forEach(type => {
      for (let i = 1; i <= 20; i++) {
        patients.push({
          name: `${type} Patient ${count++}`,
          age: 25 + (i % 30),
          gender: i % 2 === 0 ? 'Male' : 'Female',
          caseType: type,
          status: statuses[type]
        });
      }
    });

    return patients;
  }

  getFilteredPatients(branchName: string): Patient[] | undefined {
    const branch = this.hospital.branches.find(b => b.name === branchName);
    const selectedType = this.selectedFilters[branchName] || 'All';
    if (selectedType === 'All') return branch?.patients;
    return branch?.patients.filter(p => p.caseType === selectedType);
  }

  onFilterChange(branchName: string, value: string) {
    this.selectedFilters[branchName] = value;
  }

}
