  import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-request-quotation-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './request-quotation-detail.component.html',
  styleUrl: './request-quotation-detail.component.css'
})
export class RequestQuotationDetailComponent {


  rfq = {
    id: 'RFQ-001',
    vendorName: 'SurgiCare Distributors',
    createdDate: '2025-07-11',
    status: 'Pending',
    items: [
      { item: 'Paracetamol', category: 'Drug', quantity: 250 },
      { item: 'Test Tubes', category: 'General', quantity: 50 },
      { item: 'Gloves', category: 'Surgical', quantity: 300 }
    ]
  };

}
