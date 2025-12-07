import { DiscountService } from './../../../core/services/discount.service';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { consoleLogger } from '../../../helper/consoleLogger';
// import { ButtonComponent } from "../../../shared/components/button/button.component";
import { CommonModule } from '@angular/common';
@Component({
  selector: 'discount-approval-toggle',
  imports: [CommonModule],
  templateUrl: './discount-approval-toggle.component.html',
  styleUrl: './discount-approval-toggle.component.css'
})
export class DiscountApprovalToggleComponent {
  @Input() request: any;
  @Output() statusChanged = new EventEmitter<any>();
  @Output() discountChanged = new EventEmitter<any>();
  @Output() reasonbyAdmin = new EventEmitter<any>();

  constructor(private DiscountService: DiscountService) { }

  approve() {
    consoleLogger.log("this.request", this.request);
    this.DiscountService
      .updateDiscountStatus(this.request._id, 'approved', true).subscribe(
        (res) => {
          this.statusChanged.emit(res);
        }
      )
  }

  decline() {
    this.DiscountService
      .updateDiscountStatus(this.request._id, 'rejected', false).subscribe(
        (res) => {
          this.statusChanged.emit(res);
        }
      )
  }

  editRequest() {
    this.request.isEdit = true;
    // this.DiscountService.updateDiscountValueOrReason(this.request._id, 100, "New Value").subscribe((res) => {
    //   this.discountChanged.emit(res);
    // })
  }

  submitUpdate() {
    this.request.isEdit = false;
    this.DiscountService.updateDiscountValueOrReason(this.request._id, this.request.discount, this.request.reasonbyAdmin).subscribe((res) => {
      this.discountChanged.emit(res);
    })
  }
}
