import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PharmaService } from '../../pharma.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IndianCurrencyPipe } from '../../../pipe/indian-currency.pipe';
import { Chart, registerables } from 'chart.js/auto';
Chart.register(...registerables);

@Component({
  selector: 'app-returnpharmareports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IndianCurrencyPipe
  ],
  templateUrl: './returnpharmareports.component.html',
  styleUrl: './returnpharmareports.component.css'
})
export class ReturnpharmareportsComponent implements OnInit, AfterViewInit {
  title = 'RETURN PHARMA REPORTS';
  subTitle = '';

  returnRecords: any[] = [];
  filteredData: any[] = [];
  selectedRange: 'today' | 'week' | 'month' | 'year' = 'today';
  chart: any;
  chartType: 'bar' | 'line' | 'pie' | 'radar' | 'bubble' | 'polarArea' | 'scatter' | 'doughnut' = 'bar';
  totalRefundedAmount = 0;

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  paginatedData: any[] = [];
  isGeneratingPDF = false;

  @ViewChild('pdfFullContent') pdfFullContent!: ElementRef;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  constructor(private pharmaservice: PharmaService, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadRecords();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.filteredData.length > 0) {
        this.renderChart();
      }
    }, 100);
  }

  loadRecords() {
    this.pharmaservice.getAllReturnRecords().subscribe({
      next: (response: any) => {
        const array = response?.data || response?.items || response || [];
        this.returnRecords = Array.isArray(array)
          ? array.filter(r => r.returnDetails?.isReturn)
          : [];
        this.filteredData = [...this.returnRecords];
        this.applyDateRange();
      },
      error: (e) => {
        console.error('Error loading return records:', e);
      }
    });
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
      d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    switch (this.selectedRange) {
      case 'today':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        this.subTitle = ` - (${formatDate(startDate)})`;
        break;
      case 'week':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        this.subTitle = ` - (${formatDate(startDate)} to ${formatDate(endDate)})`;
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        this.subTitle = ` - (${formatDate(startDate)} to ${formatDate(endDate)})`;
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        this.subTitle = ` - (${formatDate(startDate)} to ${formatDate(endDate)})`;
        break;
      default:
        startDate = new Date(0);
        endDate = new Date();
        break;
    }

    this.filteredData = this.returnRecords.filter(record => {
      const recordDate = new Date(record.createdAt);
      return recordDate >= startDate && recordDate <= endDate;
    });

    this.totalRefundedAmount = this.filteredData.reduce(
      (sum, r) => sum + (parseFloat(r.refundAmount) || 0),
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

  changeChartType(
    type: 'bar' | 'line' | 'pie' | 'radar' | 'bubble' | 'polarArea' | 'scatter' | 'doughnut'
  ) {
    this.chartType = type;
    this.renderChart();
  }

  renderChart() {
    const chartElement = this.chartCanvas?.nativeElement as HTMLCanvasElement;
    if (!chartElement) return;
    if (this.chart) this.chart.destroy();

    const dateRefunds: Record<string, number> = {};
    this.filteredData.forEach(record => {
      const date = new Date(record.createdAt);
      let key: string;
      if (this.selectedRange === 'year') {
        key = date.toLocaleString('default', { month: 'short' });
      } else {
        key = date.toISOString().split('T')[0];
      }
      dateRefunds[key] = (dateRefunds[key] || 0) + (parseFloat(record.refundAmount) || 0);
    });

    let sortedLabels = Object.keys(dateRefunds);
    if (this.selectedRange === 'year') {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      sortedLabels.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    } else {
      sortedLabels.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    }

    const refunds = sortedLabels.map(label => dateRefunds[label]);
    this.chart = new Chart(chartElement, {
      type: this.chartType,
      data: {
        labels: sortedLabels,
        datasets: [{
          label: 'Total Refund Amount',
          data: refunds,
          backgroundColor: '#dc3545',
          borderColor: '#dc3545',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom' },
          title: {
            display: true,
            text: 'Return Refunds by Date'
          }
        }
      }
    });
  }

  async downloadPDF() {
    this.isGeneratingPDF = true;
    this.cdRef.detectChanges();

    const elementsToHide = document.querySelectorAll('.no-print, .filter-tabs');
    elementsToHide.forEach(el => { (el as HTMLElement).style.display = 'none'; });
    await new Promise(res => setTimeout(res, 100));

    const html2canvas = (await import('html2canvas')).default;
    const { default: jsPDF } = await import('jspdf');
    const element = this.pdfFullContent.nativeElement;
    const canvas = await html2canvas(element, { scale: 2, scrollY: -window.scrollY });

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
    pdf.save('ReturnPharmaReport.pdf');
    elementsToHide.forEach(el => { (el as HTMLElement).style.display = ''; });
    this.isGeneratingPDF = false;
    this.cdRef.detectChanges();
  }
}
