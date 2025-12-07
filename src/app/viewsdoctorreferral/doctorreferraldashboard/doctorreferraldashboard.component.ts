import { Component } from '@angular/core';
import { MasterService } from '../../views/mastermodule/masterservice/master.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DoctorreferralService } from '../doctorreferral.service';
import { FormsModule } from '@angular/forms';
import Chart, { ChartDataset } from 'chart.js/auto';
import { GenericHelperPipe } from '../../pipe/doctorreferralpipes/generic-helper.pipe';

@Component({
  selector: 'app-doctorreferraldashboard',
  imports: [CommonModule, RouterModule, FormsModule, GenericHelperPipe],
  templateUrl: './doctorreferraldashboard.component.html',
  styleUrl: './doctorreferraldashboard.component.css',
})
export class DoctorreferraldashboardComponent {
  allRules: any[] = [];
  recordsPerPage: number = 10;
  currentPage: number = 1;
  // totalPages: number = 0;
  allData: any[] = [];
  searchText: string = '';
  filteredData: any[] = [];
  paginatedData: any[] = [];
  filteredRules: any[] = [];

  startDate: string = '';
  endDate: string = '';
  selectedSpecialty: string = '';
  selectedDepartment: string = '';
  selectedStatus: string = '';
  todayDate: string = '';
  audits: any[] = [];

  groupBy: string = 'today';
  originalData: any[] = []; // Full data
  pendingPayouts: any[] = [];

  topServices = [
    { name: 'Blood Test', referrals: 120 },
    { name: 'CT Scan', referrals: 95 },
    { name: 'Urine Test', referrals: 80 },
    { name: 'Liver Panel', referrals: 60 },
    { name: 'ECG', referrals: 50 },
  ];

  constructor(
    private masterService: MasterService,
    private doctor: DoctorreferralService
  ) {}

  // referral-list.component.ts
  itemsPerPage: number = 1;

