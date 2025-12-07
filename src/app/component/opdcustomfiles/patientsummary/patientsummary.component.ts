import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { OpdService } from '../../../views/opdmodule/opdservice/opd.service';
import { PharmaService } from '../../../viewspharma/pharma.service';
import { TestService } from '../../../viewspatho/testservice/test.service';

@Component({
  selector: 'app-patientsummary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patientsummary.component.html',
  styleUrl: './patientsummary.component.css',
})
export class PatientsummaryComponent {
  @Input() patientData: any[] = [];
  @Input() opdPatient: any = {};
  // opdPatient: any = {};
  // opdBillData: any[] = [];
  // singlePatientSummary: any[] = [];
  // opdBillDataById: any[] = [];
  // patientId: string = '';
  pharmaData: any[] = [];
  pharmaPatientId: string = '';
  testData: any[] = [];
  labTotalAmount: any = {};
  pharmaTotal: any = {};
  date: string = '';

  constructor(
    // private service: OpdService,
    private pharmaService: PharmaService,
    private testService: TestService
  ) // private opdService: OpdService
  {}

  ngOnInit() {
    // this.getPatientSummaryById(this.patientData);

    // this.opdService.getOPDcaseById(this.opdId).subscribe((res) => {
    //   console.log('opd case by id', res);
    //   this.opdPatient = res;
    //   this.dataReady.emit(true);
    // });

    this.getPharmaData();
    this.getPathoData();

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    this.date = todayString;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['patientData']) {
      const patient = this.patientData;
      // console.log('Patient object:', patient);
    }
  }

  // getPatientSummaryById(
  //   id: string,
  //   page: number = 1,
  //   collectedData: any[] = []
  // ) {
  //   this.service.getOPDbill(page, 10).subscribe({
  //     next: (response: any) => {
  //       const currentData = response.data?.data || [];
  //       const totalPages = response.data?.totalPages || 1;
  //       const combined = [...collectedData, ...currentData];

  //       if (page < totalPages) {
  //         this.getPatientSummaryById(id, page + 1, combined); // fetch next page
  //       } else {
  //         // 🔍 Once all pages are fetched, filter by patient ID
  //         const matchedBills = combined.filter(
  //           (bill: any) => bill.patientUhid?._id === id
  //         );

  //         console.log('Filtered Bills for Patient:', matchedBills);

  //         this.opdBillDataById = matchedBills;
  //         this.singlePatientSummary =
  //           this.generatePatientSummaryFromBills(matchedBills);
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error fetching paginated OPD bills:', error);
  //     },
  //   });
  // }

  // generatePatientSummaryFromBills(bills: any[]): any[] {
  //   const summaryMap: { [patientId: string]: any } = {};

  //   bills.forEach((bill) => {
  //     // console.log("BILL",bill);
  //     const patientid = bill.patientUhid?._id;
  //     this.pharmaPatientId = patientid;
  //     const patient = bill.patientUhid;
  //     const discount = bill.DiscountMeta?.discount;

  //     if (!patientid) return;

  //     if (!summaryMap[patientid]) {
  //       summaryMap[patientid] = {
  //         id: patientid,
  //         patientName: patient.patient_name,
  //         uhid: patient.uhid,
  //         age: patient.age,
  //         address: patient.area,
  //         mobile: patient.mobile_no,
  //         bills: [],
  //       };
  //     }

  //     const billDate = new Date(bill.createdAt);
  //     const billNumber = bill.billnumber;

  //     const services = bill.serviceId.map((service: any) => ({
  //       name: service.name,
  //       charge: service.charge,
  //       type: service.type,
  //     }));

  //     summaryMap[patientid].bills.push({
  //       billNumber,
  //       date: billDate,
  //       services,
  //       totalAmount: bill.totalamount,
  //       amountReceived: bill.amountreceived,
  //       paymentMode: bill.paymentmethod,
  //       discount,
  //     });
  //   });

  //   this.getPharmaData();
  //   this.getPathoData();
  //   return Object.values(summaryMap);
  // }

  getPharmaData() {
    this.pharmaService.getPharmareq().subscribe({
      next: (res) => {
        // console.log(res);
        if (Array.isArray(res)) {
          this.pharmaData = res;
          console.log('Pharma data', this.pharmaData);
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
        // console.log(res);
        if (Array.isArray(res)) {
          this.testData = res;
          console.log('Patho data', this.testData);
        } else {
          console.warn('Unexpected response format for getTestreq');
        }
      },
      error: (err) => console.log('Pharma Error:', err),
    });
  }

  getPharmaForPatient(summaryId: string): any[] {
    const data = this.pharmaData.filter(
      (item: any) => item.uniqueHealthIdentificationId === summaryId
    );
    const total = this.calculatePharmacyTotal(data);
    // console.log("pharma total",total);
    this.pharmaTotal = total;
    return data;
  }

  getPathoForPatient(summaryId: string): any[] {
    const data = this.testData.filter(
      (item: any) => item.uniqueHealthIdentificationId === summaryId
    );
    const total = this.calculatePathologyTotal(data);
    // console.log("patho total",total);
    this.labTotalAmount = total;
    return data;
  }

  calculatePathologyTotal(data: any[]) {
    const summary = data.reduce(
      (acc, item) => {
        acc.total += Number(item.total) || 0;
        acc.amountReceived += Number(item.amountReceived) || 0;
        return acc;
      },
      { total: 0, amountReceived: 0 }
    );

    return summary;
  }

  calculatePharmacyTotal(data: any[]): number {
    return data.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  }

  getGrandTotal(data: any[]): number {
    const consultation = data.reduce(
      (sum, bill) => sum + (bill.totalAmount || 0),
      0
    );
    return consultation + this.labTotalAmount?.total + this.pharmaTotal;
  }

  getPaidTotal(data: any[]): number {
    const consultation = data.reduce(
      (sum, bill) => sum + (bill.amountReceived || 0),
      0
    );
    return (
      consultation + this.labTotalAmount?.amountReceived + this.pharmaTotal
    );
  }

  getTotalDiscount(data: any[]): number {
    return data.reduce((sum, bill) => sum + (bill.discount || 0), 0);
  }

  // async printOPDSheet(): Promise<void> {
  //   const printContent = document.getElementById('opd-sheet');

  //   if (!printContent) {
  //     console.error('Could not find print content.');
  //     return;
  //   }

  //   const html2canvas = (await import('html2canvas')).default;
  //   const { default: jsPDF } = await import('jspdf');

  //   try {
  //     const canvas: HTMLCanvasElement = await html2canvas(printContent, {
  //       scale: 2, // higher scale for better quality
  //     });

  //     const imgData: string = canvas.toDataURL('image/png'); // correct MIME type
  //     const pdf = new jsPDF('p', 'mm', 'a5');

  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = pdf.internal.pageSize.getHeight();

  //     const imgWidth = pdfWidth;
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //     let heightLeft = imgHeight;
  //     let position = 0;

  //     // First page
  //     pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  //     heightLeft -= pdfHeight;

  //     // Additional pages
  //     while (heightLeft > 0) {
  //       position -= pdfHeight;
  //       pdf.addPage();
  //       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  //       heightLeft -= pdfHeight;
  //     }

  //     pdf.save('patient-summary.pdf');
  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //   }
  // }

  printOPDSheet() {
    const opdElement = document.getElementById('opd-sheet');
    if (!opdElement) return;

    const opdClone = opdElement.cloneNode(true) as HTMLElement;

    const images = opdClone.querySelectorAll('img');
    const convertImageToBase64 = (img: HTMLImageElement) => {
      return new Promise<void>((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = img.src;
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          img.src = canvas.toDataURL('image/png');
          resolve();
        };
        image.onerror = () => resolve();
      });
    };

    Promise.all(
      Array.from(images).map((img) => convertImageToBase64(img))
    ).then(() => {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) return;

      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((style) => style.outerHTML)
        .join('\n');

      printWindow.document.write(`
      <html>
        <head>
          <title>OPD Sheet</title>
          ${styles}
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            #opd-print {
              width: 100%;
            }
            @media print {
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
              /* Allow page breaks inside the content */
              #opd-print {
                page-break-inside: auto !important;
              }
              #opd-print * {
                page-break-inside: auto !important;
                page-break-before: auto !important;
                page-break-after: auto !important;
              }
              /* Avoid breaking only key sections */
              .no-break {
                page-break-inside: avoid !important;
              }
            }
          </style>
        </head>
        <body>
          <div id="opd-print">${opdClone.outerHTML}</div>
        </body>
      </html>
    `);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      };
    });
  }
}
