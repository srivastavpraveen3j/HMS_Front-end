  import { CommonModule } from '@angular/common';
  import { Component } from '@angular/core';
  import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
  import { Router, RouterModule } from '@angular/router';
  import { MasterService } from '../../../mastermodule/masterservice/master.service';
  import { DoctorService } from '../../doctorservice/doctor.service';
  import { LoaderComponent } from "../../../loader/loader.component";
  import { DaterangeComponent } from "../../../daterange/daterange.component";

  @Component({
    selector: 'app-pharmareqlist',
    imports: [
      RouterModule,
      CommonModule,
      ReactiveFormsModule,
      FormsModule,
      LoaderComponent,

    ],
    templateUrl: './pharmareqlist.component.html',
    styleUrl: './pharmareqlist.component.css',
  })
  export class PharmareqlistComponent {
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
    medicineMap: { [key: string]: string } = {};
    isMedicineMapLoaded: boolean = false;
    module: string = '';
    yourMinDate = new Date(2020, 0, 1);
    yourMaxDate = new Date();

    constructor(
      private masterService: MasterService,
      private router: Router,
      private fb: FormBuilder,
      private doctorservice: DoctorService
    ) {}

    userPermissions: any = {};

    // ngOnInit(): void {
    //   // load permissions

    //   const allPermissions = JSON.parse(
    //     localStorage.getItem('permissions') || '[]'
    //   );
    //   const uhidModule = allPermissions.find(
    //     (perm: any) => perm.moduleName === 'pharmaceuticalRequestList'
    //   );
    //   this.userPermissions = uhidModule?.permissions || {};

    //   // load permissions

    //   const today = new Date();
    //   const todayString = today.toISOString().split('T')[0];

    //   this.startDate = todayString;
    //   this.endDate = todayString;

    //   this.filterForm = this.fb.group({
    //     recordsPerPage: [10],
    //     searchText: [''],
    //   });

    //   this.loadPharmareq();
    //   setInterval(() => {
    //     this.loadPharmareq();
    //   }, 6000);

    //   this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
    //     this.currentPage = 1;
    //     this.loadPharmareq();
    //   });

    //   this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
    //     this.currentPage = 1;
    //     this.loadPharmareq();
    //   });

    //   this.masterService.getMedicine().subscribe({
    //     next: (res) => {
    //       const data = res?.data;
    //       data.forEach((med: any) => {
    //         this.medicineMap[med._id] = med.medicineName;
    //       });
    //     },
    //   });
    // }

    ngOnInit(): void {
      // Load permissions
      const allPermissions = JSON.parse(
        localStorage.getItem('permissions') || '[]'
      );
      const uhidModule = allPermissions.find(
        (perm: any) => perm.moduleName === 'pharmaceuticalRequestList'
      );
      this.userPermissions = uhidModule?.permissions || {};
      this.module = uhidModule?.moduleName || '';

      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      this.startDate = todayString;
      this.endDate = todayString;

      this.filterForm = this.fb.group({
        recordsPerPage: [10],
        searchText: [''],
      });

      this.fetchAllMedicines();

      // Form change subscriptions
      this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
        this.currentPage = 1;
        this.loadPharmareq();
      });

      this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
        this.currentPage = 1;
        this.loadPharmareq();
      });
    }

    fetchAllMedicines(page = 1, limit = 50, accumulated: any[] = []) {
      this.masterService.getMedicine(page, limit).subscribe({
        next: (res) => {
          const data = res?.data || [];
          const totalPages = res?.totalPages || 1;
          const newAccumulated = [...accumulated, ...data];

          if (page < totalPages) {
            this.fetchAllMedicines(page + 1, limit, newAccumulated);
          } else {
            // All medicines fetched, now create the map
            newAccumulated.forEach((med: any) => {
              this.medicineMap[med._id] = med.medicine_name;
            });
            this.isMedicineMapLoaded = true;
            this.loadPharmareq();
          }
        },
        error: (err) => {
          console.error('Failed to fetch medicines:', err);
        },
      });
    }

    handleDateRangeChange(event: { startDate: string; endDate: string }) {
      this.startDate = event.startDate;
      this.endDate = event.endDate;
      this.applyFilters(); // or apply filtering etc.
    }

   loadPharmareq() {
  const limit = this.filterForm.get('recordsPerPage')?.value || 10;
  const search = this.filterForm.get('searchText')?.value || '';

  this.doctorservice.getPharmareq(this.currentPage, limit, search).subscribe((res) => {
    const fullData = res || [];
    const today = new Date().toISOString().split('T')[0];

    this.pharmareq = [];

    fullData.forEach((patient: any) => {
      if (Array.isArray(patient.pharmaceuticalrequestlists)) {
        const filteredRequests = patient.pharmaceuticalrequestlists
          .filter((req: any) => {
            const isInpatient = req.patientType === 'inpatientDepartment';
            const reqDate = new Date(req.createdAt).toISOString().split('T')[0];
            return isInpatient && reqDate === today;
          })
          .map((req: any) => ({
            ...req,
            patient_name: patient.patient_name,
            uhid: patient.uhid,
            mobile_no: patient.mobile_no,
            age: patient.age,
            gender: patient.gender,
            packages:
              req.packages?.map((pkg: any) => ({
                ...pkg,
                medicineId: pkg.medicineId || pkg.medicineName,
              })) || [],
          }));

        this.pharmareq.push(...filteredRequests);
      }
    });

    // No need for filtering again here since we already filtered above
    this.filteredCases = this.pharmareq;
    this.totalPages = Math.ceil((this.pharmareq.length || 0) / limit);
  });
}


    applyFilters() {
      let baseList = this.pharmareq;

      if (this.activeFilter === 'today') {
  const today = new Date().toISOString().split('T')[0];
  this.filteredCases = baseList.filter((req) => {
    const createdAt = req?.createdAt || req?.created_at;
    const reqDate = new Date(createdAt).toISOString().split('T')[0];
    return req.patientType === 'inpatientDepartment' && reqDate === today;
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

      this.router.navigate(['/doctor/pharmareq'], {
        queryParams: { _id: requestid },
      });
    }

    deletePharmaReq(requestid: string) {
      this.doctorservice.deletePharmareq(requestid).subscribe({
        next: (res) => {
          alert('Deleted Successfully');

          // Iterate and update each item's pharmaceuticalrequestlists
          this.filteredCases = this.filteredCases
            .map((pkg) => {
              return {
                ...pkg,
                pharmaceuticalrequestlists: pkg.pharmaceuticalrequestlists.filter(
                  (req: any) => req._id !== requestid
                ),
              };
            })
            .filter((pkg) => pkg.pharmaceuticalrequestlists.length > 0); // Optionally remove empty parent packages
        },
        error: (err) => {
          console.log(err, 'error response');
        },
      });
    }
  }
