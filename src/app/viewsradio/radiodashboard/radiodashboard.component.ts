import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormGroup, FormsModule } from '@angular/forms';
import { PharmaService } from '../../viewspharma/pharma.service';
import { UhidService } from '../../views/uhid/service/uhid.service';
import { TestService } from '../../viewspatho/testservice/test.service';
import { TestComponent } from '../../component/testcomponent/test/test.component';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoaderComponent } from '../../views/loader/loader.component';
import { environment } from '../../../../enviornment/env';
import { IpdService } from '../../views/ipdmodule/ipdservice/ipd.service';
import Swal from 'sweetalert2';
import { RoleService } from '../../views/mastermodule/usermaster/service/role.service';
import { LetterheaderComponent } from '../../views/settingsmodule/letterhead/letterheader/letterheader.component';

@Component({
  selector: 'app-radiodashboard',
  imports: [
    RouterModule,
    CommonModule,
    TestComponent,
    FormsModule,
    LoaderComponent,
    LetterheaderComponent
  ],
  templateUrl: './radiodashboard.component.html',
  styleUrl: './radiodashboard.component.css',
})
export class RadiodashboardComponent implements OnInit {
   @ViewChild('letterheaderRef', { static: false }) letterheaderRef!: ElementRef;
  filterForm!: FormGroup;
  recordsPerPage: number = 25;
  searchText: string = '';

  // ✅ Updated properties for inward records
  radioInwardRecords: any[] = [];
  currentPage = 1;
  totalPages = 1;
  totalRecords = 0;

  selectedPatient: any = null;

