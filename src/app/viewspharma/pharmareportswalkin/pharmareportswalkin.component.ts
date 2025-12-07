import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  selector: 'app-pharmareportswalkin',
  imports: [
    CommonModule,
    FormsModule,
    CanvasJSAngularChartsModule,
    LoaderComponent,
    IndianCurrencyPipe
  ],
  templateUrl: './pharmareportswalkin.component.html',
  styleUrl: './pharmareportswalkin.component.css',
})
export class PharmareportswalkinComponent implements OnInit {
  title: String = '';
  subTitle: String = '';
  opdpharmaData: any[] = [];
  filteredData: any[] = [];
  selectedRange: 'today' | 'yesterday' | 'week' | 'month' | 'year' = 'today';
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
  isGeneratingPDF = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalRecords: number = 0;
  paginatedData: any[] = [];
  @ViewChild('pdfFullContent') pdfFullContent!: ElementRef;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  totalAmountReceived = 0;

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
      this.title = params['title'] || 'OPD WALKIN PHARMA PATIENTS';
    });
  }

  getOPDpharmaBill() {
    let allData: any[] = [];
    let currentPage = 1;

    const fetchPage = (page: number) => {
      this.pharmaservice.getPharmareq(page).subscribe({
        next: (response: any) => {
          const result = response || [];
          const array = response.data || response.items || response || [];
          const opdRecords = Array.isArray(array)
            ? array.filter(
                (item: any) =>
                  item.type === 'outpatientDepartment' && item.isWalkIn === true
              )
            : [];
          allData = [...allData, ...opdRecords];
          if (result.totalPages && currentPage < result.totalPages) {
            fetchPage(++currentPage);
          } else {
            this.opdpharmaData = allData;
            this.filteredData = [...this.opdpharmaData];
            this.applyDateRange();
          }
        },
        error: (error: any) => {
          console.error('Error fetching OPD pharma data:', error);
        },
      });
    };

    fetchPage(currentPage);
  }

  selectRange(range: 'today' | 'yesterday' | 'week' | 'month' | 'year') {
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
    let endDate: Date;
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
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        );
        this.subTitle = ` - (${formatDate(startDate)})`;
        break;
      case 'yesterday':
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 1
        );
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 1,
          23,
          59,
          59,
          999
        );
        this.subTitle = ` - (${formatDate(startDate)})`;
        break;
      case 'week':
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 6
        );
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        );
        this.subTitle = ` - (${formatDate(startDate)} to ${formatDate(
          endDate
        )})`;
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        );
        this.subTitle = ` - (${formatDate(startDate)} to ${formatDate(
          endDate
        )})`;
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        );
        this.subTitle = ` - (${formatDate(startDate)} to ${formatDate(
          endDate
        )})`;
        break;
      default:
        startDate = new Date(0);
        endDate = new Date();
        break;
    }

    this.filteredData = this.opdpharmaData.filter((bill) => {
      const billDate = new Date(bill.createdAt);
      if (isNaN(billDate.getTime())) return false;
      // Convert both to local date (if your input is UTC string, JS Date will auto-convert)
      return billDate >= startDate && billDate <= endDate;
    });

    this.totalAmountReceived = this.filteredData.reduce(
      (sum, bill) => sum + (parseFloat(bill.total) || 0),
      0
    );
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.updatePaginatedData();
    this.cdRef.detectChanges();
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
    this.filteredData.forEach((record: any) => {
      const date = new Date(record.createdAt);
      if (isNaN(date.getTime())) return;
      let key: string;
      if (this.selectedRange === 'year') {
        key = date.toLocaleString('default', { month: 'short' });
      } else {
        key = date.toISOString().split('T')[0];
      }
      const amount = parseFloat(record.total) || 0;
      dateAmounts[key] = (dateAmounts[key] || 0) + amount;
    });
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
            label: 'Total OPD Pharma Billing Amount',
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
            showLine: this.chartType === 'scatter' ? false : undefined,
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

      pdf.save('OPD-WalkIn_Pharmacy_Report.pdf');

      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });

      this.isGeneratingPDF = false;
    }, 100);
  }
}
