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
import { UhidService } from '../../views/uhid/service/uhid.service';
import { registerables } from 'chart.js';
import { TestService } from '../testservice/test.service';
@Component({
  selector: 'app-pathoreportdepartmentwiseopdreportipdreport',
  imports: [ CommonModule,
    FormsModule,
    CanvasJSAngularChartsModule,
    LoaderComponent,],
  templateUrl: './pathoreportdepartmentwiseopdreportipdreport.component.html',
  styleUrl: './pathoreportdepartmentwiseopdreportipdreport.component.css'
})
export class PathoreportdepartmentwiseopdreportipdreportComponent {

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
    private opdBill: OpdService,
    private route: ActivatedRoute,
    private pharmaservice: TestService,
    private uhidservice: UhidService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.getIPDpathologyBill();

    this.route.queryParams.subscribe((params) => {
      this.title = params['title'] || 'IPD PATHOLOGY PATIENTS';
    });

    // Animate sections with delay
    setTimeout(() => (this.showStats = true), 300);
    setTimeout(() => (this.showChart = true), 600);
    setTimeout(() => (this.showTable = true), 900);
  }

  ngAfterViewInit(): void {
    // Ensure chart renders after view init
    setTimeout(() => {
      if (this.filteredData.length > 0) {
        this.renderChart();
      }
    }, 100);
  }

  getIPDpathologyBill() {
    let allData: any[] = [];
    let currentPage = 1;

    const fetchPage = (page: number) => {
      this.pharmaservice.getTestreq(page).subscribe({
        next: (response: any) => {
          const result = response || response;

          const ipdRecords =
            result?.filter(
              (item: any) =>
                item.requestedDepartment === 'pathology' &&
                item.type === 'inpatientDepartment'
            ) || [];

          allData = [...allData, ...ipdRecords];
          console.log("🚀 ~ PathoreportdepartmentwiseopdreportipdreportComponent ~ fetchPage ~ allData:", allData)

          if (result.totalPages && currentPage < result.totalPages) {
            fetchPage(++currentPage);
          } else {
            this.enrichPharmaWithUHID(allData);
          }
        },
        error: (error: any) => {
          console.error('Error fetching OPD pathology data:', error);
          this.isLoading = false;
        },
      });
    };

    fetchPage(currentPage);
  }

  enrichPharmaWithUHID(pathologyList: any[]) {
    const enrichedData: any[] = [];
    let completed = 0;

    if (pathologyList.length === 0) {
      this.opdpharmaData = [];
      this.filteredData = [];
      this.isLoading = false;
      return;
    }

    for (const pathology of pathologyList) {
      const uhidId = pathology.uniqueHealthIdentificationId;

      if (!uhidId || typeof uhidId !== 'string') {
        enrichedData.push({
          ...pathology,
          patient_name: '[UNKNOWN]',
          age: '-',
          gender: '-',
          uhid: '-',
        });
        completed++;
        this.checkCompletion(completed, pathologyList.length, enrichedData);
        continue;
      }

      this.uhidservice.getUhidById(uhidId).subscribe({
        next: (res: any) => {
          const patient = res?.[0] || res;

          enrichedData.push({
            ...pathology,
            patient_name: patient?.patient_name || '[UNKNOWN]',
            age: patient?.age || '-',
            gender: patient?.gender || '-',
            uhid: patient?.uhid || '-',
          });

          completed++;
          this.checkCompletion(completed, pathologyList.length, enrichedData);
        },
        error: () => {
          enrichedData.push({
            ...pathology,
            patient_name: '[ERROR]',
            age: '-',
            gender: '-',
            uhid: '-',
          });

          completed++;
          this.checkCompletion(completed, pathologyList.length, enrichedData);
        },
      });
    }
  }

  private checkCompletion(
    completed: number,
    total: number,
    enrichedData: any[]
  ) {
    if (completed === total) {
      this.opdpharmaData = enrichedData;
      this.filteredData = [...this.opdpharmaData];
      this.applyDateRange();
      this.isLoading = false;
    }
  }

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
        this.subTitle = ` - Today's OPD Pharmacy Report (${formatDate(
          startDate
        )})`;
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(today.getDate() - 6);
        this.subTitle = ` - This Week OPD Pharmacy Report (${formatDate(
          startDate
        )} to ${formatDate(new Date())})`;
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.subTitle = ` - This Month OPD Pharmacy Report (${formatDate(
          startDate
        )} to ${formatDate(today)})`;
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = today;
        this.subTitle = ` - This Year OPD Pharmacy Report (${formatDate(
          startDate
        )} to ${formatDate(endDate)})`;
        break;
      default:
        this.filteredData = this.opdpharmaData;
        this.updateStats();
        this.updatePaginatedData();
        setTimeout(() => this.renderChart(), 0);
        return;
    }

    this.filteredData = this.opdpharmaData.filter((bill) => {
      const billDate = new Date(bill.createdAt);
      if (isNaN(billDate.getTime())) return false;
      return billDate >= startDate && billDate <= endDate;
    });

    this.updateStats();
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.updatePaginatedData();

    this.cdRef.detectChanges();
    setTimeout(() => this.renderChart(), 0);
  }

  private updateStats() {
    this.totalAmountReceived = this.filteredData.reduce(
      (sum, bill) => sum + (parseFloat(bill.total) || 0),
      0
    );

    this.totalPatients = this.filteredData.length;
    this.averageAmount =
      this.totalPatients > 0
        ? this.totalAmountReceived / this.totalPatients
        : 0;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.applyDateRange();
      return;
    }

    this.filteredData = this.opdpharmaData.filter((record) => {
      const searchLower = this.searchTerm.toLowerCase();
      return (
        record.patient_name?.toLowerCase().includes(searchLower) ||
        record.uhid?.toLowerCase().includes(searchLower) ||
        record.inwardSerialNumber?.toLowerCase().includes(searchLower) ||
        record.packages?.some((pkg: any) =>
          pkg.medicineName?.toLowerCase().includes(searchLower)
        )
      );
    });

    this.updateStats();
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.updatePaginatedData();
    this.renderChart();
  }

  sortData(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredData.sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      if (field === 'total') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (field === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.updatePaginatedData();
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

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
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

  async downloadPDF() {
    this.isGeneratingPDF = true;
    this.cdRef.detectChanges();

    const elementsToHide = document.querySelectorAll(
      '.no-print, .d-print-none, .filter-tabs'
    );
    elementsToHide.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { default: jsPDF } = await import('jspdf');

      const element = this.pdfFullContent.nativeElement;

      const canvas = await html2canvas(element, {
        scale: 2,
        scrollY: -window.scrollY,
        useCORS: true,
        allowTaint: true,
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

      pdf.save(
        `OPD_Pharmacy_Report_${this.selectedRange}_${
          new Date().toISOString().split('T')[0]
        }.pdf`
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You could show a toast notification here
    } finally {
      this.isGeneratingPDF = false;
      this.cdRef.detectChanges();
    }
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const half = Math.floor(maxVisiblePages / 2);

    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

}
