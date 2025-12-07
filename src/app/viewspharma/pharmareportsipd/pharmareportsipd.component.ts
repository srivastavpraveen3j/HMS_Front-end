import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import * as XLSX from 'xlsx';
import { Chart } from 'chart.js/auto';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { LoaderComponent } from '../../views/loader/loader.component';
import { OpdService } from '../../views/opdmodule/opdservice/opd.service';
import { PharmaService } from '../pharma.service';
import { UhidService } from '../../views/uhid/service/uhid.service';
import { registerables } from 'chart.js';
import { IndianCurrencyPipe } from '../../pipe/indian-currency.pipe';
Chart.register(...registerables);

@Component({
  selector: 'app-pharmareportsipd',
  imports: [
    CommonModule,
    FormsModule,
    CanvasJSAngularChartsModule,
    LoaderComponent,
    IndianCurrencyPipe
  ],
  templateUrl: './pharmareportsipd.component.html',
  styleUrl: './pharmareportsipd.component.css',
})
export class PharmareportsipdComponent {
  title: String = '';
  subTitle: String = '';

  opdpharmaData: any[] = [];
  filteredData: any[] = [];
  selectedRange: 'today' | 'week' | 'month' | 'year' = 'today';
  chart: any;
  timeout: any = null;
  chartOptions: any;
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

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalRecords: number = 0;
  paginatedData: any[] = [];
  // @ViewChild('pdfContent') pdfContent!: ElementRef;
  @ViewChild('pdfFullContent') pdfFullContent!: ElementRef;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  constructor(
    private opdBill: OpdService,
    private route: ActivatedRoute,
    private pharmaservice: PharmaService,
    private uhidservice: UhidService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getOPDpharmaBill();

    this.route.queryParams.subscribe((params) => {
      this.title = params['title'] || 'IPD  PHARMA PATIENTS';
    });
  }

  totalAmountReceived = 0;
  getOPDpharmaBill() {
    let allData: any[] = [];
    let currentPage = 1;

    const fetchPage = (page: number) => {
      this.pharmaservice.getPharmareq(page).subscribe({
        next: (response: any) => {
          const result = response || response; // adjust if needed
          const array = Array.isArray(response)
          ? response
          : response.data || response.items || response.records || [];
           const opdRecords = Array.isArray(array)
          ? array.filter(
              (item: any) =>
                item.type === 'inpatientDepartment'
            )
          : [];

          allData = [...allData, ...opdRecords];

          if (result.totalPages && currentPage < result.totalPages) {
            fetchPage(++currentPage); // go to next page
          } else {
            this.enrichPharmaWithUHID(allData); // 🎯 enrich after fetch
          }
        },
        error: (error: any) => {
          console.error('Error fetching OPD pharma data:', error);
        },
      });
    };

    fetchPage(currentPage);
  }

  enrichPharmaWithUHID(pharmaList: any[]) {
    const enrichedData: any[] = [];
    let completed = 0;

    for (const pharma of pharmaList) {
      const uhidId = pharma.uniqueHealthIdentificationId._id;

      if (!uhidId || typeof uhidId !== 'string') {
        enrichedData.push({
          ...pharma,
          patient_name: '[UNKNOWN]',
          age: '-',
          gender: '-',
          uhid: '-',
        });
        completed++;
        continue;
      }

      this.uhidservice.getUhidById(uhidId).subscribe({
        next: (res: any) => {
          const patient = res?.[0] || res;

          enrichedData.push({
            ...pharma,
            patient_name: patient?.patient_name || '[UNKNOWN]',
            age: patient?.age || '-',
            gender: patient?.gender || '-',
            uhid: patient?.uhid || '-',
          });

          completed++;
          if (completed === pharmaList.length) {
            this.opdpharmaData = enrichedData;
            this.filteredData = [...this.opdpharmaData];
            this.applyDateRange(); // ✅ run your filters
          }
        },
        error: () => {
          enrichedData.push({
            ...pharma,
            patient_name: '[ERROR]',
            age: '-',
            gender: '-',
            uhid: '-',
          });

          completed++;
          if (completed === pharmaList.length) {
            this.opdpharmaData = enrichedData;
            this.filteredData = [...this.opdpharmaData];
            this.applyDateRange();
          }
        },
      });
    }
  }

  //  ngAfterViewInit(): void {
  //   // Delay chart render slightly to ensure canvas is ready
  //   setTimeout(() => {
  //     this.renderChart();
  //   }, 0);
  // }

  selectRange(range: 'today' | 'week' | 'month' | 'year') {
    this.selectedRange = range;
    this.applyDateRange();
  }

  updatePaginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  applyDateRange() {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = new Date(today);

    const formatDate = (d: Date) =>
      d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

    switch (this.selectedRange) {
      case 'today':
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        this.subTitle = ` - Today's  IPD Pharmacy  Report (${formatDate(
          startDate
        )})`;

        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(today.getDate() - 6);
        this.subTitle = ` - This Week IPD Pharmacy Report (${formatDate(
          startDate
        )} to ${formatDate(new Date())})`;
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.subTitle = ` - This Month IPD Pharmacy Report  (${formatDate(
          startDate
        )} to ${formatDate(today)})`;
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1); // Jan 1st of this year
        endDate = today; // Today
        this.subTitle = ` - This Year IPD Pharmacy Report  (${formatDate(
          startDate
        )} to ${formatDate(endDate)})`;
        break;
      default:
        this.filteredData = this.opdpharmaData;
        this.totalAmountReceived = this.filteredData.reduce(
          (sum, bill) => sum + (parseFloat(bill.total) || 0),
          0
        );
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        this.updatePaginatedData();
        setTimeout(() => {
          this.renderChart(); // Move chart creation logic here
        }, 0);
        return;
    }

    this.filteredData = this.opdpharmaData.filter((bill) => {
      const billDate = new Date(bill.createdAt);
      if (isNaN(billDate.getTime())) return false;
      return billDate >= startDate && billDate <= endDate;
    });

    this.totalAmountReceived = this.filteredData.reduce(
      (sum, bill) => sum + (parseFloat(bill.total) || 0),
      0
    );

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.updatePaginatedData();
    // ✅ Force view to update
    this.cdRef.detectChanges(); // Ensure canvas is rendered

    // ✅ Then render chart
    setTimeout(() => {
      this.renderChart();
    }, 0);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  // renderChart() {
  //   const chartElement = this.chartCanvas?.nativeElement as HTMLCanvasElement;
  //   if (!chartElement) {
  //     console.error('Chart canvas ViewChild not found.');
  //     return;
  //   }

  //   if (this.chart) {
  //     this.chart.destroy();
  //   }

  //   const dateAmounts: Record<string, number> = {};
  //   const colorPalette = [
  //     '#17A2B8',
  //     '#28a745',
  //     '#ffc107',
  //     '#dc3545',
  //     '#6f42c1',
  //     '#fd7e14',
  //     '#20c997',
  //     '#6610f2',
  //     '#e83e8c',
  //     '#6c757d',
  //   ];

  //   console.log("🚀 ~ PharmareportsComponent ~ renderChart ~  this.filteredData:",  this.filteredData)
  //   this.filteredData.forEach((record: any) => {
  //     const date = new Date(record.createdAt);
  //     if (isNaN(date.getTime())) return;

  //     let key: string;
  //     if (this.selectedRange === 'year') {
  //       key = date.toLocaleString('default', { month: 'short' }); // Jan, Feb, ...
  //     } else {
  //       key = date.toISOString().split('T')[0]; // YYYY-MM-DD
  //     }

  //     const amount = parseFloat(record.total) || 0;
  //     dateAmounts[key] = (dateAmounts[key] || 0) + amount;
  //   });

  //   let sortedLabels = Object.keys(dateAmounts);
  //   if (this.selectedRange === 'year') {
  //     const monthOrder = [
  //       'Jan',
  //       'Feb',
  //       'Mar',
  //       'Apr',
  //       'May',
  //       'Jun',
  //       'Jul',
  //       'Aug',
  //       'Sep',
  //       'Oct',
  //       'Nov',
  //       'Dec',
  //     ];
  //     sortedLabels.sort(
  //       (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
  //     );
  //   } else {
  //     sortedLabels.sort(
  //       (a, b) => new Date(a).getTime() - new Date(b).getTime()
  //     );
  //   }

  //   const billingAmounts = sortedLabels.map((label) => dateAmounts[label]);
  //   const isBar = this.chartType === 'bar';

