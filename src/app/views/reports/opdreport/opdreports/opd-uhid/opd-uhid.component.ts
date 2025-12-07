import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OpdService } from '../../../../opdmodule/opdservice/opd.service';
import { UhidService } from '../../../../uhid/service/uhid.service';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { LoaderComponent } from '../../../../loader/loader.component';

@Component({
  selector: 'app-opd-uhid',
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './opd-uhid.component.html',
  styleUrl: './opd-uhid.component.css',
})
export class OpdUhidComponent {
  title: string = '';
  subTitle: string = '';

  users: any[] = [];
  searchTerm: string = '';
  doctors: any[] = [];
  filterDoctors: any[] = [];
  uhid: any[] = [];
  uhidRecords: any[] = [];

  selectedFilter: string = 'today';
  filteredUhidRecords: any[] = [];

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalRecords: number = 0;
  isPrinting: boolean = false;

  paginatedUhidRecords: any[] = [];

  chart: any;
  chartTitle: string = 'Patients of Doctors';
  maxCount: number = 1;
  @ViewChild('pdfContent') pdfContent!: ElementRef;
  @ViewChild('chartCanvas', { static: false })
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  chartType = 'pie';
  chartInitialized = false;

  ngAfterViewChecked(): void {
    if (!this.chartInitialized && this.paginatedUhidRecords.length > 0) {
      this.renderChart();
      this.chartInitialized = true;
    }
  }

  constructor(
    private opdservice: OpdService,
    private uhidservice: UhidService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getopdcases();

    this.route.queryParams.subscribe((params) => {
      this.title = params['title'] || 'Default Title';
    });
  }

  getopdcases() {
    this.opdservice.getOPDcase(this.currentPage, 1000).subscribe({
      next: (data: any) => {
        console.log(data);
        this.users = data.outpatientCases;
        this.totalPages = data.totalPages; // <- from API
        this.totalRecords = data.total; // <- total number of records

        const doctorSet = new Set(
          this.users.map((p: any) => p.consulting_Doctor?.name).filter(Boolean)
        );
        this.doctors = Array.from(doctorSet);

        this.getuhid(); // process UHID records
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  getuhid() {
    this.uhidservice.getUhid().subscribe({
      next: (data: any) => {
        this.uhid = data.uhids;
        const uhidList = this.users.map(
          (item: any) => item.uniqueHealthIdentificationId?._id
        );

        const uhid = this.users.map((item: any) => item);
        this.uhidRecords = uhid.filter((record: any) =>
          uhidList.includes(record.uniqueHealthIdentificationId?._id)
        );
        this.filterByTime();
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateRecords();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateRecords();
    }
  }

  paginateRecords() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUhidRecords = this.filteredUhidRecords.slice(start, end);
    console.log(this.paginatedUhidRecords);

    this.chartInitialized = false;
  }

  searchDoctor() {
    if (this.searchTerm.length >= 2) {
      this.filterDoctors = this.doctors.filter((doctor: any) =>
        doctor.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filterDoctors = [];
    }
  }

  selectDoctor(doctor: string): void {
    this.searchTerm = doctor;
    this.filterDoctors = [];
    this.getDoctor();
  }

  getDoctor(): void {
    const doctorName = this.searchTerm.trim().toLowerCase();

    const doctorPatients = this.uhidRecords.filter((p: any) =>
      p.consulting_Doctor?.name?.toLowerCase().includes(doctorName)
    );

    this.filteredUhidRecords = doctorPatients;

    this.filterByTime();
  }

  filterByTime(): void {
    const now = new Date();
    let fromDate = new Date();

    const formatDate = (d: Date) =>
      d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

    switch (this.selectedFilter) {
      case 'today':
        fromDate = new Date(now.setHours(0, 0, 0, 0));
        this.subTitle = ` - Today's Patient Report (${formatDate(fromDate)})`;
        break;

      case 'week':
        const day = now.getDay();
        const diffToMonday = (day + 6) % 7;
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - diffToMonday);
        fromDate.setHours(0, 0, 0, 0);
        this.subTitle = ` - Weekly Patient Report (${formatDate(
          fromDate
        )} to ${formatDate(new Date())})`;
        break;

      case 'month':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        this.subTitle = ` - Monthly Patient Report (${formatDate(
          fromDate
        )} to ${formatDate(now)})`;
        break;

      case 'year':
        fromDate = new Date(now.getFullYear(), 0, 1);
        this.subTitle = ` - Yearly Patient Report (${formatDate(
          fromDate
        )} to ${formatDate(now)})`;
        break;

      case 'all':
      default:
        this.filteredUhidRecords = [...this.uhidRecords];
        this.subTitle = ' - All Patient Records';
        break;
    }

    // Apply date filtering only if it's not "all"
    if (this.selectedFilter !== 'all') {
      this.filteredUhidRecords = this.uhidRecords.filter((record: any) => {
        const createdAt = new Date(record.createdAt);
        return createdAt >= fromDate && createdAt <= new Date();
      });
    }

    // Update pagination state
    this.totalRecords = this.filteredUhidRecords.length;
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
    this.currentPage = 1;
    this.paginateRecords();

    this.renderChart();
  }

  renderChart() {
    if (!this.chartCanvas?.nativeElement) {
      console.warn('Canvas not ready');
      return;
    }

    if (this.chart) this.chart.destroy();

    const doctorCounts: Record<string, number> = {};
    const doctorColors: Record<string, string> = {};
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
      '#198754',
      '#0dcaf0',
      '#d63384',
      '#adb5bd',
    ];

    let colorIndex = 0;

    this.filteredUhidRecords.forEach((record: any) => {
      const doctor = record.consulting_Doctor?.name || 'Unknown';
      doctorCounts[doctor] = (doctorCounts[doctor] || 0) + 1;

      if (!doctorColors[doctor]) {
        doctorColors[doctor] = colorPalette[colorIndex++ % colorPalette.length];
      }
    });

    const doctorNames = Object.keys(doctorCounts);
    const patientCounts = Object.values(doctorCounts);
    const colors = doctorNames.map((name) => doctorColors[name]);

    // Define dataset config based on chart type
    let datasets: any[] = [];
    if (this.chartType === 'bar' || this.chartType === 'line') {
      datasets = [
        {
          label: 'Patient Count',
          data: patientCounts,
          backgroundColor: this.chartType === 'bar' ? colors : 'transparent',
          borderColor: colors,
          borderWidth: 2,
          fill: this.chartType === 'line' ? true : false,
        },
      ];
    } else {
      datasets = [
        {
          label: 'Patient Count',
          data: patientCounts,
          backgroundColor: colors,
          borderWidth: 1,
        },
      ];
    }

    this.chart = new Chart('pathoChart', {
      type: this.chartType as any,
      data: {
        labels: doctorNames,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const doctor = context.label;
                const count = context.raw;
                return `${doctor}: ${count} patients`;
              },
            },
          },
        },
        layout: {
          padding: 10,
        },
      },
    });
  }

  async downloadPDF() {
    this.isPrinting = true;

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

      pdf.save('Opd_Uhid_Report.pdf');
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });

      this.isPrinting = false;
    }, 100);
  }
}
