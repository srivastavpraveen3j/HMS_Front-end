// drwiseadmission.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IpdService } from '../ipdservice/ipd.service';
import { MasterService } from '../../mastermodule/masterservice/master.service';
import { RoleService } from '../../mastermodule/usermaster/service/role.service';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-drwiseadmission',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './drwiseadmission.component.html',
  styleUrl: './drwiseadmission.component.css'
})
export class DrwiseadmissionComponent implements OnInit {

  // Doctor search properties
  doctorSearchText: string = '';
  filteredDoctors: any[] = [];
  selectedDoctorName: string = '';
  selectedDoctorId: string = '';

  // Patient data
  allIpdCases: any[] = [];
  discharge: any[] = [];
  todaysAdmissions: any[] = [];
  todaysDischarges: any[] = [];
  combinedTodaysData: any[] = [];
  filteredPatients: any[] = [];
  displayedPatients: any[] = [];

  // Room transfer data
  patientTransferMap: Map<string, any> = new Map();

  // Pagination
  currentPage = 1;
  totalPages = 1;
  recordsPerPage = 10;

  // Loading states
  isLoading = false;

  // User permissions
  userPermissions: any = {};
  entryByUser: any;

  // Today property for print
  today = new Date();

  constructor(
    private ipdService: IpdService,
    private router: Router,
    private fb: FormBuilder,
    private masterService: MasterService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.loadAllData();
    this.loadUserPermissions();
  }

