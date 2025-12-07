import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Chart } from 'chart.js';
import { AfterViewInit } from '@angular/core';
import { UhidService } from '../../views/uhid/service/uhid.service';
import { OpdService } from '../../views/opdmodule/opdservice/opd.service';
import { MasterService } from '../../views/mastermodule/masterservice/master.service';
import { TestService } from '../testservice/test.service';

@Component({
  selector: 'app-apthologydashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './apthologydashboard.component.html',
  styleUrl: './apthologydashboard.component.css',
})
export class ApthologydashboardComponent {
  recordsPerPage: number = 4;
  currentPage: number = 1;
  totalPages: number = 0;

  patho: any[] = [];
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
  dataLoaded = {
    OPD: false,
    IPD: false,
    WalkIn: false,
  };

  constructor(
    private testservice: TestService,
    private uhidservice: UhidService,
    private opdservice: OpdService,
    private masterService: MasterService
  ) {}

  checkAndRenderCharts() {
    if (this.dataLoaded.OPD && this.dataLoaded.IPD && this.dataLoaded.WalkIn) {
      this.tryRenderChart();
    }
  }
  ngOnInit(): void {
    this.topTestsByDept = {
      OPD: [],
      IPD: [],
      WalkIn: [],
    };
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inward'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions
    const today = new Date().toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;

    // opd
    this.testservice.getTestreq().subscribe({
      next: (res) => {
        // console.log(res);
        if (Array.isArray(res)) {
          this.patho = res.filter(
            (item: any) =>
              item.requestedDepartment === 'pathology' &&
              item.type === 'outpatientDepartment' &&
              item.isWalkIn === false
          );

          this.enrichAllPharmaWithUHID(); // Enrich after filtering
        } else {
          console.warn('Unexpected response format for getPharmareq');
        }
      },
      error: (err) => console.log('Pharma Error:', err),
    });
    // walkin
    this.testservice.getTestreq().subscribe({
      next: (res) => {
        // console.log(res);
        if (Array.isArray(res)) {
        this.walkpharma = res.filter(
            (item: any) =>
              item.requestedDepartment === 'pathology' &&
              item.type === 'outpatientDepartment' &&
              item.isWalkIn === true
          );
          this.applywalkFilters(); // Enrich after filtering
        } else {
          console.warn('Unexpected response format for getPharmareq');
        }
      },
      error: (err) => console.log('Pharma Error:', err),
    });
    // ipd

    this.testservice.getTestreq().subscribe({
      next: (res) => {
        // console.log(res);
        if (Array.isArray(res)) {
          this.ipdpharma = res.filter(
            (item: any) =>
              item.requestedDepartment === 'pathology' &&
              item.type === 'inpatientDepartment'
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

    for (const patho of this.ipdpharma) {
      const uhidId = patho.uniqueHealthIdentificationId;

      if (!uhidId || typeof uhidId !== 'string' || uhidId.trim() === '') {
        enrichedRecords.push({
          ...patho,
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
            ...patho,
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
            ...patho,
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

    if (this.activeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to midnight

      baseList = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        patientDate.setHours(0, 0, 0, 0); // Normalize
        return patientDate.getTime() === today.getTime();
      });
    } else if (this.activeFilter === 'dateRange') {
      if (!this.startDate || !this.endDate) {
        this.filteredipdCases = [];
        this.totalFilteredIPDCases = 0;
        return;
      }

      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999); // Include full day

      baseList = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= start && patientDate <= end;
      });
    }

    // ✅ Assign full filtered list before slicing
    this.totalFilteredIPDCases = baseList.length;

    // ✅ Slice for pagination
    const displayLimit = 4;
    this.filteredipdCases = baseList.slice(0, displayLimit);
    this.filteredipdCases = this.filteredipdCases.slice(0, displayLimit);

    // ✅ Save full data for chart calculations
    this.filteredIPDFullList = this.filteredipdCases;

    this.dataLoaded.OPD = true;
    this.checkAndRenderCharts();
    this.dataLoaded.IPD = true;
    // this.tryRenderChart();
    this.checkAndRenderCharts();
  }

  enrichAllPharmaWithUHID() {
    if (!this.patho || !Array.isArray(this.patho)) return;

    const enrichedRecords: any[] = [];
    let completed = 0;

    for (const patho of this.patho) {
      const uhidId = patho.uniqueHealthIdentificationId;

      if (!uhidId || typeof uhidId !== 'string' || uhidId.trim() === '') {
        enrichedRecords.push({
          ...patho,
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
            ...patho,
            patient_name: patient?.patient_name || '[UNKNOWN]',
            age: patient?.age || '-',
            gender: patient?.gender || '-',
            uhid: patient?.uhid || '-',
          });

          completed++;
          if (completed === this.patho.length) {
            this.patho = [...enrichedRecords]; // ✅ force Angular update
            this.applyFilters();
          }
        },
        error: (err) => {
          console.error('UHID Fetch Error for ID:', uhidId, err);

          enrichedRecords.push({
            ...patho,
            patient_name: '[ERROR]',
            age: '-',
            gender: '-',
            uhid: '-',
          });

          completed++;
          if (completed === this.patho.length) {
            this.patho = [...enrichedRecords];
            this.applyFilters();
          }
        },
      });
    }
  }

  totalFilteredOPDCases: number = 0; // to track full filtered length before pagination

  filteredOPDFullList: any[] = [];
  applyFilters() {
    let baseList = this.patho || [];
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

    const displayLimit = 4;
    this.filteredCases = fullFiltered.slice(0, displayLimit);

    // ✅ Save full data for chart calculations
    this.filteredOPDFullList = fullFiltered;

    this.dataLoaded.OPD = true;
    this.checkAndRenderCharts();
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
    } else if (this.activeFilter === 'dateRange') {
      if (!this.startDate || !this.endDate) {
        this.filteredwalkCases = [];
        this.filteredWalkFullList = [];
        this.totalFilteredWalkCases = 0;
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

    // ✅ Save full list for chart/income use
    this.filteredWalkFullList = fullFiltered;

    // ✅ Count for total display
    this.totalFilteredWalkCases = fullFiltered.length;

    // ✅ Apply pagination
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    this.filteredwalkCases = fullFiltered.slice(startIndex, endIndex);

    this.totalPages = Math.ceil(fullFiltered.length / this.recordsPerPage);

    this.dataLoaded.WalkIn = true;

    // ✅ Now safe to render chart using complete list
    this.checkAndRenderCharts();
  }

  //  medicne chart starts
  tryRenderChart() {
    if (this.dataLoaded.OPD && this.dataLoaded.IPD && this.dataLoaded.WalkIn) {
      this.computeTopTestsToday();
      this.renderTestChart();
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
      { name: 'IPD', value: totalIPDIncome },
      { name: 'Walk-In', value: totalWalkInIncome },
    ]);
  }

  // top mediciens used today
topTestsByDept: any = {
  OPD: [],
  IPD: [],
  WalkIn: [],
};

computeTopTestsToday() {
  const todayStr = new Date().toISOString().split('T')[0];

  const collectTop = (source: any[], label: string) => {
    const countMap: { [key: string]: number } = {};

    source.forEach((entry) => {
      const createdAt = entry?.createdAt || entry?.created_at;
      const dateStr = new Date(createdAt).toISOString().split('T')[0];
      if (dateStr !== todayStr) return;

      (entry.testMaster || []).forEach((test : any) => {
        const rawName = test.testGroup || '[Unnamed]';
        const name = String(rawName).trim() || '[Unnamed]';

        if (name !== '[Unnamed]') {
          countMap[name] = (countMap[name] || 0) + 1; // Count occurrences
        }
      });
    });

    const sorted = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    this.topTestsByDept[label] = sorted;
  };

  collectTop(this.patho, 'OPD');
  collectTop(this.ipdpharma, 'IPD');
  collectTop(this.walkpharma, 'WalkIn');
}

  ngAfterViewInit() {
    // Give a slight delay to ensure data is computed
    setTimeout(() => {
      this.computeTopTestsToday();
      this.renderTestChart();
    }, 1000);
  }

  medicineChart: Chart | null = null;

renderTestChart() {
  const labels = ['OPD', 'IPD', 'WalkIn'];

  const allTests = new Set<string>();
  labels.forEach((dept) => {
    (this.topTestsByDept[dept] || []).forEach((entry: any) => {
      allTests.add(entry.name);
    });
  });

  const testArray = Array.from(allTests);
  const testTotalMap = testArray.map((name) => {
    const total =
      (this.topTestsByDept['OPD'].find((t: any) => t.name === name)?.count || 0) +
      (this.topTestsByDept['IPD'].find((t: any) => t.name === name)?.count || 0) +
      (this.topTestsByDept['WalkIn'].find((t: any) => t.name === name)?.count || 0);
    return { name, total };
  });

  const top10 = testTotalMap
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((item) => item.name);

  const colors = [
    '#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0',
    '#00BCD4', '#8BC34A', '#FF9800', '#E91E63', '#795548'
  ];

  const datasets = top10.map((testName, index) => ({
    label: testName,
    data: labels.map((dept) => {
      const entry = this.topTestsByDept[dept].find((t: any) => t.name === testName);
      return entry?.count || 0;
    }),
    backgroundColor: colors[index % colors.length],
  }));

  const ctx = document.getElementById('topTestsChart') as HTMLCanvasElement;
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
          text: 'Top 10 Test Groups Used Today by Department',
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
            text: 'Test Orders Count',
          },
        },
      },
    },
  });
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

        // Adjust font size based on value length
        const valueStr = `₹${totalIncome.toLocaleString('en-IN')}`;
        const baseFontSize = height / 150;
        const adjustedFontSize = Math.max(
          baseFontSize - (valueStr.length - 6) * 0.2,
          1.5
        );

        ctx.font = `${adjustedFontSize}em sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333';
        ctx.fillText(valueStr, width / 2, height / 2);
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
              '#36A2EB', // OPD
              '#FF6384', // IPD
              '#FFCE56', // Walk-In
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
        cutout: totalIncome >= 1000000 ? '50%' : '60%', // Shrink hole for big numbers
        plugins: {
          title: {
            display: true,
            text: 'Today Total Pathology Income ',
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

  // incoiem chart

  // low stock medicine
}
