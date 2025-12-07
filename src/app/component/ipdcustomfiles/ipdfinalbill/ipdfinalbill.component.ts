import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IndianCurrencyPipe } from '../../../pipe/indian-currency.pipe';
import { LetterheaderComponent } from '../../../views/settingsmodule/letterhead/letterheader/letterheader.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ipdfinalbill',
  imports: [
    CommonModule,
    IndianCurrencyPipe,
    LetterheaderComponent,
    FormsModule,
  ],
  templateUrl: './ipdfinalbill.component.html',
  styleUrl: './ipdfinalbill.component.css',
})
export class IpdfinalbillComponent {
  @ViewChild('printSection', { static: false }) printSection:
    | ElementRef
    | undefined;
  @Input() estimateBill: any;
  @Input() serviceList: any;
  @Input() radioList: any;
  @Input() otData: any;
  @Input() roomCharge: any;
  @Input() pharmaCharge: any;
  @Input() otcharge: any;
  @Input() total: any;
  @Input() deposit: any;
  @Input() amount: any;
  @Input() finalRoomCharge: any;
  @Input() dailyRoomCharges: any;
  @Input() paidAmount: any;
  user: any;
  date: any = new Date();

  pages: any[] = [];

  ngOnInit() {
    const userStr = JSON.parse(localStorage.getItem('authUser') || '[]');
    this.user = userStr.name;
  }

  ngOnChanges() {
    if (!this.estimateBill) return;

    this.pages = [];

    // 1) Summary page (keep as index 0)
    this.pages.push({ pageType: 'summary', patient: this.estimateBill });

    // 3) Room details
    if (this.dailyRoomCharges?.length) {
      this.pages.push({
        pageType: 'detail',
        title: 'Room Details :',
        columns: [
          { key: 'no', label: 'No.', value: (_: any, i: number) => i + 1 },
          {
            key: 'date',
            label: 'Date',
            isDate: true,
            value: (r: any) => r.date,
          },
          {
            key: 'description',
            label: 'Room',
            value: (r: any) => r.roomNumber,
          },
          {
            key: 'roomRate',
            label: 'Room Rate',
            value: (r: any) => r.originalRoomCharge + r.originalBedCharge,
          },
          {
            key: 'days',
            label: 'Days',
            value: (r: any) => (r.isFullDay ? '0' : r.isHalfDay ? '0.5' : '1'),
          },
          {
            key: 'charge',
            label: 'Room + Nursing Charge',
            value: (r: any) => r.roomCharge + r.bedCharge,
          },
          {
            key: 'amount',
            label: 'Amount',
            isCurrency: true,
            value: (r: any) => r.roomCharge + r.bedCharge,
          },
        ],
        data: this.dailyRoomCharges,
        total: this.finalRoomCharge,
      });
    }

    // 2) Service details
    if (this.serviceList?.services?.length) {
      this.pages.push({
        pageType: 'detail',
        title: 'Service Charge :',
        columns: [
          { key: 'no', label: 'No.', value: (_: any, i: number) => i + 1 },
          {
            key: 'date',
            label: 'Date',
            isDate: true,
            value: (r: any) => r.date,
          },
          {
            key: 'service',
            label: 'Description',
            value: (r: any) => r.service,
          },
          {
            key: 'amount',
            label: 'Rate',
            isCurrency: true,
            value: (r: any) => r.charge,
          },
          {
            key: 'quantity',
            label: 'Quantity',
            value: (r: any) => r.quantity,
          },
          {
            key: 'total',
            label: 'Amount',
            isCurrency: true,
            value: (r: any) => r.total,
          },
        ],
        data: this.serviceList.services,
        total: this.serviceList.totalAmount,
      });
    }

    // 4) OT details
    if (this.otData?.length) {
      this.pages.push({
        pageType: 'detail',
        title: 'OT Detail :',
        columns: [
          { key: 'no', label: 'No.', value: (_: any, i: number) => i + 1 },
          {
            key: 'date',
            label: 'Date',
            isDate: true,
            value: (r: any) => r.createdAt,
          },
          {
            key: 'name',
            label: 'Name',
            value: (r: any) =>
              [
                ...(r.manualOperationEntries || []),
                ...(r.surgeryPackages || []),
              ]
                .map((x: any) => x.name)
                .join(', '),
          },
          {
            key: 'amount',
            label: 'Amount',
            isCurrency: true,
            value: (r: any) => r.netAmount,
          },
        ],
        data: this.otData,
        total: this.otcharge,
      });
    }

    // 5) Radiology details
    if (this.radioList?.services?.length) {
      this.pages.push({
        pageType: 'detail',
        title: 'Radiology :',
        columns: [
          { key: 'no', label: 'No.', value: (_: any, i: number) => i + 1 },
          {
            key: 'date',
            label: 'Date',
            isDate: true,
            value: (r: any) => r.date,
          },
          { key: 'service', label: 'Test Name', value: (r: any) => r.service },
          {
            key: 'amount',
            label: 'Rate',
            isCurrency: true,
            value: (r: any) => r.charge,
          },
        ],
        data: this.radioList.services,
        total: this.radioList.totalAmount,
      });
    }
  }

  get netAmount(): number {
    return this.total - this.deposit - this.paidAmount;
  }

  convertNumberToWords(amount: number): string {
    const a = [
      '',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen',
    ];
    const b = [
      '',
      '',
      'twenty',
      'thirty',
      'forty',
      'fifty',
      'sixty',
      'seventy',
      'eighty',
      'ninety',
    ];

    // Split rupees and paise
    const [rupeesPart, paisePart] = amount.toString().split('.').map(Number);
    const paise = paisePart
      ? Math.round(
          (paisePart / Math.pow(10, paisePart.toString().length)) * 100
        )
      : 0;

    const numToWords = (num: number): string => {
      if (!num) return '';
      if (num < 20) return a[num];
      if (num < 100)
        return b[Math.floor(num / 10)] + (num % 10 ? '-' + a[num % 10] : '');
      if (num < 1000)
        return a[Math.floor(num / 100)] + ' hundred ' + numToWords(num % 100);
      if (num < 100000)
        return (
          numToWords(Math.floor(num / 1000)) +
          ' thousand ' +
          numToWords(num % 1000)
        );
      if (num < 10000000)
        return (
          numToWords(Math.floor(num / 100000)) +
          ' lakh ' +
          numToWords(num % 100000)
        );
      return (
        numToWords(Math.floor(num / 10000000)) +
        ' crore ' +
        numToWords(num % 10000000)
      );
    };

    let words = numToWords(rupeesPart).trim() + ' rupees';
    if (paise > 0) {
      words += ' and ' + numToWords(paise).trim() + ' paise';
    }
    return words;
  }
}
