// radiationreports.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import * as XLSX from 'xlsx';
import { Chart } from 'chart.js/auto';
import { TestService } from '../../viewspatho/testservice/test.service';
import { UhidService } from '../../views/uhid/service/uhid.service';
import { TestComponent } from '../../component/testcomponent/test/test.component';
import { MasterService } from '../../views/mastermodule/masterservice/master.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
@Component({
  selector: 'app-radiationreports',
  standalone: true,
  imports: [CommonModule, RouterModule, TestComponent],
  templateUrl: './radiationreports.component.html',
  styleUrl: './radiationreports.component.css'
})
export class RadiationreportsComponent {
title = '';
  allPathoRequests: any[] = [];
  filteredPatients: any[] = [];
  chart: any;
  activeFilter: 'today' | 'week' | 'month' | 'year' = 'today';
  selectedPatient: any = null;
  isPrinting = false;

  constructor(
    private route: ActivatedRoute,
    private masterService: MasterService,
    private testService: TestService,
    private uhidService: UhidService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.title = params['title'] || 'Unknown Test Group';
      this.fetchFilteredRequestsFromBackend(this.title);
    });
  }

  fetchFilteredRequestsFromBackend(testGroup: string): void {
    this.testService.getTestreq(1, 100, testGroup).subscribe((res: any[]) => {
      const filteredByGroup = (res || []).filter((req: any) =>
        req.testMaster?.some((tm: any) =>
          tm?.testGroup?.toLowerCase().trim() === testGroup.toLowerCase().trim()
        )
      );

      const observables = filteredByGroup.map((req: any) => {
        const uhidId = typeof req.uniqueHealthIdentificationId === 'object'
          ? req.uniqueHealthIdentificationId._id
          : req.uniqueHealthIdentificationId;

        if (!uhidId) {
          return of({
            ...req,
            patient_name: 'N/A',
            age: 'N/A',
            gender: 'N/A',
            dob: '',
            mobile: '',
            uhid: 'N/A'
          });
        }

        return this.uhidService.getUhidById(uhidId).pipe(
          map(uhid => ({
            ...req,
            patient_name: uhid?.patient_name || 'N/A',
            age: uhid?.age || 'N/A',
            gender: uhid?.gender || 'N/A',
            dob: uhid?.dob || '',
            mobile: uhid?.mobile_no || '',
            uhid: uhid?.uhid || ''
          })),
          catchError(() => of({
            ...req,
            patient_name: 'N/A',
            age: 'N/A',
            gender: 'N/A',
            dob: '',
            mobile: '',
            uhid: 'N/A'
          }))
        );
      });

      forkJoin(observables).subscribe({
        next: (enriched: any[]) => {
          this.allPathoRequests = enriched;
          this.applyDateFilter();
        },
        error: err => {
          console.error('❌ Error in forkJoin:', err);
          this.allPathoRequests = [];
        }
      });
    });
  }

  applyDateFilter() {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    switch (this.activeFilter) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff); start.setHours(0, 0, 0, 0);
        end.setDate(diff + 6); end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1); start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0); end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        start.setMonth(0, 1); start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31); end.setHours(23, 59, 59, 999);
        break;
    }

    this.filteredPatients = this.allPathoRequests.filter(p =>
      new Date(p.createdAt) >= start && new Date(p.createdAt) <= end
    );

    this.renderChart();
  }

  renderChart() {
    if (this.chart) this.chart.destroy();
    const grouped: Record<string, number> = {};
    const now = new Date();

    this.filteredPatients.forEach(p => {
      const date = new Date(p.createdAt);
      let label: string;

      if (this.activeFilter === 'month') {
        const day = date.getDate();
        const weekNumber = Math.floor((day - 1) / 7) + 1;
        const startDay = (weekNumber - 1) * 7 + 1;
        const endDay = Math.min(weekNumber * 7, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());
        label = `${startDay}-${endDay} ${date.toLocaleString('default', { month: 'short' })}`;
      } else if (this.activeFilter === 'year') {
        label = date.toLocaleString('default', { month: 'short' });
      } else {
        label = date.toISOString().split('T')[0];
      }

      grouped[label] = (grouped[label] || 0) + 1;
    });

    this.chart = new Chart('pathoChart', {
      type: 'bar',
      data: {
        labels: Object.keys(grouped),
        datasets: [{
          label: `No. of Patients - ${this.title}`,
          data: Object.values(grouped),
          backgroundColor: '#17a2b8',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => `Patients: ${context.raw}`
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: this.activeFilter === 'year' ? 'Months' : this.activeFilter === 'month' ? 'Weeks' : 'Date'
            },
            ticks: { autoSkip: false, maxRotation: 45, minRotation: 30 }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Patient Count' }
          }
        }
      }
    });
  }

  changeFilter(filter: 'today' | 'week' | 'month' | 'year') {
    this.activeFilter = filter;
    this.applyDateFilter();
  }

  getTestNames(record: any): string {
    const matchingGroup = record.testMaster?.find((tm: any) =>
      tm?.testGroup?.toLowerCase().trim() === this.title.toLowerCase().trim()
    );
    return matchingGroup?.testParameters?.map((tp: any) => tp.test_name).join(', ') || 'N/A';
  }

  viewPatient(id: string) {
    this.testService.getTestreqById(id).subscribe({
      next: res => this.selectedPatient = res,
      error: err => console.error('Error fetching patient:', err)
    });
  }

  closeModal() {
    this.selectedPatient = null;
  }

  getReportTitle(): string {
    const now = new Date();
    switch (this.activeFilter) {
      case 'today': return `Report for ${now.toDateString()}`;
      case 'week': {
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay() || 7;
        startOfWeek.setDate(now.getDate() - day + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `Weekly Report: ${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${now.getFullYear()}`;
      }
      case 'month': return `Monthly Report: ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
      case 'year': return `Yearly Report: ${now.getFullYear()}`;
      default: return 'Patient Report';
    }
  }

  async printPathologyReport(): Promise<void> {
    const printContent = document.getElementById('patho-report');
    if (!printContent) return;
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    this.isPrinting = true;
    await new Promise(resolve => setTimeout(resolve, 100));
    const canvas = await html2canvas(printContent, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${this.getReportTitle().replace(/[:]/g, '-')}-${this.title}.pdf`);
    this.isPrinting = false;
  }

  exportToExcel() {
    const exportData = this.filteredPatients.map((record, index) => ({
      '#': index + 1,
      'UHID': record.uhid || 'N/A',
      'Patient Name': record.patient_name || 'N/A',
      'Age / Gender': `${record.age || 'N/A'} / ${record.gender || 'N/A'}`,
      'Test Name(s)': this.getTestNames(record)
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${this.title} Report`);
    XLSX.writeFile(workbook, `${this.title}_Patients.xlsx`);
  }
}
