import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OpdService } from '../../opdservice/opd.service';
// import Swal from 'sweetalert2';
import { DaterangeComponent } from "../../../daterange/daterange.component";
@Component({
  selector: 'app-depositlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,

  ],
  templateUrl: './depositlist.component.html',
  styleUrl: './depositlist.component.css',
})
export class DepositlistComponent {
  recordsPerPage: number = 10;
  searchText: string = '';
  opddeposit: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  selectedPatient: any = null;
  // Using string to bind to radio buttons directly
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];
  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();


  constructor(
    private opdService: OpdService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  userPermissions: any = {};

  ngOnInit(): void {
    this.activeFilter = 'today';
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'outpatientDeposit'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    this.startDate = todayString;
    this.endDate = todayString;

    this.filterForm = this.fb.group({
      recordsPerPage: [this.recordsPerPage],
      searchText: [''],
    });

    this.loadOpddeposit();
    setInterval(() => {
      this.loadOpddeposit();
    }, 6000);

    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadOpddeposit();
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadOpddeposit();
    });
  }

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  loadOpddeposit() {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';
    const page = this.currentPage;

    this.opdService.getopdopddepositapis(page, limit, search).subscribe(
      (res) => {
        if (res) {
          this.opddeposit = res.data ? res.data : res;
          this.totalPages = res.totalPages ?? 1;
          this.applyFilters();
        } else {
          // fallback if API is not returning in expected format
          this.opddeposit = res;
          this.totalPages = 1;
        }

        console.log(`Loaded page ${this.currentPage} of ${this.totalPages}`);
      },
      (err) => {
        console.error('Error loading deposit list:', err);
      }
    );
  }

  applyFilters() {
    let baseList = this.opddeposit;

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

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOpddeposit();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOpddeposit();
    }
  }

  editPatientdeposit(depositid: string) {
    this.router.navigate(['/opd/deposit'], {
      queryParams: { _id: depositid },
    });
  }

 async deletPatientdeposit(depositid: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!depositid) {
      console.error('Deposit ID is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This deposit will be permanently deleted.',
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
        this.opdService.deleteopdopddepositapis(depositid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'OPD Deposit has been deleted successfully.',
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
            this.filteredCases = this.filteredCases.filter(
              (item) => item._id !== depositid
            );
          },
          error: (err) => {
            console.error('Error deleting deposit:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              // text: 'There was an error deleting the deposit.',
              text:
                err?.error?.message ||
                'There was an error deleting the deposit.',
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
