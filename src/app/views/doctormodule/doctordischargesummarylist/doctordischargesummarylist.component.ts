import { PatientIpdcaseComponent } from './../../../component/ipdcustomfiles/patient-ipdcase/patient-ipdcase.component';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DoctorService } from '../doctorservice/doctor.service';
import { IpdService } from '../../ipdmodule/ipdservice/ipd.service';
import { forkJoin } from 'rxjs';
import { DaterangeComponent } from "../../daterange/daterange.component";

@Component({
  selector: 'app-doctordischargesummarylist',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    PatientIpdcaseComponent,
    FormsModule,
  
  ],
  templateUrl: './doctordischargesummarylist.component.html',
  styleUrl: './doctordischargesummarylist.component.css',
})
export class DoctordischargesummarylistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  ipdcase: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  dischargedata: any[] = [];
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
    private doctorservice: DoctorService,
    private router: Router,
    private fb: FormBuilder,
    private ipdservice: IpdService
  ) {}

  combinedData: any[] = [];

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'dischargeSummary'
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
      recordsPerPage: [this.recordsPerPage],
    });

    this.loadData();
    setInterval(() => {
      this.loadData();
    }, 6000);
  }

  loadData() {
    forkJoin({
      discharges: this.doctorservice.getdischargeSummary(),
      ipdcases: this.ipdservice.getIPDcase(),
    }).subscribe(({ discharges, ipdcases }) => {
      this.dischargedata = discharges.data;
      this.ipdcase = ipdcases.data.inpatientCases;

      // Map discharge summary with patient info from ipdcase
      this.combinedData = this.dischargedata
        .map((discharge) => {
          const matchedCase = this.ipdcase.find(
            (ipd) =>
              ipd._id === discharge.inpatientCaseId ||
              ipd._id === discharge.ipdid
          );
          if (!matchedCase) return null;

          const patient = matchedCase.uniqueHealthIdentificationId || {};
          return {
            id: discharge._id,
            uhid: discharge.uhid || patient.uhid || '',
            patientName: patient.patient_name || 'N/A',
            age: patient.age || 'N/A',
            gender: patient.gender || 'N/A',
            summary:
              discharge.summaryDetails || discharge.summarydetails || 'N/A',
            createdAt: discharge.createdAt,
          };
        })
        .filter((x) => x !== null);
      this.applyFilters();

      console.log('Combined discharge + patient data:', this.combinedData);
    });
  }

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  applyFilters() {
    let baseList = this.combinedData;

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

    console.log("filtered", this.filteredCases);
  }

  viewPatient(patientId: string): void {
    // console.log("🚀 ~ DiagnosissheetlistComponent ~ viewPatient ~ patientId:", patientId)
    // Replace this with your actual API call logic
    this.doctorservice.getDiagnosisbyID(patientId).subscribe({
      next: (res) => {
        // console.log("🚀 ~ OpdcasesComponent ~ this.opdService.getOPDcaseById ~ res:", res)
        this.selectedPatient = res;
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

  closeModal(): void {
    this.selectedPatient = null;
  }

  editDiagnosis(diagnosisid: string) {}
  deleteDiagnosis(diagnosisid: string) {}

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadData(); // Fetch new page data
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadData(); // Fetch new page data
    }
  }
}
