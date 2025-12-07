import { LoaderComponent } from './../../../loader/loader.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  selector: 'app-ipddepositlist',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, LoaderComponent],
  templateUrl: './ipddepositlist.component.html',
  styleUrl: './ipddepositlist.component.css',
})
export class IpddepositlistComponent implements OnInit {
  recordsPerPage: number = 25;
  searchText: string = '';
  ipddeposit: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  module: string = '';

  // Map for UHID to patient object
  uhidToPatientMap: { [key: string]: any } = {};
  uhidToBedMap: { [key: string]: string } = {};
  uhidToPatientUHID: { [key: string]: string } = {};
  selectedPatient: any = null;

  // Using string to bind to radio buttons directly
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];
  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();

  constructor(
    private ipdService: IpdService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  userPermissions: any = {};

  ngOnInit(): void {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    this.startDate = todayString;
    this.endDate = todayString;

    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inpatientDeposit'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // load permissions
    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: [''],
    });

    // Subscribe to filters
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadData();
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadData();
    });

    this.loadData();
    setInterval(() => {
      this.loadData();
    }, 6000);
  }

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  loadData() {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';
    const page = this.currentPage;
    this.ipdService.getipddepositapis(page, limit, search).subscribe((res) => {
      this.ipddeposit = res.data.deposits;
      this.totalPages = res.data.totalPages;

      // Fetch IPD cases to map UHIDs
      this.ipdService.getIPDcase(1, 1000).subscribe((caseRes) => {
        const ipdcases = caseRes.data.inpatientCases;
        this.uhidToPatientMap = {};
        this.uhidToPatientUHID = {};
        this.uhidToBedMap = {};
        this.applyFilters();
        ipdcases.forEach((ipdcase: any) => {
          const uhid = ipdcase.uniqueHealthIdentificationId?._id;
          this.uhidToBedMap[uhid] = ipdcase.bed_id?.bed_number || 'N/A';

          if (uhid) {
            this.uhidToPatientMap[uhid] = ipdcase.uniqueHealthIdentificationId;
            this.uhidToPatientUHID[uhid] =
              ipdcase.uniqueHealthIdentificationId.uhid;
          }

          // console.log("🚀 ~ IpddepositlistComponent ~ ipdcases.forEach ~  this.uhidToPatientUHID[uhid]:",  this.uhidToPatientUHID[uhid])
        });
      });
    });
  }

  applyFilters() {
    let baseList = this.ipddeposit;
    const text = (this.searchText || '').toLowerCase();

    if (text) {
      baseList = baseList.filter((data) => {
        const depositor = data.depositorFullName?.toLowerCase() || '';
        const patientName =
          this.getPatientName(data.uniqueHealthIdentificationId)?.toLowerCase() ||
          '';
        const uhid = (this.uhidToPatientUHID[data.uniqueHealthIdentificationId])?.toLowerCase() || '';

        return (
          depositor.includes(text) ||
          patientName.includes(text) ||
          uhid.includes(text)
        );
      });
    }

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
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadData();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadData();
    }
  }

  editPatientipd(ipdid: any) {
    this.router.navigate(['ipd/ipddeposit'], {
      queryParams: { _id: ipdid },
    });
  }

 async deletPatientipd(ipdid: string){
    const Swal = (await import('sweetalert2')).default;

    if (!ipdid) {
      console.error('Ipd deposit ID is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This IPD deposit will be permanently deleted.',
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
        this.ipdService.deleteipddepositapis(ipdid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'IPD Deposit has been deleted successfully.',
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

            // Remove from local list
            this.filteredCases = this.filteredCases.filter(
              (symp) => symp._id !== ipdid
            );
          },
          error: (err) => {
            console.error('Error deleting IPD Deposit:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              // text: 'Something went wrong while deleting the IPD deposit.',
              text:
                err?.error?.message ||
                'Something went wrong while deleting the IPD deposit.',

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

  // Helper to get patient name from UHID
  getPatientName(uhid: string): string {
    return this.uhidToPatientMap[uhid]?.patient_name || 'N/A';
  }
}
