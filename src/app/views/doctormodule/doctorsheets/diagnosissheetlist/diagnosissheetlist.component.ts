import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OpdService } from '../../../opdmodule/opdservice/opd.service';
import { DoctorService } from '../../doctorservice/doctor.service';
import { PatientIpdcaseComponent } from '../../../../component/ipdcustomfiles/patient-ipdcase/patient-ipdcase.component';
import { LoaderComponent } from '../../../loader/loader.component';

@Component({
  selector: 'app-diagnosissheetlist',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    PatientIpdcaseComponent,
    FormsModule,
    LoaderComponent,
  ],
  templateUrl: './diagnosissheetlist.component.html',
  styleUrl: './diagnosissheetlist.component.css',
})
export class DiagnosissheetlistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  diagnosis: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;

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
    private fb: FormBuilder
  ) {}

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'diagnosisSheet'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    // load permissions

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    this.startDate = todayString;
    this.endDate = todayString;
    // ✅ Initialize form group first!
    this.filterForm = this.fb.group({
      searchText: [''],
      recordsPerPage: [this.recordsPerPage],
    });

    // Call the API
    this.loadDiagnosis();
    setInterval(() => {
      this.loadDiagnosis();
    }, 60000);
  }

  loadDiagnosis() {
    const isFilterActive =
      this.activeFilter === 'today' || this.activeFilter === 'dateRange';

    const pageToFetch = isFilterActive ? 1 : this.currentPage;
    const limit = isFilterActive ? 1000 : 100;

    this.doctorservice
      .getDiagnosissheet(pageToFetch, limit)
      .subscribe((res: any) => {
        const patientList = res.diagnosis || [];
        this.totalPages = isFilterActive ? 1 : res.totalPages || 1;

        this.diagnosis = patientList
          .filter(
            (patient: any) =>
              patient?.diagnosis &&
              typeof patient.diagnosis === 'object' &&
              !Array.isArray(patient.diagnosis) &&
              patient.diagnosis.type === 'inpatientDepartment'
          )
          .map((patient: any) => {
            const diagnosisData = patient.diagnosis;

            const createdAt =
              diagnosisData?.vitals?.createdAt ||
              diagnosisData?.createdAt ||
              patient?.createdAt;

            return {
              _id: patient._id,
              patient_name: patient.patient_name,
              gender: patient.gender,
              dob: patient.dob,
              age: patient.age,
              dor: patient.dor,
              dot: patient.dot,
              mobile_no: patient.mobile_no,
              area: patient.area,
              pincode: patient.pincode,
              uhid: patient.uhid,
              vitals: diagnosisData?.vitals,
              symptoms: diagnosisData?.symptoms || [],
              clinicalExamination: diagnosisData?.clinicalExamination || '',
              diagnosis: diagnosisData,
              createdAt,
            };
          });

        this.applyFilters(); // Apply any active filters
      });
  }

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  applyFilters() {
    let baseList = this.diagnosis;
    const text = (this.searchText || '').toLowerCase();

    if (text) {
      baseList = baseList.filter((data) => {
        const patientName = data.patient_name?.toLowerCase() || '';
        const uhid = data.uhid?.toLowerCase() || '';

        return (
          patientName.includes(text) ||
          uhid.includes(text)
        );
      });
    }


    if (this.activeFilter === 'today') {
      const today = new Date();
      const todayDateOnly = today.toLocaleDateString('en-CA'); // returns YYYY-MM-DD format in local time

      this.filteredCases = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;

        const patientDate = new Date(createdAt).toLocaleDateString('en-CA');
        return patientDate === todayDateOnly;
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
  }

  viewPatient(patientId: string): void {
    // console.log("🚀 ~ DiagnosissheetlistComponent ~ viewPatient ~ patientId:", patientId)
    // Replace this with your actual API call logic
    this.doctorservice.getDiagnosisbyID(patientId).subscribe({
      next: (res) => {
        // console.log("🚀 ~ OpdcasesComponent ~ this.opdService.getOPDcaseById ~ res:", res)
        // this.selectedPatient = res
        // if(res){
        // this.selectedPatient = res

        // }else if (res.diagnosis){

        this.selectedPatient = res.diagnosis;
        // }
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
      this.loadDiagnosis(); // Fetch new page data
    }
  }

  previousPage() {
    if (this.activeFilter !== 'none') return;
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDiagnosis();
    }
  }
}
