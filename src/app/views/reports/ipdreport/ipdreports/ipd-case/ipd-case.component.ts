import { Component } from '@angular/core';
import { IpdService } from '../../../../ipdmodule/ipdservice/ipd.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from "../../../../loader/loader.component";

@Component({
  selector: 'app-ipd-case',
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './ipd-case.component.html',
  styleUrl: './ipd-case.component.css',
})
export class IpdCaseComponent {
  title: string = '';
  summary: any[] = [];
  currentPage: number = 1;
  limit: number = 10;
  totalPages: number = 0;
  allCases: any[] = [];
  selectedFilter: 'today' | 'week' | 'month' | 'year' = 'today';
  today: Date = new Date();
  selectedDate: string = '';
  subTitle: string = '';
  isPrinting: boolean = false;
  @ViewChild('pdfContent') pdfContent!: ElementRef;

  constructor(private ipdService: IpdService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.getIPDsummary();
    this.route.queryParams.subscribe((params) => {
      this.title = params['title'] || 'Default Title';
    });
  }

  getIPDsummary(): Promise<void> {
    return new Promise((resolve, reject) => {
      const allCases: any[] = [];

      const fetchPage = (page: number) => {
        this.ipdService.getIPDcase(page).subscribe({
          next: (data) => {
            const cases = data.data?.inpatientCases || [];
            allCases.push(...cases);

            const totalPages = data.data?.totalPages || 1;

            if (page < totalPages) {
              fetchPage(page + 1);
            } else {
              this.allCases = allCases;
              this.totalPages = Math.ceil(
                this.filteredPatients.length / this.limit
              );
              this.updatePageSummary();
              resolve();
            }
          },
          error: (err) => {
            console.error('Error fetching IPD cases:', err);
            reject(err);
          },
        });
      };

      fetchPage(1);
    });
  }

  updatePageSummary() {
    const filtered = this.filteredPatients;
    const start = (this.currentPage - 1) * this.limit;
    const end = start + this.limit;
    this.summary = filtered.slice(start, end);
  }

  setFilter(type: 'today' | 'week' | 'month' | 'year') {
    this.selectedFilter = type;
    this.currentPage = 1;

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

    this.totalPages = Math.ceil(this.filteredPatients.length / this.limit);
    this.updatePageSummary();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePageSummary();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePageSummary();
    }
  }

  get filteredPatients() {
    const now = new Date();

    return this.allCases.filter((patient) => {
      const createdDate = new Date(patient.createdAt);

      switch (this.selectedFilter) {
        case 'today':
          return (
            createdDate.getDate() === now.getDate() &&
            createdDate.getMonth() === now.getMonth() &&
            createdDate.getFullYear() === now.getFullYear()
          );
        case 'week':
          const dayOfWeek = now.getDay();
          const diffToMonday = (dayOfWeek + 6) % 7;
          const monday = new Date(now);
          monday.setDate(now.getDate() - diffToMonday);
          monday.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(monday);
          endOfWeek.setDate(monday.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          return createdDate >= monday && createdDate <= endOfWeek;

        case 'month':
          return (
            createdDate.getMonth() === now.getMonth() &&
            createdDate.getFullYear() === now.getFullYear()
          );

        case 'year':
          return createdDate.getFullYear() === now.getFullYear();

        default:
          return true;
      }
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

      pdf.save('IPD_Case_Report.pdf');
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });

      this.isPrinting = false;
    }, 100);
  }
}
