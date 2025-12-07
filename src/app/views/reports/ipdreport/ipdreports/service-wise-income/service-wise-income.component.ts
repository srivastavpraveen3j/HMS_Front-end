import { Component, ElementRef, ViewChild } from '@angular/core';
import { IpdService } from '../../../../ipdmodule/ipdservice/ipd.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from "../../../../loader/loader.component";

@Component({
  selector: 'app-service-wise-income',
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './service-wise-income.component.html',
  styleUrl: './service-wise-income.component.css',
})
export class ServiceWiseIncomeComponent {
  ipdData: any[] = [];
  activeTab: 'admitted' | 'discharge' = 'admitted';

  @ViewChild('pdfContent') pdfContent!: ElementRef;
  constructor(private ipdService: IpdService) {}

  ngOnInit(): void {
    this.getIpdServiceIncome();
  }

  getIpdServiceIncome() {
    this.ipdService.getinpatientIntermBill().subscribe({
      next: (data) => {
        console.log(data);
        this.ipdData = data.intermBill;

        const serviceUsage = this.getServiceUsageCount();
        console.log('Service usage count:', serviceUsage);

        const latestPerPatient: { [key: string]: any } = {};

        this.ipdData.forEach((entry: any) => {
          const discharge = entry.inpatientCase?.isDischarge;
          if (discharge) return;
          const patientId =
            entry.inpatientBills[0]?.uniqueHealthIdentificationId;

          if (!patientId) return;

          if (
            !latestPerPatient[patientId] ||
            new Date(entry.createdAt) >
              new Date(latestPerPatient[patientId].createdAt)
          ) {
            latestPerPatient[patientId] = entry;
          }
        });

        this.ipdData = Object.values(latestPerPatient);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getServiceUsageCount(): Record<string, number> {
    const serviceCount: Record<string, number> = {};

    this.ipdData.forEach((record) => {
      if (record.inpatientBills && record.inpatientBills.length > 0) {
        record.inpatientBills.forEach((bill: any) => {
          if (bill.service && bill.service.length > 0) {
            bill.service.forEach((service: any) => {
              const key = service.name || service._id;
              serviceCount[key] = (serviceCount[key] || 0) + 1;
            });
          }
        });
      }
    });

    return serviceCount;
  }

  getServiceCountForPatient(patient: any): number {
    let count = 0;
    if (patient.inpatientBills && patient.inpatientBills.length > 0) {
      patient.inpatientBills.forEach((bill: any) => {
        if (bill.service && bill.service.length > 0) {
          count += bill.service.length;
        }
      });
    }
    return count;
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

  setActiveTab(tab: 'admitted' | 'discharge') {
    this.activeTab = tab;
  }

  get filteredPatients() {
    return this.ipdData.filter((patient) =>
      this.activeTab === 'admitted'
        ? !patient.inpatientCase?.isDischarge
        : patient.inpatientCase?.isDischarge
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

      pdf.save('Ipd_Service_Report.pdf');
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });
    }, 100);
  }
}
