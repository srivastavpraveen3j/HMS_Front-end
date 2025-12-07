import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OpdService } from '../../../../opdmodule/opdservice/opd.service';
import { ActivatedRoute } from '@angular/router';
import { PharmaService } from '../../../../../viewspharma/pharma.service';
import { LoaderComponent } from "../../../../loader/loader.component";
import { TestService } from '../../../../../viewspatho/testservice/test.service';

@Component({
  selector: 'app-patient-ledger-summary',
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './patient-ledger-summary.component.html',
  styleUrl: './patient-ledger-summary.component.css',
})
export class PatientLedgerSummaryComponent {
  title: string = '';
  opdBillData: any[] = [];
  serviceSummary: any[] = [];
  selectedFilter: 'today' | 'week' | 'month' | 'year' = 'today';
  today: Date = new Date();
  selectedDate: string = '';
  subTitle: string = '';
  opdBillDataById: any[] = [];
  singlePatientSummary: any[] = [];
  patientId: string = '';
  pharmaData: any[] = [];
  pharmaPatientId: string = '';
  testData: any[] = [];

  @ViewChild('pdfContent') pdfContent!: ElementRef;

  constructor(
    private service: OpdService,
    private route: ActivatedRoute,
    private pharmaService: PharmaService,
    private testService: TestService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const Id = params['_id'] || params['patientUhid_id'];
      this.title = params['title'] || 'Default Title';
      this.patientId = Id;
      // console.log(Id);

      if (Id) {
        this.getPatientSummaryById(Id);
      } else {
        this.setFilter(this.selectedFilter);
        this.getPatientSummary();
      }
    });
  }

  getPharmaData() {
    this.pharmaService.getPharmareq().subscribe({
      next: (res) => {
        console.log(res);
        if (Array.isArray(res)) {
          // this.pharmaData = res.filter(
          //   (item: any) =>
          //     item.uniqueHealthIdentificationId === this.pharmaPatientId
          // );
          this.pharmaData = res;
          console.log('pharma data', this.pharmaData);
        } else {
          console.warn('Unexpected response format for getPharmareq');
        }
      },
      error: (err) => console.log('Pharma Error:', err),
    });
  }

  getPathoData() {
    this.testService.getTestreq().subscribe({
      next: (res) => {
        console.log(res);
        if (Array.isArray(res)) {
          this.testData = res;
          console.log('patho data', this.testData);
        } else {
          console.warn('Unexpected response format for getTestreq');
        }
      },
      error: (err) => console.log('Pharma Error:', err),
    });
  }

  getPharmaForPatient(summaryId: string): any[] {
    return this.pharmaData.filter(
      (item: any) => item.uniqueHealthIdentificationId === summaryId
    );
  }

  getPathoForPatient(summaryId: string): any[] {
    return this.testData.filter(
      (item: any) => item.uniqueHealthIdentificationId === summaryId
    );
  }

  getPatientSummaryById(
    id: string,
    page: number = 1,
    collectedData: any[] = []
  ) {
    this.service.getOPDbill(page, 10).subscribe({
      next: (response: any) => {
        const currentData = response.data?.data || [];
        const totalPages = response.data?.totalPages || 1;
        const combined = [...collectedData, ...currentData];

        if (page < totalPages) {
          this.getPatientSummaryById(id, page + 1, combined); // fetch next page
        } else {
          // 🔍 Once all pages are fetched, filter by patient ID
          const matchedBills = combined.filter(
            (bill: any) => bill.patientUhid?._id === id
          );

          console.log('Filtered Bills for Patient:', matchedBills);

          this.opdBillDataById = matchedBills;
          this.singlePatientSummary =
            this.generatePatientSummaryFromBills(matchedBills);
        }
      },
      error: (error) => {
        console.error('Error fetching paginated OPD bills:', error);
      },
    });
  }

  generatePatientSummaryFromBills(bills: any[]): any[] {
    const summaryMap: { [patientId: string]: any } = {};

    bills.forEach((bill) => {
      // console.log("BILL",bill);
      const patientid = bill.patientUhid?._id;
      this.pharmaPatientId = patientid;
      const patient = bill.patientUhid;

      if (!patientid) return;

      if (!summaryMap[patientid]) {
        summaryMap[patientid] = {
          id: patientid,
          patientName: patient.patient_name,
          uhid: patient.uhid,
          age: patient.age,
          address: patient.area,
          bills: [],
        };
      }

      const billDate = new Date(bill.createdAt);
      const billNumber = bill.billnumber;

      const services = bill.serviceId.map((service: any) => ({
        name: service.name,
        charge: service.charge,
        type: service.type,
      }));

      summaryMap[patientid].bills.push({
        billNumber,
        date: billDate,
        services,
        totalAmount: bill.totalamount,
        amountReceived: bill.amountreceived,
        paymentMode: bill.paymentmethod,
      });
    });

    this.getPharmaData();
    this.getPathoData();
    return Object.values(summaryMap);
  }

  getPatientSummary(page: number = 1, collectedData: any[] = []) {
    this.service.getOPDbill(page, 10).subscribe({
      next: (response) => {
        // console.log("patient sumary",response);
        const currentData = response.data?.data || [];
        const totalPages = response.data?.totalPages || 1;
        const combined = [...collectedData, ...currentData];

        if (page < totalPages) {
          // Fetch next page recursively
          this.getPatientSummary(page + 1, combined);
        } else {
          // All data fetched
          this.opdBillData = combined;
          // console.log('opd bill data', this.opdBillData);
          this.generatePatientSummary();
        }
      },
      error: (error) => {
        console.error('Error fetching OPD bills:', error);
      },
    });
  }

  generatePatientSummary() {
    this.serviceSummary = this.generatePatientSummaryFromBills(
      this.opdBillData
    );
    // console.log('service summary', this.opdBillData);
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
  }

  get filteredPatients() {
    const baseData = this.patientId
      ? this.singlePatientSummary
      : this.serviceSummary;

    if (this.patientId) {
      return baseData;
    }

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

    return baseData
      .map((patient) => {
        const filteredBills = patient.bills.filter((bill: any) => {
          const billDate = new Date(bill.date);
          return billDate >= fromDate!;
        });

        if (filteredBills.length > 0) {
          return {
            ...patient,
            bills: filteredBills,
          };
        }
        return null;
      })
      .filter((p) => p !== null);
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

      pdf.save('Patient_Ledger_Report.pdf');
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });
    }, 100);
  }
}
