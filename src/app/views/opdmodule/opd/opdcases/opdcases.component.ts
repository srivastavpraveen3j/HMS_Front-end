import { OpdbarcodeComponent } from './../../../../component/opdcustomfiles/opdbarcode/opdbarcode.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OpdService } from '../../opdservice/opd.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { PatientInfoComponentComponent } from '../../../../component/opdcustomfiles/patient-info-component/patient-info-component.component';
import { PatientdeatailsComponent } from '../../../../component/opdcustomfiles/patientdeatails/patientdeatails.component';
// import Swal from 'sweetalert2';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { LoaderComponent } from '../../../loader/loader.component';
import { DaterangeComponent } from '../../../daterange/daterange.component';
import { PatientLedgerSummaryComponent } from '../../../reports/opdreport/opdreports/patient-ledger-summary/patient-ledger-summary.component';
import { PatientsummaryComponent } from '../../../../component/opdcustomfiles/patientsummary/patientsummary.component';
import { BarcodeDialogComponent } from '../../../../component/barcode-dialog/barcode-dialog.component';
import { UhidService } from '../../../uhid/service/uhid.service';
import { PharmaService } from '../../../../viewspharma/pharma.service';
import { TestService } from '../../../../viewspatho/testservice/test.service';
import { RoleService } from '../../../mastermodule/usermaster/service/role.service';
import { DoctorService } from '../../../doctormodule/doctorservice/doctor.service';
import { SearchFilterComponent } from "../../../../component/search-filter/search-filter.component";
import { PatientSearchBarComponent } from "../../../../component/patient-search-bar/patient-search-bar.component";
import { FLAGS } from 'html2canvas/dist/types/dom/element-container';
// import { filterByDate } from '../../../../utils/filter-utils';
import { DateFilterService } from '../../../../core/services/date-filter.service';
@Component({
  selector: 'app-opdcases',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PatientdeatailsComponent,
    FormsModule,
    LoaderComponent,
    PatientsummaryComponent,
    OpdbarcodeComponent,
    SearchFilterComponent,
    PatientSearchBarComponent
  ],
  templateUrl: './opdcases.component.html',
  styleUrl: './opdcases.component.css',
})

export class OpdcasesComponent {

  doctors: any[] = [];
  filterForm!: FormGroup;

  opdcases: any[] = [];
  filteredData: any[] = [];
  filteredCases: any[] = [];

  selectedPatient: any = null;
  selectedSummary: any = null;
  selectedDoctorName: any = '';
  selectedDoctorID: string = '';

  recordsPerPage = 10;
  currentPage = 1;
  totalPages = 1;

  // Using string to bind to radio buttons directly
  activeFilter = 'today';

  // For date range inputs bound by ngModel
  startDate: string = '';
  endDate: string = '';
  showSidebar: boolean = false;
  module: string = '';

  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();
  searchText: string = '';
  doctorId: string = '';
  isrole: string = '';
  isDoctor: boolean = false;
  queue: any[] = [];
  statusFilter: string = 'waiting'; // default tab
  applyDateFilter: boolean = false;
  searchFilterComponent: any;
  isDateDisabled: boolean = false;
  applyTodayF:boolean = true;
  constructor(
    private opdService: OpdService,
    private router: Router,
    private fb: FormBuilder,
    private masterService: MasterService,
    private uhidservice: UhidService,
    private pharmaservice: PharmaService,
    private testService: TestService,
    private role: RoleService,
    private doctorservice: DoctorService,
    private dateFilterService: DateFilterService
  ) { }

  userPermissions: any = {};

  ngOnInit() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    this.startDate = todayString;
    this.endDate = todayString;

    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'outpatientCase',
      (perm: any) => perm.moduleName === 'medicoLegalCase'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // load permissions

    const userStr = localStorage.getItem('authUser');
    if (!userStr) {
      console.error('No user found in localStorage');
      return;
    }
    const user = JSON.parse(userStr);
    const id = user._id;
    const role = user.role?.name;
    this.doctorId = id;
    this.isrole = role;
    console.log('role', this.isrole);

    // Always set isDoctor explicitly
    this.isDoctor = role === 'doctor';

    if (this.isDoctor) {
      this.loadQueue(this.doctorId);
    } else {
      this.loadOpdcase();
    }