  initializeComponent(): void {
    // Load user info
    const userData = localStorage.getItem('authUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.entryByUser = user?.name || '';
      } catch (e) {
        console.error('Error parsing authUser from localStorage:', e);
      }
    }
  }

  loadUserPermissions(): void {
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const ipdModule = allPermissions.find((perm: any) => perm.moduleName === 'inpatientCase');
    this.userPermissions = ipdModule?.permissions || {};
  }

  // Load all data and then load room transfers for each patient
  loadAllData(): void {
    this.isLoading = true;

    forkJoin({
      admissions: this.ipdService.getIPDcase(1, 1000, ''),
      discharges: this.ipdService.getipddischargeurl()
    }).subscribe({
      next: (results) => {
        // Process admission data
        this.allIpdCases = results.admissions.data.inpatientCases.filter(
          (caseItem: any) => caseItem.isDischarge === false
        );

        // ✅ Process discharge data with correct mapping
        const dischargeResponse = results.discharges.discharges || results.discharges;
        console.log('🚀 ~ Discharge Response:', dischargeResponse);

        this.discharge = dischargeResponse.map((item: any) => {
          // ✅ DEBUG: Log each discharge item processing
          console.log('Processing discharge item:', {
            patientName: item.uniqueHealthIdentificationId?.patient_name,
            bedFromInpatientCase: item.inpatientCaseId?.bed_id?.bed_number,
            roomFromInpatientCase: item.inpatientCaseId?.room_id?.roomNumber
          });

          return {
            _id: item.inpatientCaseId?._id || item._id,
            ipdCaseId: item.inpatientCaseId?._id,
            ipdNumber: item.inpatientCaseId?.inpatientCaseNumber,
            patientName: item.uniqueHealthIdentificationId?.patient_name || '',
            gender: item.uniqueHealthIdentificationId?.gender || '',
            age: item.uniqueHealthIdentificationId?.age || '',
            admissionDate: item.inpatientCaseId?.admissionDate || '',
            admissionTime: item.inpatientCaseId?.admissionTime || '',
            dateOfDischarge: item.createdAt || '',
            // ✅ FIXED: Correct mapping for bed and room from inpatientCaseId
            roomNumber: item.inpatientCaseId?.room_id?.roomNumber || '',
            bedNumber: item.inpatientCaseId?.bed_id?.bed_number || '',
            doctorConsulted: item.inpatientCaseId?.admittingDoctorId?.name || '',
            conditionOnDischarge: item.conditionOnDischarge || '',
            treatmentOnDischarge: item.treatmentOnDischarge || '',
            adviceOnDischarge: item.adviceOnDischarge || '',
            dietAdvice: item.dietAdvice || '',
            patient_type: item.inpatientCaseId?.patient_type || 'cash',
            companyName: item.inpatientCaseId?.companyName || '',
            inpatientCaseNumber: item.inpatientCaseId?.inpatientCaseNumber || '',
            mobile_number: item.uniqueHealthIdentificationId?.mobile_number || '',

            // Transform to match admission structure
            uniqueHealthIdentificationId: {
              patient_name: item.uniqueHealthIdentificationId?.patient_name || '',
              mobile_number: item.uniqueHealthIdentificationId?.mobile_number || '',
              gender: item.uniqueHealthIdentificationId?.gender || '',
              age: item.uniqueHealthIdentificationId?.age || ''
            },
            // ✅ FIXED: Correct mapping for bed_id and room_id
            bed_id: {
              bed_number: item.inpatientCaseId?.bed_id?.bed_number || ''
            },
            room_id: {
              roomNumber: item.inpatientCaseId?.room_id?.roomNumber || ''
            },
            admittingDoctorId: {
              name: item.inpatientCaseId?.admittingDoctorId?.name || ''
            },
            isDischarge: true,
            dataType: 'discharge'
          };
        });

        // ✅ DEBUG: Log processed discharge data
        console.log('✅ Processed Discharge Data:', this.discharge.map(d => ({
          name: d.patientName,
          bedNumber: d.bedNumber,
          bed_id_bed_number: d.bed_id?.bed_number,
          roomNumber: d.roomNumber,
          room_id_roomNumber: d.room_id?.roomNumber
        })));

        // Filter today's data
        this.todaysAdmissions = this.filterTodaysAdmissions(this.allIpdCases);
        this.todaysDischarges = this.filterTodaysDischarges(this.discharge);

        console.log('✅ Today\'s Discharges:', this.todaysDischarges);

        // Combine today's data
        this.combineTodaysData();

        // Load room transfers for today's patients
        this.loadRoomTransfersForPatients();

        if (this.selectedDoctorName) {
          this.filterPatientsByDoctor();
        } else {
          this.filteredPatients = [...this.combinedTodaysData];
        }

        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.isLoading = false;
      }
    });
  }

  // Load room transfers for each today's patient using case-specific API
  private loadRoomTransfersForPatients(): void {
    const transferObservables: Observable<any>[] = [];

    this.combinedTodaysData.forEach(patient => {
      const caseId = patient.ipdCaseId || patient._id;
      if (caseId) {
        const transferObs = this.ipdService.getIpdRoomTransferByCase(caseId);
        transferObservables.push(transferObs);
      }
    });

    if (transferObservables.length > 0) {
      forkJoin(transferObservables).subscribe({
        next: (transferResults) => {
          transferResults.forEach((transferData, index) => {
            const patient = this.combinedTodaysData[index];
            if (transferData && this.hasTodaysTransfer(transferData)) {
              const caseId = patient.ipdCaseId || patient._id;
              this.patientTransferMap.set(caseId, transferData);
              console.log('✅ Room transfer loaded for patient:', patient.uniqueHealthIdentificationId?.patient_name || patient.patientName, transferData);
            }
          });

          // Update displays after transfers are loaded
          this.updatePagination();
        },
        error: (err) => {
          console.error('Error loading room transfers:', err);
        }
      });
    }
  }

  // Check if transfer data has today's transfers
  private hasTodaysTransfer(transferData: any): boolean {
    if (!transferData?.transfers?.length) return false;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    return transferData.transfers.some((t: any) => {
      if (!t.transferStartTime) return false;
      const transferDate = new Date(t.transferStartTime);
      return transferDate >= todayStart && transferDate <= todayEnd;
    });
  }

  // Get room transfer for a specific patient
  getPatientRoomTransfer(patientId: string): any {
    return this.patientTransferMap.get(patientId);
  }

  // Get today's transfers only
  getTodaysTransfersOnly(transferData: any): any[] {
    if (!transferData?.transfers) return [];

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    return transferData.transfers.filter((t: any) => {
      if (!t.transferStartTime) return false;
      const transferDate = new Date(t.transferStartTime);
      return transferDate >= todayStart && transferDate <= todayEnd;
    });
  }

  // Filter patients admitted today
  private filterTodaysAdmissions(patients: any[]): any[] {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    return patients.filter(patient => {
      if (!patient.admissionTime) return false;

      const admissionDate = new Date(patient.admissionTime);
      return admissionDate >= todayStart && admissionDate <= todayEnd;
    }).map(patient => ({
      ...patient,
      isDischarge: false,
      dataType: 'admission'
    }));
  }

  // Filter patients discharged today
  private filterTodaysDischarges(patients: any[]): any[] {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    return patients.filter(patient => {
      if (!patient.dateOfDischarge) return false;

      const dischargeDate = new Date(patient.dateOfDischarge);
      return dischargeDate >= todayStart && dischargeDate <= todayEnd;
    });
  }

  // Combine today's admissions and discharges
  private combineTodaysData(): void {
    this.combinedTodaysData = [
      ...this.todaysAdmissions,
      ...this.todaysDischarges
    ].sort((a, b) => {
      const timeA = new Date(a.admissionTime || a.dateOfDischarge).getTime();
      const timeB = new Date(b.admissionTime || b.dateOfDischarge).getTime();
      return timeB - timeA; // Most recent first
    });

    console.log('🚀 ~ Combined Today\'s Data:', this.combinedTodaysData);
  }

  // Doctor search functionality
  onDoctorSearchChange(searchText: string): void {
    this.doctorSearchText = searchText;

    if (searchText.trim().length === 0) {
      this.filteredDoctors = [];
      this.selectedDoctorName = '';
      this.selectedDoctorId = '';
      this.filteredPatients = [...this.combinedTodaysData];
      this.currentPage = 1;
      this.updatePagination();
      return;
    }

    if (searchText.trim().length < 2) {
      this.filteredDoctors = [];
      return;
    }

    this.roleService.getusers(1, 10, searchText).subscribe({
      next: (res: any) => {
        const doctors = res.filter((u: any) => u.role?.name === 'doctor') || [];
        this.filteredDoctors = doctors;
      },
      error: (err) => {
        console.error('Error searching doctors:', err);
        this.filteredDoctors = [];
      }
    });
  }

  onDoctorSelected(doctor: any): void {
    this.selectedDoctorName = doctor.name;
    this.selectedDoctorId = doctor._id;
    this.doctorSearchText = doctor.name;
    this.filteredDoctors = [];
    this.currentPage = 1;

    this.filterPatientsByDoctor();
  }

  filterPatientsByDoctor(): void {
    if (!this.selectedDoctorName) {
      this.filteredPatients = [...this.combinedTodaysData];
    } else {
      this.filteredPatients = this.combinedTodaysData.filter((patient) => {
        let doctorName = '';

        if (patient.dataType === 'admission') {
          doctorName = typeof patient.admittingDoctorId === 'string'
            ? patient.admittingDoctorId.toLowerCase()
            : patient.admittingDoctorId?.name?.toLowerCase() || '';
        } else if (patient.dataType === 'discharge') {
          doctorName = patient.doctorConsulted?.toLowerCase() ||
                      patient.admittingDoctorId?.name?.toLowerCase() || '';
        }

        return doctorName === this.selectedDoctorName.toLowerCase();
      });
    }

    this.updatePagination();
  }

  // Pagination methods
  updatePagination(): void {
    const totalItems = this.filteredPatients.length;
    this.totalPages = Math.ceil(totalItems / this.recordsPerPage);

    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;

    this.displayedPatients = this.filteredPatients.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  // Navigation methods
  viewPatientDetails(patientId: string): void {
    this.router.navigate(['/ipd/patientdetails'], {
      queryParams: { id: patientId }
    });
  }

  editPatient(patientId: string): void {
    this.router.navigate(['/ipd/ipdadmission'], {
      queryParams: { _id: patientId }
    });
  }

  openDeposit(patientId: string): void {
    this.router.navigate(['/ipd/ipddeposit'], {
      queryParams: { ipdcaseId: patientId }
    });
  }

  openBill(patientId: string): void {
    this.router.navigate(['/ipd/ipdbill'], {
      queryParams: { ipdcaseId: patientId }
    });
  }

  viewPatientSummary(patient: any): void {
    this.router.navigate(['/ipdpatientsummary'], {
      queryParams: { id: patient._id }
    });
  }

  // Utility methods
  getPatientTypeLabel(type: string): string {
    switch ((type || '').toLowerCase()) {
      case 'med':
        return 'Mediclaim';
      case 'cash':
        return 'Cash';
      case 'cashless':
        return 'Cashless';
      default:
        return 'Unknown';
    }
  }

  getDoctorPatientsCount(): number {
    return this.filteredPatients.length;
  }

  getTodaysAdmissionsCount(): number {
    return this.todaysAdmissions.length;
  }

  getTodaysDischargesCount(): number {
    return this.todaysDischarges.length;
  }

  clearDoctorFilter(): void {
    this.doctorSearchText = '';
    this.selectedDoctorName = '';
    this.selectedDoctorId = '';
    this.filteredDoctors = [];
    this.filteredPatients = [...this.combinedTodaysData];
    this.currentPage = 1;
    this.updatePagination();
  }

  // Print functionality
  printDoctorWiseList(): void {
    try {
      console.log('🔄 Starting combined doctor-wise print...');

      if (this.filteredPatients.length === 0) {
        alert('No patients found for today to print.');
        return;
      }

      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('Please allow pop-ups for this site to enable printing.');
        return;
      }

      const printHTML = this.generatePrintHTML();
      printWindow.document.write(printHTML);
      printWindow.document.close();

      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };

      console.log('✅ Print window opened');
    } catch (error) {
      console.error('❌ Error generating print:', error);
      alert(`Error generating print: ${(error as Error).message}`);
    }
  }

  private generatePrintHTML(): string {
    const doctors = this.getPrintDoctors();
    let doctorSections = '';

    doctors.forEach(doctor => {
      const doctorPatients = this.getDoctorPatients(doctor.name);
      const admissionPatients = doctorPatients.filter(p => p.dataType === 'admission');
      const dischargePatients = doctorPatients.filter(p => p.dataType === 'discharge');

      doctorSections += `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px; margin-top: 15px;">
          <tr>
            <td style="border: 1px solid #000; background-color: #f0f0f0; padding: 6px; font-weight: bold; font-size: 12px;">
              DR. ${doctor.name.toUpperCase()}
            </td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 2px;">
          <tr>
            <td style="border: 1px solid #000; background-color: #ffeaa7; padding: 4px; font-weight: bold; text-align: center; font-size: 10px; width: 50%;">
              Admission Details
            </td>
            <td style="border: 1px solid #000; background-color: #ffeaa7; padding: 4px; font-weight: bold; text-align: center; font-size: 10px; width: 50%;">
              Discharge Details
            </td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 2px;">
          <tr>
            <td style="border: 1px solid #000; padding: 3px; font-size: 8px; width: 8%; text-align: center; font-weight: bold;">Bed No.</td>
            <td style="border: 1px solid #000; padding: 3px; font-size: 8px; width: 17%; text-align: center; font-weight: bold;">In Patient Name</td>
            <td style="border: 1px solid #000; padding: 3px; font-size: 8px; width: 8%; text-align: center; font-weight: bold;">Admission</td>
            <td style="border: 1px solid #000; padding: 3px; font-size: 8px; width: 8%; text-align: center; font-weight: bold;">D.O.A</td>
            <td style="border: 1px solid #000; padding: 3px; font-size: 8px; width: 9%; text-align: center; font-weight: bold;">Time</td>

            <td style="border: 1px solid #000; padding: 3px; font-size: 8px; width: 17%; text-align: center; font-weight: bold;">Patient Name(Discharged Today)</td>
            <td style="border: 1px solid #000; padding: 3px; font-size: 8px; width: 8%; text-align: center; font-weight: bold;">D.O.D</td>
            <td style="border: 1px solid #000; padding: 3px; font-size: 8px; width: 8%; text-align: center; font-weight: bold;">Discharge</td>
            <td style="border: 1px solid #000; padding: 3px; font-size: 8px; width: 9%; text-align: center; font-weight: bold;">Time</td>
          </tr>
        </table>

        ${this.generateCombinedPatientRows(admissionPatients, dischargePatients)}
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Today's Doctor Wise Admission/Discharge List</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 15px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          table {
            border-collapse: collapse;
          }
          @media print {
            body { margin: 10px; }
            table { page-break-inside: avoid; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
            tbody { display: table-row-group; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 15px;">
          <h3 style="margin: 0; font-size: 14px; font-weight: bold;">PP MANIYA HOSPITAL PVT. LTD.</h3>
          <h4 style="margin: 3px 0; font-size: 12px;">Today's Admitted/Discharged Patient List</h4>
          <div style="text-align: right; font-size: 10px; margin-top: 8px;">
            ${this.today.toLocaleDateString('en-GB')} ${this.today.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}<br>
            Page 1 of 1
          </div>
        </div>

        ${doctorSections}
      </body>
      </html>
    `;
  }

  private generateCombinedPatientRows(admissionPatients: any[], dischargePatients: any[]): string {
    const maxRows = Math.max(admissionPatients.length, dischargePatients.length, 1);

    let rows = '';

    for (let i = 0; i < maxRows; i++) {
      const admissionPatient = admissionPatients[i];
      const dischargePatient = dischargePatients[i];

      // Get room transfer info for both patients
      let admissionBedInfo = '';
      let dischargeBedInfo = '';

      if (admissionPatient) {
        const caseId = admissionPatient.ipdCaseId || admissionPatient._id;
        const transferData = this.patientTransferMap.get(caseId);
        if (transferData) {
          const todaysTransfers = this.getTodaysTransfersOnly(transferData);
          if (todaysTransfers.length > 0) {
            const latestTransfer = todaysTransfers[todaysTransfers.length - 1];
            admissionBedInfo = `${latestTransfer.from?.bedNumber || admissionPatient.bed_id?.bed_number || 'N/A'} → ${latestTransfer.to?.bedNumber || 'N/A'}`;
          } else {
            admissionBedInfo = admissionPatient.bed_id?.bed_number || 'N/A';
          }
        } else {
          admissionBedInfo = admissionPatient.bed_id?.bed_number || 'N/A';
        }
      }

      if (dischargePatient) {
        const caseId = dischargePatient.ipdCaseId || dischargePatient._id;
        const transferData = this.patientTransferMap.get(caseId);
        if (transferData) {
          const todaysTransfers = this.getTodaysTransfersOnly(transferData);
          if (todaysTransfers.length > 0) {
            const latestTransfer = todaysTransfers[todaysTransfers.length - 1];
            dischargeBedInfo = `${latestTransfer.from?.bedNumber || dischargePatient.bed_id?.bed_number || 'N/A'} → ${latestTransfer.to?.bedNumber || 'N/A'}`;
          } else {
            dischargeBedInfo = dischargePatient.bed_id?.bed_number || 'N/A';
          }
        } else {
          dischargeBedInfo = dischargePatient.bed_id?.bed_number || 'N/A';
        }
      }

      rows += `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1px;">
          <tr>
            <td style="border: 1px solid #000; padding: 2px; font-size: 8px; width: 8%; vertical-align: top;">
              ${admissionBedInfo}
            </td>
            <td style="border: 1px solid #000; padding: 2px; font-size: 8px; width: 17%; vertical-align: top;">
              ${admissionPatient ? (admissionPatient.uniqueHealthIdentificationId?.patient_name || '') : ''}
            </td>
            <td style="border: 1px solid #000; padding: 2px; font-size: 8px; width: 8%; vertical-align: top; text-align: center;">
              ${admissionPatient ? 'Admission' : ''}
            </td>
            <td style="border: 1px solid #000; padding: 2px; font-size: 8px; width: 8%; vertical-align: top; text-align: center;">
              ${admissionPatient ? new Date(admissionPatient.admissionTime).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: '2-digit'}) : ''}
            </td>
            <td style="border: 1px solid #000; padding: 2px; font-size: 8px; width: 9%; vertical-align: top; text-align: center;">
              ${admissionPatient ? new Date(admissionPatient.admissionTime).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'}) : ''}
            </td>

            <td style="border: 1px solid #000; padding: 2px; font-size: 8px; width: 17%; vertical-align: top;">
              ${dischargePatient ? (dischargePatient.uniqueHealthIdentificationId?.patient_name || dischargePatient.patientName || '') : ''}
            </td>
            <td style="border: 1px solid #000; padding: 2px; font-size: 8px; width: 8%; vertical-align: top; text-align: center;">
              ${dischargePatient ? new Date(dischargePatient.dateOfDischarge).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: '2-digit'}) : ''}
            </td>
            <td style="border: 1px solid #000; padding: 2px; font-size: 8px; width: 8%; vertical-align: top; text-align: center;">
              ${dischargePatient ? 'Discharge' : ''}
            </td>
            <td style="border: 1px solid #000; padding: 2px; font-size: 8px; width: 9%; vertical-align: top; text-align: center;">
              ${dischargePatient ? new Date(dischargePatient.dateOfDischarge).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'}) : ''}
            </td>
          </tr>
        </table>
      `;
    }

    if (maxRows === 1 && !admissionPatients.length && !dischargePatients.length) {
      rows = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1px;">
          <tr>
            <td colspan="9" style="border: 1px solid #000; padding: 8px; text-align: center; font-size: 8px;">
              No patients found for this doctor today
            </td>
          </tr>
        </table>
      `;
    }

    return rows;
  }

  getPrintDoctors(): any[] {
    const doctorMap = new Map();

    this.filteredPatients.forEach(patient => {
      let doctorName = '';

      if (patient.dataType === 'admission') {
        doctorName = typeof patient.admittingDoctorId === 'string'
          ? patient.admittingDoctorId
          : patient.admittingDoctorId?.name || 'Unknown Doctor';
      } else if (patient.dataType === 'discharge') {
        doctorName = patient.doctorConsulted || patient.admittingDoctorId?.name || 'Unknown Doctor';
      }

      if (!doctorMap.has(doctorName)) {
        doctorMap.set(doctorName, { name: doctorName });
      }
    });

    return Array.from(doctorMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getDoctorPatients(doctorName: string): any[] {
    return this.filteredPatients.filter(patient => {
      let patientDoctorName = '';

      if (patient.dataType === 'admission') {
        patientDoctorName = typeof patient.admittingDoctorId === 'string'
          ? patient.admittingDoctorId
          : patient.admittingDoctorId?.name || 'Unknown Doctor';
      } else if (patient.dataType === 'discharge') {
        patientDoctorName = patient.doctorConsulted || patient.admittingDoctorId?.name || 'Unknown Doctor';
      }

      return patientDoctorName === doctorName;
    });
  }
}
