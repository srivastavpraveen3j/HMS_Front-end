import { Component } from '@angular/core';
import { DoctorsharingserviceService } from '../doctorsharingservice.service';
import { CommonModule } from '@angular/common';
import { IpdadmissionviewComponent } from "../../component/ipdcustomfiles/ipdadmissionview/ipdadmissionview.component";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ipddatasharing',
  imports: [CommonModule, IpdadmissionviewComponent],
  templateUrl: './ipddatasharing.component.html',
  styleUrl: './ipddatasharing.component.css',
})
export class IpddatasharingComponent {
  [x: string]: any;
  sharedData: any[] = [];
  selectedPatient: any = null;
  userPermissions: any = {};
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

    this.getData();

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
  
  getData(){
    this.doctorsharingService.getSharedData().subscribe((res) => {
      this.sharedData =
        res.data?.data?.filter((item: any) => item.type === 'IPD') || [];
      console.log('Filtered IPD records:', this.sharedData);
    });
  }

  getDataById(id: string){
    this.doctorsharingService.getSharedDataById(id).subscribe((res) => {
      console.log(res);
      this.selectedData = res.data || [];
    });
  }

  viewPatient(patientId: string): void {
    this.doctorsharingService.getSharedDataById(patientId).subscribe({
      next: (res) => {
        this.selectedPatient = res.data || res;
        console.log(
          '🚀 ~ OpdcasesComponent ~ this.opdService.getOPDcaseById ~ this.selectedPatient:',
          this.selectedPatient
        );
      },
      error: (err) => {
        console.log(
          '🚀 ~ OpdcasesComponent ~ this.opdService.getOPDcaseById ~ err:',
          err
        );
      },
    });
  }

  closeModal(): void {
    this.selectedPatient = null;
  }
}
