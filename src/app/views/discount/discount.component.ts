import { DiscountApprovalToggleComponent } from './../../component/discountModule/discount-approval-toggle/discount-approval-toggle.component';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// import { DiscountRequestDetailsComponent } from '../../component/discountModule/discount-request-details/discount-request-details.component';
import { DiscountService } from '../../core/services/discount.service';

@Component({
  selector: 'app-discount',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    DiscountApprovalToggleComponent
  ],
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.css']
})

export class DiscountComponent {

  discountRequests: any[] = [];
  public selectedRequest: any;

  constructor(
    public discountService: DiscountService,
  ) { }

  ngOnInit(): void {
    this.loadDiscountRequests();
  }

  loadDiscountRequests() {
    this.discountService.getDiscountRequests().subscribe((res) => {
      this.discountRequests = res;
      this.discountRequests.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });
  }

  toggleDetails(request: any): void {
    this.selectedRequest = this.selectedRequest === request ? null : request;
  }

  updateStatus(event: any) {
    this.loadDiscountRequests();
  }
}