  //   this.chart = new Chart(chartElement, {
  //     type: this.chartType,
  //     data: {
  //       labels: sortedLabels,
  //       datasets: [
  //         {
  //           label: 'Total OPD Pharma Billing Amount',
  //           data: billingAmounts,
  //           backgroundColor: isBar
  //             ? sortedLabels.map(
  //                 (_, i) => colorPalette[i % colorPalette.length]
  //               )
  //             : 'rgba(75,192,192,0.4)',
  //           borderColor: isBar
  //             ? sortedLabels.map(
  //                 (_, i) => colorPalette[i % colorPalette.length]
  //               )
  //             : 'rgba(75,192,192,1)',
  //           borderWidth: 2,
  //           fill: !isBar,
  //           tension: isBar ? 0 : 0.4,
  //         },
  //       ],
  //     },
  //     options: {
  //       responsive: true,
  //       maintainAspectRatio: false,
  //       plugins: {
  //         tooltip: {
  //           callbacks: {
  //             label: (context: any) => `₹${context.raw.toFixed(2)}`,
  //           },
  //         },
  //         legend: {
  //           display: true,
  //           position: 'bottom',
  //         },
  //         title: {
  //           display: true,
  //           text:
  //             this.selectedRange === 'year'
  //               ? 'Monthly Billing Amount'
  //               : 'Billing Amount by Date',
  //         },
  //       },
  //       scales: {
  //         x: {
  //           title: {
  //             display: true,
  //             text: this.selectedRange === 'year' ? 'Month' : 'Date',
  //           },
  //         },
  //         y: {
  //           beginAtZero: true,
  //           title: {
  //             display: true,
  //             text: 'Amount (₹)',
  //           },
  //         },
  //       },
  //     },
  //   });
  // }

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
      '#17A2B8',
      '#28a745',
      '#ffc107',
      '#dc3545',
      '#6f42c1',
      '#fd7e14',
      '#20c997',
      '#6610f2',
      '#e83e8c',
      '#6c757d',
    ];

    // Step 1: Aggregate billing totals by date/month
    this.filteredData.forEach((record: any) => {
      const date = new Date(record.createdAt);
      if (isNaN(date.getTime())) return;

      let key: string;
      if (this.selectedRange === 'year') {
        key = date.toLocaleString('default', { month: 'short' }); // Jan, Feb...
      } else {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      }

      const amount = parseFloat(record.total) || 0;
      dateAmounts[key] = (dateAmounts[key] || 0) + amount;
    });

    // Step 2: Sort labels
    let sortedLabels = Object.keys(dateAmounts);
    if (this.selectedRange === 'year') {
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

    const isBar = this.chartType === 'bar';

    // Step 3: Format data
    const bubbleData = sortedLabels.map((label, index) => {
      const amount = dateAmounts[label];
      const radius = Math.sqrt(amount) / 2 || 5;
      return {
        x: index,
        y: amount,
        r: radius,
      };
    });

    const scatterData = sortedLabels.map((label, index) => ({
      x: index,
      y: dateAmounts[label],
    }));

    const finalData =
      this.chartType === 'bubble'
        ? bubbleData
        : this.chartType === 'scatter'
        ? scatterData
        : sortedLabels.map((label) => dateAmounts[label]);

    this.chart = new Chart(chartElement, {
      type: this.chartType,
      data: {
        labels:
          this.chartType === 'bar' || this.chartType === 'line'
            ? sortedLabels
            : undefined,
        datasets: [
          {
            label: 'Total IPD Pharma Billing Amount',
            data: finalData,
            backgroundColor: sortedLabels.map(
              (_, i) => colorPalette[i % colorPalette.length]
            ),
            borderColor: sortedLabels.map(
              (_, i) => colorPalette[i % colorPalette.length]
            ),
            borderWidth: 2,
            fill: !isBar,
            tension: isBar ? 0 : 0.4,
            showLine: this.chartType === 'scatter' ? false : undefined, // no line for scatter
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const index = context.dataIndex;
                const label = sortedLabels[index];
                const raw = context.raw;
                if (this.chartType === 'bubble') {
                  return `${label}: ₹${raw.y.toFixed(
                    2
                  )} (bubble size: ${raw.r.toFixed(1)})`;
                } else if (this.chartType === 'scatter') {
                  return `${label}: ₹${raw.y.toFixed(2)}`;
                } else {
                  return `${label}: ₹${context.raw.toFixed(2)}`;
                }
              },
            },
          },
          legend: {
            display: true,
            position: 'bottom',
          },
          title: {
            display: true,
            text:
              this.selectedRange === 'year'
                ? 'Monthly Billing Amount'
                : 'Billing Amount by Date',
          },
        },
        scales: {
          x:
            this.chartType === 'bubble' || this.chartType === 'scatter'
              ? {
                  type: 'linear',
                  title: {
                    display: true,
                    text: 'Time Index',
                  },
                  ticks: {
                    stepSize: 1,
                    callback: (val: any) => sortedLabels[val] || '',
                  },
                }
              : {
                  title: {
                    display: true,
                    text: this.selectedRange === 'year' ? 'Month' : 'Date',
                  },
                },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount (₹)',
            },
          },
        },
      },
    });
  }

  isGeneratingPDF = false;

  async downloadPDF() {
    this.isGeneratingPDF = true;

    const elementsToHide = document.querySelectorAll(
      '.no-print, .d-print-none, .filter-tabs'
    );
    elementsToHide.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });

    const html2canvas = (await import('html2canvas')).default;
    const { default: jsPDF } = await import('jspdf');

    setTimeout(async () => {
      const element = this.pdfFullContent.nativeElement;
      const canvas = await html2canvas(element, {
        scale: 2,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('IPD_Pharmacy_Report.pdf');

      // Reset view
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });

      this.isGeneratingPDF = false; // Restore UI
    }, 100);
  }
}
