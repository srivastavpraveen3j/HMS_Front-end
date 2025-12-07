import { Component } from '@angular/core';

@Component({
  selector: 'app-payment-selector',
  templateUrl: './payment-selector.component.html',
  styleUrls: ['./payment-selector.component.css']
})
export class PaymentSelectorComponent {

  paymentMethods = ['Cash', 'UPI', 'Card', 'Other'];
  selectedMethod: string = '';
  transactionId: string = '';
  paymentDetails: any = {}; // can store qr, amount, etc.

  selectMethod(method: string) {
    this.selectedMethod = method;
    // Reset transactionId and payment details on change
    this.transactionId = '';
    this.paymentDetails = {};
  }

}
