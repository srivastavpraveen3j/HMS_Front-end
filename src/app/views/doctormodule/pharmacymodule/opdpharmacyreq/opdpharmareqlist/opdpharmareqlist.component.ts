import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../../../mastermodule/masterservice/master.service';
import { DoctorService } from '../../../doctorservice/doctor.service';
import { PatientOpdmedicineRequestComponent } from '../../../../../component/opdcustomfiles/patient-opdmedicine-request/patient-opdmedicine-request.component';
// import Swal from 'sweetalert2';
import { DaterangeComponent } from "../../../../daterange/daterange.component";

@Component({
  selector: 'app-opdpharmareqlist',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    PatientOpdmedicineRequestComponent,
    FormsModule,
],
  templateUrl: './opdpharmareqlist.component.html',
  standalone: true,
  styleUrl: './opdpharmareqlist.component.css',
})
export class OpdpharmareqlistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  filterForm!: FormGroup;
  pharmareq: any[] = [];
  currentPage = 1;
  totalPages = 1;
  selectedPatient: any = null;
  // Using string to bind to radio buttons directly
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];
  allPharmaRequests: any[] = [];

  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();

  constructor(
    private masterService: MasterService,
    private router: Router,
    private fb: FormBuilder,
    private doctorservice: DoctorService
  ) {}

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'pharmaceuticalRequestList'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    this.activeFilter = 'today'; // or 'dateRange', or ''
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    this.startDate = todayString;
    this.endDate = todayString;

    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: [''],
    });

    this.loadPharmareq();
    // setInterval(() => {
    //   this.loadPharmareq();
    // }, 6000);

    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadPharmareq();
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadPharmareq();
    });
  }

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

loadPharmareq() {
  const search = this.filterForm.get('searchText')?.value || '';

  // Fetch all data (high limit to ensure all come)
  this.doctorservice.getPharmareq(1, 1000, search).subscribe((res) => {
    console.log('Fetched raw:', res);

    const flatData = res || [];
    const allRequests: any[] = [];

    flatData.forEach((patient: any) => {
      const uhid = patient.uhid || patient._id || 'UNKNOWN';
      const name = patient.patient_name || 'Unnamed';

      if (Array.isArray(patient.pharmaceuticalrequestlists)) {
        patient.pharmaceuticalrequestlists.forEach((req: any) => {
          allRequests.push({
            ...req,
            uhid,
            patient_name: name,
          });
        });
      }
    });

    const outpatientRequests = allRequests.filter(
      (req) => req.patientType === 'outpatientDepartment'
    );

    const grouped: any = {};
    outpatientRequests.forEach((req: any) => {
      if (!grouped[req.uhid]) {
        grouped[req.uhid] = {
          uhid: req.uhid,
          patient_name: req.patient_name,
          pharmaceuticalrequestlists: [],
        };
      }
      grouped[req.uhid].pharmaceuticalrequestlists.push(req);
    });

    this.allPharmaRequests = Object.values(grouped);
    this.totalPages = Math.ceil((this.allPharmaRequests.length || 0) / 25); // update pagination if needed

    this.applyFilters(); // Apply selected date filter
  });
}



applyFilters() {
  const baseList = this.allPharmaRequests || [];
  const today = new Date();

  if (this.activeFilter === 'today') {
    this.filteredCases = baseList.filter((patient) =>
      patient.pharmaceuticalrequestlists?.some((req: any) => {
        if (!req?.createdAt) return false;

        const reqDate = new Date(req.createdAt);
        const isToday =
          reqDate.getDate() === today.getDate() &&
          reqDate.getMonth() === today.getMonth() &&
          reqDate.getFullYear() === today.getFullYear();

        return isToday; // ✅ Allow completed requests too
      })
    );
  } else if (this.activeFilter === 'dateRange') {
    if (!this.startDate || !this.endDate) {
      this.filteredCases = [];
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    end.setHours(23, 59, 59, 999);

    this.filteredCases = baseList.filter((patient) =>
      patient.pharmaceuticalrequestlists?.some((req: any) => {
        const createdAt = new Date(req?.createdAt || req?.created_at);
        return createdAt >= start && createdAt <= end;
      })
    );
  } else {
    this.filteredCases = [];
  }

  console.log('Filtered:', this.filteredCases.length, this.filteredCases);
}


  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPharmareq();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPharmareq();
    }
  }

  editPharmaReq(requestid: string) {
    // alert(requestid)

    this.router.navigate(['/doctor/opdpharmareq'], {
      queryParams: { _id: requestid },
    });
  }

 async deletePharmaReq(requestid: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!requestid) {
      console.error('Request ID is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This pharmaceutical request will be permanently deleted.',
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
        this.doctorservice.deletePharmareq(requestid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Pharmacy request has been deleted successfully.',
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

            // Remove the deleted request from the UI
            this.filteredCases = this.filteredCases
              .map((pkg) => {
                return {
                  ...pkg,
                  pharmaceuticalrequestlists:
                    pkg.pharmaceuticalrequestlists.filter(
                      (req: any) => req._id !== requestid
                    ),
                };
              })
              .filter((pkg) => pkg.pharmaceuticalrequestlists.length > 0); // Remove parent if no children remain
          },
          error: (err) => {
            console.error('Error deleting pharmacy request:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text:
                err?.error?.message ||
                'There was an error deleting the pharmacy request.',
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

  // pdf [part]

  viewPatient(patientId: string): void {
    if (!patientId) {
      console.error('No patientId provided');
      return;
    }
    this.doctorservice.getpharmareqById(patientId).subscribe({
      next: (res) => {
        // console.log('Full response:', res);
        // console.log("🚀 ~ OpdappointmentlistComponent ~ this.opdService.getOpdAppointmentbyid ~ res:", res)
        this.selectedPatient = res; // Adjust if your data is under different key
        console.log('selectedPatient:', this.selectedPatient);
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
