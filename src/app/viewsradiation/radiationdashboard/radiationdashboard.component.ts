import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../component/customcalendar/customcalendar.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PharmaService } from '../../viewspharma/pharma.service';
import { UhidService } from '../../views/uhid/service/uhid.service';
import { TestService } from '../../viewspatho/testservice/test.service';
import { TestComponent } from '../../component/testcomponent/test/test.component';
import { DoctorService } from '../../views/doctormodule/doctorservice/doctor.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DaterangeComponent } from '../../views/daterange/daterange.component';
import { environment } from '../../../../enviornment/env';

@Component({
  selector: 'app-radiationdashboard',
  imports: [
    CommonModule,
    RouterModule,

    ReactiveFormsModule,
    TestComponent,
    FormsModule,
  ],
  templateUrl: './radiationdashboard.component.html',
  styleUrl: './radiationdashboard.component.css',
})
export class RadiationdashboardComponent {
  doctors: any[] = [];
  filterForm!: FormGroup;
  recordsPerPage: number = 25;
  searchText: string = '';
  patho: any[] = [];
  currentPage = 1;
  totalPages = 1;

  selectedPatient: any = null;
  uhiddata: any[] = [];
  // Using string to bind to radio buttons directly
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];
  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();
  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  constructor(
    private doctorservice: DoctorService,
    private uhidservice: UhidService,
    private testservice: TestService,
    private http: HttpClient
  ) {}

  uhidLoaded = false;
  pathoLoaded = false;

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inward'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    this.testservice.getTestreq().subscribe({
      next: (res) => {
        console.log('🚀 ~ PathodashboardComponent ~ getTestreq ~ res:', res);

        // ✅ Filter only pathology department requests
        this.patho = res.filter(
          (item: any) => item.requestedDepartment === 'radiation'
        );
        this.applyFilters();
        this.pathoLoaded = true;

        if (this.uhidLoaded) this.enrichPathoWithUHID();
      },
      error: (err) => {
        console.log('❌ ~ PathodashboardComponent ~ getTestreq ~ err:', err);
      },
    });

    this.uhidservice.getUhid().subscribe((res) => {
      this.uhiddata = res.uhids;
      this.uhidLoaded = true;

      if (this.pathoLoaded) this.enrichPathoWithUHID();
    });
  }

  applyFilters() {
    let baseList = this.patho;

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      this.filteredCases = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt).toISOString().split('T')[0];
        return patientDate === today;
      });
    } else if (this.activeFilter === 'dateRange') {
      if (!this.startDate || !this.endDate) {
        this.filteredCases = [];
        return;
      }

      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);

      this.filteredCases = baseList.filter((patient: any) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= start && patientDate <= end;
      });
    } else {
      this.filteredCases = baseList;
    }
  }

  // enrichPathoWithUHID() {
  //   if (!this.patho || !this.uhiddata) return;

  //   this.patho.forEach(patho => {
  //     const pharmaUHID = String(patho.uniqueHealthIdentificationId).trim();
  //     const uhidIds = this.uhiddata.map(p => String(p._id).trim());

  //     // Debug each comparison
  //     console.log('Looking for:', pharmaUHID);
  //     console.log('Available UHIDs:', uhidIds);

  //     const matchedPatient = this.uhiddata.find(p => String(p._id).trim() === pharmaUHID);

  //     if (!matchedPatient) {
  //       console.warn('❌ No match for pharmaUHID:', pharmaUHID, 'in UHID data');
  //     } else {
  //       console.log('✅ Match found for:', pharmaUHID, matchedPatient);
  //       patho.patient_name = matchedPatient.patient_name;
  //       patho.age = matchedPatient.age;
  //       patho.gender = matchedPatient.gender;
  //       patho.uhid = matchedPatient.uhid;
  //     }
  //   });
  // }

  private uhid = `${environment.baseurl}/uhid`;

  getUhidById(uhid: string): Observable<any> {
    return this.http.get<any>(`${this.uhid}`, {
      params: {
        _id: uhid,
      },
    });
  }

  enrichPathoWithUHID() {
    if (!this.patho || !this.uhiddata) return;

    this.patho.forEach((patho) => {
      const pharmaUHID = String(patho.uniqueHealthIdentificationId).trim();
      this.getUhidById(pharmaUHID).subscribe((res: any) => {
        const patient = res.uhids?.[0];
        if (patient) {
          patho.patient_name = patient.patient_name;
          patho.age = patient.age;
          patho.gender = patient.gender;
          patho.uhid = patient.uhid;
        }
      });
    });
  }

  viewPatient(patientId: string): void {
    if (!patientId) {
      console.error('No patientId provided');
      return;
    }
    this.testservice.getTestreqById(patientId).subscribe({
      next: (res) => {
        this.selectedPatient = res; // Keep as object
      },
      error: (err) => {
        console.error('Error fetching patient:', err);
      },
    });
  }

  closeModal(): void {
    this.selectedPatient = null;
  }
}
