import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DoctorsharingserviceService } from '../doctorsharingservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-treatmentsheet',
  imports: [CommonModule],
  templateUrl: './treatmentsheet.component.html',
  styleUrl: './treatmentsheet.component.css',
})
export class TreatmentsheetComponent {
  activeTab: 'OPD' | 'IPD' = 'OPD';
  patientList: any[] = [];
  userPermissions: any = {};

  constructor(
    private doctorsharingService: DoctorsharingserviceService,
    private router: Router
  ) {}

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
      console.log('Filtered records:', this.patientList);
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

  onViewTreatmentSheet(id: string) {
    if (this.activeTab === 'OPD') {
      this.viewOpdTreatmentSheet(id);
    } else {
      this.viewIpdTreatmentSheet(id);
    }
  }

  viewOpdTreatmentSheet(id: string) {
    this.router.navigate(['/report/patientledgersummary'], {
      queryParams: { _id: id },
    });
  }

  viewIpdTreatmentSheet(id: string) {
    this.router.navigate(['/report/patientbalancereport'], {
      queryParams: { _id: id },
    });
  }
}
