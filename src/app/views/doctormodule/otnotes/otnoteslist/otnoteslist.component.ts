import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DoctorService } from '../../doctorservice/doctor.service';
// import Swal from 'sweetalert2';
import { LoaderComponent } from "../../../loader/loader.component";

@Component({
  selector: 'app-otnoteslist',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    LoaderComponent,

  ],
  templateUrl: './otnoteslist.component.html',
  styleUrl: './otnoteslist.component.css',
})
export class OtnoteslistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  otnotes: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  selectedPatient: any = null;
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
    private doctorservice: DoctorService,
    private router: Router
  ) {}

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'operationTheatreNotes'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // load permissions

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    this.startDate = todayString;
    this.endDate = todayString;

    this.filterForm = this.fb.group({
      searchText: [''],
    });

    this.loadOtnotes();
    setInterval(() => {
      this.loadOtnotes();
    }, 6000);

    this.filterForm
      .get('searchText')
      ?.valueChanges.subscribe((text: string) => {
        this.searchText = text;
      });
  }

  loadOtnotes() {
    this.doctorservice.getoperationNote().subscribe({
      next: (res) => {
        // console.log("🚀 ~ OtnoteslistComponent ~ this.doctorservice.getoperationNote ~ res:", res)
        this.otnotes = res;
        this.applyFilters();

        console.log(
          '🚀 ~ OtnoteslistComponent ~ this.doctorservice.getoperationNote ~ this.otnotes:',
          this.otnotes
        );
      },
      error: (err) => {
        console.log(
          '🚀 ~ OtnoteslistComponent ~ this.doctorservice.getoperationNote ~ err:',
          err
        );
      },
    });
  }

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  applyFilters() {
    let baseList = this.otnotes;

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

  isSidebarOpen: boolean = false;
  selectedNote: any = null;

  viewDetails(patient: any) {
    this.selectedNote = patient;
    this.isSidebarOpen = true;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  editotnotes(otid: string) {
    // console.log("🚀 ~ OtnoteslistComponent ~ editotnotes ~ otid:", otid)
    this.router.navigate(['/doctor/otnotes'], {
      queryParams: { _id: otid },
    });
  }

 async deleteotnotes(otid: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!otid) {
      console.error('Ot Notes ID is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This OT Notes will be permanently deleted.',
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
        this.doctorservice.deleteoperationNoteapisapis(otid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'OT Note has been deleted successfully.',
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

            // Refresh list after deletion
            this.filteredCases = this.filteredCases.filter(
              (symp) => symp._id !== otid
            );
          },
          error: (err) => {
            console.error('Error deleting OT Notes:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              // text: 'There was an error deleting the OT Notes.',
              text:
                err?.error?.message ||
                'There was an error deleting the OT Notes.',
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
