import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IndianCurrencyPipe } from '../../../pipe/indian-currency.pipe';
import { LetterheaderComponent } from '../../../views/settingsmodule/letterhead/letterheader/letterheader.component';

@Component({
  selector: 'app-ipdestimatebill',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IndianCurrencyPipe,
    LetterheaderComponent,
  ],
  templateUrl: './ipdestimatebill.component.html',
  styleUrls: ['./ipdestimatebill.component.css'],
})
export class IpdestimatebillComponent implements OnChanges {
  @ViewChild('printSection', { static: false }) printSection?: ElementRef;
  @Input() estimateBill: any;
  @Input() radioList: any;
  @Input() serviceList: any;
  @Input() otData: any[] = [];
  @Input() roomCharge: any;
  @Input() serviceCharge: any;
  @Input() otcharge: any;
  @Input() total: any;
  @Input() deposit: any;
  @Input() amount: any;
  @Input() finalRoomCharge: any;
  @Input() dailyRoomCharges: any[] = [];
  pages: any[] = [];

  ngOnChanges() {
    this.pages = [];
    if (!this.estimateBill) return;

    // Summary page
    this.pages.push({ pageType: 'summary' });

    const sections = [
      {
        key: 'room',
        title: 'Room Detail :',
        data: this.dailyRoomCharges || [],
        total: this.finalRoomCharge,
        buildRow: (item: any, i: number) => ({
          no: i + 1,
          date: item.date,
          room: item.roomNumber || '-',
          roomRate: item.originalRoomCharge + item.originalBedCharge,
          days: item.isFullDay ? 1 : item.isHalfDay ? 0.5 : 0,
          charge: item.roomCharge + item.bedCharge,
          amount: item.roomCharge + item.bedCharge,
        }),
      },
      {
        key: 'service',
        title: 'Service Charge :',
        data: this.serviceList?.services || [],
        total: this.serviceList?.totalAmount,
        buildRow: (item: any, i: number) => ({
          no: i + 1,
          date: item.date,
          service: item.service,
          rate: item.charge,
          quantity: item.quantity,
          amount: item.total,
        }),
      },
      {
        key: 'ot',
        title: 'OT Detail :',
        data: this.otData || [],
        total: this.otcharge,
        buildRow: (item: any, i: number) => ({
          no: i + 1,
          date: item.createdAt,
          name: [
            ...(item.manualOperationEntries || []),
            ...(item.surgeryPackages || []),
          ]
            .map((x: any) => x.name)
            .join(', '),
          amount: item.netAmount,
        }),
      },
      {
        key: 'radio',
        title: 'Radiology :',
        data: this.radioList?.services || [],
        total: this.radioList?.totalAmount,
        buildRow: (item: any, i: number) => ({
          no: i + 1,
          date: item.date,
          service: item.service,
          rate: item.charge,
        }),
      },
      {
        key: 'visiting',
        title: 'Visiting Charges :',
        data: this.estimateBill?.visitingCharges || [],
        total: this.estimateBill?.visitingChargesTotal,
        buildRow: (v: any, i: number) => ({
          no: i + 1,
          date: v.date,
          doctor: v.name,
          detail: v.detail,
          rate: v.rate,
          qty: v.qty,
          remark: v.remark || '-',
          amount: v.amount,
        }),
      },
    ];

    sections.forEach((sec) => {
      if (!sec.data || !sec.data.length) return;
      this.pages.push({
        pageType: 'detail',
        sectionKey: sec.key,
        title: sec.title,
        columns: this.buildColumns(sec.key),
        data: sec.data.map(sec.buildRow),
        total: sec.total,
      });
    });
  }

  buildColumns(key: string) {
    switch (key) {
      case 'room':
        return [
          { key: 'no', label: 'No.' },
          { key: 'date', label: 'Date', isDate: true },
          { key: 'room', label: 'Room' },
          { key: 'roomRate', label: 'Room Rate' },
          { key: 'days', label: 'Days' },
          { key: 'charge', label: 'Room Charge' },
          { key: 'amount', label: 'Amount', isCurrency: true },
        ];
      case 'service':
        return [
          { key: 'no', label: 'No.' },
          { key: 'date', label: 'Date', isDate: true },
          { key: 'service', label: 'Description' },
          { key: 'rate', label: 'Rate', isCurrency: true },
          { key: 'quantity', label: 'Quantity' },
          { key: 'amount', label: 'Amount', isCurrency: true },
        ];
      case 'ot':
        return [
          { key: 'no', label: 'No.' },
          { key: 'date', label: 'Date', isDate: true },
          { key: 'name', label: 'Name' },
          { key: 'amount', label: 'Amount', isCurrency: true },
        ];
      case 'radio':
        return [
          { key: 'no', label: 'No.' },
          { key: 'date', label: 'Date', isDate: true },
          { key: 'service', label: 'Test Name' },
          { key: 'rate', label: 'Rate', isCurrency: true },
        ];
      case 'visiting':
        return [
          { key: 'no', label: 'No.' },
          { key: 'date', label: 'Date', isDate: true },
          { key: 'doctor', label: 'Dr. Name' },
          { key: 'detail', label: 'Detail' },
          { key: 'rate', label: 'Rate', isCurrency: true },
          { key: 'qty', label: 'Qty' },
          { key: 'remark', label: 'Remark' },
          { key: 'amount', label: 'Amount', isCurrency: true },
        ];
      default:
        return [];
    }
  }
}
