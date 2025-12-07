import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DoctorreferralService } from '../doctorreferral.service';
import { GenericHelperPipe } from "../../pipe/doctorreferralpipes/generic-helper.pipe";
import { MasterService } from '../../views/mastermodule/masterservice/master.service';

@Component({
  selector: 'app-referraldatalist',
  imports: [CommonModule, GenericHelperPipe],
  templateUrl: './referraldatalist.component.html',
  styleUrl: './referraldatalist.component.css',
})
export class ReferraldatalistComponent {
  allData: any[] = [];
  allRules: any[] = [];
  currentPage: number = 1;
  recordsPerPage: number = 10;
  todayDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private doctor: DoctorreferralService,
    private masterService: MasterService
  ) {}

  async ngOnInit(){
     try {
       await this.loadRules();
       this.loadData();
     } catch (err) {
       console.error('Error during init:', err);
     }
  }

  loadData() {
    this.doctor.getReferralData().subscribe({
      next: (res) => {
        this.allData = res.rules || res.data;
        console.log(this.allData);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  loadRules(): Promise<void> {
    this.allRules = []; // Clear existing

    return new Promise((resolve, reject) => {
      const fetchPage = (page: number) => {
        this.masterService
          .getReferralRules(page, this.recordsPerPage)
          .subscribe({
            next: (res) => {
              const rules = res.rules || res.data || [];
              this.allRules.push(...rules);

              const totalPages = res.totalPages || 1;

              if (page < totalPages) {
                fetchPage(page + 1); // Recursive call
              } else {
                console.log('All rules fetched:', this.allRules);
                resolve(); // ✅ Done
              }
            },
            error: (err) => {
              console.error('Failed to load rules', err);
              reject(err); // ❌ On error
            },
          });
      };

      fetchPage(1); // Start from page 1
    });
  }

  getReferralPercentages(services: any[]): string {
    if (!services || !this.allRules) return '';

    return services
      .map((service) => {
        const matchedRule = this.allRules.find(
          (rule) => rule.serviceName?._id === service._id
        );
        return matchedRule?.referralPercent + '%' || 'N/A';
      })
      .join(', ');
  }

  getPaymentStatusIconLabel(data: any): string {
    this.updatePaymentStatusIfNeeded(data);

    const bill = data.OutpatientBillID || {};
    const discountMeta = bill.DiscountMeta || {};

    const amountReceived = data.amountReceived || 0;
    const totalAmount = bill.totalamount || 0;
    const netPay = bill.netpay || 0;
    const discountStatus = discountMeta.discountStatus;
    const discountAmount = discountMeta.discount || 0;

    // console.log({
    //   amountReceived,
    //   totalAmount,
    //   netPay,
    //   discountStatus,
    //   discountAmount,
    //   amountPlusDiscount: amountReceived + discountAmount,
    // });

    if (
      amountReceived >= netPay ||
      (discountStatus === 'approved' &&
        Math.abs(amountReceived + discountAmount - totalAmount) < 0.01)
    ) {
      return '✅ Paid';
    }
    if (discountStatus === 'pending' && amountReceived < totalAmount) {
      return '🟠 Partially Paid (Discount Pending)';
    }

    if (
      discountStatus === 'approved' &&
      amountReceived + discountAmount < totalAmount
    ) {
      return `🟠 Partially Paid with ₹${discountAmount} Discount`;
    }

    if (amountReceived === 0) {
      return '🔴 Not Paid';
    }

    return '🟠 Partially Paid';
  }

  updatePaymentStatusIfNeeded(data: any): void {
    const bill = data.OutpatientBillID || {};
    const discountMeta = bill.DiscountMeta || {};

    const amountReceived = data.amountReceived || 0;
    const totalAmount = bill.totalamount || 0;
    const netPay = bill.netpay || 0;
    const discountStatus = discountMeta.discountStatus;
    const discountAmount = discountMeta.discount || 0;

    const isPaid =
      amountReceived >= netPay ||
      (discountStatus === 'approved' &&
        Math.abs(amountReceived + discountAmount - totalAmount) < 0.01);

    if (isPaid && (!data.paymentReceived || data.billingStatus !== 'Paid')) {
      data.paymentReceived = true;
      data.billingStatus = 'Paid';

      //==> calculate share
      const totalShare = this.calculateReferralShare(data);
      data.referralCalculated = true;
      data.referralCalculationDate = this.todayDate;
      data.calculatedShare = totalShare;

      // ✅ API call only if not already marked as paid
      this.doctor.updateReferralData(data._id, data).subscribe((res) => {
        console.log('Updated referral as Paid', res);
      });
    }
  }

  calculateReferralShare(data: any): number {
    if (!data.service || !Array.isArray(data.service)) return 0;

    const totalAmount = data.billingAmount || 0;

    // Step 1: Sum of all service charges
    const totalServiceCharge = data.service.reduce((sum: number, s: any) => {
      return sum + (s.charge || 0);
    }, 0);

    if (totalServiceCharge === 0) return 0;

    // Step 2: Calculate proportional share
    let totalShare = 0;

    for (const service of data.service) {
      const matchedRule = this.allRules.find(
        (rule) => rule.serviceName?._id === service._id
      );

      if (matchedRule) {
        const referralPercent = matchedRule.referralPercent || 0;

        // Proportional amount from totalAmount
        const proportionalAmount =
          ((service.charge || 0) / totalServiceCharge) * totalAmount;

        // Share for this service
        totalShare += (proportionalAmount * referralPercent) / 100;
      }
    }

    return Math.round(totalShare);
  }
}
