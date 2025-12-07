import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestComponent } from './../../component/testcomponent/test/test.component';
import { UhidService } from '../../views/uhid/service/uhid.service';
import { TestService } from '../testservice/test.service';
import * as XLSX from 'xlsx';
import { Chart } from 'chart.js/auto';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MasterService } from '../../views/mastermodule/masterservice/master.service';
import { LoaderComponent } from "../../views/loader/loader.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pathoreports',
  standalone: true,
  imports: [CommonModule, RouterModule, TestComponent, LoaderComponent, FormsModule],
  templateUrl: './pathoreports.component.html',
  styleUrls: ['./pathoreports.component.css']
})
export class PathoreportsComponent implements AfterViewInit {
  title = '';
  allPathoRequests: any[] = [];
  filteredPatients: any[] = [];
  chart: any;
  activeFilter: 'today' | 'week' | 'month' | 'year' = 'today';
  selectedPatient: any = null;
  isPrinting = false;
  chartType:
    | 'bar'
    | 'line'
    | 'pie'
    | 'radar'
    | 'bubble'
    | 'polarArea'
    | 'scatter'
    | 'doughnut' = 'bar';
      chartTitle: any;

  @ViewChild('pathoChart') pathoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private masterService: MasterService,
    private testService: TestService,
    private uhidService: UhidService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.title = params['title'] || 'Unknown Test Group';
      this.fetchFilteredRequestsFromBackend(this.title);
    });
  }


  ngAfterViewInit() {
    // Delay rendering chart until data is loaded
    setTimeout(() => {
      if (this.filteredPatients?.length > 0 && this.pathoChartRef) {
        this.renderChart();
      }
    }, 0);
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
  totalAmountReceived : string ='';

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

  // Filter patients within the date range
  this.filteredPatients = this.allPathoRequests.filter(p =>
    new Date(p.createdAt) >= start && new Date(p.createdAt) <= end
  );

  // ✅ Now calculate the total
  console.log("🚀 ~ Filtered Patients:", this.filteredPatients);
  this.totalAmountReceived = this.filteredPatients.reduce(
    (sum, bill) => sum + (parseFloat(bill.total) || 0),
    0
  );
  console.log("🚀 ~ Total Amount Received:", this.totalAmountReceived);

  // Re-render chart
  this.cdRef.detectChanges();
  setTimeout(() => this.renderChart(), 0);
}



  // renderChart(): void {
  //   const canvas = this.pathoChartRef.nativeElement;
  //   const ctx = canvas.getContext('2d');

  //   if (!ctx) {
  //     console.error('Chart context not found.');
  //     return;
  //   }

  //   const labels = this.filteredPatients.map(p =>
  //     new Date(p.createdAt).toLocaleDateString()
  //   );

  //   const data = {
  //     labels,
  //     datasets: [{
  //       label: 'Test Count',
  //       data: this.filteredPatients.map(() => 1), // One per patient
  //       backgroundColor: '#27a3b5'
  //     }]
  //   };

  //   this.chart = new Chart(ctx, {
  //     type: 'bar',
  //     data,
  //     options: {
  //       responsive: true,
  //       plugins: {
  //         legend: { display: true },
  //       },
  //       scales: {
  //         x: {
  //           title: { display: true, text: 'Date' }
  //         },
  //         y: {
  //           beginAtZero: true,
  //           title: { display: true, text: 'Count' }
  //         }
  //       }
  //     }
  //   });
  // }

   changeChartType(
    type:
      | 'bar'
      | 'line'
      | 'pie'
      | 'radar'
      | 'bubble'
      | 'polarArea'
      | 'scatter'
      | 'doughnut'
  ) {
    this.chartType = type;
    this.renderChart();
  }

  renderChart() {
    const chartElement = this.chartCanvas?.nativeElement as HTMLCanvasElement;
    if (!chartElement) {
      console.error('Chart canvas ViewChild not found.');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const dateAmounts: Record<string, number> = {};
    const colorPalette = [
      '#3498db',
      '#e74c3c',
      '#2ecc71',
      '#f39c12',
      '#9b59b6',
      '#660000',
      '#34495e',
      '#e67e22',
      '#95a5a6',
      '#f1c40f',
    ];

    this.filteredPatients.forEach((record: any) => {
      const date = new Date(record.createdAt);
      if (isNaN(date.getTime())) return;

      let key: string;
      if (this.activeFilter === 'year') {
        key = date.toLocaleString('default', { month: 'short' });
      } else {
        key = date.toISOString().split('T')[0];
      }

      const amount = parseFloat(record.total) || 0;
      dateAmounts[key] = (dateAmounts[key] || 0) + amount;
    });

    let sortedLabels = Object.keys(dateAmounts);
    if (this.activeFilter === 'year') {
      const monthOrder = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      sortedLabels.sort(
        (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
      );
    } else {
      sortedLabels.sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );
    }

    const billingAmounts = sortedLabels.map((label) => dateAmounts[label]);

    // Chart configuration based on type
    let chartData: any = {
      labels: sortedLabels,
      datasets: [
        {
          label: 'Total OPD Pharma Billing Amount',
          data: billingAmounts,
          backgroundColor:
            this.chartType === 'line'
              ? 'rgba(52, 152, 219, 0.2)'
              : colorPalette.slice(0, sortedLabels.length),
          borderColor:
            this.chartType === 'line'
              ? '#3498db'
              : colorPalette.slice(0, sortedLabels.length),
          borderWidth: 2,
          fill: this.chartType === 'line',
          tension: 0.4,
        },
      ],
    };

    // Special handling for bubble and scatter charts
    if (this.chartType === 'bubble') {
      chartData.datasets[0].data = sortedLabels.map((label, index) => ({
        x: index,
        y: dateAmounts[label],
        r: Math.sqrt(dateAmounts[label]) / 10 || 3,
      }));
    } else if (this.chartType === 'scatter') {
      chartData.datasets[0].data = sortedLabels.map((label, index) => ({
        x: index,
        y: dateAmounts[label],
      }));
      chartData.labels = undefined;
    }

    this.chart = new Chart(chartElement, {
      type: this.chartType,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart',
        },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            cornerRadius: 8,
            callbacks: {
              label: (context: any) => {
                const value =
                  this.chartType === 'bubble' || this.chartType === 'scatter'
                    ? context.raw.y || context.raw
                    : context.raw;
                return `₹${value.toFixed(2)}`;
              },
            },
          },
          legend: {
            display: ['pie', 'doughnut', 'polarArea'].includes(this.chartType),
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          title: {
            display: true,
            text:
              this.activeFilter === 'year'
                ? 'Monthly Billing Amount'
                : 'Billing Amount by Date',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
        },
        scales: this.getScalesConfig(sortedLabels),
      },
    });
  }

    private getScalesConfig(sortedLabels: string[]) {
    if (['pie', 'doughnut', 'polarArea'].includes(this.chartType)) {
      return {};
    }

    const config: any = {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (₹)',
          font: { weight: 'bold' },
        },
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
      },
    };

    if (this.chartType === 'bubble' || this.chartType === 'scatter') {
      config.x = {
        type: 'linear',
        title: {
          display: true,
          text: 'Time Index',
          font: { weight: 'bold' },
        },
        ticks: {
          stepSize: 1,
          callback: (val: any) => sortedLabels[val] || '',
        },
      };
    } else {
      config.x = {
        title: {
          display: true,
          text: this.activeFilter === 'year' ? 'Month' : 'Date',
          font: { weight: 'bold' },
        },
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
      };
    }

    return config;
  }


  changeFilter(filter: 'today' | 'week' | 'month' | 'year') {
    this.activeFilter = filter;

    this.applyDateFilter();
  }



  getTestNames(record: any): string {
    const matchingGroup = record.testMaster?.find((tm: any) =>
      tm?.testGroup?.toLowerCase().trim() === this.title.toLowerCase().trim()
    );
    return matchingGroup?.testParameters
      ?.map((tp: any) => tp.test_name)
      .join(', ') || 'N/A';
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
    case 'today':
      return `Report for ${now.toDateString()}`;

    case 'week': {
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay() || 7; // Sunday = 7
      startOfWeek.setDate(now.getDate() - day + 1); // Monday

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

      const startStr = `${startOfWeek.getDate()} ${startOfWeek.toLocaleString('default', { month: 'short' })}`;
      const endStr = `${endOfWeek.getDate()} ${endOfWeek.toLocaleString('default', { month: 'short' })}`;

      return `Weekly Report: ${startStr} - ${endStr} ${now.getFullYear()}`;
    }

    case 'month':
      return `Monthly Report: ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;

    case 'year':
      return `Yearly Report: ${now.getFullYear()}`;

    default:
      return 'Patient Report';
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
    'Patient Name': record?.walkInPatient?.name || record.patient_name || 'N/A',
    'Age / Gender': `${record?.walkInPatient?.age || record.age || 'N/A'} / ${record?.walkInPatient?.gender || record.gender || 'N/A'}`,
    'Test Name(s)': this.getTestNames(record)
  }));

  // Add total amount row
  exportData.push({
    '#': 0,
    'UHID': '',
    'Patient Name': '',
    'Age / Gender': '',
    'Test Name(s)': `Total Amount Received: ₹${Number(this.totalAmountReceived).toFixed(2)}`
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  const safeSheetName = `${this.title} Report`.substring(0, 31).replace(/[/\\?*[\]:]/g, '');
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
  XLSX.writeFile(workbook, `${this.title}_Patients.xlsx`);
}



}
