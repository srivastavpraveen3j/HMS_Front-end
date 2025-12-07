import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
// import Swal from 'sweetalert2';
import { IpdService } from '../../../ipdmodule/ipdservice/ipd.service';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { DoctorService } from '../../doctorservice/doctor.service';
import { Router, RouterModule } from '@angular/router';
import { IpdvitalchartComponent } from '../../../../component/ipdcustomfiles/ipdvitalchart/ipdvitalchart.component';
import { LoaderComponent } from "../../../loader/loader.component";
import { DaterangeComponent } from "../../../daterange/daterange.component";
@Component({
  selector: 'app-vitalslist',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    IpdvitalchartComponent,
    FormsModule,
    LoaderComponent,

  ],
  templateUrl: './vitalslist.component.html',
  styleUrl: './vitalslist.component.css',
})
export class VitalslistComponent {
  recordsPerPage: number = 100;
  searchText: string = '';
  ipdbill: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  service: any[] = [];
  ipdAdmissions: any[] = [];
  opdcases: any[] = [];
  filteredCases: any[] = [];

  selectedPatient: any = null;
  // Add this new variable:
  selectedDoctorName: string = '';

  // Using string to bind to radio buttons directly
  activeFilter = 'today';
  displayedCases: any[] = [];

  // For date range inputs bound by ngModel
  startDate: string = '';
  module: string = '';
  endDate: string = '';
  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();

  constructor(
    private ipdService: IpdService,
    private router: Router,
    private fb: FormBuilder,
    private masterService: MasterService,
    private doctorservice: DoctorService
  ) {}

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'vitals'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // load permissions
    this.filterForm = this.fb.group({
      recordsPerPage: [100],
      searchText: [''],
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    this.startDate = todayString;
    this.endDate = todayString;

    const limit = this.filterForm.get('recordsPerPage')?.value || 100;
    const search = this.filterForm.get('searchText')?.value || '';

    this.loadVitals(); // Assuming you use this somewhere or can remove if redundant
    // setInterval(() => {
    //   this.loadVitals();
    // }, 10000);
  }

  // vitals:any[] = [];
  vitals = [
    {
      _id: '6864c544137cdbd8aa3300a7',
      uhid: 'UHID-2025620-681180',
      patient_name: 'ritik shokeen',
      age: 25,
      temperature: '102',
      pulseRate: '90',
      spo2: '90',
      systolicBloodPressure: '78',
      diastolicBloodPressure: '90',
      respiratoryRate: '50',
      bloodSugar: '5',
      input: 'all good',
      output: 'all fine',
      remarks: 'done',
      date: '2025-07-02',
      time: '11:23',
      createdAt: '2025-07-02T05:36:04.792+00:00',
    },
  ];

  loadVitals() {
    this.doctorservice.getVitals().subscribe({
      next: (res: any[]) => {
        const allVitals = res.flatMap((patient) =>
          (patient.vitals || []).map((v: any) => ({
            ...v,
            patient_name: patient.patient_name,
            age: patient.age,
            uhid: patient.uhid,
            date: patient.dor,
            time: patient.dot,
          }))
        );

        this.vitals = allVitals;
        console.log('✅ Flattened vitals for table:', this.vitals);
        this.applyFilters();
      },
      error: (err) => {
        console.error('❌ Error fetching vitals:', err);
      },
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadVitals();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadVitals();
    }
  }

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  applyFilters() {
    this.currentPage = 1;

    let baseList = this.vitals;

    const search =
      this.filterForm.get('searchText')?.value?.toLowerCase() || '';
    if (search) {
      baseList = baseList.filter(
        (item) =>
          item.patient_name?.toLowerCase().includes(search) ||
          item.uhid?.toLowerCase().includes(search)
      );
    }

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      baseList = baseList.filter((patient) => {
        const patientDate = new Date(patient?.createdAt)
          .toISOString()
          .split('T')[0];
        return patientDate === today;
      });
    } else if (this.activeFilter === 'dateRange') {
      if (!this.startDate || !this.endDate) {
        this.filteredCases = [];
        this.displayedCases = [];
        this.totalPages = 1;
        return;
      }

      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);

      baseList = baseList.filter((patient) => {
        const patientDate = new Date(patient?.createdAt);
        return patientDate >= start && patientDate <= end;
      });
    }

    this.filteredCases = baseList;

    this.updatePagination();
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

  viewPatient(patientId: string): void {
    this.doctorservice.getVitalsById(patientId).subscribe({
      next: (res: any) => {
        this.selectedPatient = res;
        console.log(
          '🚀 ~ VitalslistComponent ~ this.doctorservice.getVitalsById ~ this.selectedPatient :',
          this.selectedPatient
        );
      },
      error: (err) => {
        console.error('Error loading patient:', err);
      },
    });

    // this.selectedPatient = this.vitals;
  }


  closeModal(): void {
    this.selectedPatient = null;
  }

  editVitals(patientid: string) {
    this.router.navigate(['/doctor/vitals'], {
      queryParams: { _id: patientid },
    });
  }

 async deleteVitals(patientid: string) {
  const Swal = (await import('sweetalert2')).default;

    if (!patientid) {
      console.error('Vitals case ID is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This Vitals case will be permanently deleted.',
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
        this.doctorservice.deleteVitals(patientid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Vital case has been deleted successfully.',
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
              (symp) => symp._id !== patientid
            );
            this.applyFilters();
          },
          error: (err) => {
            console.error('Error deleting Vuitals case:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text:
                err?.error?.message ||
                'There was an error deleting the Vital case.',
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
