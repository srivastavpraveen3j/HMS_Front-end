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
import { PharmaService } from '../pharma.service';
import { registerables } from 'chart.js';
import { MasterService } from '../../views/mastermodule/masterservice/master.service';

@Component({
  selector: 'app-stockreq-centeral-store',
  imports: [ CommonModule,
    FormsModule,
    CanvasJSAngularChartsModule,
    LoaderComponent,],
  templateUrl: './stockreq-centeral-store.component.html',
  styleUrl: './stockreq-centeral-store.component.css'
})
export class StockreqCenteralStoreComponent {
 title: String = '';
  subTitle: String = '';
  expireproducts : any[] = [];
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

    // Enhanced properties
  isLoading: boolean = false;
  isGeneratingPDF: boolean = false;
  totalAmountReceived: number = 0;
  averageAmount: number = 0;
  totalPatients: number = 0;
  searchTerm: string = '';
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalRecords: number = 0;
  paginatedData: any[] = [];

  // Animation states
  showStats: boolean = false;
  showChart: boolean = false;
  showTable: boolean = false;

  @ViewChild('pdfFullContent') pdfFullContent!: ElementRef;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;


constructor(
    private route: ActivatedRoute,
    private pharmaservice: PharmaService,
    private cdRef: ChangeDetectorRef,
    private masterService : MasterService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.getexpiredpharmameds();

    this.route.queryParams.subscribe((params) => {
      this.title = params['title'] || 'STOCK REQUEST TO CENTERAL STORE';
    });

    // Animate sections with delay
    setTimeout(() => (this.showStats = true), 300);
    setTimeout(() => (this.showChart = true), 600);
    setTimeout(() => (this.showTable = true), 900);
  }

    ngAfterViewInit(): void {
    // Ensure chart renders after view init
    setTimeout(() => {
      if (this.expireproducts.length > 0) {
        this.renderChart();
      }
    }, 100);
  }


   getexpiredpharmameds() {
    let allData: any[] = [];
    let currentPage = 1;

    const fetchPage = (page: number) => {
      this.masterService.getexpiredmedicine().subscribe({
        next: (response: any) => {
          const result = response || response;

          this.expireproducts = response.medicines

          allData = [...allData, ...this.expireproducts];

          if (result.totalPages && currentPage < result.totalPages) {
            fetchPage(++currentPage);
          } else {
          }
        },
        error: (error: any) => {
          console.error('Error fetching OPD pharma data:', error);
          this.isLoading = false;
        },
      });
    };

    fetchPage(currentPage);
  }

 selectRange(range: 'today' | 'week' | 'month' | 'year') {
    this.selectedRange = range;
    this.applyDateRange();
  }

  updatePaginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.expireproducts.slice(start, end);
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
        this.subTitle = ` - Today's EXPIRED Pharmacy MEDCINES (${formatDate(
          startDate
        )})`;
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(today.getDate() - 6);
        this.subTitle = ` -  (${formatDate(
          startDate
        )} to ${formatDate(new Date())})`;
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.subTitle = ` - (${formatDate(
          startDate
        )} to ${formatDate(today)})`;
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = today;
        this.subTitle = ` - (${formatDate(
          startDate
        )} to ${formatDate(endDate)})`;
        break;
      default:
        this.expireproducts = this.expireproducts;
        this.updatePaginatedData();
        setTimeout(() => this.renderChart(), 0);
        return;
    }


    this.currentPage = 1;
    this.totalPages = Math.ceil(this.expireproducts.length / this.pageSize);
    this.updatePaginatedData();

    this.cdRef.detectChanges();
    setTimeout(() => this.renderChart(), 0);
  }


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

    this.expireproducts.forEach((record: any) => {
      const date = new Date(record.expiry_date);
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
              this.selectedRange === 'year'
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
          text: this.selectedRange === 'year' ? 'Month' : 'Date',
          font: { weight: 'bold' },
        },
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
      };
    }

    return config;
  }
}
