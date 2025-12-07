import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DoctorsharingserviceService } from '../doctorsharingservice.service';

@Component({
  selector: 'app-patientlist',
  imports: [CommonModule],
  templateUrl: './patientlist.component.html',
  styleUrl: './patientlist.component.css',
})
export class PatientlistComponent {
  activeTab: 'OPD' | 'IPD' = 'OPD';
  patientList: any[] = [];
  userPermissions: any = {};

  constructor(private doctorsharingService: DoctorsharingserviceService) {}

  ngOnInit(): void {

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'sharedPatientCases'
    );
    this.userPermissions = uhidModule?.permissions || {};


    this.doctorsharingService.getSharedData().subscribe((res) => {
      this.patientList = res.data?.data || [];
      console.log('Filtered IPD records:', this.patientList);
    });
  }

  setActiveTab(tab: 'OPD' | 'IPD') {
    this.activeTab = tab;
  }

  get filteredPatients() {
    if (!this.patientList) return [];
    return this.patientList.filter((patient) => {
      return patient.type === this.activeTab;
    });
  }
}
