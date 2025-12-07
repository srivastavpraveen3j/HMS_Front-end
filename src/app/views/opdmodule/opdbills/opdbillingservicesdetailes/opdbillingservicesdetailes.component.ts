import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationFilterComponent } from "../../../../component/pagination-filter/pagination-filter.component";
@Component({
  selector: 'app-opdbillingservicesdetailes',
  imports: [CommonModule, PaginationFilterComponent],
  templateUrl: './opdbillingservicesdetailes.component.html',
  styleUrls: ['./opdbillingservicesdetailes.component.css']
})
export class OpdbillingservicesdetailesComponent {
  @Input() bills: any;
  @Input() currentIndex: number = 0;

  currentBill: any;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['bills'] || changes['currentIndex']) {
      this.updateCurrentBill();
    }
  }

  updateCurrentBill() {
    if (this.bills && this.bills.length > 0 && this.currentIndex >= 0 && this.currentIndex < this.bills.length) {
      this.currentBill = this.bills[this.currentIndex];
    } else {
      this.currentBill = null;
    }
  }
}
