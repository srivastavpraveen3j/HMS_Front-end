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
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { LoaderComponent } from '../../../loader/loader.component';
import { DaterangeComponent } from '../../../daterange/daterange.component';
@Component({
  selector: 'app-ipdbilllist',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoaderComponent,
  ],
  templateUrl: './ipdbilllist.component.html',
  styleUrl: './ipdbilllist.component.css',
})
export class IpdbilllistComponent {
  recordsPerPage: number = 100;
  searchText: string = '';
  ipdbill: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  service: any[] = [];
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
    private ipdService: IpdService,
    private router: Router,
    private fb: FormBuilder,
    private masterService: MasterService
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
      (perm: any) => perm.moduleName === 'inpatientBilling'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // load permissions
    this.filterForm = this.fb.group({
      recordsPerPage: [100],
      searchText: [''],
    });

    const limit = this.filterForm.get('recordsPerPage')?.value || 100;
    const search = this.filterForm.get('searchText')?.value || '';

    this.loadIpdbill(); // Assuming you use this somewhere or can remove if
    setInterval(() => {
      this.loadIpdbill();
    }, 6000);

    // First fetch IPD bills
    this.ipdService
      .getipdBillapis(this.currentPage, limit, search)
      .subscribe((res) => {
        this.ipdbill = res.data.newBillings;
        this.totalPages = res.data.totalPages;
        this.applyFilters();

        // Then fetch master services to map service IDs to names
        //     this.masterService.getServices(this.currentPage, limit, '').subscribe(serviceRes => {
        //       this.service = serviceRes.data;

        //       // Map service IDs to names for each inpatientbilling
        //       this.ipdbill.forEach(billing => {
        //         billing.inpatientbillings.forEach((ipdBill: any) => {
        //         ipdBill.serviceNames = ipdBill.serviceId.map((sid: any) => {
        //   const id = typeof sid === 'string' ? sid : sid._id;
        //   const matchedService = this.service.find(s => s._id === id);
        //   return matchedService ? matchedService.name : 'Unknown Service';
        // });
        //         });
        //       });

        //       console.log("Mapped IPD Bills with Service Names:", this.ipdbill);
        //     });
      });

    // Reset page on filter changes
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
    });
  }

  loadIpdbill() {
    const limit = this.filterForm.get('recordsPerPage')?.value || 100;
    const search = this.filterForm.get('searchText')?.value || '';
    const page = this.currentPage;
    // this.applyFilters();

    // this.ipdService.getipdBillapis(this.currentPage, limit, search).subscribe(res => {
    //   this.ipdbill = res.billings;
    //   this.totalPages = res.totalPages;
    //   console.log("🚀 ~ UhidComponent ~ this.uhidservice.getUhid ~ this.uhidRecords:", this.ipdbill)
    // });
  }

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  doctorSearchText: string = '';
  filteredDoctors: any[] = [];
  selectedDoctorName: string = '';

  onDoctorSearchChange(searchText: string) {
    if (searchText.trim().length === 0) {
      // cleared → reset everything
      this.filteredDoctors = [];
      this.selectedDoctorName = '';
      this.currentPage = 1;
      this.loadIpdbill(); // show all patients
      return;
    }

    if (searchText.trim().length < 2) {
      this.filteredDoctors = [];
      return;
    }

    this.masterService.getDoctorsByName(searchText).subscribe((res: any) => {
      this.filteredDoctors = res.data?.data || [];
    });
  }

  onDoctorSelected(selectedDoctorName: string) {
    this.selectedDoctorName = selectedDoctorName;
    this.doctorSearchText = selectedDoctorName;
    this.filteredDoctors = [];
    this.currentPage = 1;
    this.loadIpdbill();
  }

  applyFilters() {
    let baseList = this.ipdbill;
    const text = (this.searchText || '').toLowerCase();

    if (text) {
      baseList = baseList.filter((data) => {
        const mobile = data.mobile_no?.toLowerCase() || '';
        const patientName = data.patient_name?.toLowerCase() || '';
        const uhid = data.uhid?.toLowerCase() || '';

        // ✅ search in any billing object
        const billMatch = (data.inpatientbillings || []).some((bill: any) =>
          bill.billNumber?.toLowerCase().includes(text)
        );

        return (
          mobile.includes(text) ||
          patientName.includes(text) ||
          uhid.includes(text) ||
          billMatch
        );
      });
    }

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      this.filteredCases = baseList.filter((patient) => {
        return patient?.inpatientbillings?.some((billing: any) => {
          if (!billing.billingDate) return false;
          const billingDay = new Date(billing.billingDate)
            .toISOString()
            .split('T')[0];
          return billingDay === today;
        });
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
        return patient?.inpatientbillings?.some((billing: any) => {
          if (!billing.billingDate) return false;
          const billingDate = new Date(billing.billingDate);
          return billingDate >= start && billingDate <= end;
        });
      });
    } else {
      this.filteredCases = baseList;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadIpdbill(); // Fetch new page data
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadIpdbill(); // Fetch new page data
    }
  }

  // viewPatient(patientId: string): void {
  //   if (!patientId) return;
  //   this.ipdService.getipdBillapis(patientId).subscribe({
  //     next: (res) => {
  //       this.selectedPatient = res.data;
  //       this.patientid = this.selectedPatient?.patientUhid?._id || '';
  //       this.getPatientDoctor();
  //       console.log('Selected Patient:', this.selectedPatient);
  //     },
  //     error: (err) => {
  //       console.error('Error fetching patient:', err);
  //     },
  //   });
  // }

  editPatientipd(ipdid: any) {
    // alert(`Viewing details of ${ipdid}`);

    this.router.navigate(['ipd/ipdbill'], {
      queryParams: { _id: ipdid },
    });
  }
  async deletPatientipd(ipdid: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!ipdid) {
      console.error('Ipdbillid required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This IPD Bill will be permanently deleted.',
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
        this.ipdService.deleteipdBillapis(ipdid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'IPD Bill has been deleted successfully.',
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
            console.error('Error deleting IPD Bill:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              // text: 'There was an error deleting the IPD Bill.',
              text:
                err?.error?.message || 'There was an error deleting the bill.',

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
