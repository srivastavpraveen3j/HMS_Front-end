import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OpdService } from '../../../../opdmodule/opdservice/opd.service';
import { Chart } from 'chart.js/auto';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from "../../../../loader/loader.component";

@Component({
  selector: 'app-service-wise-collection',
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './service-wise-collection.component.html',
  styleUrl: './service-wise-collection.component.css',
})
export class ServiceWiseCollectionComponent {
  title: string = '';
  opdAllData: any[] = [];
  serviceSummary: any[] = [];
  selectedFilter: 'today' | 'week' | 'month' | 'year' = 'today';
  chart: any;
  filteredData: any[] = [];
  @ViewChild('pdfContent') pdfContent!: ElementRef;
  subTitle: string = '';
  chartType: string = 'bar';

  constructor(private opdBill: OpdService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.getOPDbill();

    this.route.queryParams.subscribe((params) => {
      this.title = params['title'] || 'Default Title';
    });
  }

  getOPDbill() {
    this.opdBill.getOPDbill().subscribe({
      next: (data) => {
        this.opdAllData = data.data?.data;
        console.log('OPD BILL data', this.opdAllData);

        this.generateServiceSummary();
        // this.renderChart();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  currentPage = 1;
  itemsPerPage = 10;

  get paginatedService() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.serviceSummary.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.serviceSummary.length / this.itemsPerPage);
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  getFilteredData(): any[] {
    const now = new Date();
    let fromDate: Date | null = null;

    switch (this.selectedFilter) {
      case 'today':
        fromDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        const day = now.getDay();
        const diffToMonday = (day + 6) % 7;
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - diffToMonday);
        fromDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        fromDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return this.opdAllData.filter((record) => {
      const createdAt = new Date(record.createdAt);
      return createdAt >= fromDate! && createdAt <= new Date();
    });
  }

  generateServiceSummary() {
    const summaryMap: { [key: string]: any } = {};
    this.filteredData = this.getFilteredData();

    this.filteredData.forEach((bill) => {
      const patientName = bill.patientUhid?.patient_name;
      const patientId = bill.patientUhid?._id;
      const services = bill.serviceId || [];

      services.forEach((service: any) => {
        const key = service._id;

        if (!summaryMap[key]) {
          summaryMap[key] = {
            name: service.name,
            type: service.type,
            charge: service.charge,
            timesTaken: 0,
            patientSet: new Set<string>(),
            patientNameSet: new Set<string>(),
          };
        }

        summaryMap[key].timesTaken += 1;
        summaryMap[key].patientSet.add(patientId);
        summaryMap[key].patientNameSet.add(patientName);
      });
    });

    this.serviceSummary = Object.values(summaryMap).map((item: any) => ({
      name: item.name,
      type: item.type,
      charge: item.charge,
      timesTaken: item.timesTaken,
      patientNames: Array.from(item.patientNameSet).join(', '),
    }));

    setTimeout(() => {
      this.renderChart();
    }, 0);
  }

  setFilter(type: 'today' | 'week' | 'month' | 'year') {
    this.selectedFilter = type;

    const now = new Date();
    const formatDate = (d: Date) =>
      d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

    switch (type) {
      case 'today':
        const today = new Date(now.setHours(0, 0, 0, 0));
        this.subTitle = ` - Today's Patient Report (${formatDate(today)})`;
        break;
      case 'week':
        const day = now.getDay();
        const diffToMonday = (day + 6) % 7;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - diffToMonday);
        weekStart.setHours(0, 0, 0, 0);
        this.subTitle = ` - Weekly Patient Report (${formatDate(
          weekStart
        )} to ${formatDate(new Date())})`;
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        this.subTitle = ` - Monthly Patient Report (${formatDate(
          monthStart
        )} to ${formatDate(now)})`;
        break;
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        this.subTitle = ` - Yearly Patient Report (${formatDate(
          yearStart
        )} to ${formatDate(now)})`;
        break;
    }

    this.generateServiceSummary();
  }

  changeFilter(filter: 'today' | 'week' | 'month' | 'year') {
    this.selectedFilter = filter;
    this.applyDateFilter();
  }
  applyDateFilter() {
    throw new Error('Method not implemented.');
  }

  //   calculateTotalAmount(rate: any, times: any): number {
  //   const r = parseFloat(rate);
  //   const t = parseInt(times);
  //   return (isNaN(r) || isNaN(t)) ? 0 : r * t;
  // }

  // ==> grand total of services
  calculateTotalAmount(): number {
    return this.serviceSummary.reduce((sum, service) => {
      const rate = parseFloat(service.charge) || 0;
      const times = parseFloat(service.timesTaken) || 0;
      return sum + rate * times;
    }, 0);
  }

  // renderChart() {
  //   if (this.chart) this.chart.destroy();
  //   const grouped: Record<string, number> = {};
  //   const now = new Date();

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

  //   this.filteredData.forEach((p) => {
  //     const date = new Date(p.createdAt);
  //     let label: string;

  //     if (this.selectedFilter === 'month') {
  //       const day = date.getDate();
  //       const weekNumber = Math.floor((day - 1) / 7) + 1;
  //       const startDay = (weekNumber - 1) * 7 + 1;
  //       const endDay = Math.min(
  //         weekNumber * 7,
  //         new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  //       );
  //       label = `${startDay}-${endDay} ${date.toLocaleString('default', {
  //         month: 'short',
  //       })}`;
  //     } else if (this.selectedFilter === 'year') {
  //       label = date.toLocaleString('default', { month: 'short' });
  //     } else {
  //       label = date.toISOString().split('T')[0];
  //     }

  //     const serviceCount = p.serviceId?.length || 0;
  //     grouped[label] = (grouped[label] || 0) + serviceCount;
  //   });

  //   this.chart = new Chart('pathoChart', {
  //     type: 'bar',
  //     data: {
  //       labels: Object.keys(grouped),
  //       datasets: [
  //         {
  //           label: `No. of Services`,
  //           data: Object.values(grouped),
  //           backgroundColor: Object.keys(grouped).map(
  //             (_, i) => colorPalette[i % colorPalette.length]
  //           ),
  //         },
  //       ],
  //     },
  //     options: {
  //       responsive: true,
  //       maintainAspectRatio: false,
  //       plugins: {
  //         legend: { display: false },
  //         tooltip: {
  //           callbacks: {
  //             label: (context: any) => `Services: ${context.raw}`,
  //           },
  //         },
  //       },
  //       scales: {
  //         x: {
  //           title: {
  //             display: true,
  //             text:
  //               this.selectedFilter === 'year'
  //                 ? 'Year'
  //                 : this.selectedFilter === 'month'
  //                 ? 'Months'
  //                 : this.selectedFilter === 'week'
  //                 ? 'Week'
  //                 : this.selectedFilter === 'today'
  //                 ? 'Day'
  //                 : '',
  //           },
  //           ticks: { autoSkip: false, maxRotation: 45, minRotation: 30 },
  //         },
  //         y: {
  //           beginAtZero: true,
  //           title: { display: true, text: 'Service Count' },
  //         },
  //       },
  //     },
  //   });
  // }

  renderChart() {
    if (this.chart) this.chart.destroy();
    const grouped: Record<string, number> = {};
    const now = new Date();

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

    this.filteredData.forEach((p) => {
      const date = new Date(p.createdAt);
      let label: string;

      if (this.selectedFilter === 'month') {
        const day = date.getDate();
        const weekNumber = Math.floor((day - 1) / 7) + 1;
        const startDay = (weekNumber - 1) * 7 + 1;
        const endDay = Math.min(
          weekNumber * 7,
          new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        );
        label = `${startDay}-${endDay} ${date.toLocaleString('default', {
          month: 'short',
        })}`;
      } else if (this.selectedFilter === 'year') {
        label = date.toLocaleString('default', { month: 'short' });
      } else {
        label = date.toISOString().split('T')[0];
      }

      const serviceCount = p.serviceId?.length || 0;
      grouped[label] = (grouped[label] || 0) + serviceCount;
    });

    const labels = Object.keys(grouped);
    const dataValues = Object.values(grouped);
    const backgroundColors = labels.map(
      (_, i) => colorPalette[i % colorPalette.length]
    );

    const commonDataset = {
      label: `No. of Services`,
      data: dataValues,
      backgroundColor: backgroundColors,
      borderColor: backgroundColors,
      borderWidth: 1,
      fill: this.chartType === 'radar' || 'line' ? true : false,
    };

    const config: any = {
      type: this.chartType,
      data: {
        labels,
        datasets:
          this.chartType === 'radar' || this.chartType === 'line'
            ? [commonDataset]
            : [
                {
                  ...commonDataset,
                  borderColor: undefined,
                  borderWidth: 0,
                },
              ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: this.chartType !== 'bar' && this.chartType !== 'line',
          },
          tooltip: {
            callbacks: {
              label: (context: any) => `Services: ${context.raw}`,
            },
          },
        },
      },
    };

    if (this.chartType === 'bar' || this.chartType === 'line') {
      config.options.scales = {
        x: {
          title: {
            display: true,
            text:
              this.selectedFilter === 'year'
                ? 'Months'
                : this.selectedFilter === 'month'
                ? 'Weeks'
                : 'Date',
          },
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 30,
          },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Service Count' },
        },
      };
    }

    this.chart = new Chart('pathoChart', config);
  }

  async downloadPDF() {
    const element = this.pdfContent.nativeElement;

    const elementsToHide = document.querySelectorAll(
      '.no-print, .d-print-none, .filter-tabs'
    );
    elementsToHide.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });

    const html2canvas = (await import('html2canvas')).default;
    const { default: jsPDF } = await import('jspdf');

    setTimeout(async () => {
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

      pdf.save('Opd_Service_Report.pdf');
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });
    }, 100);
  }
}
