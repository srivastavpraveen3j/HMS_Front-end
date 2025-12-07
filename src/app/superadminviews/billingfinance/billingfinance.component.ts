import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-billingfinance',
  imports: [CommonModule, FormsModule],
  templateUrl: './billingfinance.component.html',
  styleUrl: './billingfinance.component.css'
})
export class BillingfinanceComponent {

  paymentData = [
    { hospital: 'City Hospital', status: 'Pending', amount: 1200, dueDate: '2025-05-01', lastPayment: '2025-03-15' },
    { hospital: 'Metro Clinic', status: 'Paid', amount: 1500, dueDate: '2025-04-15', lastPayment: '2025-04-10' },
  ];

  hospitals = ['City Hospital', 'Metro Clinic', 'Green Valley Care'];
  selectedHospital = this.hospitals[0];
  invoiceMessage = '';

  renewalAlerts = [
    { hospital: 'City Hospital', expiryDate: '2025-05-10' },
    { hospital: 'Metro Clinic', expiryDate: '2025-05-20' },
  ];

  remind(hospital: string) {
    alert(`Reminder sent to ${hospital} for pending payment.`);
  }

  generateInvoice() {
    this.invoiceMessage = `Invoice generated for ${this.selectedHospital}`;
  }

  sendRenewalReminder(hospital: string) {
    alert(`Renewal reminder sent to ${hospital}.`);
  }

}
