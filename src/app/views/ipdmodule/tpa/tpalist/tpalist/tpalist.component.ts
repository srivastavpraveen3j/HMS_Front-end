import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
// import Swal from 'sweetalert2';
import { HttpParams } from '@angular/common/http';
import { IpdService } from '../../../ipdservice/ipd.service';
import { LoaderComponent } from "../../../../loader/loader.component";

@Component({
  selector: 'app-tpalist',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, LoaderComponent],
  templateUrl: './tpalist.component.html',
  styleUrl: './tpalist.component.css',
})
export class TpalistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  uhidRecords: any[] = [];
  patientData: any = {}; // Store the selected patient's data
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  allUhidRecords: any[] = []; // store original fetched data
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  ipdcases: any[] = [];
  module: string = '';

  constructor(
    private ipdservice: IpdService,
    private fb: FormBuilder,
    private router: Router
  ) {}
  userPermissions: any = {};

  ngOnInit(): void {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    this.startDate = todayString;
    this.endDate = todayString;

    // Load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'thirdPartyAdministrator'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // Init filter form
    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: [''],
    });

    // Fetch IPD cases first
    this.ipdservice.getIPDcase().subscribe((res) => {
      this.ipdcases = res.data.inpatientCases || res.data;
      this.loadTpa(); // Load TPA after IPD cases are ready
    });

    // Watch filters
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadTpa();
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadTpa();
    });

    setInterval(() => {
      this.loadTpa();
    }, 6000);
  }

  loadTpa() {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', limit.toString());

    if (search) {
      params = search.startsWith('UHID')
        ? params.set('uhid', search)
        : params.set('patient_name', search);
    }

    // Only add filter if explicitly set to 'today'
    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      params = params.set('dor', today);
    }

    if (
      this.activeFilter === 'dateRange' &&
      (!this.startDate || !this.endDate)
    ) {
      console.warn('Date range missing, skipping API call.');
      return;
    }

    this.ipdservice.gettpaurl().subscribe((res) => {
      const tpaData = res.thirdPartyAdministrators || res.data;
      this.totalPages = res.totalPages;

      // 🔄 Merge TPA with IPD case data
      const merged = tpaData.map((tpa: any) => {
        const caseMatch = this.ipdcases.find(
          (ipd: any) => ipd._id === tpa.inpatientCaseId
        );
        return {
          ...tpa,
          patient_name: caseMatch?.uniqueHealthIdentificationId?.patient_name,
          age: caseMatch?.uniqueHealthIdentificationId?.age,
          gender: caseMatch?.uniqueHealthIdentificationId?.gender,
          uhid: caseMatch?.uniqueHealthIdentificationId?.uhid,
          dob: caseMatch?.uniqueHealthIdentificationId?.dob,
          dor: caseMatch?.dor,
          dot: caseMatch?.dot,
          mobile_no: caseMatch?.uniqueHealthIdentificationId?.mobile_no,
          area: caseMatch?.uniqueHealthIdentificationId?.area,
          pincode: caseMatch?.uniqueHealthIdentificationId?.pincode,
        };
      });

      this.allUhidRecords = merged;
      this.applyFilters(); // 🔍 Apply filters after merge
    });
  }

  applyFilters() {
    let records = this.allUhidRecords;

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      this.uhidRecords = records.filter(
        (rec) => new Date(rec.createdAt).toISOString().split('T')[0] === today
      );
    } else if (this.activeFilter === 'dateRange') {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);

      this.uhidRecords = records.filter((rec) => {
        const dor = new Date(rec.createdAt);
        return dor >= start && dor <= end;
      });
    } else {
      this.uhidRecords = records;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTpa();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTpa();
    }
  }

  edittpa(tpaid: string) {
    this.router.navigate(['/ipd/tpa'], {
      queryParams: { _id: tpaid },
    });
  }

  async deletetpa(tpaid: string) {
    const Swal = (await import('sweetalert2')).default;

    // console.log("🚀 ~ TpalistComponent ~ deletetpa ~ tpaid:", tpaid)
    if (!tpaid) {
      console.error('TPA case ID is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This TPA case will be permanently deleted.',
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
        this.ipdservice.deletetpaurl(tpaid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'OPD case has been deleted successfully.',
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

            // Refresh the list
            this.allUhidRecords = this.allUhidRecords.filter(
              (record) => record._id !== tpaid
            );
            this.applyFilters(); // will regenerate uhidRecords correctly
          },
          error: (err) => {
            console.error('Error deleting OPD case:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text:
                err?.error?.message ||
                'There was an error deleting the OPD case.',
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
