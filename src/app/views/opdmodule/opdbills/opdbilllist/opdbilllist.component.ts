import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OpdService } from '../../opdservice/opd.service';
// import Swal from 'sweetalert2';
import { PatientInfoComponentComponent } from "../../../../component/opdcustomfiles/patient-info-component/patient-info-component.component";
import { debounceTime } from 'rxjs/operators';
import { LoaderComponent } from "../../../loader/loader.component";
import { MasterService } from '../../../mastermodule/masterservice/master.service';

@Component({
  selector: 'app-opdbilllist',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PatientInfoComponentComponent,
    LoaderComponent,
  ],
  templateUrl: './opdbilllist.component.html',
  styleUrl: './opdbilllist.component.css',
})
export class OpdbilllistComponent implements OnInit {
  recordsPerPage: number = 10;
  searchText: string = '';
  opdbill: any[] = [];
  filteredCases: any[] = [];
  currentPage = 1;
  totalPages = 1;
  selectedPatient: any = null;

  filterForm!: FormGroup;
  activeFilter: 'today' | 'dateRange' | 'all' = 'today';
  startDate: string = '';
  endDate: string = '';

  userPermissions: any = {};
  patientid: any = '';
  opdCases: any[] = [];
  selectedDoctor: any = null;
  entryByUser: any = '';
  module: string = '';
  selectedDoctorName: string = '';
  cases: any[] = [];

  constructor(
    private opdService: OpdService,
    private router: Router,
    private fb: FormBuilder,
    private masterService: MasterService
  ) {}

  ngOnInit() {
    this.opdService.getOPDcase().subscribe((caseRes) => {
      const cases = caseRes.outpatientCases || caseRes.data || [];
      this.cases = cases;
      console.log(this.cases);
    });

    // Load permissions
    const userData = localStorage.getItem('authUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.entryByUser = user?.name || ''; // Make sure the user object has a 'name' field
      } catch (e) {
        console.error('Error parsing authUser from localStorage:', e);
      }
    }

    console.log('entry', this.entryByUser);

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'outpatientBill'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    const today = new Date().toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;

    // Initialize form
    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: [''],
    });

    this.loadOpdbill();
    // setInterval(() => {
    //   this.loadOpdbill();
    // }, 6000);

    // Listen to filter changes
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadOpdbill();
    });

    this.filterForm
      .get('searchText')
      ?.valueChanges.pipe(debounceTime(400))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadOpdbill();
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
      this.loadOpdbill(); // show all patients
      return;
    }

    if (searchText.trim().length < 2) {
      this.filteredDoctors = [];
      return;
    }

    // call API when typing
    this.masterService.getDoctorsByName(searchText).subscribe((res: any) => {
      this.filteredDoctors = res.data?.data || [];
    });
  }

  onDoctorSelected(selectedDoctorName: string) {
    this.selectedDoctorName = selectedDoctorName;
    this.doctorSearchText = selectedDoctorName;
    this.filteredDoctors = []; // close dropdown
    this.currentPage = 1;
    this.loadOpdbill();
  }

  filteredData: any[] = [];
  loadOpdbill() {
    // const limit =
    //   this.activeFilter === 'today'
    //     ? 90
    //     : this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';
    const page = this.currentPage;
    const limit = 9999;

    // 1️⃣ Fetch bills first
    this.opdService.getOPDbill(1, limit, search).subscribe((res) => {
      this.opdbill = res.data.data || [];
      this.totalPages = res.data.totalPages;

      this.opdbill = this.opdbill.map((bill) => {
        const caseId = bill.patientUhid?._id;
        const matchedCase = this.cases.filter(
          (c: any) => c.uniqueHealthIdentificationId?._id === caseId
        );

        // Doctor name extraction (adjust the path as per your API)
        // const doctorName = matchedCase?.[0]?.consulting_Doctor?.name || 'N/A';

        return {
          ...bill,
          matchedCase,
        };
      });
      console.log('opdbill', this.opdbill);

      // 4️⃣ Apply filters after merging
      this.applyFilters();

    });
  }


  applyFilters() {
    let baseList = this.opdbill;
    const text = this.searchText.toLowerCase();
    console.log('baselist', baseList);

    if (this.selectedDoctorName) {
      baseList = baseList.filter(
        (patient) =>
          patient.consulting_Doctor?.name === this.selectedDoctorName ||
          patient.consulting_Doctor === this.selectedDoctorName
      );
    }

    baseList = baseList.filter((data) => {
      const mobile = data.patientUhid?.mobile_no?.toLowerCase() || '';
      const patientName = data.patientUhid?.patient_name?.toLowerCase() || '';
      const uhid = data.patientUhid?.uhid?.toLowerCase() || '';

      const matchesSearch =
        mobile.includes(text) ||
        patientName.includes(text) ||
        uhid.includes(text);

      return matchesSearch;
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

      this.filteredCases = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= start && patientDate <= end;
      });

    } else {
      this.filteredCases = baseList;
    }

    this.totalPages = Math.ceil(
      this.filteredCases.length / this.recordsPerPage
    );
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    this.filteredCases = this.filteredCases.slice(startIndex, endIndex);

    console.log('✅ Filtered Cases:', this.filteredCases);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOpdbill();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOpdbill();
    }
  }

  viewPatient(patientId: string): void {
    if (!patientId) return;
    this.opdService.getOPDBillById(patientId).subscribe({
      next: (res) => {
        this.selectedPatient = res.data;
        this.patientid = this.selectedPatient?.patientUhid?._id || '';
        this.getPatientDoctor();
        console.log('Selected Patient:', this.selectedPatient);
      },
      error: (err) => {
        console.error('Error fetching patient:', err);
      },
    });
  }

  getPatientDoctor() {
    // if (!this.selectedPatient?.consulting_Doctor?._id) return;
    if (!this.patientid) return;
    // console.log('Fetching doctor for patient ID:', this.patientid);
    this.opdService.getOPDcase().subscribe({
      next: (res) => {
        this.opdCases = res.outpatientCases;
        // console.log('Case Data:', this.opdCases);
        const patientCase = this.opdCases.find(
          (caseItem) =>
            caseItem.uniqueHealthIdentificationId?._id === this.patientid
        );
        // console.log('Patient Case:', patientCase);
        this.selectedDoctor = patientCase?.consulting_Doctor?.name || null;

        //==> Add selectedDoctor to selectedPatient object
        if (this.selectedPatient) {
          this.selectedPatient.consulting_Doctor = this.selectedDoctor;
          this.selectedPatient.entryByUser = this.entryByUser;
        }
      },
      error: (err) => {
        console.error('Error fetching doctor:', err);
      },
    });
  }

  closeModal(): void {
    this.selectedPatient = null;
  }

  editopdbill(opdbillid: string) {
    this.router.navigate(['/opd/opdbill', opdbillid]);
  }

  async deletopdbill(opdbillid: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!opdbillid) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This OPD bill will be permanently deleted.',
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
        this.opdService.deleteOPDbill(opdbillid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'OPD bill has been deleted successfully.',
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
              (bill) => bill._id !== opdbillid
            );
          },
          error: (err) => {
            console.error('Error deleting OPD bill:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text:
                err?.error?.message ||
                'There was an error deleting the OPD bill.',
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
}
