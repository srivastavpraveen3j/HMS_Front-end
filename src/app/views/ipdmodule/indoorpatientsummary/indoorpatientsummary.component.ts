import { Component } from '@angular/core';
import { IpdService } from '../ipdservice/ipd.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DateToISTPipe } from '../../../pipe/dateformatter/date-to-ist.pipe';

@Component({
  selector: 'app-indoorpatientsummary',
  imports: [CommonModule, FormsModule, DateToISTPipe],
  templateUrl: './indoorpatientsummary.component.html',
  styleUrl: './indoorpatientsummary.component.css',
})
export class IndoorpatientsummaryComponent {
  years: number[] = [];
  startDate: string = '';
  endDate: string = '';
  months = [
    { value: 'all', label: 'All' },
    { value: '01', label: 'Jan' },
    { value: '02', label: 'Feb' },
    { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' },
    { value: '05', label: 'May' },
    { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' },
    { value: '08', label: 'Aug' },
    { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dec' },
  ];

  filters = {
    // year will be a number because template uses [ngValue]
    year: new Date().getFullYear(),
    // month kept as string '01'..'12' or 'all'
    month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    dateFrom: '',
    dateTo: '',
    uhid: '',
    name: '',
    ipdNo: '',
    billNo: '',
  };

  indoorSummary: any[] = [];
  allIndoorData: any[] = [];
  allDischarges: any[] = [];
  fullSummary: any[] = []; // holds all merged records

  constructor(private ipdservice: IpdService, private router: Router) {}

  ngOnInit() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;
    this.years = this.getYearOptions();
    this.getAllData(); // centralized loading
  }

  getAllData() {
    this.getIpdpatientSummary().then(() => {
      this.getAllDischarges().then(() => {
        this.mergeDischargesIntoPatients();
        this.applyFilters();
      });
    });
  }

  getYearOptions(): number[] {
    const thisYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => thisYear - i);
  }

  getAllDischarges(page: number = 1, allDischarges: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ipdservice.getipddischargeurl(page).subscribe({
        next: (res) => {
          const currentDischarges = res.discharges || [];
          const totalPages = res.totalPages || 1;
          const currentPage = res.page || page;
          const combined = [...allDischarges, ...currentDischarges];

          if (currentPage < totalPages) {
            this.getAllDischarges(currentPage + 1, combined).then(resolve);
          } else {
            this.allDischarges = combined.map((d) => {
              const dischargeDate = d.createdAt ? new Date(d.createdAt) : null;

              return {
                uhid: d.uniqueHealthIdentificationId?.uhid || '',
                patientName: d.uniqueHealthIdentificationId?.patient_name || '',
                dischargeDate, // <-- from createdAt
                // dischargeTime: d.uniqueHealthIdentificationId?.dot || '', // <-- from dot
                status: d.status,
                condition: d.conditionOnDischarge,
              };
            });

            console.log(
              '✅ All Discharges Fetched:',
              this.allDischarges.length
            );
            resolve();
          }
        },
        error: (err) => {
          console.error('Error loading discharges', err);
          reject(err);
        },
      });
    });
  }

  // Recursive pagination fetch (same idea as you had)
  getIpdpatientSummary(page: number = 1, allData: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ipdservice.getIPDcase(page).subscribe({
        next: (res) => {
          const currentData = res.data?.inpatientCases || res.data || [];
          const totalPages = res.data?.totalPages || 1;
          const currentPage = res.data?.currentPage || page;
          const combined = [...allData, ...currentData];

          if (currentPage < totalPages) {
            this.getIpdpatientSummary(currentPage + 1, combined).then(resolve);
          } else {
            this.allIndoorData = combined;
            console.log('✅ All IPD Data Fetched:', this.allIndoorData.length);
            resolve();
          }
        },
        error: (err) => {
          console.error('Error loading IPD summary', err);
          reject(err);
        },
      });
    });
  }

  mergeDischargesIntoPatients() {
    if (!this.allIndoorData?.length || !this.allDischarges?.length) {
      console.warn('⚠️ No data to merge.');
      return;
    } // Store in fullSummary, not directly in indoorSummary
    this.fullSummary = this.allIndoorData.map((patient) => {
      const uhid =
        patient.uniqueHealthIdentificationId?.uhid || patient.uhid || '';
      const discharge = this.allDischarges.find((d: any) => d.uhid === uhid);
      console.log("Discharge data", discharge);
      return {
        ...patient,
        dischargeDate: discharge?.dischargeDate || null,
        dischargeStatus: discharge?.status || '',
        dischargeCondition: discharge?.condition || '',
      };
    });
    this.indoorSummary = this.fullSummary; // initialize the summary
    console.log('✅ Merged data count:', this.indoorSummary.length);
  }

  // Safe date parsing helper (returns null if invalid)
  private parseDateSafe(d: any): Date | null {
    if (!d) return null;
    const date = new Date(d);
    return isNaN(date.getTime()) ? null : date;
  }

  // NEW: Handler for month/year change (synchronizes date range)
  onMonthOrYearChange() {
    const { year, month } = this.filters;
    if (month && month !== 'all' && year) {
      // Set startDate/endDate for the selected month
      const firstDay = new Date(Number(year), Number(month) - 1, 1);
      const lastDay = new Date(Number(year), Number(month), 0);
      this.startDate = firstDay.toISOString().split('T')[0];
      this.endDate = lastDay.toISOString().split('T')[0];
    } else if (year && (!month || month === 'all')) {
      // Only year selected: full year
      const firstDay = new Date(Number(year), 0, 1);
      const lastDay = new Date(Number(year), 11, 31);
      this.startDate = firstDay.toISOString().split('T')[0];
      this.endDate = lastDay.toISOString().split('T')[0];
    }
    this.applyFilters();
  }

  // NEW: Handler for date change (resets month to 'all' for clarity)
  onDateRangeChange() {
    this.filters.month = 'all';
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.fullSummary];
    // Date range filter (now always in sync with month/year if selected)
    if (this.startDate || this.endDate) {
      const from = this.startDate ? new Date(this.startDate) : null;
      const to = this.endDate ? new Date(this.endDate) : null;
      if (to) to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((item) => {
        const d = this.parseDateSafe(item.admissionDate);
        if (!d) return false;
        if (from && to) return d >= from && d <= to;
        if (from) return d >= from;
        if (to) return d <= to;
        return true;
      });
    }
    // UHID filter
    if (this.filters.uhid && this.filters.uhid.trim() !== '') {
      const q = this.filters.uhid.trim().toLowerCase();
      filtered = filtered.filter((item) =>
        item.uniqueHealthIdentificationId?.uhid
          ?.toString()
          .toLowerCase()
          .includes(q)
      );
    }
    // Patient name filter
    if (this.filters.name && this.filters.name.trim() !== '') {
      const q = this.filters.name.trim().toLowerCase();
      filtered = filtered.filter((item) =>
        item.uniqueHealthIdentificationId?.patient_name
          ?.toLowerCase()
          .includes(q)
      );
    }
    // IPD Number filter
    if (this.filters.ipdNo && this.filters.ipdNo.trim() !== '') {
      const q = this.filters.ipdNo.trim().toLowerCase();
      filtered = filtered.filter((item) =>
        item.inpatientCaseNumber?.toString().toLowerCase().includes(q)
      );
    }
    // Bill Number filter
    if (this.filters.billNo && this.filters.billNo.trim() !== '') {
      const q = this.filters.billNo.trim().toLowerCase();
      filtered = filtered.filter((item) =>
        item.billNo?.toString().toLowerCase().includes(q)
      );
    }
    // Final assign
    this.indoorSummary = filtered;
    console.log('filtered summary', this.indoorSummary);
  }

  updateDateRangeByMonth() {
    const year = Number(this.filters.year);
    const month = this.filters.month;

    if (month === 'all' || isNaN(year)) {
      // If "All" selected → clear date range and reapply filters
      this.startDate = '';
      this.endDate = '';
      this.applyFilters();
      return;
    }

    // Auto set start & end date for that month
    const firstDay = new Date(year, Number(month) - 1, 1);
    const lastDay = new Date(year, Number(month), 0);

    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = lastDay.toISOString().split('T')[0];

    this.applyFilters();
  }

  // When user manually changes date range
  updateMonthYearFromDateRange() {
    if (!this.startDate || !this.endDate) {
      this.applyFilters();
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    // If both dates are within same month & year, update dropdowns accordingly
    if (
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth()
    ) {
      this.filters.year = start.getFullYear();
      this.filters.month = (start.getMonth() + 1).toString().padStart(2, '0');
    } else {
      // Spans multiple months → show "All"
      this.filters.month = 'all';
    }

    this.applyFilters();
  }

  // Optional helper: reset filters to defaults
  resetFilters() {
    this.filters = {
      year: new Date().getFullYear(),
      month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
      dateFrom: '',
      dateTo: '',
      uhid: '',
      name: '',
      ipdNo: '',
      billNo: '',
    };
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  viewsummary(patient: any) {
    if(patient.isDischarge !== true){
      this.router.navigate(['/ipdpatientsummary'], {
        queryParams: { id: patient._id },
      });
    }else{
      this.router.navigate(['/ipdpatientsummarychart'], {
        queryParams: { id: patient._id },
      });
    }
  }
}
