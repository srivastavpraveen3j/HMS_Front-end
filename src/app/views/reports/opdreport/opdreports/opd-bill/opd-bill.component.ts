import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { OpdService } from '../../../../opdmodule/opdservice/opd.service';
import { Chart } from 'chart.js';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from "../../../../loader/loader.component";

@Component({
  selector: 'app-opd-bill',
  imports: [
    CommonModule,
    FormsModule,
    CanvasJSAngularChartsModule,
    LoaderComponent,
  ],
  templateUrl: './opd-bill.component.html',
  styleUrl: './opd-bill.component.css',
})
export class OpdBillComponent {
  title: String = '';
  subTitle: String = '';

  opdBillData: any[] = [];
  filteredData: any[] = [];
  selectedRange: 'today' | 'week' | 'month' | 'year' = 'today';
  chart: any;
  timeout: any = null;
  chartOptions: any;
  chartType: 'bar' | 'line' = 'bar';
  chartTitle: any;

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalRecords: number = 0;
  paginatedData: any[] = [];
  isPrinting: boolean = false;

  @ViewChild('pdfContent') pdfContent!: ElementRef;

  constructor(private opdBill: OpdService, private route: ActivatedRoute) {}



  chartInitialized = false;
  ngAfterViewChecked(): void {
    if (!this.chartInitialized && this.paginatedData.length > 0) {
      this.renderChart();
      this.chartInitialized = true;
    }
  }

  ngOnInit(): void {
    this.getOpdBill();

    this.route.queryParams.subscribe((params) => {
      this.title = params['title'] || 'Default Title';
    });
  }

  totalAmountReceived = 0;
  allData: any[] = [];
  getOpdBill() {
    let currentPage = 1;

    const fetchPage = (page: number) => {
      this.opdBill.getOPDbill(page).subscribe({
        next: (response: any) => {
          const result = response.data;
          this.allData = [...this.allData, ...result.data];
          // console.log('DATA', allData);

          if (page < result.totalPages) {
            fetchPage(page + 1); // fetch next page
          } else {
            this.opdBillData = this.allData;
            this.filteredData = [...this.opdBillData];
            this.applyDateRange();
          }
        },
        error: (error: any) => {
          console.error('Error fetching OPD data:', error);
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
          today.getDate(),
          0,
          0,
          0
        );
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59
        );
        this.subTitle = ` - Today's Patient Report (${formatDate(startDate)})`;
        break;

      case 'week':
        startDate = new Date();
        startDate.setDate(today.getDate() - 6);
        this.subTitle = ` - This week Patient Report (${formatDate(
          startDate
        )} to ${formatDate(new Date())})`;
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.subTitle = ` - This month Patient Report (${formatDate(
          startDate
        )} to ${formatDate(today)})`;
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1); // Jan 1st of this year
        endDate = today; // Today
        this.subTitle = ` - This year Patient Report (${formatDate(
          startDate
        )} to ${formatDate(endDate)})`;
        break;
      default:
        this.filteredData = this.opdBillData;
        this.totalAmountReceived = this.filteredData.reduce(
          (sum, bill) => sum + (parseFloat(bill.amountreceived) || 0),
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

    this.filteredData = this.opdBillData.filter((bill) => {
      const billDate = new Date(bill.createdAt);
      if (isNaN(billDate.getTime())) return false;
      return billDate >= startDate && billDate <= endDate;
    });

    this.totalAmountReceived = this.filteredData.reduce(
      (sum, bill) => sum + (parseFloat(bill.amountreceived) || 0),
      0
    );

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.updatePaginatedData();
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
  //   if (!this.filteredData || this.filteredData.length === 0) return;
  //   if (this.chart) this.chart.destroy();

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

  //   this.filteredData.forEach((record: any) => {
  //     const date = new Date(record.createdAt);
  //     if (isNaN(date.getTime())) return;

  //     let key: string;

  //     // ⬇️ Group by month if yearly view, else by date
  //     if (this.selectedRange === 'year') {
  //       const month = date.toLocaleString('default', { month: 'short' });
  //       key = `${month}`; // Jan, Feb, etc.
  //       // key = `${date.getFullYear()}-${month}`; //==> this will show data like 2023-Jan, 2024-Feb
  //     } else {
  //       key = date.toISOString().split('T')[0]; // YYYY-MM-DD
  //     }

  //     // const amount = parseFloat(record.totalamount) || 0;
  //     const amount = parseFloat(record.amountreceived) || 0;
  //     dateAmounts[key] = (dateAmounts[key] || 0) + amount;
  //   });

  //   const sortedLabels = Object.keys(dateAmounts).sort(
  //     (a, b) => new Date(`${a}-01`).getTime() - new Date(`${b}-01`).getTime()
  //   );

  //   const billingAmounts = sortedLabels.map((label) => dateAmounts[label]);
  //   const isBar = this.chartType === 'bar';

  //   this.chart = new Chart('pathoChart', {
  //     type: this.chartType,
  //     data: {
  //       labels: sortedLabels,
  //       datasets: [
  //         {
  //           label: 'Total Billing Amount',
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
  //             : 'rgba(75,192,192,0.4)',
  //           borderWidth: 2,
  //           fill: !isBar,
  //           tension: this.chartType === 'line' ? 0.4 : 0,
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
    if (!this.filteredData || this.filteredData.length === 0) return;
    if (this.chart) this.chart.destroy();

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

      const amount = parseFloat(record.amountreceived) || 0;
      dateAmounts[key] = (dateAmounts[key] || 0) + amount;
    });

    const labels = Object.keys(dateAmounts);
    const values = labels.map((label) => dateAmounts[label]);

    const commonDataset: any = {
      label: 'Total Billing Amount',
      data: values,
      backgroundColor: labels.map(
        (_, i) => colorPalette[i % colorPalette.length]
      ),
      borderColor: labels.map((_, i) => colorPalette[i % colorPalette.length]),
      borderWidth: 2,
      fill: this.chartType !== 'bar' && this.chartType === 'line',
      tension: this.chartType === 'line' ? 0.4 : 0,
    };

    const chartConfig: any = {
      type: this.chartType,
      data: {
        labels: labels,
        datasets: [commonDataset],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context: any) => `₹${context.raw.toFixed(2)}`,
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
        scales:
          this.chartType === 'bar' || this.chartType === 'line'
            ? {
                x: {
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
              }
            : {},
      },
    };

    this.chart = new Chart('pathoChart', chartConfig);
  }

  async downloadPDF() {
    this.isPrinting = true;

    // Allow DOM to update
    setTimeout(async () => {
      const element = this.pdfContent.nativeElement;

      const elementsToHide = document.querySelectorAll(
        '.no-print, .d-print-none, .filter-tabs'
      );
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });

      const html2canvas = (await import('html2canvas')).default;
      const { default: jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let position = 0;

      if (imgHeight < pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        let heightLeft = imgHeight;

        while (heightLeft > 0) {
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          position -= pageHeight;
          if (heightLeft > 0) pdf.addPage();
        }
      }

      pdf.save('Opd_Bill_Report.pdf');

      // Restore UI
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });

      this.isPrinting = false;
    }, 100);
  }
}
