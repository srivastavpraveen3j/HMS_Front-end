import { Component } from '@angular/core';
import { UhidService } from '../service/uhid.service';
import { BarcodeDialogComponent } from '../../../component/barcode-dialog/barcode-dialog.component'; // Adjust the path accordingly
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MasterService } from '../../mastermodule/masterservice/master.service';
// import Swal from 'sweetalert2';
import { HttpParams } from '@angular/common/http';
import { LoaderComponent } from '../../loader/loader.component';
import { debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { OpdService } from '../../opdmodule/opdservice/opd.service';
import { IpdService } from '../../ipdmodule/ipdservice/ipd.service';

@Component({
  selector: 'app-uhid',
  templateUrl: './uhid.component.html',
  styleUrls: ['./uhid.component.css'],
  standalone: true,
  imports: [
    BarcodeDialogComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    LoaderComponent,
  ], // Import the BarcodeDialogComponent here
})
export class UhidComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  uhidRecords: any[] = [];
  modalOpen: boolean = false;
  patientData: any = {}; // Store the selected patient's data
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  allUhidRecords: any[] = []; // store original fetched data
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  module: string = '';
  showNoDataMessage: boolean = false;
  paginatedUhidRecords: any[] = [];

  constructor(
    private uhidservice: UhidService,
    private masterService: MasterService,
    private fb: FormBuilder,
    private router: Router,
    private opdservice: OpdService,
    private ipdservice: IpdService
  ) {}
  userPermissions: any = {};

  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.onDateRangeChange(); // or apply filtering etc.
  }

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
      (perm: any) => perm.moduleName === 'uhid'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // load permissions

    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: [''],
    });

    this.loadUhidRecords();
    this.loadOpdcase();
    setInterval(() => {
      this.loadUhidRecords();
    }, 60000);

    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      // this.loadUhidRecords();
      this.updatePaginatedRecords();
    });

    this.filterForm
      .get('searchText')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadUhidRecords();
      });
  }

  loadUhidRecords() {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';

    let baseParams = new HttpParams().set('limit', limit.toString());

    // if (search) {
    //   if (search.startsWith('UHID')) {
    //     baseParams = baseParams.set('uhid', search);
    //   } else {
    //     baseParams = baseParams.set('patient_name', search);
    //   }
    // }

    if (search) {
      baseParams = baseParams.set('search', search);
    }

    // For dateRange: fetch all pages
    if (this.activeFilter === 'dateRange' || 'all') {
      if (!this.startDate || !this.endDate) {
        console.warn(
          'Date range selected but missing dates — skipping API call.'
        );
        return;
      }

      // First, fetch page 1 to get total pages
      this.uhidservice
        .getUhidWithParams(baseParams.set('page', '1'))
        .subscribe((res1) => {
          const totalPages = res1.totalPages;
          const allRecords = res1.uhids || res1.data || [];

          const requests = [];
          for (let i = 2; i <= totalPages; i++) {
            const pagedParams = baseParams.set('page', i.toString());
            requests.push(this.uhidservice.getUhidWithParams(pagedParams));
          }

          if (requests.length === 0) {
            this.allUhidRecords = allRecords;
            this.applyFilters();
            return;
          }

          forkJoin(requests).subscribe((responses) => {
            for (const res of responses) {
              const more = res.uhids || res.data || [];
              allRecords.push(...more);
            }
            this.allUhidRecords = allRecords;
            this.applyFilters();
          });
        });
    } else {
      // Other filters (like 'today') can be paginated
      let params = baseParams.set('page', this.currentPage.toString());

      if (this.activeFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params = params.set('dor', today);
      }

      this.uhidservice.getUhidWithParams(params).subscribe((res) => {
        this.allUhidRecords = res.uhids || res.data || [];
        this.totalPages = res.totalPages;
        this.mergeOpdDoctorsIntoUhid();
        this.tryMergeIpdDoctors();

        this.applyFilters();
      });
    }
  }

  loadDataForUhid(uhid: string) {
    forkJoin({
      uhidRecords: this.uhidservice.getUhidWithParams(
        new HttpParams().set('uhid', uhid)
      ),
      ipdCases: this.ipdservice.getIPDcase(1, 1000, uhid),
    }).subscribe(({ uhidRecords, ipdCases }) => {
      this.allUhidRecords = uhidRecords.uhids || uhidRecords.data || [];
      this.ipdcases = (ipdCases.data?.inpatientCases || []).filter(
        (c: any) => !c.isDischarge
      );
      this.tryMergeIpdDoctors();
      this.applyFilters();
    });
  }

  tryMergeIpdDoctors() {
    if (this.allUhidRecords?.length && this.ipdcases?.length) {
      for (let uhidRecord of this.allUhidRecords) {
        const match = this.ipdcases.find(
          (ipd) =>
            ipd.uniqueHealthIdentificationId &&
            ipd.uniqueHealthIdentificationId.uhid === uhidRecord.uhid
        );

        if (match) {
          uhidRecord.consultingDoctorName =
            match.admittingDoctorId?.name || null;
          uhidRecord.referringDoctorName =
            match.referringDoctorId?.name || null;
          uhidRecord.ipdCaseId = match._id;
        }
      }
    }
  }

  mergeOpdDoctorsIntoUhid() {
    if (!this.allUhidRecords || !this.opdcases) return;

    for (let uhidRecord of this.allUhidRecords) {
      const match = this.opdcases.find(
        (opd) =>
          opd.uniqueHealthIdentificationId &&
          opd.uniqueHealthIdentificationId.uhid === uhidRecord.uhid
      );

      if (match) {
        uhidRecord.consultingDoctorName = match.consulting_Doctor?.name || null;
        uhidRecord.referringDoctorName = match.referringDoctorId?.name || null;
        uhidRecord.opdCaseId = match._id; // optional: to identify the case
      }
    }
  }
  mergeIpdDoctorsIntoUhid() {
    if (!this.allUhidRecords || !this.ipdcases) return; // ✅ use ipdcases

    for (let uhidRecord of this.allUhidRecords) {
      const match = this.ipdcases.find(
        (ipd) =>
          ipd.uniqueHealthIdentificationId &&
          ipd.uniqueHealthIdentificationId.uhid === uhidRecord.uhid
      );

      if (match) {
        uhidRecord.consultingDoctorName = match.admittingDoctorId?.name || null; // correct field
        uhidRecord.referringDoctorName = match.referringDoctorId?.name || null;
        uhidRecord.ipdCaseId = match._id;
      }
    }
  }

  opdcases: any[] = [];
  loadOpdcase() {
    const search = this.filterForm.get('searchText')?.value || '';
    const limit = 9999; // Load all
    this.opdservice.getOPDcase(1, limit, search).subscribe((res: any) => {
      this.opdcases = res.outpatientCases || res || [];
      // const filterNotMedicoData = this.opdcases.filter(
      //   (data) => !data.isMedicoLegalCase
      // );
      console.log();
    });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadUhidRecords();
  }

  ipdcases: any[] = [];

  loadIpdcase(): void {
    const search = this.filterForm.get('searchText')?.value || '';

    this.ipdservice.getIPDcase(1, 1000, search).subscribe((res) => {
      console.log('IPD CASES', res);

      this.ipdcases = res.data.inpatientCases.filter(
        (caseItem: any) => caseItem.isDischarge === false
      );
      // this.mergeIpdDoctorsIntoUhid()
      this.tryMergeIpdDoctors();
      // this.applyFilters();
    });
  }

  onDateRangeChange() {
    if (this.activeFilter === 'dateRange') {
      // Only load when both dates are selected properly
      if (this.startDate && this.endDate) {
        this.currentPage = 1;
        this.loadUhidRecords();
      } else {
        console.log('Start or End date not selected yet → NOT calling API');
      }
    }
  }

  applyTodayFilter() {
    const today = new Date().toISOString().split('T')[0];
    this.uhidRecords = this.allUhidRecords.filter((record) => {
      const dorDate = new Date(record.dor).toISOString().split('T')[0];
      return dorDate === today;
    });
    console.log('🚀 ~ Today Filter Result:', this.uhidRecords);
  }

  applyFilters() {
    let baseList = this.allUhidRecords;

    if (this.activeFilter === 'dateRange') {
      if (!this.startDate || !this.endDate) {
        this.uhidRecords = [];
        this.paginatedUhidRecords = [];
        return;
      }

      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);

      this.uhidRecords = baseList.filter((record) => {
        const dorDate = new Date(record.dor);
        return dorDate >= start && dorDate <= end;
      });
    } else if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      this.uhidRecords = baseList.filter((record) => {
        const dorDate = new Date(record.dor).toISOString().split('T')[0];
        return dorDate === today;
      });
    } else if( this.activeFilter === 'all'){
      this.uhidRecords = this.allUhidRecords;
    }
     else {
      this.uhidRecords = baseList;
    }

    this.totalPages = Math.ceil(
      this.uhidRecords.length /
        (this.filterForm.get('recordsPerPage')?.value || 10)
    );
    // this.currentPage = 1;
    this.updatePaginatedRecords();
  }

  updatePaginatedRecords() {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const startIndex = (this.currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    this.paginatedUhidRecords = this.uhidRecords.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      // this.loadUhidRecords();
      this.updatePaginatedRecords();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      // this.loadUhidRecords();
      this.updatePaginatedRecords();
    }
  }

  openIndex: number | null = null;

  openBarcodePopup(index: number): void {
    this.openIndex = index;
  }

  closeModal(): void {
    this.openIndex = null;
  }

  selectedPatient: any = null;

  edituhid(uhidid: string) {
    // alert(uhidid)

    this.router.navigate(['/adduhid'], {
      queryParams: { _id: uhidid },
    });
  }

  goToOpdCase(data: any) {
    console.log('data', data);
    this.router.navigate(['/opd/opd'], {
      queryParams: { uhid: data._id },
    });
  }

  async deleteduhid(uhidid: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!uhidid) {
      console.error('UHID id is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This UHID will be permanently deleted.',
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
        this.uhidservice.deleteuhid(uhidid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'UHID has been deleted successfully.',
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
            this.uhidRecords = this.uhidRecords.filter(
              (symp) => symp._id !== uhidid
            );
          },
          error: (err) => {
            console.error('Error deleting UHID:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: 'There was an error deleting the UHID.',
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
