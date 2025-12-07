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
import { LoaderComponent } from '../../../loader/loader.component';
import { DaterangeComponent } from '../../../daterange/daterange.component';
import { DischargecardComponent } from '../../dischargecard/dischargecard.component';
import { DateToISTPipe } from "../../../../pipe/dateformatter/date-to-ist.pipe";

@Component({
  selector: 'app-ipddischargelist',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoaderComponent,
    DischargecardComponent,
    DateToISTPipe
],
  templateUrl: './ipddischargelist.component.html',
  styleUrl: './ipddischargelist.component.css',
})
export class IpddischargelistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  ipdcases: any[] = [];
  intermbill: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  selectedPatient: any = null;
  // Using string to bind to radio buttons directly
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];
  selectedDischargePatient: any = null;
  billingDetails: any = null;
  showDischargeDetailSection = false;
  module: string = '';
  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();

  viewDischargeDetails(patient: any) {
    this.selectedDischargePatient = patient;
    this.showDischargeDetailSection = true;

    // Example: Fetch related inter bill details by patient name or ID (adjust as per your backend)
    this.ipdService
      .getPatientIntermByName(patient.patientName)
      .subscribe((billRes) => {
        this.billingDetails = billRes;
      });
  }

  constructor(
    private ipdService: IpdService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'discharge'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // load permissions
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    this.startDate = todayString;
    this.endDate = todayString;

    this.filterForm = this.fb.group({
      recordsPerPage: [this.recordsPerPage],
      searchText: [''],
    });

    this.loadIpdcase();

    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadIpdcase(); // reload when filter changes
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadIpdcase(); // reload when search changes
    });
  }

  loadIpdcase() {
    this.ipdService.getipddischargeurl().subscribe((res) => {
      const response = res.discharges || [];
      console.log('🚀 ~ IpddischargelistComponent ~ Discharge Response:', response);

      this.ipdcases = response.map((item: any) => ({
        _id: item?._id,
        ipdNumber: item.inpatientCaseId?.inpatientCaseNumber,
        patientName: item.uniqueHealthIdentificationId?.patient_name || '',
        gender: item.uniqueHealthIdentificationId?.gender || '',
        age: item.uniqueHealthIdentificationId?.age || '',
        admissionDate: item.uniqueHealthIdentificationId?.dor || '',
        admissionTime: item.uniqueHealthIdentificationId?.dot || '',
        dateOfDischarge: item?.createdAt || '',
        roomNumber: item.inpatientCaseId?.room_id?.roomNumber || '',
        bedNumber: item.inpatientCaseId?.bed_id?.bed_number || '',
        doctorConsulted: item.inpatientCaseId?.admittingDoctorId?.name || '',
      }));

      this.totalPages = 1;
      this.applyFilters();
    });
  }

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  applyFilters() {
    let baseList = this.ipdcases;

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      this.filteredCases = baseList.filter((patient) => {
        const dischargeDate = patient.dateOfDischarge;
        if (!dischargeDate) return false;
        const patientDate = new Date(dischargeDate).toISOString().split('T')[0];
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
        const dischargeDate = patient.dateOfDischarge;
        if (!dischargeDate) return false;
        const patientDate = new Date(dischargeDate);
        return patientDate >= start && patientDate <= end;
      });
    } else {
      this.filteredCases = baseList;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadIpdcase(); // Fetch new page data
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadIpdcase(); // Fetch new page data
    }
  }

  editPatientipd(ipdid: any) {
    // alert(`Viewing details of ${ipdid}`);

    this.router.navigate(['ipd/ipdadmission'], {
      queryParams: { _id: ipdid },
    });
  }
  async deletPatientipd(ipdid: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!ipdid) {
      console.error('IPD Case ID is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This IPD Case will be permanently deleted.',
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
        this.ipdService.deleteIPDcase(ipdid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'IPD Case has been deleted successfully.',
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
              (symp) => symp._id !== ipdid
            );
          },
          error: (err) => {
            console.error('Error deleting IPD Case:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              // text: 'There was an error deleting the IPD Case.',
              text:
                err?.error?.message ||
                'There was an error deleting the IPD Discharge Case.',
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

  viewPatient(patient: any): void {
    this.selectedPatient = patient;
  }

  closeModal(): void {
    this.selectedPatient = null;
  }
}