    this.initForm();
    // this.fetchDoctors();
    // this.loadOpdcase();

    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadOpdcase();
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadOpdcase();
    });
    this.toggleCheck();
  }

  doctorList = [];

  // fetchDoctors(searchText: string) {
  //   this.masterService.getDoctorMasterList(searchText).subscribe((res: any) => {
  //     this.doctorList = res || [];
  //   });
  // }

  onFiltersChanged(filters: any) {
    console.log('Filters:', filters);
    // 🔹 Call your API with these filters
  }

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  initForm() {
    this.filterForm = this.fb.group({
      recordsPerPage: [this.recordsPerPage],
      searchText: [''],
    });
  }

  // fetchDoctors(searchTerm: string): Promise<void> {
  //   console.log(searchTerm);
  //   return new Promise((resolve) => {
  //     this.role.searchUser(searchTerm, 'doctor').subscribe((res: any) => {

  //       const allDoctors = res.filter((u: any) => u.role?.name === 'doctor');
  //       console.log(allDoctors)
  //       // 🔹 Filter by search text (case-insensitive)
  //        const filtered = searchTerm
  //          ? allDoctors.filter((d: any) =>
  //            d.name.toLowerCase().includes(searchTerm.toLowerCase())
  //          )
  //          : allDoctors;

  //       // // 🔹 Bind to the variable used in your template
  //       this.doctorList = filtered;

  //       resolve();
  //     });
  //   });
  // }

  // loadOpdcase() {
  //   const limit = this.filterForm.get('recordsPerPage')?.value || 25;
  //   const search = this.filterForm.get('searchText')?.value || '';

  //   this.opdService.getOPDcase(this.currentPage, limit, search).subscribe((res: any) => {
  //     this.opdcases = res.outpatientCases || [];
  //     this.totalPages = res.totalPages || 1;
  //     this.applyFilters();
  //   });
  // }

  // private getRoleBasedDoctorId(): string | undefined {
  //   return this.isrole === 'doctor' ? this.doctorId : undefined;
  // }

  //==> Load OPD cases data
  loadOpdcase() {
    // const search = this.filterForm.get('searchText')?.value || '';
    const limit = 9999; // Load all
    this.opdService.getOPDcase(1, limit, '').subscribe((res: any) => {
      this.opdcases = res.outpatientCases || res || [];

      this.filteredData = this.opdcases;
      this.applyFilters(this.dateFilterService.getApplyFilterValue());
    });
  }

  onSelectPatient(patient: any) {
    if (!patient) return;

    const uhid = patient.uniqueHealthIdentificationId;
    this.selectedPatient = patient;

    // console.log("Selected Patient UHID:", uhid._id);

  }

  searchByUHID(searchText: any) {
    this.applyFilters(false);
    searchText = (searchText ?? '').toString().trim();  // safe convert

    this.searchText = '';

    if (!searchText) {
      this.loadOpdcase();
      return;
    }

    this.opdService.searchOPDcasebyUHID(searchText).subscribe({
      next: (res) => {
        debugger
        this.filteredCases = res.opdCases || res || [];
        console.log(res.opdCases);
        console.log("filter changed", this.filteredData);
      },
      error: () => {
        this.filteredData = [];
        this.filteredCases = [];
      }
    });
  }



  //==> Load Queue data
  loadQueue(doctorId?: string) {
    this.opdService.getQueues(doctorId ?? '').subscribe((res: any) => {
      this.queue = res.queue || [];
      console.log('Queues', this.queue);

      // this.filteredData = this.queue.filter((item) => item.status === 'waiting');
      this.filteredData = this.queue;

      // this.statusFilter = 'waiting || skipped';
      this.statusFilter = 'waiting';

      this.applyFilters(true);
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
      this.loadOpdcase(); // show all patients
      return;
    }

    if (!searchText || searchText.trim().length < 2) {
      this.filteredDoctors = [];
      return;
    }

    // call API when typing
    this.role.getusers(1, 100, searchText).subscribe((res: any) => {
      const doctors = res.filter((u: any) => u.role?.name === 'doctor') || [];
      this.filteredDoctors = doctors;
      console.log('filtered', this.filteredDoctors);
    });
  }

  onDoctorSelected(selectedDoctorName: any) {
    this.selectedDoctorName = selectedDoctorName.name;
    this.doctorSearchText = selectedDoctorName.name;
    this.filteredDoctors = [];
    this.currentPage = 1;
    // this.applyDateFilter = false;
    this.selectedDoctorID = selectedDoctorName._id;
    if (this.applyDateFilter) {
      this.loadOpdcase();
    }
  }



  // nextPage() {
  //   if (this.currentPage < this.totalPages) {
  //     this.currentPage++;
  //     this.loadOpdcase();
  //   }
  // }

  // previousPage() {
  //   if (this.currentPage > 1) {
  //     this.currentPage--;
  //     this.loadOpdcase();
  //   }
  // }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters(false);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters(false);
    }
  }

  closeSidebar() {
    this.showSidebar = false;
  }

  onDoctorSelect(event: Event): void {
    const selectedDoctorName = (event.target as HTMLSelectElement).value;
    this.selectedDoctorName = selectedDoctorName;
    this.currentPage = 1;
    this.loadOpdcase();
  }

  // applyFilters() {
  //   let baseList = this.opdcases;

  //   // If a doctor is selected, filter by doctor first
  //   if (this.selectedDoctorName) {
  //     baseList = baseList.filter((patient) => {
  //       // Depending on your data shape:
  //       return (
  //         patient.consulting_Doctor?.name === this.selectedDoctorName ||
  //         patient.consulting_Doctor === this.selectedDoctorName
  //       ); // in case of string
  //     });
  //   }

  //   // Now apply date filter
  //   if (this.activeFilter === 'today') {
  //     const today = new Date().toISOString().split('T')[0];
  //     this.filteredCases = baseList.filter((patient) => {
  //       const createdAt = patient?.createdAt || patient?.created_at;
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

  //     this.filteredCases = baseList.filter((patient) => {
  //       const createdAt = patient?.createdAt || patient?.created_at;
  //       if (!createdAt) return false;
  //       const patientDate = new Date(createdAt);
  //       return patientDate >= start && patientDate <= end;
  //     });
  //   } else {
  //     // Fallback if no filter selected (should not happen)
  //     this.filteredCases = baseList;
  //   }
  // }

  resetFilters() {
    this.activeFilter = 'today';
    this.startDate = '';
    this.endDate = '';

    this.selectedDoctorName = '';   // replaced selectedDoctorId
    this.statusFilter = '';         // if doctor view

    this.currentPage = 1;
    this.applyDateFilter = this.dateFilterService.getApplyFilterValue();
    if (this.searchFilterComponent) {
      this.searchFilterComponent.clear();
    }

    this.applyFilters();
    this.loadOpdcase();
  }

  setStatusFilter(status: string) {
    this.statusFilter = status;
    this.applyFilters(true);
  }

  applyTodayFilter(applyTodayF:boolean){
    this.applyTodayF = applyTodayF;
  }

  applyFilters(resetPage: boolean = false) {
    // debugger
    // this.toggleCheck()
    let baseList = this.filteredData;
    const text = (this.searchText || '').toLowerCase();

    if (resetPage) {
      this.currentPage = 1;
    }

    if (this.isDoctor && this.statusFilter) {
      if (this.statusFilter === 'waiting') {
        baseList = baseList.filter(
          (p: any) => p.status === 'waiting' || p.status === 'skipped'
        );
      } else {
        baseList = baseList.filter((p: any) => p.status === this.statusFilter);
      }
    }


    if (this.selectedDoctorName) {
      baseList = baseList.filter(
        (patient) =>
          patient.consulting_Doctor?.name === this.selectedDoctorName ||
          patient.consulting_Doctor === this.selectedDoctorName
      );
    }

    baseList = baseList.filter((data) => {
      const mobile =
        data.uniqueHealthIdentificationId?.mobile_no?.toLowerCase() || data.caseId?.uniqueHealthIdentificationId?.mobile_no || '';
      const patientName =
        data.uniqueHealthIdentificationId?.patient_name?.toLowerCase() || data.caseId?.uniqueHealthIdentificationId?.patient_name?.toLowerCase() || '';
      const uhid = data.uniqueHealthIdentificationId?.uhid?.toLowerCase() || data.caseId?.uniqueHealthIdentificationId?.uhid || '';
      return (
        mobile.includes(text) ||
        patientName.includes(text) ||
        uhid.includes(text)
      );
    });

    if (this.applyTodayF) {
      if (this.activeFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];

        baseList = baseList.filter((patient) => {
          const createdAt = patient?.createdAt || patient?.created_at;
          return (
            createdAt &&
            new Date(createdAt).toISOString().split('T')[0] === today
          );
        });

      } else if (this.activeFilter === 'dateRange') {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        end.setHours(23, 59, 59, 999);

        baseList = baseList.filter((patient) => {
          const createdAt = patient?.createdAt || patient?.created_at;
          const date = new Date(createdAt);
          return date >= start && date <= end;
        });
      }
    }


    this.totalPages = Math.ceil(baseList.length / this.recordsPerPage);
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    this.filteredCases = baseList.slice(startIndex, endIndex);
    console.log('filtered data', this.filteredCases);
  }

  vitals: any[] = [];
  viewPatient(patientId: string): void {
    console.log('🚀 ~ OpdcasesComponent ~ viewPatient ~ patientId:', patientId);
    this.opdService.getOPDcaseById(patientId).subscribe({
      next: (res: any) => {
        console.log(
          '🚀 ~ OpdcasesComponent ~ this.opdService.getOPDcaseById ~ res:',
          res
        );
        this.selectedPatient = res; // ✅ extract `data` directly
        console.log('Patient details:', this.selectedPatient);
      },
      error: (err) => {
        console.error('Error loading patient:', err);
      },
    });

    this.doctorservice.getVitals().subscribe({
      next: (res: any) => {
        this.vitals = res.filter(
          (vital: any) => vital.vitals?.[0]?.outpatientCaseId === patientId
        );
        console.log('VITALS', this.vitals);
      },
      error: (err) => {
        console.error('Error loading vitals:', err);
      },
    });
  }

  viewPatientSummary(patient: any) {
    const patientId = patient.caseId?._id || patient._id;
    console.log('patient id', patient);
    this.router.navigate(['/patientsummary'], {
      queryParams: { id: patientId },
    });

    if (patient.status === 'waiting' || patient.status === 'skipped') {
      const updateData = {
        caseId: patient.caseId?._id,
        doctorId: patient.doctorId?._id,
        status: 'inConsultation',
      };

      this.opdService.updateQueue(updateData).subscribe({
        next: (res) => {
          console.log('Queue updated successfully:', res);
        },
        error: (err) => {
          console.error('Error updating queue:', err);
        },
      });
    }

    if (this.isDoctor) {
      const opdid = patient.caseId?._id;
      const updateData = {
        consulted: 'inConsultation',
      };

      this.opdService.updateOPDcase(opdid, updateData).subscribe({
        next: (res) => {
          console.log(
            `OPD case status updated successfully to ${updateData.consulted}:`,
            res
          );
        },
        error: (err) => {
          console.error('Error updating OPD case:', err);
        },
      });
    }
  }

  opdId: string = '';
  openSummary(patientId: string, id: string): void {
    this.opdId = id;
    this.selectedSummary = patientId;
    this.summary();
  }

  opdPatient: any = {};

  summary() {
    this.getPatientSummaryById(this.selectedSummary);

    this.opdService.getOPDcaseById(this.opdId).subscribe((res) => {
      console.log('opd case by id', res);
      this.opdPatient = res;
    });
  }

  singlePatientSummary: any[] = [];
  opdBillDataById: any[] = [];
  patientId: string = '';
  pharmaData: any[] = [];
  pharmaPatientId: string = '';
  testData: any[] = [];
  labTotalAmount: any = {};
  pharmaTotal: any = {};

  getPatientSummaryById(
    id: string,
    page: number = 1,
    collectedData: any[] = []
  ) {
    this.opdService.getOPDbill(page, 10).subscribe({
      next: (response: any) => {
        const currentData = response.data?.data || [];
        const totalPages = response.data?.totalPages || 1;
        const combined = [...collectedData, ...currentData];

        if (page < totalPages) {
          this.getPatientSummaryById(id, page + 1, combined); // fetch next page
        } else {
          // 🔍 Once all pages are fetched, filter by patient ID
          const matchedBills = combined.filter(
            (bill: any) => bill.patientUhid?._id === id
          );

          console.log('Filtered Bills for Patient:', matchedBills);

          this.opdBillDataById = matchedBills;
          this.singlePatientSummary =
            this.generatePatientSummaryFromBills(matchedBills);
        }
      },
      error: (error: any) => {
        console.error('Error fetching paginated OPD bills:', error);
      },
    });
  }

  generatePatientSummaryFromBills(bills: any[]): any[] {
    const summaryMap: { [patientId: string]: any } = {};

    bills.forEach((bill) => {
      // console.log("BILL",bill);
      const patientid = bill.patientUhid?._id;
      this.pharmaPatientId = patientid;
      const patient = bill.patientUhid;
      const discount = bill.DiscountMeta?.discount;

      if (!patientid) return;

      if (!summaryMap[patientid]) {
        summaryMap[patientid] = {
          id: patientid,
          patientName: patient.patient_name,
          uhid: patient.uhid,
          age: patient.age,
          address: patient.area,
          mobile: patient.mobile_no,
          bills: [],
        };
      }

      const billDate = new Date(bill.createdAt);
      const billNumber = bill.billnumber;

      const services = bill.serviceId.map((service: any) => ({
        name: service.name,
        charge: service.charge,
        type: service.type,
      }));

      summaryMap[patientid].bills.push({
        billNumber,
        date: billDate,
        services,
        totalAmount: bill.totalamount,
        amountReceived: bill.amountreceived,
        paymentMode: bill.paymentmethod,
        discount,
      });
    });

    this.getPharmaData();
    this.getPathoData();
    return Object.values(summaryMap);
  }

  getPharmaData() {
    this.pharmaservice.getPharmareq().subscribe({
      next: (res) => {
        // console.log(res);
        if (Array.isArray(res)) {
          this.pharmaData = res;
          console.log('Pharma data', this.pharmaData);
        } else {
          console.warn('Unexpected response format for getPharmareq');
        }
      },
      error: (err) => console.log('Pharma Error:', err),
    });
  }

  getPathoData() {
    this.testService.getTestreq().subscribe({
      next: (res) => {
        // console.log(res);
        if (Array.isArray(res)) {
          this.testData = res;
          console.log('Patho data', this.testData);
        } else {
          console.warn('Unexpected response format for getTestreq');
        }
      },
      error: (err) => console.log('Pharma Error:', err),
    });
  }

  closeModal(): void {
    this.selectedPatient = null;
    this.singlePatientSummary = [];
  }

  editOpdcase(opdcaseid: string) {
    this.router.navigate(['/opd/opd'], {
      queryParams: { _id: opdcaseid },
    });
  }

  async deleteOpdcase(opdcaseid: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!opdcaseid) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This OPD case will be permanently deleted.',
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
        this.opdService.deleteOPDcase(opdcaseid).subscribe({
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

            this.filteredData = this.filteredData.filter(
              (symp) => symp._id !== opdcaseid
            );
            this.applyFilters();
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

  selectedMedicoPatient: any = {};

  viewMedicoPatient(patient: any) {
    // this.selectedMedicoPatient = patient;
    // this.opdService.getMedicalCaseById(patient).subscribe((res: any) => {
    //   console.log('data medical', res);
    //   this.selectedMedicoPatient = res[0] || res;
    // });
    console.log('selected patient data', this.selectedMedicoPatient);
    this.showSidebar = true;
  }

  // new vies mode
  openDeposit(patientid: string) {
    this.router.navigate(['/opd/deposit'], {
      queryParams: { _id: patientid },
    });
  }
  openBill(patientid: string) {
    this.router.navigate(['/opd/opdbill'], {
      queryParams: { _id: patientid },
    });
  }
  Patientdiagnosis(patientid: string) {
    this.router.navigate(['/opd/opddiagnosissheet'], {
      queryParams: { _id: patientid },
    });
  }
  Patientpharmacy(patientId: string) {
    this.router.navigate(['/doctor/opdpharmareq'], {
      queryParams: { patientId }, // 👈 changed
    });
  }

  Patientpathology(patientId: string) {
    console.log('Navigating with patientId:', patientId);
    this.router.navigate(['/doctor/opdpathologyreq'], {
      queryParams: { patientId },
    });
  }
  Patientradiology(patientId: string) {
    console.log('Navigating with patientId:', patientId);
    this.router.navigate(['/doctor/opdradiologyreq'], {
      queryParams: { patientId },
    });
  }

  openIndex: number | null = null;
  selectedBarcodePatient: any = null;

  // If your table uses "opdcases" directly:
  openBarcodePopup(patient: any, index: number) {
    this.selectedBarcodePatient = patient;
    this.openIndex = index; // store which row's modal to open
  }

  addVitals(patientId: string) {
    this.router.navigate(['/doctor/vitals'], {
      queryParams: { patientId: patientId },
    });
  }

  closebardModal() {
    this.openIndex = null;
  }

  // moduel access
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

  skipPatient(patient: any) {
    console.log('Skipping patient:', patient);

    const updateData = {
      caseId: patient.caseId?._id,
      doctorId: patient.doctorId?._id,
      status: 'skipped',
      isConsultDone: false,
    };

    this.opdService.updateQueue(updateData).subscribe({
      next: (res) => {
        console.log(`Queue updated successfully to ${updateData.status}:`, res);
      },
      error: (err) => {
        console.error('Error updating queue:', err);
      },
    });
  }

  toggleCheck() {
    this.isDateDisabled = !this.applyDateFilter;
    this.dateFilterService.setApplyFilter(this.applyDateFilter);
    this.resetFilters()
  }
}
