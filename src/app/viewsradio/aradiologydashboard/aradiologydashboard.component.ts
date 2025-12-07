import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Chart } from 'chart.js';
import { UhidService } from '../../views/uhid/service/uhid.service';
import { OpdService } from '../../views/opdmodule/opdservice/opd.service';
import { MasterService } from '../../views/mastermodule/masterservice/master.service';
import { IpdService } from '../../views/ipdmodule/ipdservice/ipd.service';

@Component({
  selector: 'app-aradiologydashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './aradiologydashboard.component.html',
  styleUrl: './aradiologydashboard.component.css'
})
export class AradiologydashboardComponent implements OnInit, AfterViewInit {
  recordsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 0;

  // Radiology specific data arrays
  radiologyOPDData: any[] = [];
  radiologyIPDData: any[] = [];
  pendingRadiologyRequests: any[] = []; // New array for pending requests
  allRadiologyRequests: any[] = []; // Store all requests

  // Filtered data for display
  filteredOPDCases: any[] = [];
  filteredIPDCases: any[] = [];
  filteredPendingRequests: any[] = []; // New filtered array for pending requests

  // Counts for today
  totalFilteredOPDCases: number = 0;
  totalFilteredIPDCases: number = 0;
  totalPendingRequests: number = 0; // New count for pending requests

  selectedPatient: any = null;
  activeFilter = 'all'; // Changed from 'today' to 'all' to show all pending requests
  startDate: string = '';
  endDate: string = '';

  // Permissions
  userPermissions: any = {};
  ipdradiopermission: any = {};

  dataLoaded = {
    OPD: false,
    IPD: false,
    PendingRequests: false, // New data loaded flag
  };

  // Chart instances
  testChart: Chart | null = null;
  incomeChartInstance: Chart | null = null;

  constructor(
    private uhidservice: UhidService,
    private opdservice: OpdService,
    private masterService: MasterService,
    private ipdService: IpdService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializePermissions();
    this.initializeDates();
    this.loadRadiologyData();
    this.loadPendingRadiologyRequests(); // Load pending requests



  }

  initializePermissions(): void {
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');

    const opdModule = allPermissions.find((perm: any) => perm.moduleName === 'inward');
    const ipdModule = allPermissions.find((perm: any) => perm.moduleName === 'ipdinward');

    this.userPermissions = opdModule?.permissions?.read === 1 || opdModule?.permissions?.create === 1;
    this.ipdradiopermission = ipdModule?.permissions?.read === 1 || ipdModule?.permissions?.create === 1;
  }

  initializeDates(): void {
    const today = new Date().toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;
  }

  loadRadiologyData(): void {
    // Load OPD radiology data
    if (this.userPermissions) {
      this.loadOPDRadiologyData();
    }

    // Load IPD radiology data
    if (this.ipdradiopermission) {
      this.loadIPDRadiologyData();
    }
  }

  // Fixed method to load pending radiology requests
  loadPendingRadiologyRequests(): void {
    console.log('Loading pending radiology requests...');

    this.ipdService.getradiologyreq().subscribe({
      next: (res: any) => {
        console.log('Radiology requests response:', res);

        this.allRadiologyRequests = res?.data || [];
        console.log('All requests count:', this.allRadiologyRequests.length);

        // Filter requests that are either 'pending' or 'in-progress' (both need attention)
        this.pendingRadiologyRequests = this.allRadiologyRequests.filter((req: any) => {
          const status = req.overallStatus?.toLowerCase();
          return status === 'pending' || status === 'in-progress';
        });

        console.log('Filtered pending requests count:', this.pendingRadiologyRequests.length);
        console.log('Pending requests:', this.pendingRadiologyRequests);

        this.applyPendingRequestsFilters();
        this.dataLoaded.PendingRequests = true;
        this.checkAndRenderCharts();
      },
      error: (err) => {
        console.error('Error loading pending radiology requests:', err);
        this.pendingRadiologyRequests = [];
        this.allRadiologyRequests = [];
        this.filteredPendingRequests = [];
        this.dataLoaded.PendingRequests = true;
      }
    });
  }

  // Fixed method to filter pending requests
  applyPendingRequestsFilters(): void {
    console.log('Applying pending requests filters...');

    let filteredData = [...this.pendingRadiologyRequests]; // Create a copy
    console.log('Initial filtered data count:', filteredData.length);

    // Apply date filter only if activeFilter is 'today'
    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filteredData = this.pendingRadiologyRequests.filter((record) => {
        const recordDate = new Date(record.createdAt || record.requestDate).toISOString().split('T')[0];
        return recordDate === today;
      });
      console.log('After today filter count:', filteredData.length);
    }

