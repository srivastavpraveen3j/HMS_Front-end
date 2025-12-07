import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { DoctorService } from '../../doctorservice/doctor.service';
import { IpdService } from '../../../ipdmodule/ipdservice/ipd.service';
import { LoaderComponent } from '../../../loader/loader.component';
import { DaterangeComponent } from '../../../daterange/daterange.component';

@Component({
  selector: 'app-treatmentlist',
  imports: [RouterModule, CommonModule, FormsModule, LoaderComponent],
  templateUrl: './treatmentlist.component.html',
  styleUrl: './treatmentlist.component.css',
})
export class TreatmentlistComponent {
  recordsPerPage: number = 25;
  searchText: string = '';
  ipdcase: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  dischargedata: any[] = [];
  selectedPatient: any = null;
  treatmenthistory: any[] = [];
  // Using string to bind to radio buttons directly
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];
  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();

  constructor(
    private doctorservice: DoctorService,
    private router: Router,
    private fb: FormBuilder,
    private ipdservice: IpdService
  ) {}

  userPermissions: any = {};
  module: string = '';

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'treatmentHistorySheet'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName;

    // load permissions
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    this.startDate = todayString;
    this.endDate = todayString;

    this.filterForm = this.fb.group({
      searchText: [''],
      recordsPerPage: [this.recordsPerPage],
    });

    this.loadtreatmentsheet();
    setInterval(() => {
      this.loadtreatmentsheet();
    }, 60000);
  }

  loadtreatmentsheet() {
    this.doctorservice.gettreatmentHistorySheetapi().subscribe((res) => {
      console.log(
        '🚀 ~ TreatmentlistComponent ~ this.doctorservice.gettreatmentHistorySheetapi ~ res:',
        res
      );
      this.treatmenthistory = res;
      this.totalPages = res.totalPages ?? 1;
      this.applyFilters();
    });
  }

  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  applyFilters() {
    let baseList = this.treatmenthistory;

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
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadtreatmentsheet();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadtreatmentsheet();
    }
  }
}
