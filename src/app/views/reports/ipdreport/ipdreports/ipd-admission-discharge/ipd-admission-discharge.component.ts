import { Component, ElementRef, ViewChild } from '@angular/core';
import { IpdService } from '../../../../ipdmodule/ipdservice/ipd.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from "../../../../loader/loader.component";

@Component({
  selector: 'app-ipd-admission-discharge',
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './ipd-admission-discharge.component.html',
  styleUrl: './ipd-admission-discharge.component.css',
})
export class IpdAdmissionDischargeComponent {
  ipdSummary: any[] = [];
  dischargeSummary: any[] = [];
  activeTab: 'admission' | 'discharge' = 'admission';
  @ViewChild('pdfContent') pdfContent!: ElementRef;

  constructor(private ipdService: IpdService) {}

  ngOnInit(): void {
    this.getIPDcases();
    this.getIPDdischarge();
  }

  getIPDcases(page = 1, allCases: any[] = []) {
    this.ipdService.getIPDcase(page).subscribe({
      next: (data) => {
        const currentPageData = data.data?.inpatientCases || [];
        const combinedData = [...allCases, ...currentPageData];
        const totalPages = data.data?.totalPages || 1;

        if (page < totalPages) {
          // Recursively fetch next page
          this.getIPDcases(page + 1, combinedData);
        } else {
          // Final combined data
          this.ipdSummary = combinedData;
          console.log('All IPD Records:', this.ipdSummary);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getIPDdischarge(page = 1, allDischarged: any[] = []) {
    this.ipdService.getipddischargeurl(page).subscribe({
      next: (data) => {
        const currentData = data.data?.inpatientCases || [];
        const combined = [...allDischarged, ...currentData];
        const totalPages = data.data?.totalPages || 1;

        if (page < totalPages) {
          this.getIPDdischarge(page + 1, combined);
        } else {
          this.dischargeSummary = combined;
          console.log('All Discharged:', this.dischargeSummary);
        }
      },
      error: (err) => console.log(err),
    });
  }

  currentPage = 1;
  itemsPerPage = 10;

  get paginatedPatients() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredPatients.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.filteredPatients.length / this.itemsPerPage);
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  setActiveTab(tab: 'admission' | 'discharge') {
    this.activeTab = tab;
  }

  get filteredPatients() {
    return this.ipdSummary.filter((patient) =>
      this.activeTab === 'admission'
        ? !patient.isDischarge
        : patient.isDischarge
    );
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

      pdf.save('Ipd_Admit_Discharge.pdf');
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });
    }, 100);
  }
}
