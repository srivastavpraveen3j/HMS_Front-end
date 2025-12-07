import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { CustomtimepickerComponent } from '../../../../component/customtimepicker/customtimepicker.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { OpdService } from '../../opdservice/opd.service';
import Swal from 'sweetalert2';
import { OpdappointmentComponent } from '../opdappointment/opdappointment.component';
import { PatientAppointmentComponent } from '../../../../component/opdcustomfiles/patient-appointment/patient-appointment.component';
import { LoaderComponent } from '../../../loader/loader.component';

@Component({
  selector: 'app-opdappointmentquelist',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    PatientAppointmentComponent,
    FormsModule,
    LoaderComponent,
  ],

  templateUrl: './opdappointmentquelist.component.html',
  styleUrl: './opdappointmentquelist.component.css',
})
export class OpdappointmentquelistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  opdappointment: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  selectedPatient: any = null;
  // Using string to bind to radio buttons directly
  activeFilter = 'all';
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];
  doctorFilter: string = '';

  fullFilteredCases: any[] = [];
  displayedCases: any[] = [];
  userPermissions: any = {};

  showSuggestions: boolean = false;
  filteredDoctorSuggestions: string[] = [];
  module: string = '';
  case: string = '';

  constructor(
    private opdService: OpdService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}

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

    const today = new Date();
    // const todayString = today.toISOString().split('T')[0];

    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: [''],
    });
    this.loadOpdappointment();
    setInterval(() => {
      this.loadOpdappointment();
    }, 60000);

    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.applyPagination(); // Add this line
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
    });
  }

  loadOpdappointment() {
    const search = this.filterForm.get('searchText')?.value || '';
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    this.opdService
      .getopdappointmentapis(1, 100000, search)
      .subscribe((res) => {
        const appointments = res?.data?.appointments || [];

        // const processed = appointments
        //   .filter((apt: any) => {
        //     if (!apt.date || !apt.time) return false;
        //     const aptDate = apt.date.split('T')[0];
        //     return aptDate === todayStr;
        //   })
        const processed = appointments
          .filter((apt: any) => {
            if (!apt.date || !apt.time) return false;

            const aptDate = apt.date.split('T')[0];

            return (
              aptDate === todayStr ||
              (apt.status === 'missed' && aptDate === todayStr)
            );
          })
          .map((apt: any) => {
            const dateStr = apt.date.split('T')[0];
            const timeStr =
              apt.time.length === 5 ? apt.time : apt.time.slice(0, 5);
            const dateTimeStr = `${dateStr}T${timeStr}:00`;
            const appointmentTime = new Date(dateTimeStr);

            const diffInMs = now.getTime() - appointmentTime.getTime();

            const isMissedNow =
              diffInMs > 1 * 60 * 1000 && apt.status === 'scheduled';
            const isAlreadyMissed = apt.status === 'missed';

            // 🔥 Call update API only once when appointment becomes missed
            if (isMissedNow) {
              this.markAppointmentAsMissed(apt);
            }

            const isMissed = isMissedNow || isAlreadyMissed;

            return {
              ...apt,
              isMissed,
              appointmentTime,
            };
          });

        // Helper: sort by time ascending
        const sortByTime = (a: any, b: any) =>
          a.appointmentTime.getTime() - b.appointmentTime.getTime();

        const sorted = [
          // 1. Upcoming
          ...processed
            .filter((a: any) => a.status === 'scheduled' && !a.isMissed)
            .sort(sortByTime),

          // 2. Cancelled
          ...processed
            .filter((a: any) => a.status === 'cancelled')
            .sort(sortByTime),

          // 3. Missed
          ...processed
            .filter((a: any) => a.status === 'missed')
            .sort(sortByTime),

          // 4. Done (confirmed)
          ...processed
            .filter((a: any) => a.status === 'confirmed')
            .sort(sortByTime),
        ];

        this.opdappointment = sorted;
        this.fullFilteredCases = sorted;
        this.applyDoctorFilter();
      });
  }

  applyPagination() {
    const perPage = this.filterForm.get('recordsPerPage')?.value || 10;
    const start = (this.currentPage - 1) * perPage;
    const end = start + perPage;

    this.displayedCases = this.filteredCases.slice(start, end);
    this.totalPages = Math.ceil(this.filteredCases.length / perPage);
  }

  //==> filter appointments by today
  applyFilters() {
    let baseList = this.opdappointment;

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];

      this.opdService.getopdappointmentapis(1, 1000, '').subscribe((res) => {
        const list = res?.data?.appointments || [];
        const filtered = list.filter((patient: any) => {
          const date = patient?.date;
          if (!date) return false;
          const patientDate = new Date(date).toISOString().split('T')[0];
          return patientDate === today;
        });

        this.fullFilteredCases = filtered;
        this.filteredCases = filtered;
        this.totalPages = Math.ceil(filtered.length / this.recordsPerPage);
        this.applyPagination();
      });
    } else if (this.activeFilter === 'all') {
      this.fullFilteredCases = baseList;
      this.filteredCases = baseList;
      this.totalPages = Math.ceil(baseList.length / this.recordsPerPage);
      this.applyPagination();
    } else {
      this.fullFilteredCases = baseList;
      this.filteredCases = baseList;
      this.totalPages = Math.ceil(baseList.length / this.recordsPerPage);
      this.applyPagination();
    }
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

  onDoctorFilterChange() {
    const query = this.doctorFilter.toLowerCase();
    this.filteredDoctorSuggestions = this.getAllDoctors().filter((name) =>
      name.toLowerCase().includes(query)
    );
    this.applyDoctorFilter();
  }

  hideSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectDoctor(name: string) {
    this.doctorFilter = name;
    this.showSuggestions = false;
    this.currentPage = 1;
    this.applyDoctorFilter(); //==> apply filter
  }

  formatTimeToAmPm(timeStr: string): string {
    if (!timeStr) return '';

    const [hourStr, minute] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12 || 12; // convert 0 or 12 to 12, 13 to 1, etc.
    return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
  }

  // applyDoctorFilter() {
  //   this.recordsPerPage = this.filterForm.get('recordsPerPage')?.value || 10;
  //   const doctorName = this.doctorFilter.trim().toLowerCase();

  //   let base = this.opdappointment; // already filtered

  //   if (doctorName) {
  //     base = base.filter((item: any) => {
  //       const docName = item?.Consulting_Doctor?.name?.toLowerCase() || '';
  //       return docName.includes(doctorName);
  //     });
  //   }

  //   this.filteredCases = base;
  //   this.totalPages = Math.ceil(
  //     this.filteredCases.length / this.recordsPerPage
  //   );
  //   this.applyPagination();
  // }

  applyDoctorFilter() {
    //==> To show missed badge appointments at the bottom
    this.recordsPerPage = this.filterForm.get('recordsPerPage')?.value || 10;
    const doctorName = this.doctorFilter.trim().toLowerCase();

    let base = this.opdappointment; //==> already filtered

    if (doctorName) {
      base = base.filter((item: any) => {
        const docName = item?.Consulting_Doctor?.name?.toLowerCase() || '';
        return docName.includes(doctorName);
      });
    }

    //==> Re-filter to show missed badge appointments at the bottom
    const sorted = [
      ...base.filter((a) => !a.isMissed),
      ...base.filter((a) => a.isMissed),
    ];

    this.filteredCases = sorted;
    console.log('filtered', this.filteredCases);
    this.totalPages = Math.ceil(sorted.length / this.recordsPerPage);
    this.applyPagination();
  }

  clearDoctorFilter() {
    this.doctorFilter = '';
    this.filteredDoctorSuggestions = [];
    this.currentPage = 1;
    this.applyDoctorFilter(); //==> Re-apply without filter
  }

  getAllDoctors(): string[] {
    const doctors = this.opdappointment
      .map((a) => a.Consulting_Doctor?.name)
      .filter((name, i, self) => name && self.indexOf(name) === i);
    return doctors.sort();
  }

  markAppointmentAsDone(patient: any): void {
    console.log(patient);
    patient.status = 'confirmed'; // ✅ DONE status
    this.opdService.updateopdappointmentapis(patient._id, patient).subscribe({
      next: () => {
        // Optionally update UI or show success toast
      },
      error: (err) => {
        console.error('Error updating appointment:', err);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'There was an error updating the appointment status.',
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

  markAppointmentAsCancelled(patient: any): void {
    patient.status = 'cancelled';
    this.opdService.updateopdappointmentapis(patient._id, patient).subscribe({
      next: () => {
        // patient.isMissed = true;
      },
      error: (err) => {
        console.error('Error marking appointment as missed:', err);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'There was an error cancelling the appointment.',
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

  isCase: boolean = false;
  createCase(patient: any): void {
    this.router.navigate(['/opd/opd'], {
      queryParams: { appointmentId: patient._id },
    });
  }

  markAppointmentAsMissed(apt: any): void {
    apt.status = 'missed'; // ✅ DONE status
    this.opdService.updateopdappointmentapis(apt._id, apt).subscribe({
      next: () => {
        this.loadOpdappointment();
      },
      error: (err) => {
        console.error('Error updating appointment:', err);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'There was an error updating the appointment status.',
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

  notActive: boolean = false;
  markPatientAsCheckin(patient: any): void {
    console.log(patient);

    this.opdService.checkForActiveDoctor().subscribe({
      next: (res) => {
        console.log('Active doctor check result:', res);
        const doc = (res.activeDoctors || []).some(
          (d: any) => d._id === patient.Consulting_Doctor?._id
        );

        if (res.count === 0) {
          this.notActive = true;
          Swal.fire({
            title: 'Doctor is not active',
            text: 'The selected doctor is currently inactive.',
            icon: 'warning',
            customClass: {},
          });
        } else if (res.activeDoctors.length > 0 && !doc) {
          this.notActive = true;
          Swal.fire({
            title: 'Doctor is not assigned',
            text: `The ${patient.Consulting_Doctor?.name} is not active.`,
            icon: 'warning',
            customClass: {},
          });
        } else {
          this.notActive = false;
          patient.isCheckin = true;
          this.opdService
            .updateopdappointmentapis(patient._id, patient)
            .subscribe({
              next: () => {},
              error: (err) => {
                console.error('Error updating appointment:', err);
                Swal.fire({
                  icon: 'error',
                  title: 'Update Failed',
                  text: 'There was an error updating the appointment status.',
                  customClass: {
                    popup: 'hospital-swal-popup',
                    title: 'hospital-swal-title',
                    htmlContainer: 'hospital-swal-text',
                    confirmButton: 'hospital-swal-button',
                  },
                });
              },
            });

          const patientData = {
            doctorId: patient.Consulting_Doctor?._id,
            patientId: patient._id,
            caseId: patient.outpatientcaseId,
            source: patient.source,
            isAppoinmentToQueue: true,
          };

          this.opdService.addPatientToQueue(patientData).subscribe({
            next: () => {
              // Optionally update UI or show success toast
            },
            error: (err) => {
              console.error('Error adding patient to queue:', err);
              Swal.fire({
                icon: 'error',
                title: 'Add Failed',
                text: 'There was an error adding the patient to the queue.',
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
      },
      error: (error: any) => {
        console.error('Error checking for active doctor:', error);
      },
    });
  }

  deletePatientAppointments(appointmentid: string) {
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
            this.filteredCases = this.filteredCases.filter(
              (symp) => symp._id !== appointmentid
            );
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

  viewPatient(patientId: string): void {
    if (!patientId) {
      console.error('No patientId provided');
      return;
    }
    this.opdService.getOpdAppointmentbyid(patientId).subscribe({
      next: (res) => {
        this.selectedPatient = res.data;
        console.log('selectedPatient:', this.selectedPatient);
      },
      error: (err) => {
        console.error('Error fetching patient:', err);
      },
    });
  }

  selectedDoctorId: string = '';
  selectedAppointment: any = {};
  doctors: any[] = [];

  openReassignModal(patient: any) {
    this.selectedAppointment = patient;
    console.log('selected appointment', this.selectedAppointment);
    this.selectedDoctorId = '';
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('reassignModal')
    );
    modal.show();

    this.opdService.checkForActiveDoctor().subscribe({
      next: (res) => {
        const doc = res.activeDoctors;
        this.doctors = doc;
        console.log('active doctor', this.doctors);
      },
      error: (err) => {
        console.error('Error checking for active doctor:', err);
      },
    });
  }

  confirmDoctorAssignment(patient: any, id: string) {
    if (!id) return;

    const patientData = {
      doctorId: id,
      patientId: patient._id,
      caseId: patient.outpatientcaseId,
      source: patient.source,
      isAppoinmentToQueue: true,
    };

    this.opdService.addPatientToQueue(patientData).subscribe({
      next: () => {
        // Optionally update UI or show success toast
        Swal.fire({
          icon: 'success',
          title: 'Patient added to queue!',
          text: 'OPD Appointment has been added to the queue successfully.',
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

        patient.isCheckin = true;
        this.opdService
          .updateopdappointmentapis(patient._id, patient)
          .subscribe({
            next: () => {},
            error: (err) => {
              console.error('Error updating appointment:', err);
              Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'There was an error updating the appointment status.',
                customClass: {
                  popup: 'hospital-swal-popup',
                  title: 'hospital-swal-title',
                  htmlContainer: 'hospital-swal-text',
                  confirmButton: 'hospital-swal-button',
                },
              });
            },
          });
      },
      error: (err) => {
        console.error('Error adding patient to queue:', err);
        Swal.fire({
          icon: 'error',
          title: 'Add Failed',
          text: 'Patient is already in the queue for this doctor and case.',
          customClass: {
            popup: 'hospital-swal-popup',
            title: 'hospital-swal-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-button',
          },
        });
      },
    });

    // Close modal
    const modalEl = document.getElementById('reassignModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
    modal.hide();
  }

  closeModal(): void {
    this.selectedPatient = null;
  }
}
