import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DoctorsharingserviceService } from '../doctorsharingservice.service';
import { ActivatedRoute } from '@angular/router';
import { PatientdeatailsComponent } from "../../component/opdcustomfiles/patientdeatails/patientdeatails.component";

@Component({
  selector: 'app-opddatasharing',
  imports: [CommonModule, PatientdeatailsComponent],
  templateUrl: './opddatasharing.component.html',
  styleUrl: './opddatasharing.component.css',
})
export class OpddatasharingComponent {
  sharedData: any[] = [];
  userPermissions: any = {};
  selectedPatient: any = null;
  selectedData: any = null;

  constructor(
    private doctorsharingService: DoctorsharingserviceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'sharedPatientCases'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // this.getData();

    this.route.queryParams.subscribe((params) => {
      const Id = params['_id'];
      if (Id) {
        this.getDataById(Id);
      } else {
        // this.setFilter(this.selectedFilter);
        this.getData();
      }
    });
  }

  getData() {
    this.doctorsharingService.getSharedData().subscribe((res) => {
      this.sharedData =
        res.data?.data?.filter((item: any) => item.type === 'OPD') || [];
      console.log('Filtered OPD records:', this.sharedData);
    });
  }

  viewPatient(patientId: string): void {
    this.doctorsharingService.getSharedDataById(patientId).subscribe({
      next: (res) => {
        this.selectedPatient = res.data || res;
        console.log('🚀 selectedPatient:', this.selectedPatient);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getDataById(id: string) {
    this.doctorsharingService.getSharedDataById(id).subscribe((res) => {
      this.selectedData = res.data || [];
    });
  }

  closeModal(): void {
    this.selectedPatient = null;
  }
}