    // Sort by creation date (newest first)
    filteredData.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.requestDate).getTime();
      const dateB = new Date(b.createdAt || b.requestDate).getTime();
      return dateB - dateA;
    });

    this.totalPendingRequests = filteredData.length;
    this.filteredPendingRequests = filteredData.slice(0, this.recordsPerPage);

    console.log('Final filtered requests count:', this.filteredPendingRequests.length);
    console.log('Final filtered requests:', this.filteredPendingRequests);
  }

  // Navigation method for pending requests
  navigateToRadiologyPage(request: any): void {
    console.log('Navigating to radiology page for:', request);

    if (request.sourceType === 'ipd') {
      // Navigate to IPD radiology inward page
      this.router.navigate(['/radiologylayout/manageradioinward'], {
        queryParams: {
          requestId: request._id,
          patientId: request.inpatientCaseId
        }
      });
    } else if (request.sourceType === 'opd') {
      // Navigate to OPD radiology page
      this.router.navigate(['/radiologylayout/radiointermbill'], {
        queryParams: {
          requestId: request._id,
          patientId: request.outpatientCaseId
        }
      });
    }
  }

  loadOPDRadiologyData(): void {
    const filters = {
      sourceType: 'opd',
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.ipdService.getRadioInwardRecords(1, 100, filters).subscribe({
      next: (response) => {
        this.radiologyOPDData = response.data || [];
        this.applyOPDFilters();
        this.dataLoaded.OPD = true;
        this.checkAndRenderCharts();
      },
      error: (err) => {
        console.error('Error loading OPD radiology data:', err);
        this.radiologyOPDData = [];
        this.dataLoaded.OPD = true;
      }
    });
  }

  loadIPDRadiologyData(): void {
    const filters = {
      sourceType: 'ipd',
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.ipdService.getRadioInwardRecords(1, 100, filters).subscribe({
      next: (response) => {
        this.radiologyIPDData = response.data || [];
        this.applyIPDFilters();
        this.dataLoaded.IPD = true;
        this.checkAndRenderCharts();
      },
      error: (err) => {
        console.error('Error loading IPD radiology data:', err);
        this.radiologyIPDData = [];
        this.dataLoaded.IPD = true;
      }
    });
  }

  applyOPDFilters(): void {
    let filteredData = this.radiologyOPDData;

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filteredData = this.radiologyOPDData.filter((record) => {
        const recordDate = new Date(record.createdAt).toISOString().split('T')[0];
        return recordDate === today;
      });
    }

    this.totalFilteredOPDCases = filteredData.length;
    this.filteredOPDCases = filteredData.slice(0, this.recordsPerPage);
  }

  applyIPDFilters(): void {
    let filteredData = this.radiologyIPDData;

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filteredData = this.radiologyIPDData.filter((record) => {
        const recordDate = new Date(record.createdAt).toISOString().split('T')[0];
        return recordDate === today;
      });
    }

    this.totalFilteredIPDCases = filteredData.length;
    this.filteredIPDCases = filteredData.slice(0, this.recordsPerPage);
  }

  checkAndRenderCharts(): void {
    const opdReady = this.userPermissions ? this.dataLoaded.OPD : true;
    const ipdReady = this.ipdradiopermission ? this.dataLoaded.IPD : true;
    const pendingReady = this.dataLoaded.PendingRequests;

    if (opdReady && ipdReady && pendingReady) {
      this.renderCharts();
    }
  }

  renderCharts(): void {
    this.renderTestChart();
    this.renderIncomePieChart();
  }

  renderTestChart(): void {
    const ctx = document.getElementById('topTestsChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.testChart) {
      this.testChart.destroy();
    }

    // Get test counts from both OPD and IPD data
    const testCounts = this.getTestCounts();
    const labels = Object.keys(testCounts);
    const data = Object.values(testCounts);

    this.testChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.slice(0, 10), // Top 10 tests
        datasets: [{
          label: 'Test Requests Today',
          data: data.slice(0, 10),
          backgroundColor: '#4CAF50',
          borderColor: '#45a049',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Top Radiology Tests Today'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Requests'
            }
          }
        }
      }
    });
  }

  getTestCounts(): { [key: string]: number } {
    const counts: { [key: string]: number } = {};

    // Count OPD tests
    this.filteredOPDCases.forEach(record => {
      if (record.requestedServices) {
        record.requestedServices.forEach((service: any) => {
          const serviceName = service.serviceName || 'Unknown';
          counts[serviceName] = (counts[serviceName] || 0) + 1;
        });
      }
    });

    // Count IPD tests
    this.filteredIPDCases.forEach(record => {
      if (record.requestedServices) {
        record.requestedServices.forEach((service: any) => {
          const serviceName = service.serviceName || 'Unknown';
          counts[serviceName] = (counts[serviceName] || 0) + 1;
        });
      }
    });

    return counts;
  }

  renderIncomePieChart(): void {
    const canvas = document.getElementById('incomePieChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.incomeChartInstance) {
      this.incomeChartInstance.destroy();
    }

    const opdIncome = this.calculateIncome(this.filteredOPDCases);
    const ipdIncome = this.calculateIncome(this.filteredIPDCases);
    const totalIncome = opdIncome + ipdIncome;

    const data: any[] = [];
    if (this.userPermissions) data.push({ name: 'OPD', value: opdIncome });
    if (this.ipdradiopermission) data.push({ name: 'IPD', value: ipdIncome });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.incomeChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: ['#36A2EB', '#FF6384'],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Today's Radiology Income: ₹${totalIncome.toLocaleString('en-IN')}`
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  calculateIncome(cases: any[]): number {
    return cases.reduce((total, record) => {
      if (record.requestedServices) {
        return total + record.requestedServices.reduce((serviceTotal: number, service: any) => {
          return serviceTotal + (service.charge || 0);
        }, 0);
      }
      return total;
    }, 0);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.checkAndRenderCharts();
    }, 1000);
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'final':
        return 'bg-success';
      case 'pending':
      case 'draft':
        return 'bg-warning';
      case 'in-progress':
      case 'preliminary':
        return 'bg-info';
      case 'cancelled':
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  // Get status badge class for pending requests
  getPendingStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'in-progress':
        return 'bg-info text-white';
      case 'completed':
        return 'bg-success text-white';
      default:
        return 'bg-secondary text-white';
    }
  }

  // Method to refresh pending requests (call this periodically or after actions)
  refreshPendingRequests(): void {
    this.loadPendingRadiologyRequests();
  }

  // Filter methods for pending requests
  showAllPendingRequests(): void {
    this.activeFilter = 'all';
    this.applyPendingRequestsFilters();
  }

  showTodayPendingRequests(): void {
    this.activeFilter = 'today';
    this.applyPendingRequestsFilters();
  }
}
