import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase-ledger',
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-ledger.component.html',
  styleUrl: './purchase-ledger.component.css'
})
export class PurchaseLedgerComponent {


  vendorSearch = '';
  filterDate = '';

  ledgerData = [
    {
      poNumber: 'PO-1001',
      vendor: 'ABC Pharma',
      invoiceNo: 'INV-1001',
      invoiceAmount: 1680,
      paymentMode: 'NEFT',
      transactionId: 'TXN123456',
      status: 'Paid',
      date: '2025-07-11'
    },
    {
      poNumber: 'PO-1002',
      vendor: 'MedLife Supplies',
      invoiceNo: 'INV-1002',
      invoiceAmount: 630,
      paymentMode: '',
      transactionId: '',
      status: 'Pending',
      date: '2025-07-12'
    }
  ];

  filteredLedger() {
    return this.ledgerData.filter(item =>
      (!this.vendorSearch || item.vendor.toLowerCase().includes(this.vendorSearch.toLowerCase())) &&
      (!this.filterDate || item.date === this.filterDate)
    );
  }

  exportLedger() {
    console.log('Exporting Ledger:', this.ledgerData);
    alert('Download triggered (mock only in this demo).');
  }
}
