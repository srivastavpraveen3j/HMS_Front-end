import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IpdService } from '../../../../ipdmodule/ipdservice/ipd.service';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from "../../../../loader/loader.component";

@Component({
  selector: 'app-patient-balance-report',
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './patient-balance-report.component.html',
  styleUrl: './patient-balance-report.component.css',
})
export class PatientBalanceReportComponent {
  ipdCaseData: any[] = [];
  depositData: any[] = [];
  ipdBalanceReport: any[] = [];
  activeTab: 'admitted' | 'discharge' = 'admitted';
  combinedPatientData: any[] = [];
  ipdPatientId: string = '';
  idExists: boolean = false;
  selectedPatientName: string = '';
  noPatientData: boolean = false;

  @ViewChild('pdfContent') pdfContent!: ElementRef;

  constructor(private ipdService: IpdService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.ipdPatientId = params['_id'];
      console.log(this.ipdPatientId);
    });

    this.getIPDBalanceReport();
    this.getIpdDeposit();
    this.getIPDsummary();
  }

  // ==> Getting IPD data to match isDischarge
  getIPDsummary() {
    this.ipdService.getIPDcase().subscribe({
      next: (data) => {
        // console.log(data);
        this.ipdCaseData = data.data?.inpatientCases;
        console.log('iPD data', this.ipdCaseData);

        this.getIPDBalanceReport();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  // ==> Getting patients' deposit from ipd interm bill
  getIpdDeposit() {
    this.ipdService.getinpatientIntermBill().subscribe({
      next: (response) => {
        this.depositData = response.intermBill;
        console.log('Patient deposit', this.depositData);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  // ==> Getting patient balance report from ipd bill history
  getIPDBalanceReport() {
    this.ipdService.getinpatientIntermBillhistory().subscribe({
      next: (data) => {
        console.log('History data', data);
        const latestPerPatient: { [key: string]: any } = {};

        data.forEach((entry: any) => {
          const patientId =
            entry.inpatientBills?.[0]?.uniqueHealthIdentificationId;

          if (!patientId) {
            console.warn('Skipping entry with missing patient ID:', entry);
            return;
          }

          if (
            !latestPerPatient[patientId] ||
            new Date(entry.createdAt) >
              new Date(latestPerPatient[patientId].createdAt)
          ) {
            latestPerPatient[patientId] = entry;
          }
        });

        // Store as array
        this.ipdBalanceReport = Object.values(latestPerPatient);

        console.log('IPD BALANCE', this.ipdBalanceReport);
        // Now merge isDischarge from ipdCaseData
        this.addDischargeStatusToReport();
      },
      error: (error) => {
        console.error('Error fetching IPD report:', error);
        this.noPatientData = true; // fallback in case of error
      },
    });
  }

  // addDischargeStatusToReport() {
  //   if (!this.ipdCaseData.length || !this.ipdBalanceReport.length) return;

  //   this.ipdBalanceReport = this.ipdBalanceReport.map((report: any) => {
  //     const patientId =
  //       report.inpatientBills?.[0]?.uniqueHealthIdentificationId;
  //       // console.log("patient id",patientId);

  //     const caseMatch = this.ipdCaseData.find(
  //       (c) => c.uniqueHealthIdentificationId?._id === patientId
  //     );

  //     // console.log("casematch",caseMatch);

  //     return {
  //       ...report,
  //       isDischarge: caseMatch?.isDischarge,
  //     };
  //   });
  // }

  addDischargeStatusToReport() {
    if (!this.ipdCaseData.length || !this.ipdBalanceReport.length) return;

    let updatedReport = this.ipdBalanceReport.map((report: any) => {
      const patientId =
        report.inpatientBills?.[0]?.uniqueHealthIdentificationId;

      const caseMatch = this.ipdCaseData.find(
        (c) => c.uniqueHealthIdentificationId?._id === patientId
      );

      return {
        ...report,
        isDischarge: caseMatch?.isDischarge,
        patientName: caseMatch?.patientName || report.patientName, // make sure patient name is available
      };
    });

    if (this.ipdPatientId) {
      this.idExists = true;
      const filtered = updatedReport.filter((r) => {
        const uhid = r.inpatientBills?.[0]?.uniqueHealthIdentificationId;
        return uhid === this.ipdPatientId;
      });

      this.selectedPatientName = filtered[0]?.patientName || ''; // store patient name
      updatedReport = filtered;
    } else {
      this.idExists = false;
      this.selectedPatientName = '';
    }

    this.ipdBalanceReport = updatedReport;
  }

  setActiveTab(tab: 'admitted' | 'discharge') {
    this.activeTab = tab;
  }

  get filteredPatients() {
    return this.ipdBalanceReport.filter((patient) =>
      this.activeTab === 'admitted' ? !patient.isDischarge : patient.isDischarge
    );
  }

  getDepositAmount(uhid: any): number {
    const deposit = this.depositData.find((d) => d.inpatientCase?._id === uhid);
    return deposit
      ? deposit.inpatientCase?.inpatientDeposits[0]?.amountDeposited
      : 0;
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

      pdf.save('Patient_Balance_Report.pdf');
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });
    }, 100);
  }
}