  async ngOnInit() {
    try {
      await this.loadRules();
      this.loadData();
      this.getAudits();
    } catch (err) {
      console.error('Error during init:', err);
    }

    let today = new Date();
    let todayStr = today.toISOString().split('T')[0];
    this.todayDate = todayStr;
    this.startDate = todayStr;
    this.endDate = todayStr;
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

  loadData() {
    this.doctor.getReferralData().subscribe((res) => {
      this.allData = res.rules || res.data || [];
      this.filteredData = this.allData;
      this.pendingPayouts = this.filteredData.filter(
        (p: any) => p.payoutApproved === false || p.payoutApproved === 'false'
      );

      console.log('Filtered data', this.filteredData);
      // console.log("pending payouts",this.pendingPayouts);

      // console.log(this.allData);
      this.itemsPerPage = 1;
      this.updatePagination(this.itemsPerPage);

      this.renderTopServicesChart();
      this.renderTopDoctorsChart();
    });
  }

  updatePagination(page: any) {
    const startIndex = (this.currentPage - 1) * page;
    this.paginatedData = this.filteredData.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  get totalPages() {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= 5) {
      this.currentPage = page;
      this.updatePagination(this.itemsPerPage); // ✅ Recalculate paginated data
    }
  }

  // getServiceNames(services: any[]): string {
  //   return services?.map((s) => s.name).join(', ');
  // }

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

  // calculateTotalCost(): number {
  //   return this.allData.reduce((total: number, item: any) => {
  //     return total + (item.billingAmount || 0);
  //   }, 0);
  // }

  // calculatePayout(): number {
  //   return this.allData
  //     .filter((item) => item.payoutApproved === false)
  //     .reduce((sum, item) => sum + (item.calculatedShare || 0), 0);
  // }

  applyFilters() {
    // console.log(
    //   'Search:',
    //   this.searchText,
    //   'Start:',
    //   this.startDate,
    //   'End:',
    //   this.endDate
    // );
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    const filtered = this.allData.filter((data: any) => {
      const createdAt = new Date(data.createdAt);
      const dateMatch =
        (!start || createdAt >= start) && (!end || createdAt <= end);

      return dateMatch;
    });

    console.log('Filtered Count:', filtered);
    this.filteredData = filtered;
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

  getAudits() {
    this.doctor.getAudits().subscribe((res) => {
      this.audits = res.audits || res.data;
      console.log(this.audits);
    });
  }

  chartType: 'bar' | 'donut' = 'bar';
  topServicesChart: any;
  topDoctorsChart: any;

  onChartTypeChange(type: 'bar' | 'donut') {
    this.chartType = type;
    this.renderTopServicesChart();
  }

  renderTopServicesChart(): void {
    const isBar = this.chartType === 'bar';

    if (this.topServicesChart) {
      this.topServicesChart.destroy();
    }

    if (isBar) {
      // STACKED BAR CHART LOGIC (by date)
      const dateServiceMap: {
        [date: string]: { [serviceName: string]: number };
      } = {};

      const dataSource = this.filteredData;

      for (const record of dataSource) {
        const date = record?.createdAt
          ? new Date(record.createdAt).toLocaleDateString('en-CA')
          : null;

        if (!date) continue;

        for (const svc of record.service || []) {
          const serviceName = svc?.name;
          if (serviceName) {
            if (!dateServiceMap[date]) dateServiceMap[date] = {};
            dateServiceMap[date][serviceName] =
              (dateServiceMap[date][serviceName] || 0) + 1;
          }
        }
      }

      const dates = Object.keys(dateServiceMap).sort();

      //==> collect all unique service names from the actual data
      const uniqueServices = new Set<string>();
      for (const serviceCountMap of Object.values(dateServiceMap)) {
        Object.keys(serviceCountMap).forEach((svc) => uniqueServices.add(svc));
      }

      const serviceList = Array.from(uniqueServices);

      const colors = [
        '#4e79a7',
        '#f28e2c',
        '#e15759',
        '#76b7b2',
        '#59a14f',
        '#edc949',
        '#af7aa1',
        '#ff9da7',
        '#9c755f',
        '#bab0ab',
      ];

      const datasets = serviceList.map((serviceName, i) => ({
        label: serviceName,
        data: dates.map((date) =>
          dateServiceMap[date]?.[serviceName] !== undefined
            ? dateServiceMap[date][serviceName]
            : null
        ),
        backgroundColor: colors[i % colors.length],
        stack: 'stack1',
      }));

      this.topServicesChart = new Chart('dynamicTopServicesChart', {
        type: 'bar',
        data: {
          labels: dates,
          datasets: datasets,
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Top Services by Date',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: '#343a40',
              titleColor: '#fff',
              bodyColor: '#fff',
            },
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                color: '#495057',
              },
            },
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
          },
          scales: {
            x: {
              stacked: true,
              ticks: {
                color: '#495057',
                font: { weight: 'bold' },
              },
            },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: {
                color: '#495057',
                font: { weight: 'bold' },
              },
              title: {
                display: true,
                text: 'Service Count',
              },
            },
          },
        },
      });
    } else {
      // DOUGHNUT CHART LOGIC (Top N overall)
      const serviceMap: { [name: string]: number } = {};

      for (const record of this.allData) {
        for (const svc of record.service || []) {
          if (svc?.name) {
            serviceMap[svc.name] = (serviceMap[svc.name] || 0) + 1;
          }
        }
      }

      const sorted = Object.entries(serviceMap).sort((a, b) => b[1] - a[1]);

      const labels = sorted.map(([name]) => name);
      const data = sorted.map(([, count]) => count);
      const colors = [
        '#4e79a7',
        '#f28e2c',
        '#e15759',
        '#76b7b2',
        '#59a14f',
        '#edc949',
        '#af7aa1',
        '#ff9da7',
        '#9c755f',
        '#bab0ab',
      ];

      this.topServicesChart = new Chart('dynamicTopServicesChart', {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: colors.slice(0, labels.length),
              label: 'Referrals',
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                color: '#495057',
              },
            },
            tooltip: {
              backgroundColor: '#343a40',
              titleColor: '#fff',
              bodyColor: '#fff',
            },
          },
        },
      });
    }
  }

  renderTopDoctorsChart() {
    const dateDoctorMap: { [date: string]: { [doctor: string]: number } } = {};

    // for (const record of this.allData) {
    for (const record of this.filteredData) {
      const doctorName = record?.referredTo?.name;
      const date = record?.createdAt
        ? new Date(record.createdAt).toISOString().slice(0, 10)
        : null;

      if (doctorName && date && Array.isArray(record.service)) {
        if (!dateDoctorMap[date]) dateDoctorMap[date] = {};
        dateDoctorMap[date][doctorName] =
          (dateDoctorMap[date][doctorName] || 0) + record.service.length;
      }
    }

    const dates = Object.keys(dateDoctorMap).sort();
    const doctorNamesSet = new Set<string>();

    // Collect all doctors
    dates.forEach((date) => {
      Object.keys(dateDoctorMap[date]).forEach((doc) =>
        doctorNamesSet.add(doc)
      );
    });

    const doctorNames = Array.from(doctorNamesSet);

    // Build dataset for each doctor across all dates
    const datasets = doctorNames.map((doctor, i) => ({
      label: doctor,
      data: dates.map((date) => dateDoctorMap[date][doctor] || 0),
      backgroundColor: ['#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'][i % 4],
      stack: 'stack1',
    }));

    // Destroy old chart if exists
    if (this.topDoctorsChart) this.topDoctorsChart.destroy();

    // Render stacked bar chart
    this.topDoctorsChart = new Chart('topDoctorsBarChart', {
      type: 'bar',
      data: {
        labels: dates,
        datasets: datasets,
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Top Referred Doctors by Date',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: 'Total Services Referred',
            },
          },
        },
      },
    });
  }

  applyChartFilters() {
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    // Filtered data
    this.filteredData = this.allData.filter((record: any) => {
      const createdAt = new Date(record.createdAt);
      if (start && createdAt < start) return false;
      if (end && createdAt > end) return false;
      return true;
    });

    this.renderTopServicesChart(); // pass filtered data inside
    this.renderTopDoctorsChart(); // if needed
  }

  // setGroup(group: string): void {
  //   this.groupBy = group;
  //   this.applyGroupFilter();
  // }

  applyGroupFilter(group: string): void {
    this.groupBy = group;
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filteredData = this.allData.filter((item) => {
      const date = new Date(item.createdAt || item.date);
      // console.log('Checking item:', item._id, 'Date:', date.toDateString());

      switch (this.groupBy) {
        case 'today':
          return date.toDateString() === today.toDateString();

        case 'week':
          return date >= startOfWeek;

        case 'month':
          return date >= startOfMonth;

        default:
          return true;
      }
    });

    this.renderTopServicesChart(); 
    this.renderTopDoctorsChart();
  }

  async downloadChartAsImage() {
    const chartEl = document.getElementById(
      'dynamicTopServicesChart'
    ) as HTMLCanvasElement;
    if (!chartEl) return;

    const link = document.createElement('a');
    link.download = 'top-services-chart.png';
    link.href = chartEl.toDataURL('image/png');
    link.click();
  }

  async downloadChartAsPDF() {
    const chartEl = document.getElementById(
      'dynamicTopServicesChart'
    ) as HTMLCanvasElement;
    if (!chartEl) return;

    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;

    const pdf = new jsPDF();
    const imgData = chartEl.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 10, 180, 100);
    pdf.save('top-services-chart.pdf');
  }
}
