import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { DoctorService } from '../../doctorservice/doctor.service';
import Swal from 'sweetalert2';
import { TestComponent } from '../../../../component/testcomponent/test/test.component';
import { TestService } from '../../../../viewspatho/testservice/test.service';
import { UhidService } from '../../../uhid/service/uhid.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DaterangeComponent } from '../../../daterange/daterange.component';
import { environment } from '../../../../../../enviornment/env';

@Component({
  selector: 'app-radiationreqlist',
  imports: [CommonModule, RouterModule, TestComponent, FormsModule],
  templateUrl: './radiationreqlist.component.html',
  styleUrl: './radiationreqlist.component.css',
})
export class RadiationreqlistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  filterForm!: FormGroup;
  pathologyData: any[] = [];
  currentPage = 1;
  totalPages = 1;
  selectedPatient: any = null;
  // Using string to bind to radio buttons directly
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];

  uhiddata: any[] = [];
  patho: any[] = [];
  uhidLoaded = false;
  pathoLoaded = false;

  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();

  constructor(
    private masterService: MasterService,
    private router: Router,
    private fb: FormBuilder,
    private doctorservice: DoctorService,
    private testservice: TestService,
    private uhidservice: UhidService,
    private http: HttpClient
  ) {}

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'departmentRequestList'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    this.startDate = todayString;
    this.endDate = todayString;

    this.doctorservice.getreuesttestapis().subscribe((res) => {
      const dataArray = res?.data || res;

      if (!Array.isArray(dataArray)) {
        console.error('Expected an array but got:', dataArray);
        this.pathologyData = [];
        return;
      }

      let pathologyRequests: any[] = [];

      dataArray.forEach((patient: any) => {
        if (Array.isArray(patient.departmentreqlists)) {
          const matching = patient.departmentreqlists.filter(
            (item: any) => item.typeOfRequest === 'radiation'
          );

          matching.forEach((req: any) => {
            pathologyRequests.push({
              ...req,
              patient_name: patient.patient_name,
              uhid: patient.uhid,
              age: patient.age,
              gender: patient.gender,
            });
          });
        }
      });

      this.pathologyData = pathologyRequests;
      this.applyFilters();
      console.log('🚀 Pathology Requests:', this.pathologyData);
    });

    // for files

    this.testservice.getTestreq().subscribe({
      next: (res) => {
        console.log('🚀 ~ PathodashboardComponent ~ getTestreq ~ res:', res);

        // ✅ Filter only pathology department requests
        this.patho = res.filter(
          (item: any) => item.requestedDepartment === 'radiation'
        );
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

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  private uhid = `${environment.baseurl}/uhid`;

  getUhidById(uhid: string): Observable<any> {
    return this.http.get<any>(`${this.uhid}`, {
      params: {
        _id: uhid,
      },
    });
  }
  matchedPathoMap = new Map<string, any>(); // test._id -> patho

  enrichPathoWithUHID() {
    if (!this.patho || !this.uhiddata) return;

    this.patho.forEach((p) => {
      if (p.requestedDepartmentId) {
        this.matchedPathoMap.set(p.requestedDepartmentId, p);
      }
    });
  }

  applyFilters() {
    let baseList = this.pathologyData;

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

  edittest(radiationid: string) {
    console.log(
      '🚀 ~ PathologyreqlistComponent ~ edittest ~   radiationid:',
      radiationid
    );

    this.router.navigate(['/doctor/radiationreq'], {
      queryParams: { _id: radiationid },
    });
  }

  deletetest(radiationid: string) {
    if (!radiationid) {
      console.error('Test ID is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This test request will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
        cancelButton: 'hospital-swal-button',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.doctorservice.deletereuesttestapis(radiationid).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Test request has been deleted successfully.',
              position: 'top-end',
              toast: true,
              timer: 3000,
              showConfirmButton: false,
              customClass: {
                popup: 'hospital-toast-popup',
                title: 'hospital-toast-title',
                htmlContainer: 'hospital-toast-text',
              },
            });

            this.filteredCases = this.filteredCases.filter(
              (item) => item._id !== radiationid
            );
          },
          error: (err) => {
            console.error('Error deleting test request:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text:
                err?.error?.message ||
                'There was an error deleting the test request.',
              customClass: {
                popup: 'hospital-swal-popup',
                title: 'hospital-swal-title',
                htmlContainer: 'hospital-swal-text',
                confirmButton: 'hospital-swal-button',
              },
            });
          },
        });
      }
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
