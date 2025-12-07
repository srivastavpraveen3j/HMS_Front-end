import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LetterheaderComponent } from '../../../views/settingsmodule/letterhead/letterheader/letterheader.component';

@Component({
  selector: 'app-ipdbillcumreceipt',
  imports: [CommonModule, FormsModule, LetterheaderComponent],
  templateUrl: './ipdbillcumreceipt.component.html',
  styleUrl: './ipdbillcumreceipt.component.css',
})
export class IpdbillcumreceiptComponent {
  @Input() selectedPatientBill: any;
  @Input() serviceList: any;
  @Input() radioList: any;
  @Input() roomLog: any;
  @Input() totalRoomCharge: any;

  get allPages(): any[] {
    const pages: any[] = [];

    // 1. Summary
    pages.push({
      pageType: 'summary',
      patient: this.selectedPatientBill,
    });

    // 2. Room Details
    if (this.roomLog && this.roomLog.length > 0) {
      pages.push({
        pageType: 'room',
        data: this.roomLog,
        total: this.totalRoomCharge,
        title: 'Room Details :',
        columns: [
          { key: 'no', label: 'No.', value: (item: any, i: number) => i + 1 },
          { key: 'date', label: 'Date', value: (item: any) => item.date },
          {
            key: 'days',
            label: 'Days',
            value: (item: any) =>
              item.isFullDay ? '0' : (item.isHalfDay ? '0.5' : '1'),
          },
          {
            key: 'charge',
            label: 'Room + Nursing Charge',
            value: (item: any) => item.roomCharge + item.bedCharge,
          },
          {
            key: 'amount',
            label: 'Amount',
            value: (item: any) => item.roomCharge + item.bedCharge,
          },
        ],
      });
    }

    // 3. Service Details
    if (this.serviceList?.services?.length > 0) {
      pages.push({
        pageType: 'service',
        data: this.serviceList.services,
        total: this.serviceList.totalAmount,
        title: 'Service Details :',
        columns: [
          { key: 'no', label: 'No.', value: (item: any, i: number) => i + 1 },
          { key: 'date', label: 'Date', value: (item: any) => item.date },
          {
            key: 'service',
            label: 'Service',
            value: (item: any) => item.service,
          },
          { key: 'charge', label: 'Charge', value: (item: any) => item.charge },
        ],
      });
    }

    // 4. Radiology Details
    if (this.radioList?.services?.length > 0) {
      pages.push({
        pageType: 'radiology',
        data: this.radioList.services,
        total: this.radioList.totalAmount,
        title: 'Radiology Details :',
        columns: [
          { key: 'no', label: 'No.', value: (item: any, i: number) => i + 1 },
          { key: 'date', label: 'Date', value: (item: any) => item.date },
          {
            key: 'service',
            label: 'Service',
            value: (item: any) => item.service,
          },
          { key: 'charge', label: 'Charge', value: (item: any) => item.charge },
        ],
      });
    }

    // Extend for more detail page types if needed, just like above.

    return pages;
  }
}
