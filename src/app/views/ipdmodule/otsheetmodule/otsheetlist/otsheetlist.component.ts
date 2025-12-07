import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IpdService } from '../../ipdservice/ipd.service';
// import Swal from 'sweetalert2';
import { DaterangeComponent } from "../../../daterange/daterange.component";

@Component({
  selector: 'app-otsheetlist',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './otsheetlist.component.html',
  styleUrl: './otsheetlist.component.css',
})
export class OtsheetlistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  otcases: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;

  // Using string to bind to radio buttons directly
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];
  module: string = '';

  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private ipdservice: IpdService,
    private router: Router
  ) {}

  userPermissions: any = {};

  ngOnInit(): void {
    // Load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'oprationTheatresheet'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // Initialize date range
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    this.startDate = todayString;
    this.endDate = todayString;

    // Initialize filter form
    this.filterForm = this.fb.group({
      recordsPerPage: [this.recordsPerPage],
      searchText: [''],
    });

    // Subscribe to filter changes
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
    });

    this.loadOtSheet();
    setInterval(() => {
      this.loadOtSheet();
    }, 6000);

    // Fetch operation theatre sheets
  }

  loadOtSheet() {
    this.ipdservice.getoprationTheatresheet().subscribe({
      next: (res) => {
        // Flatten each surgery into its own object
        this.otcases = res.flatMap((patient: any) => {
          if (Array.isArray(patient.operationTheatresheets)) {
            return patient.operationTheatresheets.map((sheet: any) => ({
              ...patient,
              operationTheatresheets: sheet,
            }));
          } else if (patient.operationTheatresheets) {
            // If it's a single object
            return [
              {
                ...patient,
                operationTheatresheets: patient.operationTheatresheets,
              },
            ];
          } else {
            return [];
          }
        });

        console.log('🚀 ~ Flattened OT Cases:', this.otcases);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error fetching operation theatre sheets:', err);
      },
    });
  }

  //    applyFilters() {
  //   let baseList = this.otcases;

  //   if (this.activeFilter === 'today') {
  //     const today = new Date().toISOString().split('T')[0];
  //     this.filteredCases = baseList.filter(patient => {
  //       const createdAt = patient?.operationTheatresheets
  // ?.createdAt || patient?.operationTheatresheets
  // ?.created_at;
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

  //     this.filteredCases = baseList.filter((patient :any) => {
  //       const createdAt = patient?.createdAt || patient?.created_at;
  //       if (!createdAt) return false;
  //       const patientDate = new Date(createdAt);
  //       return patientDate >= start && patientDate <= end;
  //     });
  //   } else {
  //     this.filteredCases = baseList;
  //   }
  // }

   handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  applyFilters() {
    let baseList = this.otcases;
    const text = (this.searchText || '').toLowerCase();

    if (text) {
      baseList = baseList.filter((data) => {
        const mobile = data.mobile_no?.toLowerCase() || '';
        const patientName = data.patient_name?.toLowerCase() || '';
        const uhid = data.uhid?.toLowerCase() || '';

        return (
          mobile.includes(text) ||
          patientName.includes(text) ||
          uhid.includes(text) 
        );
      });
    }

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      this.filteredCases = baseList.filter((entry: any) => {
        const createdAt =
          entry?.operationTheatresheets?.createdAt ||
          entry?.operationTheatresheets?.surgeryDate;
        if (!createdAt) return false;
        const entryDate = new Date(createdAt).toISOString().split('T')[0];
        return entryDate === today;
      });
    } else if (this.activeFilter === 'dateRange') {
      if (!this.startDate || !this.endDate) {
        this.filteredCases = [];
        return;
      }

      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);

      this.filteredCases = baseList.filter((entry: any) => {
        const createdAt =
          entry?.operationTheatresheets?.createdAt ||
          entry?.operationTheatresheets?.surgeryDate;
        if (!createdAt) return false;
        const entryDate = new Date(createdAt);
        return entryDate >= start && entryDate <= end;
      });
    } else {
      this.filteredCases = baseList;
    }

    // Optional: apply search filter
    const search =
      this.filterForm.get('searchText')?.value?.toLowerCase() || '';
    if (search) {
      this.filteredCases = this.filteredCases.filter((entry: any) =>
        entry?.patient_name?.toLowerCase().includes(search)
      );
    }
  }

 async deleteOT(otid: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!otid) {
      console.error('OT ID is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This Operation Theatre record will be permanently deleted.',
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
        this.ipdservice.deleteoprationTheatresheet(otid).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'OT record has been deleted successfully.',
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
              (item) => item?.operationTheatresheets?._id !== otid
            );
          },
          error: (err) => {
            console.error('Error deleting OT record:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: 'There was an error deleting the OT record.',
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
