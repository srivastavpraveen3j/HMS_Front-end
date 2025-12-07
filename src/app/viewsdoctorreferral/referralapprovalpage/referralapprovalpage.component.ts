import { Component } from '@angular/core';
import { DoctorreferralService } from '../doctorreferral.service';
import { CommonModule } from '@angular/common';
import { MasterService } from '../../views/mastermodule/masterservice/master.service';
import { GenericHelperPipe } from '../../pipe/doctorreferralpipes/generic-helper.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-referralapprovalpage',
  imports: [CommonModule, GenericHelperPipe, FormsModule],
  templateUrl: './referralapprovalpage.component.html',
  styleUrl: './referralapprovalpage.component.css',
})
export class ReferralapprovalpageComponent {
  Number(arg0: any) {
    throw new Error('Method not implemented.');
  }
  allData: any[] = [];
  allRules: any[] = [];
  currentPage: number = 1;
  recordsPerPage: number = 10;
  todayDate: string = new Date().toISOString().split('T')[0];
  searchText: string = '';
  filteredData: any[] = [];

  constructor(
    private doctor: DoctorreferralService,
    private masterService: MasterService
  ) {}

  async ngOnInit() {
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
        this.filteredData = this.allData.filter(
          (d) => d.paymentReceived === true || d.paymentReceived === 'true'
        );
        console.log('FILTERED', this.filteredData);
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

  calculateReferralShare(data: any) {
    if (!data || !data.service || !Array.isArray(data.service)) return 0;

    // ✅ Skip calculation only if share is already > 0
    if (Number(data.calculatedShare) > 0) return data.calculatedShare;

    const totalAmount = data.billingAmount || 0;
    const totalServiceCharge = data.service.reduce((sum: number, s: any) => {
      return sum + (s.charge || 0);
    }, 0);

    if (totalServiceCharge === 0 || totalAmount === 0) return 0;

    let totalShare = 0;

    for (const service of data.service) {
      const matchedRule = this.allRules.find(
        (rule) =>
          rule.serviceName === service._id ||
          rule.serviceName?._id === service._id
      );

      if (matchedRule) {
        const referralPercent = matchedRule.referralPercent || 0;
        const proportionalAmount =
          ((service.charge || 0) / totalServiceCharge) * totalAmount;
        totalShare += (proportionalAmount * referralPercent) / 100;
      }
    }

    const share = Math.round(totalShare);

    if (!data._id) return 0;

    // Update data even if share is 0
    data.referralCalculated = true;
    data.referralCalculationDate = this.todayDate;
    data.calculatedShare = share;

    // Save in DB
    this.doctor.updateReferralData(data._id, data).subscribe((res) => {
      console.log('Updated referral data with calculated share', res);
    });

    return share;
  }

  approvePayout(data: any) {
    data.payoutApproved = true;
    data.payoutApprovalDate = this.todayDate;
    this.doctor.updateReferralData(data._id, data).subscribe((res) => {
      console.log('Updated payout approval', res);
    });
  }

  doctorFilter() {
    const search = this.searchText?.toLowerCase() || '';

    const filtered = this.allData.filter((data: any) => {
      const doctorName = data.referredBy?.name?.toLowerCase() || '';
      // console.log('Doctor:', doctorName, '| CreatedAt:', createdAt);

      const nameMatch = !search || doctorName.includes(search);

      return nameMatch;
    });

    //  console.log('Filtered Count:', filtered);
    this.filteredData = filtered;
  }
}