  // Using string to bind to radio buttons directly
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];
  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();

  // ✅ Loading states
  isLoading = false;
  userPermissions: any = {};

  // ✅ Additional properties for user management
  users: any[] = [];
  currentUser: any = null;

  constructor(
    private pharmaservice: PharmaService,
    private uhidservice: UhidService,
    private testservice: TestService,
    private http: HttpClient,
    private ipdService: IpdService,
    private roleservice : RoleService
  ) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;

    this.initializeUser();
    this.initializePermissions();
    this.loadUsers();
    this.loadRadioInwardRecords();
  }

  // ✅ Initialize current user
  initializeUser(): void {
    const userStr = localStorage.getItem('authUser');
    if (userStr && userStr !== '[]') {
      try {
        const parsedUser = JSON.parse(userStr);
        this.currentUser = parsedUser;
        console.log('✅ Current user loaded:', this.currentUser);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
      }
    }
  }

  // ✅ Initialize permissions
  initializePermissions(): void {
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inward'
    );
    this.userPermissions = uhidModule?.permissions || {};
    console.log('✅ User permissions loaded:', this.userPermissions);
  }

  // ✅ Load users for radiologist name mapping
  loadUsers(): void {
    // Assuming you have a method to get users in your service
    this.roleservice.getusers?.().subscribe({
      next: (response) => {
        this.users = response.data || [];
        console.log('✅ Users loaded for name mapping:', this.users.length);
      },
      error: (err) => {
        console.error('❌ Error loading users:', err);
        this.users = [];
      }
    });
  }

  // ✅ Load radiology inward records using the new API
  loadRadioInwardRecords(): void {
    this.isLoading = true;

    const filters = this.buildFilters();

    console.log('🔄 Loading radiology inward records with filters:', filters);

    this.ipdService.getRadioInwardRecords(this.currentPage, this.recordsPerPage, filters).subscribe({
      next: (response) => {
        console.log('✅ Radio inward records response:', response);

        this.radioInwardRecords = response.data || [];
        this.totalRecords = response.total || 0;
        this.totalPages = Math.ceil(this.totalRecords / this.recordsPerPage);

        // Apply additional client-side filtering
        this.applyFilters();
        this.isLoading = false;

        console.log(`✅ Loaded ${this.radioInwardRecords.length} radiology inward records`);
      },
      error: (err) => {
        console.error('❌ Error loading radiology inward records:', err);
        this.radioInwardRecords = [];
        this.filteredCases = [];
        this.isLoading = false;
      },
    });
  }

  // ✅ Build filters object for API call
  buildFilters(): any {
    const filters: any = {};

    // Date filters
    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filters.startDate = today;
      filters.endDate = today;
    } else if (this.activeFilter === 'dateRange') {
      if (this.startDate && this.endDate) {
        filters.startDate = this.startDate;
        filters.endDate = this.endDate;
      }
    }

    // Search filters
    if (this.searchText && this.searchText.trim()) {
      filters.search = this.searchText.trim();
    }

    // Source type filter (only IPD)
    filters.sourceType = 'ipd';

    return filters;
  }

  // ✅ Apply client-side filters
  applyFilters() {
    let baseList = this.radioInwardRecords;
    const text = this.searchText.toLowerCase();

    // Apply search filter
    if (text) {
      baseList = baseList.filter((record) => {
        const patientName = record.patientName?.toLowerCase() || '';
        const uhid = record.patientUhid?.uhid?.toLowerCase() || '';
        const requestNumber = record.requestNumber?.toLowerCase() || '';

        return patientName.includes(text) || uhid.includes(text) || requestNumber.includes(text);
      });
    }

    // Apply date filter
    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      this.filteredCases = baseList.filter((record) => {
        const createdAt = record?.createdAt || record?.created_at;
        if (!createdAt) return false;
        const recordDate = new Date(createdAt).toISOString().split('T')[0];
        return recordDate === today;
      });
    } else if (this.activeFilter === 'dateRange') {
      if (!this.startDate || !this.endDate) {
        this.filteredCases = [];
        return;
      }

      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);

      this.filteredCases = baseList.filter((record: any) => {
        const createdAt = record?.createdAt || record?.created_at;
        if (!createdAt) return false;
        const recordDate = new Date(createdAt);
        return recordDate >= start && recordDate <= end;
      });
    } else {
      this.filteredCases = baseList;
    }

    console.log(`✅ Applied filters. Found ${this.filteredCases.length} matching records`);
  }

  // ✅ Handle date range change
  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.loadRadioInwardRecords(); // Reload with new date range
  }

  // ✅ Handle filter change
  onFilterChange() {
    this.currentPage = 1; // Reset to first page
    this.loadRadioInwardRecords();
  }

  // ✅ Handle search input
  onSearchChange() {
    // Debounce search
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1; // Reset to first page
      this.loadRadioInwardRecords();
    }, 500);
  }

  private searchTimeout: any;

  // ✅ View patient details
  viewPatient(recordId: string): void {
    if (!recordId) {
      console.error('❌ No record ID provided');
      return;
    }

    console.log('🔄 Loading patient details for record:', recordId);

    this.ipdService.getRadioInwardById(recordId).subscribe({
      next: (response) => {
        console.log('✅ Patient details loaded:', response.data);
        this.selectedPatient = response.data;
      },
      error: (err) => {
        console.error('❌ Error fetching patient details:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error Loading Details',
          text: 'Error loading patient details. Please try again.',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false
        });
      },
    });
  }

  // ✅ Close modal
  closeModal(): void {
    this.selectedPatient = null;
  }

  // ✅ Print report functionality
  printReport(recordId: string): void {
    if (!recordId) {
      console.error('❌ No record ID provided for printing');
      return;
    }

    // First get the patient details if not already selected
    this.ipdService.getRadioInwardById(recordId).subscribe({
      next: (response) => {
        console.log('✅ Patient details loaded for printing:', response.data);
        this.generatePrintableReport(response.data);
      },
      error: (err) => {
        console.error('❌ Error fetching patient details for printing:', err);
        Swal.fire({
          icon: 'error',
          title: 'Print Failed',
          text: 'Error loading report data. Please try again.',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }

  // ✅ Generate printable report


  // ✅ Get radiologist name
  getRadiologistName(record: any): string {
  // First check if consultantRadiologist exists and has name property
  if (record.consultantRadiologist && record.consultantRadiologist.name) {
    return record.consultantRadiologist.name;
  }

  // Fallback to reportedBy if consultantRadiologist is not available
  if (record.reportedBy && record.reportedBy.name) {
    return record.reportedBy.name;
  }

  // If neither is available, return default
  return 'Dr. RADIOLOGIST NAME';
}


  // ✅ Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadRadioInwardRecords();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // ✅ Get status badge class
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

  // ✅ Format date for display
  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }

  // ✅ Get test names from requested services
  getTestNames(record: any): string {
    if (!record.requestedServices || !Array.isArray(record.requestedServices)) {
      return 'N/A';
    }
    return record.requestedServices.map((service: any) => service.serviceName).join(', ');
  }



  // Enhanced Generate printable report matching the medical report structure
// Enhanced Generate printable report with proper ViewChild handling
generatePrintableReport(patientData: any): void {
  const radiologistName = this.getRadiologistName(patientData);
  const testNames = patientData.requestedServices?.map((s: any) => s.serviceName).join(', ') || 'STUDY NAME';
  const reportDate = new Date().toLocaleDateString('en-GB');

  // Add a small delay to ensure ViewChild is properly initialized
  setTimeout(() => {
    // Get letterheader HTML content with null check
    let letterheaderHtml = '<div style="text-align: center; padding: 20px;"><h2>HOSPITAL NAME</h2><p>Hospital Address, Phone, Email</p></div>';

    if (this.letterheaderRef && this.letterheaderRef.nativeElement) {
      const innerHTML = this.letterheaderRef.nativeElement.innerHTML;
      if (innerHTML && innerHTML.trim()) {
        letterheaderHtml = innerHTML;
      }
    }

    const reportHtml = `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background: white; color: black;">
        <!-- Hospital Header using letterheader component -->
        <div style="border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px;">
          ${letterheaderHtml}
        </div>

        <!-- Patient Information Table -->
        <div style="border: 2px solid #000; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="border: 1px solid #000; padding: 8px; background-color: #000; color: white; font-weight: bold; width: 20%;">Patient Name:</td>
              <td style="border: 1px solid #000; padding: 8px; width: 30%;">${patientData.patientName || 'N/A'}</td>
              <td style="border: 1px solid #000; padding: 8px; background-color: #000; color: white; font-weight: bold; width: 15%;">Study:</td>
              <td style="border: 1px solid #000; padding: 8px; width: 35%;">${testNames}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; background-color: #000; color: white; font-weight: bold;">Age / Sex:</td>
              <td style="border: 1px solid #000; padding: 8px;">${patientData.age || 'N/A'} / ${patientData.gender || 'N/A'}</td>
              <td style="border: 1px solid #000; padding: 8px; background-color: #000; color: white; font-weight: bold;">Date:</td>
              <td style="border: 1px solid #000; padding: 8px;">${reportDate}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; background-color: #000; color: white; font-weight: bold;">Referred By:</td>
              <td style="border: 1px solid #000; padding: 8px;">Dr. ${patientData.consultingDoctor?.name || 'N/A'}</td>
              <td style="border: 1px solid #000; padding: 8px; background-color: #000; color: white; font-weight: bold;">UHID:</td>
              <td style="border: 1px solid #000; padding: 8px;">${patientData.patientUhid?.uhid || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <!-- Report Title -->
        <div style="text-align: center; margin-bottom: 20px;">
          <h3 style="text-decoration: underline; margin: 0; font-size: 16px; font-weight: bold;">${testNames.toUpperCase()}</h3>
        </div>

        <!-- Protocol Section -->
        ${patientData.protocol ? `
        <div style="margin-bottom: 15px; text-align: justify; line-height: 1.5;">
          <strong style="font-size: 14px;">Protocol:</strong> ${patientData.protocol}
        </div>
        ` : ''}

        <!-- Clinical Profile Section -->
        ${patientData.clinicalProfile ? `
        <div style="margin-bottom: 15px; text-align: justify; line-height: 1.5;">
          <strong style="font-size: 14px;">Clinical Profile:</strong><br><br>
          ${patientData.clinicalProfile}
        </div>
        ` : ''}

        <!-- Study Name Section -->
        <div style="margin-bottom: 15px; text-align: justify; line-height: 1.5;">
          <strong style="font-size: 14px;">${testNames}:</strong>
        </div>

        <!-- Findings/Observation Section -->
        ${patientData.observation ? `
        <div style="margin-bottom: 15px; text-align: justify; line-height: 1.6; white-space: pre-line;">
          ${patientData.observation}
        </div>
        ` : ''}

        <!-- Impression Section -->
        ${patientData.impression ? `
        <div style="margin-bottom: 40px; text-align: left; line-height: 1.6;">
          <strong style="font-size: 14px;">IMPRESSION:</strong><br><br>
          <div style="margin-left: 20px;">
            ${patientData.impression.includes('•') ?
              patientData.impression.split('•').slice(1).map((point: string) =>
                `• <strong>${point.trim()}</strong>`
              ).join('<br>') :
              `• <strong>${patientData.impression}</strong>`
            }
          </div>
        </div>
        ` : ''}

        <!-- Additional Findings -->
        ${patientData.findings ? `
        <div style="margin-bottom: 40px; text-align: justify; line-height: 1.6;">
          <strong style="font-size: 14px;">ADDITIONAL FINDINGS:</strong><br><br>
          <div style="line-height: 1.6;">${patientData.findings}</div>
        </div>
        ` : ''}

        <!-- Signature Section -->
        <div style="margin-top: 60px;">
          <div style="float: right; text-align: center; width: 250px;">
            ${patientData.radiologistSignature?.signatureData ?
              `<img src="${patientData.radiologistSignature.signatureData}" style="max-width: 200px; height: auto; border: 1px solid #ccc; padding: 5px; margin-bottom: 10px; background: white;"><br>` :
              '<div style="height: 60px; border-bottom: 1px solid #000; width: 200px; margin: 0 auto 10px;"></div>'
            }
            <strong>Dr. ${radiologistName}</strong><br>
          </div>
          <div style="clear: both;"></div>
        </div>
      </div>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Radiology Report - ${patientData.patientName || 'Patient'}</title>
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
              body {
                font-family: Arial, sans-serif;
                line-height: 1.4;
                font-size: 12px;
              }
              table {
                border-collapse: collapse;
              }
              .impression-list {
                list-style-type: none;
                padding-left: 0;
              }
              .impression-list li:before {
                content: "• ";
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            ${reportHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Print Failed',
        text: 'Unable to open print window. Please check your popup settings.',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
    }
  }, 100); // Small delay to ensure ViewChild is ready
}


}
