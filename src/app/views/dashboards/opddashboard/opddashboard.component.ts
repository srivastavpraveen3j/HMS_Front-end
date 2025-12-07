import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OpdService } from '../../opdmodule/opdservice/opd.service';
import { PatientdeatailsComponent } from "../../../component/opdcustomfiles/patientdeatails/patientdeatails.component";
import { MasterService } from '../../mastermodule/masterservice/master.service';
import { LoaderComponent } from '../../loader/loader.component';
import { LogoService } from '../../settingsmodule/logo/logo.service';
import { RoleService } from '../../mastermodule/usermaster/service/role.service';

@Component({
  selector: 'app-opddashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PatientdeatailsComponent,
    FormsModule,
    LoaderComponent,
  ],
  templateUrl: './opddashboard.component.html',
  styleUrls: ['./opddashboard.component.css'],
})
export class OpddashboardComponent implements OnInit {
  //================ logo purpose =================
  logoUrl!: string;

  //================ logo purpose =================
  doctors: any[] = [];
  filterForm!: FormGroup;

  opdcases: any[] = [];
  filteredCases: any[] = [];
  module: string = 'outpatientCase';
  selectedPatient: any = null;
  // Add this new variable:
  selectedDoctorName: string = '';

  recordsPerPage = 10;
  currentPage = 1;
  totalPages = 1;

  // Using string to bind to radio buttons directly
  activeFilter = 'today';

  // For date range inputs bound by ngModel
  startDate: string = '';
  endDate: string = '';

  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();
  searchText: string = '';
  doctorId: string = '';
  isrole: string = '';
  isDoctor: boolean = false; 

  constructor(
    private opdService: OpdService,
    private router: Router,
    private fb: FormBuilder,
    private masterService: MasterService,
    private logoService: LogoService,
    private role: RoleService
  ) {}

  userPermissions: any = {};
  useripdreportPermissions: any = {};

  ngOnInit() {
    //================ logo purpose =================

    this.logoService.getLogoMeta().subscribe();

    // 🔥 Subscribe to live updates
    this.logoService.logoUrl$.subscribe((url) => {
      if (url) {
        this.logoUrl = url;
      }
    });

    //================ logo purpose =================

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    this.startDate = todayString;
    this.endDate = todayString;

    // load permission

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );

    // const opdreports = allPermissions.find(
    //   (perm: any) => perm.moduleName === 'outpatientCase'
    // );

    const ipdreports = allPermissions.find(
      (perm: any) => perm.moduleName === 'inpatientCase'
    );

    // this.userPermissions = opdreports?.permissions || {};
    this.useripdreportPermissions = ipdreports?.permissions || {};
    // load permission

    const userStr = localStorage.getItem('authUser');
    if (!userStr) {
      console.error('No user found in localStorage');
      return;
    }
    // console.log(userStr);
    const user = JSON.parse(userStr);
    const id = user._id;
    const role = user.role?.name;
    this.doctorId = id;
    this.isrole = role;

    if (this.isrole === 'doctor') {
      this.isDoctor = true;
      this.loadOpdcase(this.doctorId);
    } else {
      this.loadOpdcase();
    }

