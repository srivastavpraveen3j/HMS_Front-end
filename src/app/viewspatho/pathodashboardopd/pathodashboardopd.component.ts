import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CustomcalendarComponent } from '../../component/customcalendar/customcalendar.component';
import { FormGroup, FormsModule } from '@angular/forms';
import { PharmaService } from '../../viewspharma/pharma.service';
import { UhidService } from '../../views/uhid/service/uhid.service';
import { TestService } from '../testservice/test.service';
import { TestComponent } from '../../component/testcomponent/test/test.component';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoaderComponent } from '../../views/loader/loader.component';
import { DaterangeComponent } from '../../views/daterange/daterange.component';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../enviornment/env';

@Component({
  selector: 'app-pathodashboardopd',
  imports: [
    CommonModule,

    TestComponent,
    FormsModule,
    LoaderComponent,

    RouterModule,
  ],
  templateUrl: './pathodashboardopd.component.html',
  styleUrl: './pathodashboardopd.component.css',
})
export class PathodashboardopdComponent {
  doctors: any[] = [];
  filterForm!: FormGroup;
  recordsPerPage: number = 25;
  searchText: string = '';
  patho: any[] = [];
  currentPage = 1;
  totalPages = 1;

  selectedPatient: any = null;
  uhiddata: any[] = [];
  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();

  constructor(
    private pharmaservice: PharmaService,
    private uhidservice: UhidService,
    private testservice: TestService,
    private http: HttpClient
  ) {}

  uhidLoaded = false;
  pathoLoaded = false;

  // Using string to bind to radio buttons directly
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];
  userPermissions: any = {};
  module: string = '';

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inward'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // load permissions

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    this.startDate = todayString;
    this.endDate = todayString;

    this.testservice.getTestreq().subscribe({
      next: (res) => {
        console.log('🚀 ~ PathodashboardComponent ~ getTestreq ~ res:', res);

        // ✅ Filter only pathology department requests
        this.patho = res.filter(
          (item: any) =>
            item.requestedDepartment === 'pathology' &&
            item.type === 'outpatientDepartment' &&
            item.isWalkIn === false
        );
        this.pathoLoaded = true;
        this.applyFilters();
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

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  applyFilters() {
    let baseList = this.patho;
    const text = this.searchText.toLowerCase();

    baseList = baseList.filter((data) => {
      const patient = data.patient_name.toLowerCase() || '';
      const uhid = data.uhid;

      return patient.includes(text) || uhid.includes(text);
    });

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
