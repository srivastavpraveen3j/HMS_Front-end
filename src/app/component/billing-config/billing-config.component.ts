import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-billing-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing-config.component.html',
  styleUrls: ['./billing-config.component.css']
})
export class BillingConfigComponent implements OnInit {
 billingSettings = {
  applyGST: false,
  gstPercentage: 0,
  adminDiscountAllowed: false,
  adminMaxDiscount: 0
};

  ngOnInit(): void {
    // You can load these settings from a service or backend in real scenarios
    this.billingSettings ={
      applyGST: false,
      gstPercentage: 0,
      adminDiscountAllowed: false,
      adminMaxDiscount: 0
    }
  }

  logSettings(): void {
    console.log('Billing Settings:', this.billingSettings);
  }
}