    this.initForm();
    this.fetchDoctors();
    // this.loadOpdcase();

    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadOpdcase();
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadOpdcase(this.getRoleBasedDoctorId());
    });
  }

  initForm() {
    this.filterForm = this.fb.group({
      recordsPerPage: [this.recordsPerPage],
      searchText: [''],
    });
  }

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  fetchDoctors(): Promise<void> {
    return new Promise((resolve) => {
     this.role.getusers().subscribe((res: any) => {
       this.doctors = res.filter((u: any) => u.role?.name === 'doctor') || [];
       resolve();
     });
    });
  }

  // loadOpdcase() {
  //   const limit = this.filterForm.get('recordsPerPage')?.value || 25;
  //   const search = this.filterForm.get('searchText')?.value || '';

  //   this.opdService.getOPDcase(this.currentPage, limit, search).subscribe((res: any) => {
  //     this.opdcases = res.outpatientCases || [];
  //     this.totalPages = res.totalPages || 1;
  //     this.applyFilters();
  //   });
  // }

  private getRoleBasedDoctorId(): string | undefined {
    return this.isrole === 'doctor' ? this.doctorId : undefined;
  }

  loadOpdcase(doctorId?: string) {
    // const search = this.filterForm.get('searchText')?.value || '';
    const limit = 9999; // Load all

    this.opdService.getOPDcase(1, limit, '').subscribe((res: any) => {
      console.log("response", res);
      let opdcases = res.outpatientCases || [];

      // Restrict by login role → doctor only sees their own
      if (doctorId) {
        opdcases = opdcases.filter(
          (c: any) =>
            c.consulting_Doctor?._id === doctorId ||
            c.consulting_Doctor === doctorId
        );
      }

      this.opdcases = opdcases;
      this.applyFilters();
    });
  }

  doctorSearchText: string = '';
  filteredDoctors: any[] = [];

  onDoctorSearchChange(searchText: string) {
    if (searchText.trim().length === 0) {
      // cleared → reset everything
      this.filteredDoctors = [];
      this.selectedDoctorName = '';
      this.currentPage = 1;
      this.loadOpdcase(this.getRoleBasedDoctorId()); // show all patients
      return;
    }

    if (searchText.trim().length < 2) {
      this.filteredDoctors = [];
      return;
    }

    // call API when typing
    this.role.getusers(1, 100, searchText).subscribe((res: any) => {
      const doctors = res.filter((u: any) => u.role?.name === 'doctor') || [];
      this.filteredDoctors = doctors;
      // console.log('filtered', this.filteredDoctors);
    });
  }

  onDoctorSelected(selectedDoctorName: string) {
    this.selectedDoctorName = selectedDoctorName;
    this.doctorSearchText = selectedDoctorName;
    this.filteredDoctors = []; // close dropdown
    this.currentPage = 1;
    this.loadOpdcase(this.getRoleBasedDoctorId());
  }

  // nextPage() {
  //   if (this.currentPage < this.totalPages) {
  //     this.currentPage++;
  //     this.loadOpdcase();
  //   }
  // }

  // previousPage() {
  //   if (this.currentPage > 1) {
  //     this.currentPage--;
  //     this.loadOpdcase();
  //   }
  // }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  onDoctorSelect(event: Event): void {
    const selectedDoctorName = (event.target as HTMLSelectElement).value;
    this.selectedDoctorName = selectedDoctorName;
    this.currentPage = 1;
    this.loadOpdcase(this.getRoleBasedDoctorId());
  }

  // applyFilters() {
  //   let baseList = this.opdcases;

  //   // If a doctor is selected, filter by doctor first
  //   if (this.selectedDoctorName) {
  //     baseList = baseList.filter((patient) => {
  //       // Depending on your data shape:
  //       return (
  //         patient.consulting_Doctor?.name === this.selectedDoctorName ||
  //         patient.consulting_Doctor === this.selectedDoctorName
  //       ); // in case of string
  //     });
  //   }

  //   // Now apply date filter
  //   if (this.activeFilter === 'today') {
  //     const today = new Date().toISOString().split('T')[0];
  //     this.filteredCases = baseList.filter((patient) => {
  //       const createdAt = patient?.createdAt || patient?.created_at;
  //       if (!createdAt) return false;
  //       const patientDate = new Date(createdAt).toISOString().split('T')[0];
  //       return patientDate === today;
  //     });
  //   } else if (this.activeFilter === 'dateRange') {
  //     if (!this.startDate || !this.endDate) {
  //       this.filteredCases = [];
  //       return;
  //     }

  //     const start = new Date(this.startDate);
  //     const end = new Date(this.endDate);
  //     end.setHours(23, 59, 59, 999);

  //     this.filteredCases = baseList.filter((patient) => {
  //       const createdAt = patient?.createdAt || patient?.created_at;
  //       if (!createdAt) return false;
  //       const patientDate = new Date(createdAt);
  //       return patientDate >= start && patientDate <= end;
  //     });
  //   } else {
  //     // Fallback if no filter selected (should not happen)
  //     this.filteredCases = baseList;
  //   }
  // }

  applyFilters() {
    let baseList = this.opdcases;
    const text = this.searchText.toLowerCase();

    if (this.selectedDoctorName) {
      baseList = baseList.filter(
        (patient) =>
          patient.consulting_Doctor?.name === this.selectedDoctorName ||
          patient.consulting_Doctor === this.selectedDoctorName
      );
    }

    baseList = baseList.filter((data) => {
      const mobile =
        data.uniqueHealthIdentificationId?.mobile_no?.toLowerCase() || '';
      const patientName =
        data.uniqueHealthIdentificationId?.patient_name?.toLowerCase() || '';
      const uhid = data.uniqueHealthIdentificationId?.uhid?.toLowerCase() || '';

      const matchesSearch =
        mobile.includes(text) ||
        patientName.includes(text) ||
        uhid.includes(text);

      return matchesSearch;
    });

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      baseList = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        return (
          createdAt && new Date(createdAt).toISOString().split('T')[0] === today
        );
      });
    } else if (this.activeFilter === 'dateRange') {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      baseList = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        const date = new Date(createdAt);
        return date >= start && date <= end;
      });
    }

    // Apply pagination manually here
    this.totalPages = Math.ceil(baseList.length / this.recordsPerPage);
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    this.filteredCases = baseList.slice(startIndex, endIndex);
  }

  viewPatient(patientId: string): void {
    this.opdService.getOPDcaseById(patientId).subscribe({
      next: (res: any) => {
        this.selectedPatient = res.outpatientCases;
      },
      error: (err) => {
        console.error('Error loading patient:', err);
      },
    });
  }

  closeModal(): void {
    this.selectedPatient = null;
  }

  editOpdcase(opdcaseid: string) {
    this.router.navigate(['/opd/opd'], {
      queryParams: { _id: opdcaseid },
    });
  }

  deleteOpdcase(opdcaseid: string) {
    if (!opdcaseid) return;
    this.opdService.deleteOPDcase(opdcaseid).subscribe({
      next: () => {
        alert('OPD Case deleted successfully');
        this.opdcases = this.opdcases.filter((symp) => symp._id !== opdcaseid);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error deleting OPD case:', err);
      },
    });
  }
}
