  import { CommonModule } from '@angular/common';
  import {
    ChangeDetectorRef,
    Component,
    ViewChild,
    ElementRef,
  } from '@angular/core';
  import { RouterModule } from '@angular/router';
  import { Chart } from 'chart.js';
  import { AfterViewInit } from '@angular/core';
  import { PharmaService } from '../pharma.service';
  import { UhidService } from '../../views/uhid/service/uhid.service';
  import { OpdService } from '../../views/opdmodule/opdservice/opd.service';
  import { MasterService } from '../../views/mastermodule/masterservice/master.service';
  import { FormsModule } from '@angular/forms';
  import { IndianCurrencyPipe } from '../../pipe/indian-currency.pipe';

  @Component({
    selector: 'app-pharmareportsmedicinestock',
    imports: [CommonModule, RouterModule, FormsModule, IndianCurrencyPipe],
    templateUrl: './pharmareportsmedicinestock.component.html',
    styleUrl: './pharmareportsmedicinestock.component.css',
  })
  export class PharmareportsmedicinestockComponent {
    subTitle: String = '';

    opdpharmaData: any[] = [];
    filteredData: any[] = [];
    selectedRange: 'today' | 'week' | 'month' | 'year' = 'today';
    activeFilter: 'today' | 'week' | 'month' | 'year' | 'dateRange' = 'today';
    currentDeptFilter: 'OPD' | 'IPD' | 'Walk-In' = 'OPD';
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
    // activeFilter = 'today'; // 'today' | 'dateRange' | 'all'
    chartOptions: any;
    chartType:
      | 'bar'
      | 'line'
      | 'pie'
      | 'radar'
      | 'bubble'
      | 'polarArea'
      | 'scatter'
      | 'doughnut' = 'bar';
    chartTitle: any;
    startDate: string = '';
    endDate: string = '';
    filteredCases: any[] = [];
    filteredwalkCases: any[] = [];
    filteredipdCases: any[] = [];
    userPermissions: any = {};
    dataLoaded = {
      OPD: false,
      IPD: false,
      WalkIn: false,
    };

    @ViewChild('pdfFullContent') pdfFullContent!: ElementRef;
    @ViewChild('chartCanvas') chartCanvas!: ElementRef;
    constructor(
      private pharmaservice: PharmaService,
      private uhidservice: UhidService,
      private opdservice: OpdService,
      private masterService: MasterService,
      private cdRef: ChangeDetectorRef
    ) {}

    checkAndRenderCharts() {
      if (this.dataLoaded.OPD && this.dataLoaded.IPD && this.dataLoaded.WalkIn) {
        this.tryRenderChart();
      }
    }
    pharmapermisssion: any = {};
    ngOnInit(): void {
      this.topMedicinesByDept = {
        OPD: [],
        IPD: [],
        WalkIn: [],
      };
      this.checkAndRenderCharts();
      this.fetchLowStockMedicines();

      // load permissions

      const allPermissions = JSON.parse(
        localStorage.getItem('permissions') || '[]'
      );
      const uhidModule = allPermissions.find(
        (perm: any) => perm.moduleName === 'pharmaceuticalInward'
      );
      const pharmaModule = allPermissions.find(
        (perm: any) => perm.moduleName === 'pharmaceuticalRequestList'
      );
      this.userPermissions = uhidModule?.permissions || {};
      this.pharmapermisssion = pharmaModule?.permissions?.read;

      // load permissions
      const today = new Date().toISOString().split('T')[0];
      this.startDate = today;
      this.endDate = today;

      // opd
      this.pharmaservice.getPharmareq().subscribe({
        next: (res) => {
          // console.log(res);
          if (Array.isArray(res)) {
            this.pharma = res.filter(
              (item: any) =>
                item.type === 'outpatientDepartment' && item.isWalkIn === false
            );
            this.enrichAllPharmaWithUHID(); // Enrich after filtering
          } else {
            console.warn('Unexpected response format for getPharmareq');
          }
        },
        error: (err) => console.log('Pharma Error:', err),
      });
      // walkin
      this.pharmaservice.getPharmareq().subscribe({
        next: (res) => {
          // console.log(res);
          if (Array.isArray(res)) {
            this.walkpharma = res.filter(
              (item: any) =>
                item.type === 'outpatientDepartment' && item.isWalkIn === true
            );
            this.applywalkFilters(); // Enrich after filtering
          } else {
            console.warn('Unexpected response format for getPharmareq');
          }
        },
        error: (err) => console.log('Pharma Error:', err),
      });
      // ipd

      this.pharmaservice.getPharmareq().subscribe({
        next: (res) => {
          // console.log(res);
          if (Array.isArray(res)) {
            this.ipdpharma = res.filter(
              (item: any) => item.type === 'inpatientDepartment'
            );
            // console.log(
            //   '🚀 ~ PharmacydashboardComponent ~ ngOnInit ~ this.ipdpharma 1:',
            //   this.ipdpharma
            // );
            this.enrichIPDPharmaWithUHID(); // Enrich after filtering
          } else {
            console.warn('Unexpected response format for getPharmareq');
          }
        },
        error: (err) => console.log('Pharma Error:', err),
      });
      this.checkAndRenderCharts();
    }

    enrichIPDPharmaWithUHID() {
      if (!this.ipdpharma || !Array.isArray(this.ipdpharma)) return;

      const enrichedRecords: any[] = [];
      let completed = 0;

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
              this.ipdpharma = [...enrichedRecords]; // ✅ force Angular update
              // console.log(
              //   '🚀 ~ PharmacydashboardComponent ~ enrichIPDPharmaWithUHID ~ this.ipdpharma 2:',
              //   this.ipdpharma
              // );

              this.applyIPDFilters();
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
              this.ipdpharma = [...enrichedRecords];
              this.applyIPDFilters();
            }
          },
        });
      }
    }

    totalFilteredIPDCases: number = 0;
    filteredIPDFullList: any[] = [];
  applyIPDFilters() {
    let baseList = this.ipdpharma || [];
    let fullFiltered: any[] = [];

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      fullFiltered = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt).toISOString().split('T')[0];
        return patientDate === today;
      });
    } else if (this.activeFilter === 'week') {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 6);
      weekAgo.setHours(0, 0, 0, 0);

      fullFiltered = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= weekAgo && patientDate <= today;
      });
    } else if (this.activeFilter === 'month') {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const monthAgo = new Date();
      monthAgo.setDate(today.getDate() - 29);
      monthAgo.setHours(0, 0, 0, 0);

      fullFiltered = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= monthAgo && patientDate <= today;
      });
    } else if (this.activeFilter === 'year') {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const yearAgo = new Date();
      yearAgo.setDate(today.getDate() - 364);
      yearAgo.setHours(0, 0, 0, 0);

      fullFiltered = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= yearAgo && patientDate <= today;
      });
    }

    this.totalFilteredIPDCases = fullFiltered.length;
    const displayLimit = 4;
    this.filteredipdCases = fullFiltered.slice(0, displayLimit);
    this.filteredIPDFullList = fullFiltered; // ✅ Use full list, not sliced
    this.dataLoaded.IPD = true;
  }
    enrichAllPharmaWithUHID() {
      if (!this.pharma || !Array.isArray(this.pharma)) return;

      const enrichedRecords: any[] = [];
      let completed = 0;

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
              this.pharma = [...enrichedRecords]; // ✅ force Angular update
              this.applyFilters();
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
              this.pharma = [...enrichedRecords];
              this.applyFilters();
            }
          },
        });
      }
    }

    totalFilteredOPDCases: number = 0; // to track full filtered length before pagination

    filteredOPDFullList: any[] = [];
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
    } else if (this.activeFilter === 'week') {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // ✅ End of today
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 6);
      weekAgo.setHours(0, 0, 0, 0); // ✅ Start of week ago

      fullFiltered = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= weekAgo && patientDate <= today;
      });
    } else if (this.activeFilter === 'month') {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const monthAgo = new Date();
      monthAgo.setDate(today.getDate() - 29);
      monthAgo.setHours(0, 0, 0, 0);

      fullFiltered = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= monthAgo && patientDate <= today;
      });
    } else if (this.activeFilter === 'year') {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const yearAgo = new Date();
      yearAgo.setDate(today.getDate() - 364);
      yearAgo.setHours(0, 0, 0, 0);

      fullFiltered = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= yearAgo && patientDate <= today;
      });
    }

    this.totalFilteredOPDCases = fullFiltered.length;
    const displayLimit = 4;
    this.filteredCases = fullFiltered.slice(0, displayLimit);
    this.filteredOPDFullList = fullFiltered; // ✅ Use full list, not sliced
    this.dataLoaded.OPD = true;
  }


    totalFilteredWalkCases: number = 0; // to track full filtered length before pagination

    filteredWalkFullList: any[] = []; // ⬅️ Add this to your component

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
    } else if (this.activeFilter === 'week') {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // ✅ Set to end of day
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 6);
      weekAgo.setHours(0, 0, 0, 0); // ✅ Set to start of day

      fullFiltered = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= weekAgo && patientDate <= today;
      });
    } else if (this.activeFilter === 'month') {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // ✅ Set to end of day
      const monthAgo = new Date();
      monthAgo.setDate(today.getDate() - 29);
      monthAgo.setHours(0, 0, 0, 0); // ✅ Set to start of day

      fullFiltered = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= monthAgo && patientDate <= today;
      });
    } else if (this.activeFilter === 'year') {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // ✅ Set to end of day
      const yearAgo = new Date();
      yearAgo.setDate(today.getDate() - 364);
      yearAgo.setHours(0, 0, 0, 0); // ✅ Set to start of day

      fullFiltered = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= yearAgo && patientDate <= today;
      });
    }

    // Rest of your code stays the same
    this.filteredWalkFullList = fullFiltered;
    this.totalFilteredWalkCases = fullFiltered.length;

    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    this.filteredwalkCases = fullFiltered.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(fullFiltered.length / this.recordsPerPage);

    this.dataLoaded.WalkIn = true;
  }


    //  medicne chart starts
    tryRenderChart() {
      if (this.dataLoaded.OPD && this.dataLoaded.IPD && this.dataLoaded.WalkIn) {
        this.computeTopMedicinesToday();
        this.renderMedicineChart();
      }

      if (!this.dataLoaded.OPD || !this.dataLoaded.IPD || !this.dataLoaded.WalkIn)
        return;

      const totalOPDIncome = this.filteredOPDFullList.reduce(
        (sum, item) => sum + (item.total || 0),
        0
      );
      const totalIPDIncome = this.filteredIPDFullList.reduce(
        (sum, item) => sum + (item.total || 0),
        0
      );
      const totalWalkInIncome = this.filteredWalkFullList.reduce(
        (sum, item) => sum + (item.total || 0),
        0
      );

      this.renderIncomePieChart([
        { name: 'OPD', value: totalOPDIncome },
        // { name: 'IPD', value: totalIPDIncome },
        { name: 'Walk-In', value: totalWalkInIncome },
      ]);
    }

    // top mediciens used today
    topMedicinesByDept: any = {
      OPD: [],
      // IPD: [],
      WalkIn: [],
    };

    computeTopMedicinesToday() {
      const collectTop = (source: any[], label: string) => {
        const countMap: { [key: string]: number } = {};

        source.forEach((entry) => {
          // Use packages not medicines
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

      // Use filtered data instead of all data
      collectTop(this.filteredOPDFullList || [], 'OPD');
      // collectTop(this.filteredIPDFullList || [], 'IPD');
      collectTop(this.filteredWalkFullList || [], 'WalkIn');
    }

    ngAfterViewInit() {
      // Give a slight delay to ensure data is computed
      setTimeout(() => {
        this.computeTopMedicinesToday();
        this.renderMedicineChart();
      }, 1000);
    }

    medicineChart: Chart | null = null;

    renderMedicineChart() {
      const ctx = document.getElementById(
        'topMedicinesChart'
      ) as HTMLCanvasElement;
      if (!ctx) return;

      if (this.medicineChart) {
        this.medicineChart.destroy();
      }

      const allTop = [
        ...(this.topMedicinesByDept.OPD || []),
        ...(this.topMedicinesByDept.IPD || []),
        ...(this.topMedicinesByDept.WalkIn || []),
      ];

      const medicineMap: Record<string, number> = {};
      allTop.forEach((item) => {
        if (!item?.name) return;
        medicineMap[item.name] = (medicineMap[item.name] || 0) + item.count;
      });

      const topMedicines = Object.entries(medicineMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      const labels = topMedicines.map((m) => m.name);
      const data = topMedicines.map((m) => m.count);

      const backgroundColors = [
        '#4CAF50',
        '#2196F3',
        '#FFC107',
        '#FF5722',
        '#9C27B0',
        '#00BCD4',
        '#8BC34A',
        '#FF9800',
        '#E91E63',
        '#795548',
      ];

      const chartType = this.chartType;

      const config: any = {
        type: chartType,
        data: {},
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Top 10 Medicines - ${chartType.toUpperCase()} Chart`,
            },
            legend: {
              display: ['pie', 'doughnut', 'polarArea', 'radar'].includes(
                chartType
              ),
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const val = context.raw?.y ?? context.raw;
                  return `Dispensed: ${val}`;
                },
              },
            },
          },
        },
      };

      switch (chartType) {
        case 'bar':
        case 'line':
          config.data = {
            labels,
            datasets: [
              {
                label: 'Dispensed Units',
                data,
                backgroundColor: backgroundColors,
                borderColor: '#333',
                borderWidth: 1,
                fill: chartType === 'line' ? false : true,
              },
            ],
          };
          config.options.scales = {
            x: {
              beginAtZero: true,
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Units Dispensed',
              },
            },
          };
          break;

        case 'pie':
        case 'doughnut':
        case 'polarArea':
          config.data = {
            labels,
            datasets: [
              {
                label: 'Dispensed Units',
                data,
                backgroundColor: backgroundColors,
              },
            ],
          };
          break;

        case 'radar':
          config.data = {
            labels,
            datasets: [
              {
                label: 'Dispensed Units',
                data,
                backgroundColor: 'rgba(33, 150, 243, 0.3)',
                borderColor: '#2196F3',
                pointBackgroundColor: '#2196F3',
              },
            ],
          };
          break;

        case 'scatter':
          config.data = {
            datasets: labels.map((label, index) => ({
              label,
              data: [{ x: index + 1, y: data[index] }],
              backgroundColor: backgroundColors[index],
            })),
          };
          config.options.scales = {
            x: {
              type: 'linear',
              position: 'bottom',
            },
            y: {
              beginAtZero: true,
            },
          };
          break;

        case 'bubble':
          config.data = {
            datasets: labels.map((label, index) => ({
              label,
              data: [
                { x: index + 1, y: data[index], r: Math.max(5, data[index] / 5) },
              ],
              backgroundColor: backgroundColors[index],
            })),
          };
          config.options.scales = {
            x: {
              type: 'linear',
              title: {
                display: true,
                text: 'Medicine Index',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Dispensed Units',
              },
            },
          };
          break;
      }

      this.medicineChart = new Chart(ctx, config);
    }

    //  medicne chart ends

    // incoiem chart

    incomeChartInstance: any;

    renderIncomePieChart(data: { name: string; value: number }[]): void {
      const canvas = document.getElementById(
        'incomePieChart'
      ) as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (this.incomeChartInstance) {
        this.incomeChartInstance.destroy();
      }

      const totalIncome = data.reduce((sum, d) => sum + d.value, 0);

      // Plugin to draw center text
      const centerTextPlugin = {
        id: 'centerTextPlugin',
        afterDraw: (chart: any) => {
          const { width, height, ctx } = chart;
          ctx.restore();
          const fontSize = (height / 150).toFixed(2);
          ctx.font = `${fontSize}em sans-serif`;
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#333';
          ctx.fillText(`₹${totalIncome.toLocaleString()}`, width / 2, height / 2);
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
              backgroundColor: [
                '#36A2EB',
                '#FF6384',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
              ],
              borderColor: '#ffffff',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%', // Creates doughnut effect
          plugins: {
            title: {
              display: true,
              text: 'Today Total Pharmacy Income ',
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
                  return `${context.label}: ₹${value.toLocaleString()}`;
                },
              },
            },
          },
        },
        plugins: [centerTextPlugin],
      });
    }

    // incoiem chart

    // low stock medicine
    lowStockMedicinesFullList: any[] = [];
    lowStockMedicines: any[] = [];

    fetchLowStockMedicines(): void {
      // Force limit to very high to fetch all medicines in one go
      const veryLargeLimit = 10000; // assuming you don't have more than 10k medicines
    const pharmacyId = '68beb0b38066685ac24f8017';

      this.masterService.getSubPharmacyInventoryItems(pharmacyId,1, veryLargeLimit).subscribe({
        next: (res) => {
          const filtered = res.data.filter((med: any) => med.stock < 10);

          // console.log('Filtered low stock medicines:', filtered); // ✅ Add this

          this.lowStockMedicinesFullList = filtered;
        },
        error: (err) => {
          console.error('Error fetching low stock medicines:', err);
        },
      });
    }

    // Add these methods to show individual totals correctly
  getWalkInTotal(): number {
    return this.getGrandTotalQuantity(this.filteredWalkFullList);
  }

  getOPDTotal(): number {
    return this.getGrandTotalQuantity(this.filteredOPDFullList);
  }

  getIPDTotal(): number {
    return this.getGrandTotalQuantity(this.filteredIPDFullList);
  }


    getTotalQuantity(packages: any[]): number {
    return packages.reduce((total, med) => total + (med.quantity || 0), 0);
  }

  getGrandTotalQuantity(cases: any[]): number {
    return cases.reduce((grandTotal, record) => {
      const total = this.getTotalQuantity(record.packages);
      return grandTotal + total;
    }, 0);
  }
  getAllDepartmentsTotal(): number {
    return (
      // ✅ Use FULL filtered lists, not paginated ones
      this.getGrandTotalQuantity(this.filteredWalkFullList) +  // ← Changed from filteredwalkCases
      this.getGrandTotalQuantity(this.filteredOPDFullList) +  // ← Changed from filteredCases
      this.getGrandTotalQuantity(this.filteredIPDFullList)    // ← Changed from filteredipdCases
    );
  }


    //

    // Add these methods to your component class
    getDateRangeSubtitle(): string {
      const today = new Date();

      switch (this.activeFilter) {
        case 'today':
          return ` - ${today.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}`;

        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          return ` - ${weekAgo.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })} to ${today.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}`;

        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          return ` - ${monthAgo.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })} to ${today.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}`;

        case 'year':
          const yearAgo = new Date();
          yearAgo.setFullYear(today.getFullYear() - 1);
          return ` - ${yearAgo.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })} to ${today.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}`;

        case 'dateRange':
          if (this.startDate && this.endDate) {
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            return ` - ${start.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })} to ${end.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}`;
          }
          return '';

        default:
          return '';
      }
    }

    // Update the selectRange method to update subtitle
  selectRange(range: 'today' | 'week' | 'month' | 'year') {
    this.activeFilter = range;
    this.subTitle = this.getDateRangeSubtitle();

    // Apply filters to all departments
    this.applyFilters();
    this.applywalkFilters();
    this.applyIPDFilters();

    // ✅ FORCE ANGULAR CHANGE DETECTION
    this.cdRef.detectChanges();

    // Update chart with new filtered data
    this.checkAndRenderCharts();
  }


    isGeneratingPDF: boolean = false;

    async downloadPDF() {
      this.isGeneratingPDF = true;
      this.cdRef.detectChanges();

      const elementsToHide = document.querySelectorAll(
        '.no-print, .d-print-none, .filter-tabs'
      );
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const html2canvas = (await import('html2canvas')).default;
        const { default: jsPDF } = await import('jspdf');

        const element = this.pdfFullContent.nativeElement;

        const canvas = await html2canvas(element, {
          scale: 2,
          scrollY: -window.scrollY,
          useCORS: true,
          allowTaint: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(
          `OPD_Pharmacy_Report_${this.selectedRange}_${
            new Date().toISOString().split('T')[0]
          }.pdf`
        );
      } catch (error) {
        console.error('Error generating PDF:', error);
        // You could show a toast notification here
      } finally {
        this.isGeneratingPDF = false;
        this.cdRef.detectChanges();
      }
    }

    // date range
    // or 'IPD' or 'Walk-In'

    chartLabels: string[] = [];
    chartData: any[] = [];

    filteredOpdPharma: any[] = [];
    filteredIpdPharma: any[] = [];
    filteredWalkinPharma: any[] = [];

    totalOPD: number = 0;
    totalIPD: number = 0;
    totalWalkIn: number = 0;
    customStartDate!: Date;
    customEndDate!: Date;

    filterByDate(data: any[], range: string): any[] {
      const today = new Date();
      const startDate = new Date();

      switch (range) {
        case 'today':
          return data.filter((item) =>
            this.isSameDate(item.createdAt || item.created_at, today)
          );

        case 'week':
          startDate.setDate(today.getDate() - 6);
          break;

        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;

        case 'year':
          startDate.setFullYear(today.getFullYear() - 1);
          break;

        case 'dateRange':
          if (!this.customStartDate || !this.customEndDate) return data;
          return data.filter((item) => {
            const itemDate = new Date(item.createdAt || item.created_at);
            return (
              itemDate >= this.customStartDate && itemDate <= this.customEndDate
            );
          });

        default:
          return data;
      }

      return data.filter((item) => {
        const itemDate = new Date(item.createdAt || item.created_at);
        return itemDate >= startDate && itemDate <= today;
      });
    }

    isSameDate(dateStr: string, targetDate: Date): boolean {
      const date = new Date(dateStr);
      return (
        date.getFullYear() === targetDate.getFullYear() &&
        date.getMonth() === targetDate.getMonth() &&
        date.getDate() === targetDate.getDate()
      );
    }
    updateChart(): void {
      let rawData: any[] = [];

      switch (this.currentDeptFilter) {
        case 'OPD':
          rawData = this.pharma || [];
          break;
        case 'IPD':
          rawData = this.ipdpharma || [];
          break;
        case 'Walk-In':
          rawData = this.walkpharma || [];
          break;
      }

      const filtered = this.filterByDate(rawData, this.activeFilter);

      // Store filtered lists
      this.filteredOpdPharma =
        this.currentDeptFilter === 'OPD' ? filtered : this.filteredOpdPharma;
      this.filteredIpdPharma =
        this.currentDeptFilter === 'IPD' ? filtered : this.filteredIpdPharma;
      this.filteredWalkinPharma =
        this.currentDeptFilter === 'Walk-In'
          ? filtered
          : this.filteredWalkinPharma;

      // Totals
      this.totalOPD = this.filteredOpdPharma.reduce(
        (sum, item) => sum + (item.totalMedicines || 0),
        0
      );
      this.totalIPD = this.filteredIpdPharma.reduce(
        (sum, item) => sum + (item.totalMedicines || 0),
        0
      );
      this.totalWalkIn = this.filteredWalkinPharma.reduce(
        (sum, item) => sum + (item.totalMedicines || 0),
        0
      );

      // Chart data
      this.chartLabels = filtered.map((item) =>
        new Date(item.createdAt || item.created_at).toLocaleDateString()
      );

      this.chartData = [
        {
          data: filtered.map((item) => item.totalMedicines || 0),
          label: `${this.activeFilter.toUpperCase()} - ${this.currentDeptFilter}`,
        },
      ];
    }

    onCustomDateRangeChange(start: Date, end: Date) {
      this.customStartDate = start;
      this.customEndDate = end;
      this.activeFilter = 'dateRange';
      this.updateChart();
    }
  }
