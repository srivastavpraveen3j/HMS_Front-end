import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { CustomtimepickerComponent } from '../../../../component/customtimepicker/customtimepicker.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OpdService } from '../../opdservice/opd.service';
// import Swal from 'sweetalert2';
import { OpdappointmentComponent } from "../opdappointment/opdappointment.component";
import { PatientAppointmentComponent } from '../../../../component/opdcustomfiles/patient-appointment/patient-appointment.component';
import { LoaderComponent } from "../../../loader/loader.component";
import { DaterangeComponent } from "../../../daterange/daterange.component";
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { RoleService } from '../../../mastermodule/usermaster/service/role.service';

@Component({
  selector: 'app-opdappointmentlist',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    PatientAppointmentComponent,
    FormsModule,
    LoaderComponent,
  ],
  templateUrl: './opdappointmentlist.component.html',
  styleUrl: './opdappointmentlist.component.css',
})
export class OpdappointmentlistComponent {
  recordsPerPage: number = 10;
  searchText: string = '';
  opdappointment: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  selectedPatient: any = null;
  // Using string to bind to radio buttons directly
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];
  fullFilteredCases: any[] = []; // This holds all matching results
  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();
  selectedDoctorName: string = '';
  doctorId: string = '';
  isrole: string = '';
  isDoctor: boolean = false;

  constructor(
    private opdService: OpdService,
    private router: Router,
    private fb: FormBuilder,
    private masterService: MasterService,
    private role: RoleService
  ) {}

  userPermissions: any = {};
  module: string = '';
  intervalId: any;

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'appointment'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // load permissions

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
      this.loadAppointments(this.doctorId);
    } else {
      this.loadAppointments();
      this.intervalId = setInterval(() => this.loadAppointments(), 60000);
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    this.startDate = todayString;
    this.endDate = todayString;

    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: [''],
    });

    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe((val) => {
      this.recordsPerPage = val;
      this.currentPage = 1;
      this.totalPages = Math.ceil(
        this.fullFilteredCases.length / this.recordsPerPage
      );
      this.applyPagination();
    });

    // this.opdService.getOPDbill(this.currentPage, limit, search).subscribe(res => {
    //   this.opdbill = res.data;
    //   console.log("🚀 ~ UhidComponent ~ this.uhidservice.getUhid ~ this.uhidRecords:", this.opdbill)
    //   this.totalPages = res.totalPages;
    // });

    // this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
    //   this.currentPage = 1;
    //   if (this.isrole === 'doctor') {
    //     this.loadAppointments(this.doctorId);
    //   } else {
    //     this.loadAppointments();
    //   }
    // });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  // loadOpdappointment() {
  //   const search = this.filterForm.get('searchText')?.value || '';

  //   if (this.activeFilter === 'today') {
  //     this.opdService
  //       .getopdappointmentapis(1, 1000, search)
  //       .subscribe((res) => {
  //         const baseList = res?.data?.appointments || [];
  //         const today = new Date().toISOString().split('T')[0];
  //         const filtered = baseList.filter((patient: any) => {
  //           const date = patient?.date;
  //           if (!date) return false;
  //           const patientDate = new Date(date).toISOString().split('T')[0];
  //           return patientDate === today;
  //         });

  //         this.fullFilteredCases = filtered;
  //         this.totalPages = Math.ceil(
  //           this.fullFilteredCases.length / this.recordsPerPage
  //         );
  //         this.applyPagination();
  //       });
  //   } else {
  //     let allAppointments: any[] = [];
  //     let pageNum = 1;
  //     const pageSize = 1000;

  //     const fetchAllPages = () => {
  //       this.opdService
  //         .getopdappointmentapis(pageNum, pageSize, search)
  //         .subscribe((res) => {
  //           const appointments = res?.data?.appointments || [];
  //           allAppointments = [...allAppointments, ...appointments];

  //           const totalPagesFromAPI = res?.data?.totalPages || 1;
  //           if (pageNum < totalPagesFromAPI) {
  //             pageNum++;
  //             fetchAllPages();
  //           } else {
  //             this.opdappointment = allAppointments;

  //             // ✅ Always apply filters (like date range)
  //             this.applyFilters();
  //           }
  //         });
  //     };

  //     fetchAllPages();
  //   }
  // }

  private getRoleBasedDoctorId(): string | undefined {
    return this.isrole === 'doctor' ? this.doctorId : undefined;
  }

  loadAppointments(doctorId?: string) {
    let allAppointments: any[] = [];
    let pageNum = 1;
    const pageSize = 1000;

    const fetchAllPages = () => {
      this.opdService
        .getopdappointmentapis(pageNum, pageSize, '') // 👈 no search here
        .subscribe((res) => {
          const appointments = res?.data?.appointments || [];

          // Filter for doctor role
          const filtered = doctorId
            ? appointments.filter(
                (a: any) =>
                  a.Consulting_Doctor?._id === doctorId ||
                  a.Consulting_Doctor === doctorId
              )
            : appointments;

          allAppointments = [...allAppointments, ...filtered];

          console.log('all', allAppointments);

          const totalPagesFromAPI = res?.data?.totalPages || 1;
          if (pageNum < totalPagesFromAPI) {
            pageNum++;
            fetchAllPages();
          } else {
            // Save the base list
            this.opdappointment = allAppointments;

            // Apply local filters (search/date/etc.)
            this.applyFilters();
          }
        });
    };

    fetchAllPages();
  }

  applyPagination() {
    const start = (this.currentPage - 1) * this.recordsPerPage;
    const end = start + this.recordsPerPage;
    this.filteredCases = this.fullFilteredCases.slice(start, end);
  }

  doctorSearchText: string = '';
  filteredDoctors: any[] = [];

  onDoctorSearchChange(searchText: string) {
    if (searchText.trim().length === 0) {
      // cleared → reset everything
      this.filteredDoctors = [];
      this.selectedDoctorName = '';
      this.currentPage = 1;
      // this.loadAppointments(); // show all patients
      this.loadAppointments(this.getRoleBasedDoctorId());
      return;
    }

    if (searchText.trim().length < 2) {
      this.filteredDoctors = [];
      return;
    }

    this.role.getusers(1, 10, searchText).subscribe((res: any) => {
      const doctors = res.filter((u: any) => u.role?.name === 'doctor') || [];
      this.filteredDoctors = doctors;
      console.log('filtered', this.filteredDoctors);
    });
  }

  onDoctorSelected(selectedDoctorName: string) {
    this.selectedDoctorName = selectedDoctorName;
    this.doctorSearchText = selectedDoctorName;
    this.filteredDoctors = [];
    this.currentPage = 1;
    // this.loadAppointments();
    this.loadAppointments(this.getRoleBasedDoctorId());
  }

  // applyFilters() {
  //   let baseList = [...this.opdappointment];
  //   const text = this.searchText.toLowerCase();
  //   // this.currentPage = 1;

  //   baseList = baseList.filter((data) => {
  //     const mobile = data.uhid?.mobile_no?.toLowerCase() || '';
  //     const patientName = data.uhid?.patient_name?.toLowerCase() || '';
  //     const uhid = data.uhid?.uhid?.toLowerCase() || '';

  //     const matchesSearch =
  //       mobile.includes(text) ||
  //       patientName.includes(text) ||
  //       uhid.includes(text);

  //     return matchesSearch;
  //   });

  //   if (this.activeFilter === 'dateRange') {
  //     if (!this.startDate || !this.endDate) {
  //       this.fullFilteredCases = [];
  //       this.filteredCases = [];
  //       return;
  //     }

  //     const start = new Date(this.startDate);
  //     const end = new Date(this.endDate);
  //     end.setHours(23, 59, 59, 999);

  //     this.fullFilteredCases = baseList.filter((patient: any) => {
  //       const date = patient?.date;
  //       if (!date) return false;
  //       const patientDate = new Date(date);
  //       return patientDate >= start && patientDate <= end;
  //     });
  //   } else {
  //     this.fullFilteredCases = baseList;
  //   }

  //   this.totalPages = Math.ceil(
  //     this.fullFilteredCases.length / this.recordsPerPage
  //   );

  //   // ✅ This is crucial — do the actual slicing
  //   this.applyPagination();
  // }

  applyFilters() {
    let baseList = [...this.opdappointment];
    const text = (this.searchText || '').toLowerCase();

    if (text) {
      baseList = baseList.filter((data) => {
        const mobile = data.uhid?.mobile_no?.toLowerCase() || '';
        const patientName = data.uhid?.patient_name?.toLowerCase() || '';
        const uhid = data.uhid?.uhid?.toLowerCase() || '';
        return (
          mobile.includes(text) ||
          patientName.includes(text) ||
          uhid.includes(text)
        );
      });
    }

    if (this.selectedDoctorName) {
      baseList = baseList.filter(
        (patient) =>
          patient.Consulting_Doctor?.name === this.selectedDoctorName ||
          patient.Consulting_Doctor === this.selectedDoctorName
      );
    }

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      baseList = baseList.filter((patient) => {
        const date = patient?.date;
        if (!date) return false;
        const patientDate = new Date(date).toISOString().split('T')[0];
        return patientDate === today;
      });
    }

    if (this.activeFilter === 'dateRange' && this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      baseList = baseList.filter((patient) => {
        const date = patient?.date;
        if (!date) return false;
        const patientDate = new Date(date);
        return patientDate >= start && patientDate <= end;
      });
    }

    this.fullFilteredCases = baseList;
    this.totalPages = Math.ceil(
      this.fullFilteredCases.length / this.recordsPerPage
    );

    console.log('object', this.fullFilteredCases);
    this.applyPagination();
  }

  setFilterType(type: 'today' | 'dateRange') {
    this.activeFilter = type;
    this.currentPage = 1;
    // this.loadAppointments();
    this.loadAppointments(this.getRoleBasedDoctorId());
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  clearDoctorFilter() {
    this.doctorSearchText = '';
    this.filteredDoctors = [];
    this.currentPage = 1;
    this.onDoctorSearchChange(this.doctorSearchText); //==> Re-apply without filter
  }

  formatTimeToAmPm(timeStr: string): string {
    if (!timeStr) return '';

    const [hourStr, minute] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12 || 12; // convert 0 or 12 to 12, 13 to 1, etc.
    return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
  }

  editPatientappointments(appointmentid: string) {
    this.router.navigate(['/opd/opdappointment'], {
      queryParams: { _id: appointmentid },
    });
  }

  async deletPatientappointments(appointmentid: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!appointmentid) {
      console.error('Appointment ID is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This OPD Appointment will be permanently deleted.',
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
        this.opdService.deleteopdappointmentapis(appointmentid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'OPD Appointment has been deleted successfully.',
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
            this.fullFilteredCases = this.fullFilteredCases.filter(
              (symp) => symp._id !== appointmentid
            );
            this.applyPagination();
          },
          error: (err) => {
            console.error('Error deleting OPD Appointment:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: 'There was an error deleting the OPD Appointment.',
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

  // pf pasrt
  viewPatient(patientId: string): void {
    if (!patientId) {
      console.error('No patientId provided');
      return;
    }
    this.opdService.getOpdAppointmentbyid(patientId).subscribe({
      next: (res) => {
        console.log('Full response:', res);
        // console.log("🚀 ~ OpdappointmentlistComponent ~ this.opdService.getOpdAppointmentbyid ~ res:", res)
        this.selectedPatient = res.data; // Adjust if your data is under different key
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

  hasModuleAccess(
    module: string,
    action: 'read' | 'create' | 'update' | 'delete' = 'read'
  ): boolean {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    return permissions.some(
      (perm: any) =>
        perm.moduleName === module && perm.permissions?.[action] === 1
    );
  }
}
