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
import { PatientIpdcaseComponent } from '../../../../component/ipdcustomfiles/patient-ipdcase/patient-ipdcase.component';
import { IpdpatientinfoComponent } from '../../../../component/ipdcustomfiles/ipdpatientinfo/ipdpatientinfo.component';
import { IpdadmissionviewComponent } from '../../../../component/ipdcustomfiles/ipdadmissionview/ipdadmissionview.component';
import { LoaderComponent } from '../../../loader/loader.component';
import { DaterangeComponent } from '../../../daterange/daterange.component';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { OpdbarcodeComponent } from '../../../../component/opdcustomfiles/opdbarcode/opdbarcode.component';
import { RoleService } from '../../../mastermodule/usermaster/service/role.service';

@Component({
  selector: 'app-admissionlist',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    // PatientIpdcaseComponent,
    FormsModule,
    IpdpatientinfoComponent,
    IpdadmissionviewComponent,
    OpdbarcodeComponent,
  ],
  templateUrl: './admissionlist.component.html',
  styleUrl: './admissionlist.component.css',
})
export class AdmissionlistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  ipdcases: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  // Using string to bind to radio buttons directly
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];
  paginatedCases: any[] = [];

  patients: any[] = [];
  entryByUser: any;
  amountInWords: any = '';
  selectedDoctorName: string = '';

  constructor(
    private ipdService: IpdService,
    private router: Router,
    private fb: FormBuilder,
    private masterService: MasterService,
    private role: RoleService
  ) {}

  userPermissions: any = {};
  displayedCases: any[] = [];
  module: string = '';
  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();

  ngOnInit(): void {
    // load user info
    const userData = localStorage.getItem('authUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.entryByUser = user?.name || '';
      } catch (e) {
        console.error('Error parsing authUser from localStorage:', e);
      }
    }

    // load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inpatientCase'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // initialize dates to today
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    this.startDate = todayString;
    this.endDate = todayString;

    // init filter form
    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: [''],
    });

    // load patients
    this.loadIpdcase();

    // reset page on filter change
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.applyFilters();
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.applyFilters();
    });
  }

  allIpdCases: any[] = [];
  // Load IPD cases
  loadIpdcase(): void {
    const search = this.filterForm.get('searchText')?.value || '';

    this.ipdService.getIPDcase(1, 1000, search).subscribe((res) => {
      this.ipdcases = res.data.inpatientCases.filter(
        (caseItem: any) => caseItem.isDischarge === false
      );
      console.log('IPD CASES', this.ipdcases);

      if (this.selectedDoctorName) {
        const searchName = this.selectedDoctorName.toLowerCase();
        this.ipdcases = this.ipdcases.filter((patient) => {
          const doctorName =
            typeof patient.admittingDoctorId === 'string'
              ? patient.admittingDoctorId.toLowerCase()
              : patient.admittingDoctorId?.name?.toLowerCase() || '';
          return doctorName === searchName;
        });
      }

      if (this.tab) {
        const mappedTab = this.tab === 'mediclaim' ? 'med' : this.tab;
        this.ipdcases = this.ipdcases.filter(
          (p) => p.patient_type?.toLowerCase() === mappedTab
        );
      }

      this.allIpdCases = [...this.ipdcases];
      this.applyFilters();
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
      this.loadIpdcase(); // show all patients
      return;
    }

    if (searchText.trim().length < 2) {
      this.filteredDoctors = [];
      return;
    }

    // call API when typing
    this.role.getusers(1, 10, searchText).subscribe((res: any) => {
      const doctors = res.filter((u: any) => u.role?.name === 'doctor') || [];
      this.filteredDoctors = doctors;
    });
  }

  onDoctorSelected(selectedDrName: string) {
    this.selectedDoctorName = selectedDrName;
    this.doctorSearchText = selectedDrName;
    this.filteredDoctors = []; // close dropdown
    this.currentPage = 1;
    this.loadIpdcase();
  }

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  patientFilter() {
    const text = (this.searchText || '').toLowerCase();

    if (!text) {
      // Reset to original if search is empty
      this.displayedCases = [...this.filteredCases];
      return;
    }

    this.displayedCases = this.ipdcases.filter((data) => {
      const mobile = (
        data.uniqueHealthIdentificationId?.mobile_no || ''
      ).toLowerCase();
      const patientName = (
        data.uniqueHealthIdentificationId?.patient_name || ''
      ).toLowerCase();
      const uhid = data.uniqueHealthIdentificationId?.uhid || '';

      return (
        mobile.includes(text) ||
        patientName.includes(text) ||
        uhid.includes(text)
      );
    });
  }

  // Filter patients based on date & tab
  applyFilters(): void {
    let baseList = this.ipdcases;
    const text = this.searchText.toLowerCase();

    // Filter by tab (patient_type)
    if (this.tab) {
      const mappedTab = this.tab === 'mediclaim' ? 'med' : this.tab;
      baseList = baseList.filter(
        (p) => p.patient_type?.toLowerCase() === mappedTab
      );
    }

    if (this.selectedDoctorName) {
      baseList = baseList.filter(
        (patient) =>
          patient.consulting_Doctor?.name === this.selectedDoctorName ||
          patient.consulting_Doctor === this.selectedDoctorName
      );
    }

    // Filter by date
    // if (this.activeFilter === 'today') {
    //   const today = new Date().toISOString().split('T')[0];
    //   this.filteredCases = baseList.filter((patient) => {
    //     const createdAt = patient?.createdAt || patient?.created_at;
    //     if (!createdAt) return false;
    //     const patientDate = new Date(createdAt).toISOString().split('T')[0];
    //     return patientDate === today;
    //   });
    // } 
    else if (this.activeFilter === 'dateRange') {
      if (!this.startDate || !this.endDate) {
        this.filteredCases = [];
        this.displayedCases = [];
        this.totalPages = 1;
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

    console.log('filteerd', this.filteredCases);

    this.updatePagination();
  }
  tab: string = 'cash'; // default active tab

  // Tab switch logic
  selectTab(tabName: string): void {
    this.tab = tabName;
    this.loadIpdcase();
  }

  getPatientTypeLabel(type: string): string {
    switch ((type || '').toLowerCase()) {
      case 'med':
        return 'Mediclaim';
      case 'cash':
        return 'Cash';
      case 'cashless':
        return 'Cashless';
      default:
        return 'Unknown';
    }
  }

  updatePagination() {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const totalItems = this.filteredCases.length;

    this.totalPages = Math.ceil(totalItems / limit);
    const startIndex = (this.currentPage - 1) * limit;
    const endIndex = startIndex + limit;

    this.displayedCases = this.filteredCases.slice(startIndex, endIndex);
    console.log('displayed cses', this.displayedCases);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
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
            this.displayedCases = this.displayedCases.filter(
              (symp) => symp._id !== ipdid
            );
          },
          error: (err) => {
            console.error('Error deleting IPD Case:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: 'There was an error deleting the IPD Case.',
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

  viewPatientSummary(patient: any) {
    this.router.navigate(['/ipdpatientsummary'], {
      queryParams: { id: patient._id },
    });
  }

  selectedPatient: any = null;
  // modal setion
  viewPatient(patientId: string): void {
    // Replace this with your actual API call logic
    this.ipdService.getIPDcaseById(patientId).subscribe({
      next: (res) => {
        console.log(
          '🚀 ~ OpdcasesComponent ~ this.opdService.getOPDcaseById ~ res:',
          res
        );
        this.selectedPatient = res.data || res;
        // this.selectedPatient = this.patients.find((p) => p._id === patientId);
        console.log(
          '🚀 ~ OpdcasesComponent ~ this.opdService.getOPDcaseById ~ this.selectedPatient:',
          this.selectedPatient
        );
      },
      error: (err) => {
        console.log(
          '🚀 ~ OpdcasesComponent ~ this.opdService.getOPDcaseById ~ err:',
          err
        );
      },
    });
  }

  selectedPatientBill: any = null;
  patientBills: any[] = [];

  viewPatientBill(patientId: string): void {
    // console.log('Patient ID:', patientId);
    this.ipdService.getinpatientIntermBillhistory().subscribe({
      next: (res) => {
        const allBills = res.intermBill || res;

        this.ipdService.getIPDcaseById(patientId).subscribe((res) => {
          const patient = res.data || res;
          // console.log('patient', patient);
          this.selectedPatientBill.ipdNum = patient.inpatientCaseNumber;
        });

        // Filter bills for current patient
        const patientBills = allBills.filter(
          (bill: any) =>
            Array.isArray(bill.inpatientCase) &&
            bill.inpatientCase.some(
              (caseItem: any) => caseItem._id === patientId
            )
        );

        // console.log("patient bills",patientBills);

        // Sort by createdAt (or billDate) descending to get latest first
        const sortedBills = patientBills.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // console.log("SORTED",sortedBills);
        // Pick the latest one
        this.selectedPatientBill = sortedBills[0] || null;

        if (this.selectedPatientBill) {
          this.selectedPatientBill.entryByUser = this.entryByUser;
          this.amountInWords =
            this.convertNumberToWords(
              this.selectedPatientBill.grandTotalAmount
            ) + ' rupees';

          this.selectedPatientBill.amountInWords = this.amountInWords;
        }
        // console.log('Latest Interim Bill:', this.selectedPatientBill);
      },
      error: (err) => {
        console.error('Error fetching interim bills:', err);
      },
    });
  }

  closeModal(): void {
    this.selectedPatient = null;
    this.selectedPatientBill = null;
  }

  // new structure
  openDeposit(patientid: string) {
    this.router.navigate(['/ipd/ipddeposit'], {
      queryParams: { ipdcaseId: patientid },
    });
  }
  openBill(patientid: string) {
    this.router.navigate(['/ipd/ipdbill'], {
      // queryParams: { _id: patientid },
      queryParams: { ipdcaseId: patientid },
    });
  }
  openSummary(patientid: string) {
    this.router.navigate(['/report/patientbalancereport'], {
      queryParams: { _id: patientid },
    });
  }

  convertNumberToWords(amount: number): string {
    const a = [
      '',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen',
    ];
    const b = [
      '',
      '',
      'twenty',
      'thirty',
      'forty',
      'fifty',
      'sixty',
      'seventy',
      'eighty',
      'ninety',
    ];

    if ((amount = amount || 0) === 0) return 'zero';
    if (amount < 20) return a[amount];
    if (amount < 100)
      return (
        b[Math.floor(amount / 10)] + (amount % 10 ? '-' + a[amount % 10] : '')
      );
    if (amount < 1000)
      return (
        a[Math.floor(amount / 100)] +
        ' hundred ' +
        this.convertNumberToWords(amount % 100)
      );
    if (amount < 100000)
      return (
        this.convertNumberToWords(Math.floor(amount / 1000)) +
        ' thousand ' +
        this.convertNumberToWords(amount % 1000)
      );
    if (amount < 10000000)
      return (
        this.convertNumberToWords(Math.floor(amount / 100000)) +
        ' lakh ' +
        this.convertNumberToWords(amount % 100000)
      );
    return (
      this.convertNumberToWords(Math.floor(amount / 10000000)) +
      ' crore ' +
      this.convertNumberToWords(amount % 10000000)
    );
  }

  // change tab

  // selectTab(tabName: string): void {
  //   this.tab = tabName;
  // }

  openIndex: number | null = null;
  selectedBarcodePatient: any = null;

  // If your table uses "opdcases" directly:
  openBarcodePopup(patient: any, index: number) {
    this.selectedBarcodePatient = patient;
    this.openIndex = index; // store which row's modal to open
  }

  closebardModal() {
    this.openIndex = null;
  }
}
