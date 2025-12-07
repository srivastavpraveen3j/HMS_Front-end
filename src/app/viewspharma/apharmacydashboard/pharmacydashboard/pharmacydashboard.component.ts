import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PharmaService } from '../../pharma.service';
import { UhidService } from '../../../views/uhid/service/uhid.service';
import { OpdService } from '../../../views/opdmodule/opdservice/opd.service';
import { MasterService } from '../../../views/mastermodule/masterservice/master.service';
import { Chart } from 'chart.js';
import { AfterViewInit } from '@angular/core';
import { IndianCurrencyPipe } from '../../../pipe/indian-currency.pipe';

@Component({
  selector: 'app-pharmacydashboard',
  imports: [CommonModule, RouterModule, IndianCurrencyPipe],
  templateUrl: './pharmacydashboard.component.html',
  styleUrl: './pharmacydashboard.component.css',
})
export class PharmacydashboardComponent implements AfterViewInit {
  recordsPerPage: number = 4;
  currentPage: number = 1;
  totalPages: number = 0;

  pharma: any[] = [];
  walkpharma: any[] = [];
  ipdpharma: any[] = [];

  selectedDept: string = 'outpatientDepartment';
  selectedPatient: any = null;
  uhiddata: any[] = [];
  uhidLoaded = false;
  pharmaLoaded = false;
  activeFilter = 'today'; // 'today' | 'dateRange' | 'all'
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];
  filteredwalkCases: any[] = [];
  filteredipdCases: any[] = [];
  userPermissions: any = {};
  pharmapermission: any = {};
  ipdpharmapermission: any = {};
  dataLoaded = {
    OPD: false,
    IPD: false,
    WalkIn: false,
  };

  // Refund related properties
  refundRecords: any[] = [];
  totalRefundRecords: number = 0;
  totalRefundAmount: number = 0;
  refundDataLoaded: boolean = false;

  // Chart instances
  netIncomeChartInstance: any;
  refundAnalysisChartInstance: any;
  incomeRefundTrendChartInstance: any;
  returnReasonsChartInstance: any;
  incomeChartInstance: any;
  medicineChart: Chart | null = null;

  // Full filtered lists for calculations
  filteredOPDFullList: any[] = [];
  filteredIPDFullList: any[] = [];
  filteredWalkFullList: any[] = [];

  // Counters
  totalFilteredOPDCases: number = 0;
  totalFilteredIPDCases: number = 0;
  totalFilteredWalkCases: number = 0;

  // Medicine related
  topMedicinesByDept: any = {
    OPD: [],
    IPD: [],
    WalkIn: [],
  };

  // Low stock and expired medicines
  lowStockMedicinesFullList: any[] = [];
  lowStockMedicines: any[] = [];
  countexpired: string = '';
  expireproducts: any[] = [];

  constructor(
    private pharmaservice: PharmaService,
    private uhidservice: UhidService,
    private opdservice: OpdService,
    private masterService: MasterService
  ) {}

  ngOnInit(): void {
    this.topMedicinesByDept = {
      OPD: [],
      IPD: [],
      WalkIn: [],
    };

    this.fetchLowStockMedicines();
    this.setupPermissions();
    this.setDefaultDates();
    this.loadAllData();
  }

  setupPermissions(): void {
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');

    const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'pharmaceuticalInward');
    const pharmamodule = allPermissions.find((perm: any) => perm.moduleName === 'pharmaceuticalRequestList');
    const ipdpharmamodule = allPermissions.find((perm: any) => perm.moduleName === 'ipdpharmaceuticalRequestList');

    this.userPermissions = uhidModule?.permissions || {};
    this.pharmapermission = pharmamodule?.permissions?.read === 1 || pharmamodule?.permissions?.create === 1;
    this.ipdpharmapermission = ipdpharmamodule?.permissions?.read === 1 || ipdpharmamodule?.permissions?.create === 1;
  }

  setDefaultDates(): void {
    const today = new Date().toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;
  }

  loadAllData(): void {
    // Load OPD data
    this.loadOPDData();
    // Load Walk-in data
    this.loadWalkInData();
    // Load IPD data
    this.loadIPDData();
    // Load refund data
    this.loadRefundData();
    // Load expired medicines
    this.expiredmedicine();
  }

  loadOPDData(): void {
    this.pharmaservice.getPharmareqall().subscribe({
      next: (res) => {
        if (Array.isArray(res.data)) {
          this.pharma = res.data.filter(
            (item: any) => item.type === 'outpatientDepartment' && item.isWalkIn === false
          );
          this.enrichAllPharmaWithUHID();
        } else {
          console.warn('Unexpected response format for OPD data');
        }
      },
      error: (err) => {
        console.log('OPD Pharma Error:', err);
        this.dataLoaded.OPD = true;
        this.checkAndRenderAllCharts();
      },
    });
  }

  loadWalkInData(): void {
    this.pharmaservice.getPharmareqall().subscribe({
      next: (res) => {
        if (Array.isArray(res.data)) {
          this.walkpharma = res.data.filter(
            (item: any) => item.type === 'outpatientDepartment' && item.isWalkIn === true
          );
          this.applywalkFilters();
        } else {
          console.warn('Unexpected response format for Walk-in data');
        }
      },
      error: (err) => {
        console.log('Walk-in Pharma Error:', err);
        this.dataLoaded.WalkIn = true;
        this.checkAndRenderAllCharts();
      },
    });
  }

  loadIPDData(): void {
    this.pharmaservice.getPharmareqall().subscribe({
      next: (res) => {
        if (Array.isArray(res.data)) {
          this.ipdpharma = res.data.filter((item: any) => item.type === 'inpatientDepartment');
          this.enrichIPDPharmaWithUHID();
        } else {
          console.warn('Unexpected response format for IPD data');
        }
      },
      error: (err) => {
        console.log('IPD Pharma Error:', err);
        this.dataLoaded.IPD = true;
        this.checkAndRenderAllCharts();
      },
    });
  }

  loadRefundData(): void {
    this.pharmaservice.getAllReturnRecords().subscribe({
      next: (response) => {
        const records = response?.data || response || [];

        // Filter only return records for today
        const today = new Date().toISOString().split('T')[0];
        this.refundRecords = records.filter((record: any) => {
          if (!record.returnDetails || !record.returnDetails.isReturn) return false;

          const recordDate = new Date(record.createdAt).toISOString().split('T')[0];
          return recordDate === today;
        });

        this.calculateRefundStats();
        this.refundDataLoaded = true;
        console.log('Refund data loaded:', this.refundRecords.length, 'records');
        this.checkAndRenderAllCharts();
      },
      error: (err) => {
        console.error('Error loading refund data:', err);
        this.refundDataLoaded = true; // Continue even if refund data fails
        this.checkAndRenderAllCharts();
      }
    });
  }

  calculateRefundStats(): void {
    this.totalRefundRecords = this.refundRecords.length;
    this.totalRefundAmount = this.refundRecords.reduce((sum, record) => {
      return sum + this.getCalculatedRefundAmount(record);
    }, 0);
  }

  getCalculatedRefundAmount(record: any): number {
    if (!record.returnDetails || !record.returnDetails.returnedPackages) return 0;

    return record.returnDetails.returnedPackages.reduce((total: number, pkg: any) => {
      return total + (pkg.refundAmount || 0);
    }, 0);
  }

  enrichIPDPharmaWithUHID() {
    if (!this.ipdpharma || !Array.isArray(this.ipdpharma)) {
      this.dataLoaded.IPD = true;
      this.checkAndRenderAllCharts();
      return;
    }

    const enrichedRecords: any[] = [];
    let completed = 0;

    if (this.ipdpharma.length === 0) {
      this.dataLoaded.IPD = true;
      this.checkAndRenderAllCharts();
      return;
    }

    for (const pharma of this.ipdpharma) {
      const uhidId = pharma.uniqueHealthIdentificationId;

      if (!uhidId || typeof uhidId !== 'string' || uhidId.trim() === '') {
        enrichedRecords.push({
          ...pharma,
          patient_name: '[UNKNOWN]',
          age: '-',
          gender: '-',
          uhid: '-',
        });
        completed++;

        if (completed === this.ipdpharma.length) {
          this.finalizeIPDData(enrichedRecords);
        }
        continue;
      }

      this.uhidservice.getUhidById(uhidId).subscribe({
        next: (res) => {
          const patient = res?.[0] || res;
          enrichedRecords.push({
            ...pharma,
            patient_name: patient?.patient_name || '[UNKNOWN]',
            age: patient?.age || '-',
            gender: patient?.gender || '-',
            uhid: patient?.uhid || '-',
          });

          completed++;
          if (completed === this.ipdpharma.length) {
            this.finalizeIPDData(enrichedRecords);
          }
        },
        error: (err) => {
          console.error('UHID Fetch Error for ID:', uhidId, err);
          enrichedRecords.push({
            ...pharma,
            patient_name: '[ERROR]',
            age: '-',
            gender: '-',
            uhid: '-',
          });

          completed++;
          if (completed === this.ipdpharma.length) {
            this.finalizeIPDData(enrichedRecords);
          }
        },
      });
    }
  }

  finalizeIPDData(enrichedRecords: any[]): void {
    this.ipdpharma = [...enrichedRecords];
    this.applyIPDFilters();
    this.dataLoaded.IPD = true;
    this.checkAndRenderAllCharts();
  }

  applyIPDFilters() {
    let baseList = this.ipdpharma || [];

    if (this.activeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      baseList = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        patientDate.setHours(0, 0, 0, 0);
        return patientDate.getTime() === today.getTime();
      });
    } else if (this.activeFilter === 'dateRange') {
      if (!this.startDate || !this.endDate) {
        this.filteredipdCases = [];
        this.totalFilteredIPDCases = 0;
        this.filteredIPDFullList = [];
        return;
      }

      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);

      baseList = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= start && patientDate <= end;
      });
    }

    this.filteredIPDFullList = baseList;
    this.totalFilteredIPDCases = baseList.length;

    const displayLimit = 4;
    this.filteredipdCases = baseList.slice(0, displayLimit);
  }

  enrichAllPharmaWithUHID() {
    if (!this.pharma || !Array.isArray(this.pharma)) {
      this.dataLoaded.OPD = true;
      this.checkAndRenderAllCharts();
      return;
    }

    const enrichedRecords: any[] = [];
    let completed = 0;

    if (this.pharma.length === 0) {
      this.dataLoaded.OPD = true;
      this.checkAndRenderAllCharts();
      return;
    }

    for (const pharma of this.pharma) {
      const uhidId = pharma.uniqueHealthIdentificationId;

      if (!uhidId || typeof uhidId !== 'string' || uhidId.trim() === '') {
        enrichedRecords.push({
          ...pharma,
          patient_name: '[UNKNOWN]',
          age: '-',
          gender: '-',
          uhid: '-',
        });
        completed++;

        if (completed === this.pharma.length) {
          this.finalizeOPDData(enrichedRecords);
        }
        continue;
      }

      this.uhidservice.getUhidById(uhidId).subscribe({
        next: (res) => {
          const patient = res?.[0] || res;
          enrichedRecords.push({
            ...pharma,
            patient_name: patient?.patient_name || '[UNKNOWN]',
            age: patient?.age || '-',
            gender: patient?.gender || '-',
            uhid: patient?.uhid || '-',
          });

          completed++;
          if (completed === this.pharma.length) {
            this.finalizeOPDData(enrichedRecords);
          }
        },
        error: (err) => {
          console.error('UHID Fetch Error for ID:', uhidId, err);
          enrichedRecords.push({
            ...pharma,
            patient_name: '[ERROR]',
            age: '-',
            gender: '-',
            uhid: '-',
          });

          completed++;
          if (completed === this.pharma.length) {
            this.finalizeOPDData(enrichedRecords);
          }
        },
      });
    }
  }

  finalizeOPDData(enrichedRecords: any[]): void {
    this.pharma = [...enrichedRecords];
    this.applyFilters();
    this.dataLoaded.OPD = true;
    this.checkAndRenderAllCharts();
  }

  applyFilters() {
    let baseList = this.pharma || [];
    let fullFiltered: any[] = [];

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      fullFiltered = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt).toISOString().split('T')[0];
        return patientDate === today;
      });
    } else if (this.activeFilter === 'dateRange') {
      if (!this.startDate || !this.endDate) {
        this.filteredCases = [];
        this.totalFilteredOPDCases = 0;
        this.filteredOPDFullList = [];
        return;
      }

      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);

      fullFiltered = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= start && patientDate <= end;
      });
    } else {
      fullFiltered = baseList;
    }

    this.totalFilteredOPDCases = fullFiltered.length;
    this.filteredOPDFullList = fullFiltered;

    const displayLimit = 4;
    this.filteredCases = fullFiltered.slice(0, displayLimit);
  }

  applywalkFilters() {
    let baseList = this.walkpharma || [];
    let fullFiltered: any[] = [];

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      fullFiltered = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt).toISOString().split('T')[0];
        return patientDate === today;
      });
    } else if (this.activeFilter === 'dateRange') {
      if (!this.startDate || !this.endDate) {
        this.filteredwalkCases = [];
        this.filteredWalkFullList = [];
        this.totalFilteredWalkCases = 0;
        this.dataLoaded.WalkIn = true;
        this.checkAndRenderAllCharts();
        return;
      }

      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);

      fullFiltered = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= start && patientDate <= end;
      });
    } else {
      fullFiltered = baseList;
    }

    this.filteredWalkFullList = fullFiltered;
    this.totalFilteredWalkCases = fullFiltered.length;

    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    this.filteredwalkCases = fullFiltered.slice(startIndex, endIndex);

    this.totalPages = Math.ceil(fullFiltered.length / this.recordsPerPage);
    this.dataLoaded.WalkIn = true;
    this.checkAndRenderAllCharts();
  }

  checkAndRenderAllCharts(): void {
    console.log('Checking chart render conditions:', {
      OPD: this.dataLoaded.OPD,
      IPD: this.dataLoaded.IPD,
      WalkIn: this.dataLoaded.WalkIn,
      refundDataLoaded: this.refundDataLoaded
    });

    if (this.dataLoaded.OPD && this.dataLoaded.IPD && this.dataLoaded.WalkIn && this.refundDataLoaded) {
      console.log('All data loaded, rendering charts...');
      this.tryRenderChart();
      this.renderRefundCharts();
    }
  }

  // Updated tryRenderChart method with proper refund integration
  tryRenderChart() {
    if (!this.dataLoaded.OPD || !this.dataLoaded.IPD || !this.dataLoaded.WalkIn || !this.refundDataLoaded) {
      console.log('Not all data loaded yet, skipping chart render');
      return;
    }

    console.log('Rendering charts with all data loaded...');

    this.computeTopMedicinesToday();
    this.renderMedicineChart();

    // Calculate gross income
    const totalOPDIncome = this.filteredOPDFullList.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalIPDIncome = this.filteredIPDFullList.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalWalkInIncome = this.filteredWalkFullList.reduce((sum, item) => sum + (item.total || 0), 0);

    console.log('Income calculations:', {
      OPD: totalOPDIncome,
      IPD: totalIPDIncome,
      WalkIn: totalWalkInIncome,
      refundRecords: this.refundRecords.length
    });

    // Calculate refunds by department
    const opdRefunds = this.calculateRefundsByDepartment('outpatientDepartment', false);
    const ipdRefunds = this.calculateRefundsByDepartment('inpatientDepartment');
    const walkInRefunds = this.calculateRefundsByDepartment('outpatientDepartment', true);

    console.log('Refund calculations:', {
      OPD: opdRefunds,
      IPD: ipdRefunds,
      WalkIn: walkInRefunds
    });

    // Render both gross income chart and NET income chart
    this.renderIncomePieChart([
      ...(this.pharmapermission ? [{ name: 'OPD', value: totalOPDIncome }] : []),
      ...(this.ipdpharmapermission ? [{ name: 'IPD', value: totalIPDIncome }] : []),
      { name: 'Walk-In', value: totalWalkInIncome },
    ]);

    // Render NET income chart (gross - refunds)
    this.renderNetIncomePieChart([
      ...(this.pharmapermission ? [{
        name: 'OPD',
        grossValue: totalOPDIncome,
        refundValue: opdRefunds,
        netValue: totalOPDIncome - opdRefunds
      }] : []),
      ...(this.ipdpharmapermission ? [{
        name: 'IPD',
        grossValue: totalIPDIncome,
        refundValue: ipdRefunds,
        netValue: totalIPDIncome - ipdRefunds
      }] : []),
      {
        name: 'Walk-In',
        grossValue: totalWalkInIncome,
        refundValue: walkInRefunds,
        netValue: totalWalkInIncome - walkInRefunds
      }
    ]);
  }

  calculateRefundsByDepartment(type: string, isWalkIn?: boolean): number {
    return this.refundRecords
      .filter(record => {
        if (record.type !== type) return false;
        if (isWalkIn !== undefined) {
          return record.isWalkIn === isWalkIn;
        }
        return true;
      })
      .reduce((sum, record) => sum + this.getCalculatedRefundAmount(record), 0);
  }

  computeTopMedicinesToday() {
    const todayStr = new Date().toISOString().split('T')[0];

    const collectTop = (source: any[], label: string) => {
      const countMap: { [key: string]: number } = {};

      source.forEach((entry) => {
        const createdAt = entry?.createdAt || entry?.created_at;
        const dateStr = new Date(createdAt).toISOString().split('T')[0];
        if (dateStr !== todayStr) return;

        (entry.packages || []).forEach((pkg: any) => {
          const rawName = pkg.medicineName || pkg.name || '[Unnamed]';
          const name = String(rawName).trim() || '[Unnamed]';
          const quantity = Number(pkg.quantity) || 0;

          if (name !== '[Unnamed]' && quantity > 0) {
            countMap[name] = (countMap[name] || 0) + quantity;
          }
        });
      });

      const sorted = Object.entries(countMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      this.topMedicinesByDept[label] = sorted;
    };

    collectTop(this.pharma, 'OPD');
    collectTop(this.ipdpharma, 'IPD');
    collectTop(this.walkpharma, 'WalkIn');
  }

  renderMedicineChart() {
    const labels = [
      ...(this.pharmapermission ? ['OPD'] : []),
      'WalkIn',
      ...(this.ipdpharmapermission ? ['IPD'] : []),
    ];

    const allMedicines = new Set<string>();
    ['OPD', 'IPD', 'WalkIn'].forEach(dept => {
      (this.topMedicinesByDept[dept] || []).forEach((entry: any) => {
        allMedicines.add(entry.name);
      });
    });

    const medicineArray = Array.from(allMedicines);
    const medicineTotalMap = medicineArray.map(name => {
      const total =
        (this.topMedicinesByDept['OPD'].find((m: any) => m.name === name)?.count || 0) +
        (this.topMedicinesByDept['IPD'].find((m: any) => m.name === name)?.count || 0) +
        (this.topMedicinesByDept['WalkIn'].find((m: any) => m.name === name)?.count || 0);
      return { name, total };
    });

    const top10 = medicineTotalMap
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map(item => item.name);

    const colors = [
      '#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0',
      '#00BCD4', '#8BC34A', '#FF9800', '#E91E63', '#795548'
    ];

    const datasets = top10.map((medicineName, index) => ({
      label: medicineName,
      data: labels.map(dept => {
        const entry = this.topMedicinesByDept[dept].find((m: any) => m.name === medicineName);
        return entry?.count || 0;
      }),
      backgroundColor: colors[index % colors.length],
    }));

    const ctx = document.getElementById('topMedicinesChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.medicineChart) {
      this.medicineChart.destroy();
    }

    this.medicineChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Top 10 Medicines Used Today by Department',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          x: { stacked: true },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: 'Units Dispensed',
            },
          },
        },
      },
    });
  }

  renderIncomePieChart(data: { name: string; value: number }[]): void {
    const canvas = document.getElementById('incomePieChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.incomeChartInstance) {
      this.incomeChartInstance.destroy();
    }

    const totalIncome = data.reduce((sum, d) => sum + d.value, 0);

    const centerTextPlugin = {
      id: 'centerTextPlugin',
      afterDraw: (chart: any) => {
        const { width, height, ctx } = chart;
        ctx.restore();

        const valueStr = `₹${totalIncome.toLocaleString('en-IN')}`;
        const baseFontSize = height / 150;
        const adjustedFontSize = Math.max(baseFontSize - (valueStr.length - 6) * 0.2, 1.5);

        ctx.font = `${adjustedFontSize}em sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333';
        // ctx.fillText('Gross Income', width / 2, (height / 2) - 10);
        ctx.fillText(valueStr, width / 2, (height / 2) + 10);
        ctx.save();
      },
    };

    this.incomeChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map((d) => d.name),
        datasets: [
          {
            label: 'Income by Department',
            data: data.map((d) => d.value),
            backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: totalIncome >= 1000000 ? '50%' : '60%',
        plugins: {
          title: {
            display: true,
            text: 'Today Total Pharmacy Gross Income',
          },
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 20,
              padding: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                return `${context.label}: ₹${value.toLocaleString('en-IN')}`;
              },
            },
          },
        },
      },
      plugins: [centerTextPlugin],
    });
  }

  renderNetIncomePieChart(data: any[]): void {
    const canvas = document.getElementById('netIncomePieChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.netIncomeChartInstance) {
      this.netIncomeChartInstance.destroy();
    }

    const totalNetIncome = data.reduce((sum, d) => sum + d.netValue, 0);

    const centerTextPlugin = {
      id: 'centerTextPlugin',
      afterDraw: (chart: any) => {
        const { width, height, ctx } = chart;
        ctx.restore();

        const valueStr = `₹${totalNetIncome.toLocaleString('en-IN')}`;
        const baseFontSize = height / 150;
        const adjustedFontSize = Math.max(baseFontSize - (valueStr.length - 6) * 0.2, 1.5);

        ctx.font = `${adjustedFontSize}em sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333';
        // ctx.fillText('Net Income', width / 2, (height / 2) - 10);
        ctx.fillText(valueStr, width / 2, (height / 2) + 10);
        ctx.save();
      },
    };

    this.netIncomeChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map((d) => d.name),
        datasets: [
          {
            label: 'Net Income by Department',
            data: data.map((d) => Math.max(0, d.netValue)),
            backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          title: {
            display: true,
            text: 'Today Net Pharmacy Income (Gross - Refunds)',
          },
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 20,
              padding: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const index = context.dataIndex;
                const dept = data[index];
                return [
                  `${context.label}: ₹${dept.netValue.toLocaleString('en-IN')}`,
                  `Gross: ₹${dept.grossValue.toLocaleString('en-IN')}`,
                  `Refunds: ₹${dept.refundValue.toLocaleString('en-IN')}`
                ];
              },
            },
          },
        },
      },
      plugins: [centerTextPlugin],
    });
  }

  renderRefundCharts(): void {
    this.renderRefundAnalysisChart();
    this.renderIncomeRefundTrendChart();
    this.renderReturnReasonsChart();
  }

  renderRefundAnalysisChart(): void {
    const canvas = document.getElementById('refundAnalysisChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.refundAnalysisChartInstance) {
      this.refundAnalysisChartInstance.destroy();
    }

    const refundData = [
      ...(this.pharmapermission ? [{
        name: 'OPD',
        amount: this.calculateRefundsByDepartment('outpatientDepartment', false),
        count: this.refundRecords.filter(r => r.type === 'outpatientDepartment' && !r.isWalkIn).length
      }] : []),
      ...(this.ipdpharmapermission ? [{
        name: 'IPD',
        amount: this.calculateRefundsByDepartment('inpatientDepartment'),
        count: this.refundRecords.filter(r => r.type === 'inpatientDepartment').length
      }] : []),
      {
        name: 'Walk-In',
        amount: this.calculateRefundsByDepartment('outpatientDepartment', true),
        count: this.refundRecords.filter(r => r.type === 'outpatientDepartment' && r.isWalkIn).length
      }
    ];

    this.refundAnalysisChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: refundData.map(d => d.name),
        datasets: [
          {
            label: 'Refund Amount (₹)',
            data: refundData.map(d => d.amount),
            backgroundColor: '#FF6B6B',
            borderColor: '#FF5252',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Return Count',
            data: refundData.map(d => d.count),
            backgroundColor: '#4ECDC4',
            borderColor: '#26A69A',
            borderWidth: 1,
            yAxisID: 'y1'
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Today Refund Analysis by Department',
          },
          legend: {
            position: 'top',
          },
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Refund Amount (₹)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Return Count'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      },
    });
  }

  renderIncomeRefundTrendChart(): void {
    const canvas = document.getElementById('incomeRefundTrendChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.incomeRefundTrendChartInstance) {
      this.incomeRefundTrendChartInstance.destroy();
    }

    const last7Days = this.getLast7DaysData();

    this.incomeRefundTrendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: last7Days.map(d => d.date),
        datasets: [
          {
            label: 'Gross Income',
            data: last7Days.map(d => d.income),
            borderColor: '#36A2EB',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Refunds',
            data: last7Days.map(d => d.refunds),
            borderColor: '#FF6384',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Net Income',
            data: last7Days.map(d => d.income - d.refunds),
            borderColor: '#4BC0C0',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            tension: 0.4,
            fill: true
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Income vs Refunds Trend (Last 7 Days)',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount (₹)'
            }
          }
        }
      },
    });
  }

  renderReturnReasonsChart(): void {
    const canvas = document.getElementById('returnReasonsChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.returnReasonsChartInstance) {
      this.returnReasonsChartInstance.destroy();
    }

    const reasonCounts: { [key: string]: number } = {};
    const reasonLabels: { [key: string]: string } = {
      'expired': 'Medicine Expired',
      'wrong_medicine': 'Wrong Medicine',
      'patient_discharged': 'Patient Discharged',
      'doctor_changed': 'Prescription Changed',
      'excess_quantity': 'Excess Quantity',
      'other': 'Other Reasons'
    };

    this.refundRecords.forEach(record => {
      const reason = record.returnDetails?.returnReason || 'other';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    const data = Object.entries(reasonCounts).map(([key, count]) => ({
      label: reasonLabels[key] || key,
      count: count
    }));

    this.returnReasonsChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.label),
        datasets: [
          {
            data: data.map(d => d.count),
            backgroundColor: [
              '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
              '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Today Return Reasons Distribution',
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    });
  }

  getLast7DaysData(): any[] {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayIncome = this.calculateIncomeForDate(dateStr);
      const dayRefunds = this.calculateRefundsForDate(dateStr);

      data.push({
        date: displayDate,
        income: dayIncome,
        refunds: dayRefunds
      });
    }

    return data;
  }

  calculateIncomeForDate(dateStr: string): number {
    const allRecords = [...this.pharma, ...this.ipdpharma, ...this.walkpharma];
    return allRecords
      .filter(record => {
        const recordDate = new Date(record.createdAt).toISOString().split('T')[0];
        return recordDate === dateStr;
      })
      .reduce((sum, record) => sum + (record.total || 0), 0);
  }

  calculateRefundsForDate(dateStr: string): number {
    return this.refundRecords
      .filter(record => {
        const recordDate = new Date(record.createdAt).toISOString().split('T')[0];
        return recordDate === dateStr;
      })
      .reduce((sum, record) => sum + this.getCalculatedRefundAmount(record), 0);
  }

  fetchLowStockMedicines(): void {
    const pharmacyId = '68beb0b38066685ac24f8017';
    this.masterService.getSubPharmacyInventoryItems(pharmacyId, this.currentPage).subscribe({
      next: (res) => {
        const filtered = res.data.filter(
          (med: any) => med.current_stock < 10 && !this.isExpired(med)
        );
        this.lowStockMedicinesFullList = filtered;
      },
      error: (err) => {
        console.error('Error fetching medicines:', err);
      },
    });
  }

  isExpired(medicine: any): boolean {
    if (!medicine?.batch_details[0]?.expiry_date) return false;

    try {
      const expiryDate = new Date(medicine?.batch_details[0]?.expiry_date);
      const today = new Date();
      return expiryDate < today;
    } catch (error) {
      console.error('Error parsing date:', error);
      return false;
    }
  }

  isNearExpiry(medicine: any, daysThreshold: number = 30): boolean {
    if (!medicine?.batch_details[0]?.expiry_date) return false;

    try {
      const expiryDate = new Date(medicine.expiry_date);
      const today = new Date();
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      return daysDiff <= daysThreshold && daysDiff > 0;
    } catch (error) {
      return false;
    }
  }

  expiredmedicine() {
    const pharmacyId = '68beb0b38066685ac24f8017';
    this.masterService.getSubPharmacyExpiredStock(pharmacyId).subscribe({
      next: (res: any) => {
        this.countexpired = res.count;
        this.expiredmedicine = res.medicines;
      },
      error: (err) => {
        console.log('Expired medicine error:', err);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.computeTopMedicinesToday();
      this.renderMedicineChart();
      this.checkAndRenderAllCharts();
    }, 1000);
  }
}
