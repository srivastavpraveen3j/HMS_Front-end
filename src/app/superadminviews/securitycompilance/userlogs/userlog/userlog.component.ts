import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-userlog',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './userlog.component.html',
  styleUrl: './userlog.component.css'
})
export class UserlogComponent {

  logForm: FormGroup;

  hospitalList = [
    { id: 'h1', name: 'PP Maniya Hospital' },
    { id: 'h2', name: 'Sunrise Hospital' }
  ];

  branchList = [
    { id: 'b1', name: 'PPM - Branch 1', hospitalId: 'h1' },
    { id: 'b2', name: 'PPM - Branch 2', hospitalId: 'h1' },
    { id: 'b3', name: 'Sunrise - Branch 1', hospitalId: 'h2' },
  ];

  filteredBranches = [...this.branchList];

  allLogs = [
    {
      user: 'admin',
      role: 'Superadmin',
      hospitalId: 'h1',
      hospitalName: 'PP Maniya Hospital',
      branchId: '',
      branchName: '',
      action: 'login',
      timestamp: new Date(),
      ip: '192.168.0.1'
    },
    {
      user: 'john',
      role: 'Branch Admin',
      hospitalId: 'h1',
      hospitalName: 'PP Maniya Hospital',
      branchId: 'b1',
      branchName: 'PPM - Branch 1',
      action: 'update',
      timestamp: new Date(),
      ip: '192.168.0.55'
    },
    {
      user: 'jane',
      role: 'Staff',
      hospitalId: 'h2',
      hospitalName: 'Sunrise Hospital',
      branchId: 'b3',
      branchName: 'Sunrise - Branch 1',
      action: 'logout',
      timestamp: new Date(),
      ip: '192.168.0.22'
    }
    // Add more mock logs if needed
  ];

  filteredLogs = [...this.allLogs];

  constructor(private fb: FormBuilder) {
    this.logForm = this.fb.group({
      hospital: [''],
      branch: [''],
      user: [''],
      action: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  onHospitalChange(): void {
    const selectedHospitalId = this.logForm.value.hospital;
    this.filteredBranches = this.branchList.filter(branch => branch.hospitalId === selectedHospitalId);
    this.logForm.patchValue({ branch: '' }); // Clear branch on hospital change
  }

  filterLogs(): void {
    const { hospital, branch, user, action, fromDate, toDate } = this.logForm.value;

    this.filteredLogs = this.allLogs.filter(log => {
      const matchHospital = !hospital || log.hospitalId === hospital;
      const matchBranch = !branch || log.branchId === branch;
      const matchUser = !user || log.user.toLowerCase().includes(user.toLowerCase());
      const matchAction = !action || log.action === action;
      const matchFrom = !fromDate || new Date(log.timestamp) >= new Date(fromDate);
      const matchTo = !toDate || new Date(log.timestamp) <= new Date(toDate);

      return matchHospital && matchBranch && matchUser && matchAction && matchFrom && matchTo;
    });
  }

  resetForm(): void {
    this.logForm.reset();
    this.filteredBranches = [...this.branchList];
    this.filteredLogs = [...this.allLogs];
  }

}
